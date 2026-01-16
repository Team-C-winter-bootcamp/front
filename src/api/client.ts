import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useStore } from '../store/useStore'
import { ApiResponse } from './types'

// 에러 객체 타입 (인터셉터에서 반환)
interface ApiError {
  message: string
  status?: number
  code?: string
  detail?: Record<string, string[]>
}

/**
 * API Base URL 설정
 * 환경 변수에서 가져오거나 기본값 사용
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * Axios 인스턴스 생성
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 요청 인터셉터
 * - 인증 토큰 자동 추가
 * - 요청 로깅 (개발 환경)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Zustand store에서 토큰 가져오기
    // 토큰이 localStorage나 store에 저장되어 있다고 가정
    const token = localStorage.getItem('authToken')
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 개발 환경에서 요청 로깅
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      })
    }

    return config
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * 응답 인터셉터
 * - 에러 처리
 * - 토큰 만료 처리
 * - 응답 로깅 (개발 환경)
 */
apiClient.interceptors.response.use(
  (response: any) => {
    // 개발 환경에서 응답 로깅
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  async (error: AxiosError<ApiResponse<null> | { message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 개발 환경에서 에러 로깅
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
    }

    // 401 Unauthorized - 토큰 만료 또는 인증 실패
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 토큰 제거 및 로그아웃 처리
      localStorage.removeItem('authToken')
      const { logout } = useStore.getState()
      logout()

      // 로그인 페이지로 리다이렉트 (브라우저 환경에서만)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }

      return Promise.reject({
        message: '인증이 만료되었습니다. 다시 로그인해주세요.',
        status: 401,
      } as ApiError)
    }

    // 400 Bad Request - 유효성 검사 실패 등
    if (error.response?.status === 400) {
      const errorData = error.response.data as ApiResponse<null> | { message?: string }
      
      // ApiResponse 형태인 경우
      if (errorData && 'code' in errorData && 'message' in errorData) {
        const apiResponse = errorData as ApiResponse<null>
        return Promise.reject({
          message: apiResponse.message || '요청이 올바르지 않습니다.',
          status: 400,
          code: apiResponse.code,
        } as ApiError)
      }
      
      return Promise.reject({
        message: errorData?.message || '요청이 올바르지 않습니다.',
        status: 400,
      } as ApiError)
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      const errorData = error.response.data as ApiResponse<null> | { code?: string; message?: string }
      
      // ApiResponse 형태인 경우
      if (errorData && 'code' in errorData && 'message' in errorData) {
        const apiResponse = errorData as ApiResponse<null>
        return Promise.reject({
          message: apiResponse.message || '접근 권한이 없습니다.',
          status: 403,
          code: apiResponse.code,
        } as ApiError)
      }
      
      return Promise.reject({
        message: errorData?.message || '접근 권한이 없습니다.',
        status: 403,
      } as ApiError)
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      const errorData = error.response.data as ApiResponse<null> | { message?: string }
      return Promise.reject({
        message: (errorData && 'message' in errorData ? errorData.message : undefined) || '요청한 리소스를 찾을 수 없습니다.',
        status: 404,
      } as ApiError)
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      const errorData = error.response.data as ApiResponse<null> | { message?: string }
      return Promise.reject({
        message: (errorData && 'message' in errorData ? errorData.message : undefined) || '서버 오류가 발생했습니다.',
        status: 500,
      } as ApiError)
    }

    // 네트워크 오류
    if (!error.response) {
      return Promise.reject({
        message: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
        status: 0,
      } as ApiError)
    }

    // 기타 에러
    const errorData = error.response.data as ApiResponse<null> | { message?: string }
    return Promise.reject({
      message: (errorData && 'message' in errorData ? errorData.message : undefined) || error.message || '알 수 없는 오류가 발생했습니다.',
      status: error.response.status,
    } as ApiError)
  }
)

export default apiClient