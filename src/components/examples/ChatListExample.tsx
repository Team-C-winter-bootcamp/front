/**
 * 채팅 목록 조회 및 북마크 토글 예시 컴포넌트
 * 
 * 이 컴포넌트는 React Query 기반 custom hooks를 사용하여
 * 채팅 목록을 조회하고 북마크를 토글하는 방법을 보여줍니다.
 */

import { useSessions, useToggleBookmark, useDeleteSession } from '../../hooks/useSessions'

export const ChatListExample = () => {
  // 채팅 목록 조회
  const { data: sessions, isLoading, error } = useSessions()
  
  // 북마크 토글 mutation
  const toggleBookmark = useToggleBookmark()
  
  // 채팅방 삭제 mutation
  const deleteSession = useDeleteSession()

  // 북마크 토글 핸들러
  const handleToggleBookmark = (sessionId: number, currentBookmark: boolean) => {
    toggleBookmark.mutate(
      { sessionId, currentBookmark },
      {
        onSuccess: () => {
          console.log('북마크가 성공적으로 토글되었습니다.')
        },
        onError: (error) => {
          console.error('북마크 토글 실패:', error)
          // 에러 메시지 표시 등 추가 처리
        },
      }
    )
  }

  // 채팅방 삭제 핸들러
  const handleDeleteSession = (sessionId: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteSession.mutate(sessionId, {
        onSuccess: () => {
          console.log('채팅방이 삭제되었습니다.')
        },
        onError: (error) => {
          console.error('채팅방 삭제 실패:', error)
        },
      })
    }
  }

  if (isLoading) {
    return <div>채팅 목록을 불러오는 중...</div>
  }

  if (error) {
    return <div>에러가 발생했습니다: {error.message}</div>
  }

  if (!sessions || sessions.length === 0) {
    return <div>채팅 목록이 비어있습니다.</div>
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold mb-4">채팅 목록</h2>
      
      {/* 북마크된 채팅 목록 */}
      {sessions.filter(s => s.bookmark).length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">고정된 채팅</h3>
          {sessions
            .filter(s => s.bookmark)
            .map((session) => (
              <ChatListItem
                key={session.id}
                session={session}
                onToggleBookmark={handleToggleBookmark}
                onDelete={handleDeleteSession}
                isToggling={toggleBookmark.isPending}
              />
            ))}
        </div>
      )}

      {/* 일반 채팅 목록 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">일반 채팅</h3>
        {sessions
          .filter(s => !s.bookmark)
          .map((session) => (
            <ChatListItem
              key={session.id}
              session={session}
              onToggleBookmark={handleToggleBookmark}
              onDelete={handleDeleteSession}
              isToggling={toggleBookmark.isPending}
            />
          ))}
      </div>
    </div>
  )
}

/**
 * 채팅 목록 아이템 컴포넌트
 */
interface ChatListItemProps {
  session: {
    id: number
    title: string
    bookmark: boolean
  }
  onToggleBookmark: (sessionId: number, currentBookmark: boolean) => void
  onDelete: (sessionId: number) => void
  isToggling: boolean
}

const ChatListItem = ({ session, onToggleBookmark, onDelete, isToggling }: ChatListItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <h4 className="font-medium">{session.title}</h4>
        <p className="text-sm text-gray-500">ID: {session.id}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* 북마크 토글 버튼 */}
        <button
          onClick={() => onToggleBookmark(session.id, session.bookmark)}
          disabled={isToggling}
          className={`p-2 rounded ${
            session.bookmark
              ? 'text-yellow-500 hover:bg-yellow-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={session.bookmark ? '북마크 해제' : '북마크 고정'}
        >
          {session.bookmark ? '⭐' : '☆'}
        </button>
        
        {/* 삭제 버튼 */}
        <button
          onClick={() => onDelete(session.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
