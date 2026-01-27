export const API_ENDPOINTS = {
  inits: { INIT: 'cases/init/' },
  cases: {
    INFO: 'cases/', // 사건 정보 등록(POST)
    SUMMARY: 'cases/{precedents_id}', // 판결문 요약 보기(GET)
    ANSWER: 'cases/answer/{precedents_id}/', // 판결문 답변 보기(Post)
    GETFILEDETAIL: 'cases/documents', // 판례 상세 정보 조회(GET)
    CREATEFILE: 'cases/documents/', // 문서 생성 시작(POST)
    MODIFYFILE: 'cases/documents/', // 문서 수정(PATCH)
  },

  // 사용자 (Users) - 기존 서비스용
  users: {
    ME: 'users/me', // 현재 사용자 정보 조회(GET)
  },
  session: {
    NEWCHAT: 'sessions',
    GETLIST: 'sessions',
    MODIFY: 'sessions/{session_id}',
    DELETE: 'sessions/{session_id}',
    GETMESSAGE: 'sessions/{session_id}/messages',
    SENDMESSAGE: 'sessions/{session_id}/messages',
    MODIFYMESSAGE: 'messages/{message_id}',
  },
  precedents: {
    PREVIEW: 'precedents/preview',
    TOTALDATA: 'precedents/{precedents_id}',
  },
} as const;

export const replaceParams = (endpoint: string, params: Record<string, string | number>): string => {
  let result = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    const encodedValue = encodeURIComponent(String(value));
    result = result.replace(`{${key}}`, encodedValue).replace(`:${key}`, encodedValue);
  });
  return result;
};