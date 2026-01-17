import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, sessionService, precedentService } from '../api'
import { NEWCHATRequest, MODIFYRequest } from '../api/types'

/**
 * React Query를 사용한 API 호출 예제 컴포넌트
 * 
 * 이 컴포넌트는 README.md의 5번 과정을 기반으로 작성되었습니다.
 * - useQuery: GET 요청 (데이터 조회)
 * - useMutation: POST, PATCH, DELETE 요청 (데이터 변경)
 * - useQueryClient: 캐시 관리
 */
export const ApiExample = () => {
  const queryClient = useQueryClient()

  // ============================================
  // Query 예제 (GET 요청)
  // ============================================

  /* 1. 사용자 정보 조회 */
  const {
    data: userProfile,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userService.getMe(),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  })

  /* 2. 채팅방 목록 조회 */
  const {
    data: sessionList,
    isLoading: isSessionListLoading,
    error: sessionListError,
    refetch: refetchSessionList,
  } = useQuery({
    queryKey: ['sessions', 'list'],
    queryFn: () => sessionService.getList(),
  })

  /* 3. 특정 채팅방 메시지 조회 (조건부 쿼리) */
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  
  const {
    data: messages,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ['sessions', selectedSessionId, 'messages'],
    queryFn: () => sessionService.getMessage(selectedSessionId!),
    enabled: selectedSessionId !== null, // selectedSessionId가 있을 때만 실행
  }) 

  /* 4. 판례 검색 (파라미터가 있는 쿼리) */
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    q: '',
  })

  const {
    data: precedentPreview,
    isLoading: isPrecedentLoading,
    error: precedentError,
  } = useQuery({
    queryKey: ['precedents', 'preview', searchParams],
    queryFn: () => precedentService.preview(searchParams),
    enabled: searchParams.q.length > 0, // 검색어가 있을 때만 실행
  })

  // ============================================
  // Mutation 예제 (POST, PATCH, DELETE 요청)
  // ============================================

  /* 1. 새 채팅방 생성 (POST) */
  const createSessionMutation = useMutation({
    mutationFn: (data: NEWCHATRequest) => sessionService.newChat(data),
    onSuccess: () => {
      // 성공 시 채팅방 목록 캐시 무효화하여 자동으로 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['sessions', 'list'] })
      alert('채팅방이 생성되었습니다!')
    },
    onError: (error: Error) => {
      alert(`채팅방 생성 실패: ${error.message}`)
    },
  })

  /* 2. 채팅방 수정 (PATCH) */
  const modifySessionMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: MODIFYRequest }) =>
      sessionService.modify(sessionId, data),
    onSuccess: (_, variables) => {
      // 성공 시 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['sessions', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] })
      alert('채팅방이 수정되었습니다!')
    },
    onError: (error: Error) => {
      alert(`채팅방 수정 실패: ${error.message}`)
    },
  })

  /* 3. 채팅방 삭제 (DELETE) */
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: number) => sessionService.delete(sessionId),
    onSuccess: () => {
      // 성공 시 채팅방 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['sessions', 'list'] })
      alert('채팅방이 삭제되었습니다!')
    },
    onError: (error: Error) => {
      alert(`채팅방 삭제 실패: ${error.message}`)
    },
  })

  /* 4. 메시지 전송 (POST) */
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: number; message: string }) =>
      sessionService.sendMessage(sessionId, { message }),
    onSuccess: (_, variables) => {
      // 성공 시 해당 채팅방의 메시지 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId, 'messages'] })
    },
    onError: (error: Error) => {
      alert(`메시지 전송 실패: ${error.message}`)
    },
  })

  // ============================================
  // 이벤트 핸들러
  // ============================================

  const handleCreateSession = () => {
    createSessionMutation.mutate({ message: '안녕하세요!' })
  }

  const handleModifySession = (sessionId: number) => {
    modifySessionMutation.mutate({
      sessionId,
      data: { title: '수정된 제목', bookmark: false },
    })
  }

  const handleDeleteSession = (sessionId: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteSessionMutation.mutate(sessionId)
    }
  }

  const handleSendMessage = (sessionId: number) => {
    sendMessageMutation.mutate({ sessionId, message: '테스트 메시지' })
  }

  const handleSearch = () => {
    if (searchParams.q.trim()) {
      // 쿼리 파라미터가 변경되면 자동으로 다시 조회됨
      setSearchParams({ ...searchParams })
    }
  }

  // ============================================
  // 렌더링
  // ============================================

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">React Query API 호출 예제</h1>

      {/* 사용자 정보 조회 */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">1. 사용자 정보 조회 (useQuery)</h2>
        {isUserLoading && <p>로딩 중...</p>}
        {userError && <p className="text-red-500">에러: {userError.message}</p>}
        {userProfile && (
          <div className="bg-gray-50 p-3 rounded">
            <p>이름: {userProfile.name}</p>
            <p>이메일: {userProfile.email_address}</p>
          </div>
        )}
      </section>

      {/* 채팅방 목록 조회 */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">2. 채팅방 목록 조회 (useQuery)</h2>
        <button
          onClick={() => refetchSessionList()}
          className="mb-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          목록 새로고침
        </button>
        {isSessionListLoading && <p>로딩 중...</p>}
        {sessionListError && <p className="text-red-500">에러: {sessionListError.message}</p>}
        {sessionList && (
          <div className="space-y-2">
            {sessionList.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-gray-500">ID: {session.id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSessionId(session.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    메시지 보기
                  </button>
                  <button
                    onClick={() => handleModifySession(session.id)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                    disabled={modifySessionMutation.isPending}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    disabled={deleteSessionMutation.isPending}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 새 채팅방 생성 */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">3. 새 채팅방 생성 (useMutation)</h2>
        <button
          onClick={handleCreateSession}
          disabled={createSessionMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {createSessionMutation.isPending ? '생성 중...' : '새 채팅방 생성'}
        </button>
      </section>

      {/* 메시지 조회 (조건부 쿼리) */}
      {selectedSessionId && (
        <section className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            4. 메시지 조회 (조건부 useQuery) - 세션 ID: {selectedSessionId}
          </h2>
          {isMessagesLoading && <p>로딩 중...</p>}
          {messagesError && <p className="text-red-500">에러: {messagesError.message}</p>}
          {messages && (
            <div className="space-y-2">
              {messages.messages.map((msg) => (
                <div key={msg.id} className="bg-gray-50 p-2 rounded">
                  <p className="text-sm">
                    <span className="font-medium">{msg.role}</span>: {msg.content}
                  </p>
                </div>
              ))}
              <button
                onClick={() => handleSendMessage(selectedSessionId)}
                disabled={sendMessageMutation.isPending}
                className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                {sendMessageMutation.isPending ? '전송 중...' : '메시지 전송'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* 판례 검색 (파라미터 쿼리) */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">5. 판례 검색 (파라미터 useQuery)</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={searchParams.q}
            onChange={(e) => setSearchParams({ ...searchParams, q: e.target.value })}
            placeholder="검색어 입력"
            className="flex-1 px-3 py-2 border rounded"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            검색
          </button>
        </div>
        {isPrecedentLoading && <p>로딩 중...</p>}
        {precedentError && <p className="text-red-500">에러: {precedentError.message}</p>}
        {precedentPreview && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium">검색 결과</p>
            <p className="text-sm text-gray-600">
              총 {precedentPreview.meta.total_count}건
            </p>
            {/* 실제 데이터는 PREVIEWData[] 형태로 표시해야 함 */}
          </div>
        )}
      </section>
    </div>
  )
}
