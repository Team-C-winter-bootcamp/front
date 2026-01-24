/* API 엔드포인트 상수 정의*/
export const API_ENDPOINTS = {
  // 사용자/카테고리 초기화
  inits: {
    INIT: 'init', // 카테고리 및 질문 목록 조회(GET)
  },

  // 사건 (Cases)
  cases: {
    INFO: 'cases/', // 사건 정보 등록(POST)
    SUMMARY: 'cases/{precedents_id}/', // 판결문 요약 보기(GET)
    ANSWER: 'cases/{precedents_id}/answer', // 판결문 답변 보기(GET)
    GETFILEDETAIL: 'cases/documents', // 판례 상세 정보 조회(GET)
    CREATEFILE: 'cases/documents', // 문서 생성 시작(POST)
    MODIFYFILE: 'cases/documents', // 문서 수정(PATCH)
  },

  // 사용자 (Users) - 기존 서비스용
  users: {
    ME: 'users/me', // 현재 사용자 정보 조회(GET)
  },

  // 세션 (Session) - 기존 서비스용
  session: {
    NEWCHAT: 'sessions', // 새로운 채팅방 생성(POST)
    GETLIST: 'sessions', // 채팅방 목록 조회(GET)
    MODIFY: 'sessions/{session_id}', // 채팅방 수정(PATCH)
    DELETE: 'sessions/{session_id}', // 채팅방 삭제(DELETE)
    GETMESSAGE: 'sessions/{session_id}/messages', // 특정 채팅방 메시지 조회(GET)
    SENDMESSAGE: 'sessions/{session_id}/messages', // 채팅방 메시지 전송(POST)
    MODIFYMESSAGE: 'messages/{message_id}', // 특정 메시지 수정(PATCH)
  },

  // 판례 (Precedents) - 기존 서비스용
  precedents: {
    PREVIEW: 'precedents/preview', // 판례 검색 및 미리보기(GET)
    TOTALDATA: 'precedents/{precedents_id}', // 판례 데이터 전문 조회(GET)
  },

} as const;


/**
 * 엔드포인트에 파라미터를 동적으로 주입하는 헬퍼 함수
 * 경로 파라미터는 URL 인코딩을 수행합니다.
 * @example
 * replaceParams(API_ENDPOINTS.SEARCH.DETAIL, { id: '123' }) // '/precedents/123'
 * replaceParams(API_ENDPOINTS.session.MODIFY_SESSION, { session_id: '456' }) // '/sessions/456'
 * replaceParams(API_ENDPOINTS.cases.SUMMARY, { case_id: 1, precedents_id: '2001년688' }) // '/cases/1/2001%EB%85%B4688/'
 */
export const replaceParams = (
  endpoint: string,
  params: Record<string, string | number>
): string => {
  let result = endpoint
  Object.entries(params).forEach(([key, value]) => {
    // 경로 파라미터는 URL 인코딩 필요 (한글, 특수문자 등)
    const encodedValue = encodeURIComponent(String(value))
    // {session_id} 형식과 :id 형식 모두 지원
    result = result.replace(`{${key}}`, encodedValue)
    result = result.replace(`:${key}`, encodedValue)
  })
  return result
}