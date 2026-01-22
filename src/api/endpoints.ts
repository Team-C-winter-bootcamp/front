/* API 엔드포인트 상수 정의*/
export const API_ENDPOINTS = {
  // 사용자/카테고리 초기화
  inits: {
    INIT: '/init', // 카테고리 및 질문 목록 조회(GET)
  },

  // 사건 (Cases)
  cases: {
    INFO: '/cases', // 사건 정보 등록(POST)
    SUMMARY: '/cases/{case_id}/{precedents_id}', // 판결문 요약 보기(GET)
    ANSWER: '/cases/{case_id}/{precedents_id}/answer', // 판결문 답변 보기(GET)
    CREATEFILE: '/cases/{case_id}/documents', // 문서 생성 시작(POST)
    MODIFYFILE: '/cases/{case_id}/documents', // 문서 수정(PATCH)
  },


} as const;


/**
 * 엔드포인트에 파라미터를 동적으로 주입하는 헬퍼 함수
 * @example
 * replaceParams(API_ENDPOINTS.SEARCH.DETAIL, { id: '123' }) // '/precedents/123'
 * replaceParams(API_ENDPOINTS.session.MODIFY_SESSION, { session_id: '456' }) // '/sessions/456'
 */
export const replaceParams = (
  endpoint: string,
  params: Record<string, string | number>
): string => {
  let result = endpoint
  Object.entries(params).forEach(([key, value]) => {
    // {session_id} 형식과 :id 형식 모두 지원
    result = result.replace(`{${key}}`, String(value))
    result = result.replace(`:${key}`, String(value))
  })
  return result
}
