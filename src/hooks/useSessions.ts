import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../api'
import { GETLISTData, MODIFYRequest } from '../api/types'
import { getSessionId } from '../utils/sessionStorage'

/**
 * React Query Keys
 * session_id를 포함하여 user별로 캐시를 분리합니다.
 */
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (sessionId: string | null) => [...sessionKeys.lists(), sessionId] as const,
  detail: (sessionId: number) => [...sessionKeys.all, 'detail', sessionId] as const,
  messages: (sessionId: number) => [...sessionKeys.all, 'messages', sessionId] as const,
}

/**
 * 채팅 목록 조회 Hook
 * 
 * session_id 기준으로 user별 데이터가 자동으로 분리됩니다.
 * React Query가 session_id를 queryKey에 포함하여 캐싱합니다.
 */
export const useSessions = () => {
  const currentSessionId = getSessionId()

  return useQuery({
    queryKey: sessionKeys.list(currentSessionId),
    queryFn: async () => {
      const sessions = await sessionService.getList()
      // 북마크된 항목을 먼저, 그 다음 최신순으로 정렬
      return sessions.sort((a, b) => {
        if (a.bookmark !== b.bookmark) {
          return a.bookmark ? -1 : 1
        }
        return b.id - a.id // 최신순 (id가 큰 것이 최신)
      })
    },
    enabled: !!currentSessionId, // session_id가 있을 때만 조회
    staleTime: 30 * 1000, // 30초간 fresh 상태 유지
  })
}

/**
 * 채팅방 생성 Hook
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient()
  const currentSessionId = getSessionId()

  return useMutation({
    mutationFn: (message: string) => sessionService.newChat({ message }),
    onSuccess: () => {
      // 채팅 목록 갱신
      queryClient.invalidateQueries({ queryKey: sessionKeys.list(currentSessionId) })
    },
  })
}

/**
 * 채팅방 수정 Hook (제목, 북마크 포함)
 */
export const useUpdateSession = () => {
  const queryClient = useQueryClient()
  const currentSessionId = getSessionId()

  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: number; data: MODIFYRequest }) => {
      console.log('[useUpdateSession] mutationFn 호출:', { sessionId, data })
      try {
        const result = await sessionService.modify(sessionId, data)
        console.log('[useUpdateSession] API 호출 성공:', result)
        return result
      } catch (error) {
        console.error('[useUpdateSession] API 호출 실패:', error)
        throw error
      }
    },
    onSuccess: (data, variables) => {
      console.log('[useUpdateSession] onSuccess:', { data, variables })
      // 채팅 목록 갱신
      queryClient.invalidateQueries({ queryKey: sessionKeys.list(currentSessionId) })
      // 상세 정보도 갱신
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) })
    },
    onError: (error, variables) => {
      console.error('[useUpdateSession] onError:', { error, variables })
    },
  })
}

/**
 * 채팅방 삭제 Hook
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient()
  const currentSessionId = getSessionId()

  return useMutation({
    mutationFn: (sessionId: number) => sessionService.delete(sessionId),
    onSuccess: () => {
      // 채팅 목록 갱신
      queryClient.invalidateQueries({ queryKey: sessionKeys.list(currentSessionId) })
    },
  })
}

/**
 * 북마크 토글 Hook
 * 
 * 채팅방의 북마크 상태를 토글합니다.
 * user별로 북마크가 다르게 노출됩니다.
 */
export const useToggleBookmark = () => {
  const queryClient = useQueryClient()
  const currentSessionId = getSessionId()

  return useMutation({
    mutationFn: async ({ sessionId, currentBookmark }: { sessionId: number; currentBookmark: boolean }) => {
      // 현재 세션 목록에서 해당 세션의 제목 가져오기
      const currentData = queryClient.getQueryData<GETLISTData[]>(sessionKeys.list(currentSessionId))
      const session = currentData?.find((s) => s.id === sessionId)
      const currentTitle = session?.title || ''

      // Optimistic Update: 즉시 UI 업데이트
      queryClient.setQueryData<GETLISTData[]>(
        sessionKeys.list(currentSessionId),
        (old) => {
          if (!old) return old
          return old.map((session) =>
            session.id === sessionId ? { ...session, bookmark: !currentBookmark } : session
          )
        }
      )

      // 서버에 업데이트 요청 (기존 제목 유지)
      return sessionService.modify(sessionId, {
        title: currentTitle,
        bookmark: !currentBookmark,
      })
    },
    onSuccess: () => {
      // 서버 응답 후 목록 갱신
      queryClient.invalidateQueries({ queryKey: sessionKeys.list(currentSessionId) })
    },
    onError: (_, variables) => {
      // 에러 발생 시 롤백
      queryClient.setQueryData<GETLISTData[]>(
        sessionKeys.list(currentSessionId),
        (old) => {
          if (!old) return old
          return old.map((session) =>
            session.id === variables.sessionId ? { ...session, bookmark: variables.currentBookmark } : session
          )
        }
      )
    },
  })
}
