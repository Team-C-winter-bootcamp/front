import apiClient from '../client'
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse, ApiResponse } from '../types'
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
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post<ApiResponse<SignupResponse>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    )
    
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || '회원가입에 실패했습니다.')
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
