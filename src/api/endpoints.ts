/**
 * API 엔드포인트 상수 정의
 */

export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SIGNUP: '/auth/signup',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // 검색
  SEARCH: {
    SEARCH: '/search',
    DETAIL: '/judgment/:id',
  },

  // AI 채팅
  AI: {
    CHAT: '/ai/chat',
    HISTORY: '/ai/chat/history',
    HISTORY_DETAIL: '/ai/chat/history/:id',
  },

  // 문서
  DOCUMENT: {
    SESSIONS: '/document/sessions',
    SESSION_DETAIL: '/document/sessions/:id',
    FILES: '/document/files',
    FILE_UPLOAD: '/document/files/upload',
  },

  // 메모
  MEMO: {
    LIST: '/memo',
    DETAIL: '/memo/:id',
    CREATE: '/memo',
    UPDATE: '/memo/:id',
    DELETE: '/memo/:id',
  },
} as const

/**
 * 엔드포인트에 파라미터를 동적으로 주입하는 헬퍼 함수
 * @example
 * replaceParams(API_ENDPOINTS.SEARCH.DETAIL, { id: '123' }) // '/judgment/123'
 */
export const replaceParams = (
  endpoint: string,
  params: Record<string, string | number>
): string => {
  let result = endpoint
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value))
  })
  return result
}
