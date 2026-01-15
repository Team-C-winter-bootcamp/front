import apiClient from '../client'
import { 
  LoginRequest, 
  LoginResponse, 
  SignupRequest, 
  SignupResponse, 
  ApiResponse,
  ApiErrorResponse 
} from '../types'
import { API_ENDPOINTS } from '../endpoints'

/**
 * 인증 관련 API 서비스
 */
export const authService = {
  /**
   * 로그인
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    )
    
    if (response.data.success && response.data.data) {
      // 토큰을 localStorage에 저장
      localStorage.setItem('authToken', response.data.data.token)
      return response.data.data
    }
    
    throw new Error(response.data.message || '로그인에 실패했습니다.')
  },

  /**
   * 회원가입
   * API 명세서에 따라 업데이트된 엔드포인트 및 응답 구조
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    try {
      // 명세서에 따르면 응답이 { message, user } 형태로 직접 반환됨
      const response = await apiClient.post<SignupResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
        data
      )
      
      // 200 OK 응답 처리
      return response.data
    } catch (error: any) {
      // 에러 응답 처리
      if (error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse
        
        // 명세서에 따른 에러 코드별 처리
        switch (errorData.error_code) {
          case 'DUPLICATE_RESOURCE':
            throw new Error(
              errorData.detail 
                ? Object.values(errorData.detail).flat().join(', ')
                : errorData.message || '이미 존재하는 정보입니다.'
            )
          case 'VALIDATION_FAILED':
            throw new Error(
              errorData.detail
                ? Object.values(errorData.detail).flat().join(', ')
                : errorData.message || '입력값이 올바르지 않습니다.'
            )
          case 'FIELD_REQUIRED':
            throw new Error(
              errorData.detail
                ? Object.values(errorData.detail).flat().join(', ')
                : errorData.message || '필수 항목이 누락되었습니다.'
            )
          default:
            throw new Error(errorData.message || '회원가입에 실패했습니다.')
        }
      }
      
      // 네트워크 오류 등 기타 에러
      throw error
    }
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 토큰 제거
      localStorage.removeItem('authToken')
    }
  },

  /**
   * 현재 사용자 정보 조회
   */
  getMe: async (): Promise<LoginResponse['user']> => {
    const response = await apiClient.get<ApiResponse<LoginResponse['user']>>(
      API_ENDPOINTS.AUTH.ME
    )
    
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || '사용자 정보를 가져오는데 실패했습니다.')
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (): Promise<string> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      API_ENDPOINTS.AUTH.REFRESH
    )
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('authToken', response.data.data.token)
      return response.data.data.token
    }
    
    throw new Error(response.data.message || '토큰 갱신에 실패했습니다.')
  },
}
