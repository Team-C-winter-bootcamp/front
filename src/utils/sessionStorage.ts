/**
 * session_id 관리 유틸리티
 * 
 * session_id는 서버에서 발급되는 인증 토큰으로,
 * 로그인 시 받아서 저장하고, API 요청 시 자동으로 포함됩니다.
 */

const SESSION_ID_KEY = 'session_id'

/**
 * session_id 저장
 */
export const setSessionId = (sessionId: string): void => {
  localStorage.setItem(SESSION_ID_KEY, sessionId)
}

/**
 * session_id 조회
 */
export const getSessionId = (): string | null => {
  return localStorage.getItem(SESSION_ID_KEY)
}

/**
 * session_id 삭제 (로그아웃 시)
 */
export const removeSessionId = (): void => {
  localStorage.removeItem(SESSION_ID_KEY)
}

/**
 * session_id 존재 여부 확인
 */
export const hasSessionId = (): boolean => {
  return !!getSessionId()
}
