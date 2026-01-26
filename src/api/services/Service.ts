import apiClient from '../client';
import {
  GetCategoriesResponse,
  PostCaseRequest,
  GetPrecedentDetailResponse,
  GetCaseDetailResponse,
  GenerateDocumentResponse,
  PostCaseInfoSuccess,
} from '../types';
import { API_ENDPOINTS, replaceParams } from '../endpoints';

// 문서 타입 정의
export type DocType = 'complaint' | 'notice' | 'agreement';


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
  /**
   * 내 사건 정보 저장 (POST)
   */
  createCase: async (data: PostCaseRequest): Promise<PostCaseInfoSuccess> => {
    try {
      const response = await apiClient.post<PostCaseInfoSuccess>(API_ENDPOINTS.cases.INFO, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * 판례 상세 및 AI 분석 조회 (GET)
   */
  getPrecedentDetail: async (precedentsId: string): Promise<GetPrecedentDetailResponse> => {
    try {
      const endpoint = replaceParams(API_ENDPOINTS.cases.SUMMARY, {
        precedents_id: precedentsId,
      });
      const response = await apiClient.get<GetPrecedentDetailResponse>(endpoint, {
        timeout: 60000,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * 내 사건 결과 예측 조회 (POST)
   */
  getCaseDetail: async (precedentsId: string, userCaseId: number): Promise<GetCaseDetailResponse> => {
    try {
      const endpoint = `cases/answer/${precedentsId}/`;
      const response = await apiClient.post<GetCaseDetailResponse>(endpoint, {
        timeout: 60000,
        case_id: userCaseId
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * AI 법률 문서 초안 생성 (POST)
   * 분리된 엔드포인트(/api/documents/{docType}/)를 동적으로 호출합니다.
   */
  generateDocument: async (
    docType: DocType, 
    data: { case_id: number; precedent: string }
  ): Promise<GenerateDocumentResponse> => {
    try {
      // 엔드포인트를 타입에 따라 결정 (예: documents/complaint/)
      const endpoint = `documents/${docType}/`;
      const response = await apiClient.post<GenerateDocumentResponse>(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * AI 기반 법률 문서 수정 (PATCH)
   * 기존 SSE 스트리밍 방식에서 일반 PATCH 요청 방식으로 전환하여 백엔드와 맞춤
   */
  updateDocument: async (
    docType: DocType, 
    data: { document_id: number; user_request: string }
  ): Promise<GenerateDocumentResponse> => {
    try {
      const endpoint = `documents/${docType}/`;
      const response = await apiClient.patch<GenerateDocumentResponse>(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
