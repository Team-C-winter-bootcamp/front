import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../api'
import { SENDMESSAGERequest, MODIFYMESSAGERequest } from '../api/types'
import { sessionKeys } from './useSessions'

/**
 * 채팅 메시지 조회 Hook
 */
export const useSessionMessages = (sessionId: number | null) => {
  return useQuery({
    queryKey: sessionKeys.messages(sessionId!),
    queryFn: () => sessionService.getMessage(sessionId!),
    enabled: !!sessionId, // sessionId가 있을 때만 조회
    staleTime: 10 * 1000, // 10초간 fresh 상태 유지
  })
}

/**
 * 메시지 전송 Hook
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: SENDMESSAGERequest }) =>
      sessionService.sendMessage(sessionId, data),
    onSuccess: (_, variables) => {
      // 메시지 목록 갱신
      queryClient.invalidateQueries({ queryKey: sessionKeys.messages(variables.sessionId) })
    },
  })
}

/**
 * 메시지 수정 Hook
 */
export const useModifyMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, data }: { messageId: number; data: MODIFYMESSAGERequest }) =>
      sessionService.modifyMessage(messageId, data),
    onSuccess: (_, variables) => {
      // 해당 메시지가 속한 세션의 메시지 목록 갱신
      // messageId로 sessionId를 찾아야 하는데, API 응답에 포함되어 있다면 사용
      // 여기서는 전체 메시지 목록을 갱신 (실제로는 sessionId를 전달받아야 함)
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
    },
  })
}
