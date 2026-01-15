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

// 회원가입 요청 타입 (API 명세서에 따라 업데이트)
export interface SignupRequest {
  username: string
  password: string
  email: string
}

// 회원가입 응답 타입 (API 명세서에 따라 업데이트)
export interface SignupResponse {
  message: string
  user: {
    username: string
    email: string
  }
}

// API 에러 응답 타입 (명세서에 따른 에러 구조)
export interface ApiErrorResponse {
  error_code: string
  message: string
  detail?: Record<string, string[]>
}

// 에러 코드 상수
export const ERROR_CODES = {
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  AUTH_403: 'AUTH_403',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

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
