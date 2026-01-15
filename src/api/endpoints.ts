/* API 엔드포인트 상수 정의*/
export const API_ENDPOINTS = {
   // 사용자 (Users)
  users: {
    ME: '/users/me', // 사용자 정보 조회(GET)
  },

  // 세션 (Session)
  session: {
    NEWCHAT: '/sessions', // 새로운 채팅방 생성(POST)
    GETLIST: '/sessions', // 채팅방 목록 전체 조회(GET)
    MODIFY: '/sessions/{session_id}', // 채팅방 수정(PATCH)
    DELETE: '/sessions/{session_id}', // 채팅방 삭제(DELETE)
    GETMESSAGE: '/sessions/{session_id}', // 특정 채팅방 메시지 조회(GET)
    SENDMESSAGE: '/sessions/{session_id}/chat', // 채팅방 메시지 전송(POST)
    MODIFYMESSAGE: '/sessions/chats/{message_id}', // 특정 채팅방 메시지 수정(PATCH)
  },

  // 판례 (Precedents)
  precedents: {
    INIT: '/precedents/init', // 법원명, 분류명, 선고명,매핑페이지, 타입, 오름차순(GET)
    PREVIEW: '/precedents', // 검색 하고 미리보기 page 별로 나눠서 보여주기(GET) - 쿼리 파라미터는 Service에서 처리
    TOTALDATA: '/precedents/{precedents_id}', // 판례 데이터 전문 조회(GET)
  },
} as const;


/*AI가 알려준 부분분*/

/* 1. 주소 뒤에 ?물음표 들은 다 지우세요! (가장 중요)
PREVIEW에 적으신 ?limit=10&page=1... 같은 **검색 조건(Query String)**은 여기서 고정해버리면 안 됩니다.

이유: 유저가 2페이지를 누르면 page=2로 바뀌어야 하는데, 상수에 page=1이라고 박아두면 바꾸기가 힘들어집니다.

해결: 상수는 깔끔하게 /precedents만 적고, 뒤에 붙는 조건들은 나중에 Service 함수에서 붙이는 게 정석입니다.

2. {session_id} 같은 구멍 뚫린 주소
/sessions/{session_id} 처럼 변수가 들어갈 자리를 표시한 건 아주 잘하셨습니다. 나중에 이 {session_id} 부분을 실제 ID 값으로 갈아끼워주는 함수를 쓰면 됩니다.

3. "Webhook 이거 뭐지?" 에 대한 답변
코드에 주석으로 적어두신 질문(//webhook 이거 뭐지?)에 답해드릴게요.

**웹훅(Webhook)**은 보통 "클러크(Clerk) 서버가 → 우리 백엔드 서버한테" "야, 방금 누가 가입했어!"라고 알려주는 서버끼리의 통신입니다.

결론: 프론트엔드(우리 웹사이트)에서 이 주소로 요청을 보낼 일은 99% 없습니다.

액션: 백엔드 개발자에게 "이거 프론트에서 호출하는 거 맞나요? 아니면 서버끼리 쓰는 건가요?" 라고 물어보세요. (아마 지워도 될 겁니다.)*/


// export const API_ENDPOINTS = {
//   // 1. 사용자 (User)
//   USERS: {
//     SIGNUP: '/users/signup',
//     LOGIN: '/users/login',
//     LOGOUT: '/users/logout',
//     REFRESH: '/users/token/refresh',
//     VERIFY: '/users/token/verify',
//     ME: '/users/me',
//   },

//   // 2. 웹훅 (확인 필요 - 프론트에서 호출 안 할 가능성 높음)
//   WEBHOOKS: {
//     CREATE: '/webhooks/clerk',
//   },

//   // 3. 채팅 세션 (Session)
//   SESSIONS: {
//     BASE: '/sessions',                 // 목록 조회(GET), 생성(POST) 공통
//     DETAIL: '/sessions/:id',           // 수정(PATCH), 삭제(DELETE) 공통
//     SEND_CHAT: '/sessions/:id/chat',   // 메시지 전송
//     MESSAGES: '/sessions/:id/messages',// 메시지 조회
//     MODIFY_MSG: '/sessions/chats/:id', // 특정 메시지 수정
//   },

//   // 4. 판례 (Precedents)
//   PRECEDENTS: {
//     INIT: '/precedents/init',
//     SEARCH: '/precedents',            // ?뒤에 붙는 건 제거함 (Service에서 처리)
//     DETAIL: '/precedents/:id',        // 판례 상세 조회
//   },
// } as const;

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
