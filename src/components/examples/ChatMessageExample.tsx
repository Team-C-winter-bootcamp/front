/**
 * 채팅 메시지 조회 및 전송 예시 컴포넌트
 */

import { useState } from 'react'
import { useSessionMessages, useSendMessage } from '../../hooks/useSessionMessages'

interface ChatMessageExampleProps {
  sessionId: number
}

export const ChatMessageExample = ({ sessionId }: ChatMessageExampleProps) => {
  const [message, setMessage] = useState('')

  // 메시지 목록 조회
  const { data: messageData, isLoading, error } = useSessionMessages(sessionId)
  
  // 메시지 전송 mutation
  const sendMessage = useSendMessage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    sendMessage.mutate(
      { sessionId, data: { message } },
      {
        onSuccess: () => {
          setMessage('') // 입력 필드 초기화
          console.log('메시지가 전송되었습니다.')
        },
        onError: (error) => {
          console.error('메시지 전송 실패:', error)
        },
      }
    )
  }

  if (isLoading) {
    return <div>메시지를 불러오는 중...</div>
  }

  if (error) {
    return <div>에러가 발생했습니다: {error.message}</div>
  }

  const messages = messageData?.messages || []

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100 mr-auto'
            }`}
          >
            <div className="text-sm font-medium mb-1">
              {msg.role === 'user' ? '사용자' : 'AI'}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={sendMessage.isPending || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {sendMessage.isPending ? '전송 중...' : '전송'}
          </button>
        </div>
      </form>
    </div>
  )
}
