export const API_ENDPOINTS = {
  inits: { INIT: 'init' },
  cases: {
    INFO: 'cases/',
    SUMMARY: 'cases/{case_id}/{precedents_id}/',
    ANSWER: 'cases/{case_id}/{precedents_id}/answer',
    GETFILEDETAIL: 'cases/{case_id}/documents',
    CREATEFILE: 'cases/{case_id}/documents',
    MODIFYFILE: 'cases/{case_id}/documents',
  },
  users: { ME: 'users/me' },
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