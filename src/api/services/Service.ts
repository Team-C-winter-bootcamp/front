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

// API Base URL 설정 (환경 변수에서 가져오거나 기본값 사용)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 쿠키에서 특정 이름의 값을 가져오는 헬퍼 함수
 */
function getCookie(name: string): string | null {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ==========================================
// 서비스 함수들
// ==========================================

/**
 * 1. INIT - 사용자/카테고리 초기화
 */
export const initService = {
  getCategories: async (): Promise<GetCategoriesResponse> => {
    try {
      const response = await apiClient.get<GetCategoriesResponse>(
        API_ENDPOINTS.inits.INIT
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};

/**
 * 2. CASES - 사건 정보 등록
 */
export const caseService = {
  /**
   * 사건 정보 등록 (POST)
   */
  createCase: async (data: PostCaseInfoRequest): Promise<PostCaseInfoResponse> => {
    try {
      const response = await apiClient.post<PostCaseInfoResponse>(
        API_ENDPOINTS.cases.INFO,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  /**
   * 판례 상세 및 AI 분석 조회 (GET)
   */
  getPrecedentDetail: async (
    precedentsId: string
  ): Promise<GetPrecedentDetailResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.SUMMARY, {
        precedents_id: precedentsId,
      });
      console.log('getPrecedentDetail 호출:', {
        precedentsId,
        endpoint,
        fullUrl: `${BASE_URL}${endpoint}`
      });
      // 타임아웃을 60초로 증가
      const response = await apiClient.get<GetPrecedentDetailResponse>(endpoint, {
        timeout: 60000,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  /**
   * 사건 분석 결과 조회 (GET)
   */
  getCaseDetail: async (
    caseId: number,
    precedentsId: string
  ): Promise<GetCaseDetailResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.ANSWER, {
        case_id: caseId,
        precedents_id: precedentsId,
      });
      const response = await apiClient.get<GetCaseDetailResponse>(endpoint);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  /**
   * 문서 생성 (POST)
   */
  generateDocument: async (
    caseId: number,
    data: GenerateDocumentRequest
  ): Promise<GenerateDocumentResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.CREATEFILE, {
        case_id: caseId,
      });
      const response = await apiClient.post<GenerateDocumentResponse>(
        endpoint,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  /**
   * 문서 수정 (PATCH) - SSE 스트리밍
   * @param caseId - 사건 ID
   * @param data - 수정 요청 데이터
   * @param callbacks - 이벤트 핸들러들
   */
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
      const endpoint = replaceParams(API_ENDPOINTS.cases.MODIFYFILE, {
        case_id: caseId,
      });

      // 토큰 가져오기
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      // CSRF 토큰 추가
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      // fetch API를 사용한 SSE 스트리밍 (PATCH 요청 지원)
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        credentials: 'include', // 자격 증명(쿠키 포함)을 함께 보냄
      });

      if (!response.ok) {
        const errorData = await response.json();
        callbacks.onError?.(errorData as PatchDocumentErrorResponse);
        return;
      }

      if (!response.body) {
        callbacks.onError?.(new Error('응답 본문이 없습니다.'));
        return;
      }

      // ReadableStream을 사용하여 SSE 이벤트 파싱
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
              const jsonStr = line.slice(6);
              const parsed = JSON.parse(jsonStr);

              // 이벤트 타입에 따라 처리
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
      if (error.response?.data) {
        callbacks.onError?.(error.response.data);
      } else {
        callbacks.onError?.(error);
      }
    }
  },
};

// ==========================================
// 기존 서비스들 (userService, sessionService, precedentService)
// ==========================================

/*사용자 관련 API 서비스*/
export const userService = {
  /*현재 사용자 정보 조회(GET)*/
  getMe: async (): Promise<any> => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.users.ME
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '사용자 정보를 가져오는데 실패했습니다.')
  },
}

/*세션(채팅방) 관련 API 서비스*/
export const sessionService = {
  /*새로운 채팅방 생성(POST)*/
  newChat: async (data: any): Promise<any> => {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.session.NEWCHAT,
      data
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 생성에 실패했습니다.')
  },

  /*채팅방 목록 전체 조회(GET)*/
  getList: async (): Promise<any[]> => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.session.GETLIST
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 목록을 가져오는데 실패했습니다.')
  },

  /*채팅방 수정(PATCH)*/
  modify: async (sessionId: number, data: any): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.MODIFY, { session_id: sessionId })
    const response = await apiClient.patch<any>(
      endpoint,
      data
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 수정에 실패했습니다.')
  },

  /*채팅방 삭제(DELETE)*/
  delete: async (sessionId: number): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.DELETE, { session_id: sessionId })
    const response = await apiClient.delete<any>(endpoint)

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 삭제에 실패했습니다.')
  },

  /*특정 채팅방 메시지 조회(GET)*/
  getMessage: async (sessionId: number): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.GETMESSAGE, { session_id: sessionId })
    const response = await apiClient.get<any>(endpoint)

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '메시지를 가져오는데 실패했습니다.')
  },

  /*채팅방 메시지 전송(POST)*/
  sendMessage: async (sessionId: number, data: any): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.SENDMESSAGE, { session_id: sessionId })
    const response = await apiClient.post<any>(
      endpoint,
      data
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '메시지 전송에 실패했습니다.')
  },

  /*특정 채팅방 메시지 수정(PATCH)*/
  modifyMessage: async (messageId: number, data: any): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.MODIFYMESSAGE, { message_id: messageId })
    const response = await apiClient.patch<any>(
      endpoint,
      data
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '메시지 수정에 실패했습니다.')
  },
}

/*판례 관련 API 서비스*/
export const precedentService = {
  /**
   * 판례 검색 및 미리보기
   * @param params - 검색 조건 (page, limit, q, categories, outcome, court, date 등)
   */
  preview: async (params?: {
    page?: number
    limit?: number
    q?: string
    categories?: string[]
    outcome?: string
    court?: string
    date?: string
  }): Promise<any> => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.precedents.PREVIEW,
      { params }
    )

    // PREVIEW는 ApiResponse 래퍼가 아닌 직접 응답 구조
    return response.data
  },

  /*판례 데이터 전문 조회(GET)*/
  getTotalData: async (precedentsId: string): Promise<any> => {
    const endpoint = replaceParams(API_ENDPOINTS.precedents.TOTALDATA, { precedents_id: precedentsId })
    const response = await apiClient.get<any>(endpoint)

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '판례 데이터를 가져오는데 실패했습니다.')
  },
}
