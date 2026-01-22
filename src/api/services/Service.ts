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
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    caseId: number,
    precedentsId: number
  ): Promise<GetPrecedentDetailResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.SUMMARY, {
        case_id: caseId,
        precedents_id: precedentsId,
      });
      const response = await apiClient.get<GetPrecedentDetailResponse>(endpoint);
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
    precedentsId: number
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

      // 토큰 가져오기 (Clerk에서 동적으로 가져오기)
      let token: string | null = null;
      try {
        if (typeof window !== 'undefined' && (window as any).__clerk) {
          const clerk = (window as any).__clerk;
          if (clerk.session) {
            token = await clerk.session.getToken();
          }
        }
      } catch (error) {
        console.warn('Clerk 토큰을 가져오는데 실패했습니다:', error);
        token = localStorage.getItem('clerk-session-token');
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // fetch API를 사용한 SSE 스트리밍 (PATCH 요청 지원)
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
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
