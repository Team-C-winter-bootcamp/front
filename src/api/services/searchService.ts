import apiClient from '../client'
import { SearchRequest, SearchResult, JudgmentDetail, ApiResponse, PaginatedResponse } from '../types'
import { API_ENDPOINTS, replaceParams } from '../endpoints'

/**
 * 검색 관련 API 서비스
 */
export const searchService = {
  /**
   * 판례 검색
   */
  search: async (params: SearchRequest): Promise<PaginatedResponse<SearchResult>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SearchResult>>>(
      API_ENDPOINTS.SEARCH.SEARCH,
      { params }
    )
    
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || '검색에 실패했습니다.')
  },

  /**
   * 판례 상세 조회
   */
  getJudgmentDetail: async (id: number): Promise<JudgmentDetail> => {
    const endpoint = replaceParams(API_ENDPOINTS.SEARCH.DETAIL, { id })
    const response = await apiClient.get<ApiResponse<JudgmentDetail>>(endpoint)
    
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || '판례 상세 정보를 가져오는데 실패했습니다.')
  },
}
