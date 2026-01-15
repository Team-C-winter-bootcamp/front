/**
 * API 응답 타입 정의
 */

// 공통 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 에러 응답 타입
export interface ApiError {
  message: string
  status?: number
  code?: string
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 인증 관련 타입
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name?: string
  }
}

export interface SignupRequest {
  email: string
  password: string
  name?: string
}

export interface SignupResponse {
  user: {
    id: string
    email: string
    name?: string
  }
}

// 검색 관련 타입
export interface SearchRequest {
  query: string
  page?: number
  limit?: number
  filters?: {
    caseType?: string[]
    court?: string[]
    judgmentType?: string
    period?: string
  }
}

export interface SearchResult {
  id: number
  title: string
  content: string
  court: string
  date: string
  caseType: string
  judgmentType: string
}

// 판례 상세 타입
export interface JudgmentDetail {
  id: number
  title: string
  content: string
  court: string
  date: string
  caseType: string
  judgmentType: string
  fullText?: string
  relatedCases?: number[]
}
