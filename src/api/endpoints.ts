/**
 * API 엔드포인트 상수 정의
 */

export const API_ENDPOINTS = {
  // user
  user: {
    SIGNUP: '/users/signup', // 회원가입
    LOGIN: '/users/login', // 로그인
    LOGOUT: '/users/logout', // 로그아웃
    REFRESH: '/users/token/refresh', // 토큰 재발급
    VERIFY: '/users/token/verify', // 토큰 유효성 확인
    ME: '/users/me', // 사용자 정보 조회
  },

  //webhook 이거 뭐지? 질문하기기
  webhook: {
    CREATE: '/webhooks/clerk' //사용자 데이터 동기화
  },

  // session
  session: {
    SEARCH: '/search',
    DETAIL: '/judgment/:id',
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
