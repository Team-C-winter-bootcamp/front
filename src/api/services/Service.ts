import apiClient from '../client';
import {
  GetCategoriesResponse,
  PostCaseInfoRequest,
  PostCaseInfoResponse,
  GetPrecedentDetailResponse,
  GetCaseDetailResponse,
  GenerateDocumentRequest,
  GenerateDocumentResponse,
  PatchDocumentRequest,
  StreamEventInfo,
  StreamEventChunk,
  StreamEventComplete,
  PatchDocumentErrorResponse,
} from '../types';
import { API_ENDPOINTS, replaceParams } from '../endpoints';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getCookie(name: string): string | null {
  if (!document.cookie) return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
}

export const initService = {
  getCategories: async (): Promise<GetCategoriesResponse> => {
    try {
      const response = await apiClient.get<GetCategoriesResponse>(API_ENDPOINTS.inits.INIT);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};

export const caseService = {
  createCase: async (data: PostCaseInfoRequest): Promise<PostCaseInfoResponse> => {
    try {
      const response = await apiClient.post<PostCaseInfoResponse>(API_ENDPOINTS.cases.INFO, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  getPrecedentDetail: async (caseId: number, precedentsId: string): Promise<GetPrecedentDetailResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.SUMMARY, { case_id: caseId, precedents_id: precedentsId });
      const response = await apiClient.get<GetPrecedentDetailResponse>(endpoint, { timeout: 60000 });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  getCaseDetail: async (caseId: number, precedentsId: string): Promise<GetCaseDetailResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.ANSWER, { case_id: caseId, precedents_id: precedentsId });
      const response = await apiClient.get<GetCaseDetailResponse>(endpoint);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  generateDocument: async (caseId: number, data: GenerateDocumentRequest): Promise<GenerateDocumentResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.CREATEFILE, { case_id: caseId });
      const response = await apiClient.post<GenerateDocumentResponse>(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  modifyDocument: async (
    caseId: number,
    data: PatchDocumentRequest,
    callbacks: {
      onInfo?: (event: StreamEventInfo) => void;
      onChunk?: (event: StreamEventChunk) => void;
      onComplete?: (event: StreamEventComplete) => void;
      onError?: (error: PatchDocumentErrorResponse | Error) => void;
    }
  ): Promise<void> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.MODIFYFILE, { case_id: caseId });
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'text/event-stream' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) headers['X-CSRFToken'] = csrfToken;
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        callbacks.onError?.(await response.json() as PatchDocumentErrorResponse);
        return;
      }
      if (!response.body) {
        callbacks.onError?.(new Error('응답 본문이 없습니다.'));
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.status === 'processing' && parsed.extracted_fields) {
                callbacks.onInfo?.(parsed as StreamEventInfo);
              } else if (parsed.text) {
                callbacks.onChunk?.(parsed as StreamEventChunk);
              } else if (parsed.status === 'success' && parsed.document_id) {
                callbacks.onComplete?.(parsed as StreamEventComplete);
                return;
              }
            } catch (parseError) {
              console.error('SSE 데이터 파싱 오류:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      callbacks.onError?.(error.response?.data || error);
    }
  },
};

export const userService = {
  getMe: async (): Promise<any> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.users.ME);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '사용자 정보를 가져오는데 실패했습니다.');
  },
};

export const sessionService = {
  newChat: async (data: any): Promise<any> => {
    const response = await apiClient.post<any>(API_ENDPOINTS.session.NEWCHAT, data);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '채팅방 생성에 실패했습니다.');
  },
  getList: async (): Promise<any[]> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.session.GETLIST);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '채팅방 목록을 가져오는데 실패했습니다.');
  },
  modify: async (sessionId: number, data: any): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.MODIFY, { session_id: sessionId });
    const response = await apiClient.patch<any>(endpoint, data);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '채팅방 수정에 실패했습니다.');
  },
  delete: async (sessionId: number): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.DELETE, { session_id: sessionId });
    const response = await apiClient.delete<any>(endpoint);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '채팅방 삭제에 실패했습니다.');
  },
  getMessage: async (sessionId: number): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.GETMESSAGE, { session_id: sessionId });
    const response = await apiClient.get<any>(endpoint);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '메시지를 가져오는데 실패했습니다.');
  },
  sendMessage: async (sessionId: number, data: any): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.SENDMESSAGE, { session_id: sessionId });
    const response = await apiClient.post<any>(endpoint, data);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '메시지 전송에 실패했습니다.');
  },
  modifyMessage: async (messageId: number, data: any): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.MODIFYMESSAGE, { message_id: messageId });
    const response = await apiClient.patch<any>(endpoint, data);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '메시지 수정에 실패했습니다.');
  },
};

export const precedentService = {
  preview: async (params?: { page?: number; limit?: number; q?: string; categories?: string[]; outcome?: string; court?: string; date?: string }): Promise<any> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.precedents.PREVIEW, { params });
    return response.data;
  },
  getTotalData: async (precedentsId: string): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.precedents.TOTALDATA, { precedents_id: precedentsId });
    const response = await apiClient.get<any>(endpoint);
    if (response.data.data) return response.data.data;
    throw new Error(response.data.message || '판례 데이터를 가져오는데 실패했습니다.');
  },
};
