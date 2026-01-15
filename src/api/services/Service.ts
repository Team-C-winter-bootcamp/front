import apiClient from '../client'
import {
  ApiResponse,
  UserProfile,
  NEWCHATRequest,
  NEWCHATRequestData,
  GETLISTData,
  MODIFYRequest,
  MODIFYData,
  DELETEData,
  GETMESSAGEData,
  SENDMESSAGERequest,
  SENDMESSAGEData,
  MODIFYMESSAGERequest,
  MODIFYMESSAGEData,
  PREVIEW,
  TOTALDATAData,
} from '../types'
import { API_ENDPOINTS, replaceParams } from '../endpoints'

/*사용자 관련 API 서비스*/
export const userService = {
  /*현재 사용자 정보 조회(GET)*/
  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
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
  newChat: async (data: NEWCHATRequest): Promise<NEWCHATRequestData> => {
    const response = await apiClient.post<ApiResponse<NEWCHATRequestData>>(
      API_ENDPOINTS.session.NEWCHAT,
      data
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 생성에 실패했습니다.')
  },

  /*채팅방 목록 전체 조회(GET)*/
  getList: async (): Promise<GETLISTData[]> => {
    const response = await apiClient.get<ApiResponse<GETLISTData[]>>(
      API_ENDPOINTS.session.GETLIST
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 목록을 가져오는데 실패했습니다.')
  },

  /*채팅방 수정(PATCH)*/
  modify: async (sessionId: number, data: MODIFYRequest): Promise<MODIFYData> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.MODIFY, { session_id: sessionId })
    const response = await apiClient.patch<ApiResponse<MODIFYData>>(
      endpoint,
      data
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 수정에 실패했습니다.')
  },

  /*채팅방 삭제(DELETE)*/
  delete: async (sessionId: number): Promise<DELETEData> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.DELETE, { session_id: sessionId })
    const response = await apiClient.delete<ApiResponse<DELETEData>>(endpoint)

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '채팅방 삭제에 실패했습니다.')
  },

  /*특정 채팅방 메시지 조회(GET)*/
  getMessage: async (sessionId: number): Promise<GETMESSAGEData> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.GETMESSAGE, { session_id: sessionId })
    const response = await apiClient.get<ApiResponse<GETMESSAGEData>>(endpoint)

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '메시지를 가져오는데 실패했습니다.')
  },

  /*채팅방 메시지 전송(POST)*/
  sendMessage: async (sessionId: number, data: SENDMESSAGERequest): Promise<SENDMESSAGEData> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.SENDMESSAGE, { session_id: sessionId })
    const response = await apiClient.post<ApiResponse<SENDMESSAGEData>>(
      endpoint,
      data
    )

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '메시지 전송에 실패했습니다.')
  },

  /*특정 채팅방 메시지 수정(PATCH)*/
  modifyMessage: async (messageId: number, data: MODIFYMESSAGERequest): Promise<MODIFYMESSAGEData> => {
    const endpoint = replaceParams(API_ENDPOINTS.session.MODIFYMESSAGE, { message_id: messageId })
    const response = await apiClient.patch<ApiResponse<MODIFYMESSAGEData>>(
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
  }): Promise<PREVIEW> => {
    const response = await apiClient.get<PREVIEW>(
      API_ENDPOINTS.precedents.PREVIEW,
      { params }
    )

    // PREVIEW는 ApiResponse 래퍼가 아닌 직접 응답 구조
    return response.data
  },

  /*판례 데이터 전문 조회(GET)*/
  getTotalData: async (precedentsId: string): Promise<TOTALDATAData> => {
    const endpoint = replaceParams(API_ENDPOINTS.precedents.TOTALDATA, { precedents_id: precedentsId })
    const response = await apiClient.get<ApiResponse<TOTALDATAData>>(endpoint)

    if (response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || '판례 데이터를 가져오는데 실패했습니다.')
  },
}
