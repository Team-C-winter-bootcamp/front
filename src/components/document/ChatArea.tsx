import { useEffect } from 'react'
import { ChatMessage } from '../../hooks/useChatSessions'

interface ChatAreaProps {
  messages: ChatMessage[]
  isProcessing: boolean
  chatInput: string
  setChatInput: (value: string) => void
  onChatSend: (e: React.FormEvent) => void
  onAddToMemo: (content: string, titleHint?: string) => void
  chatEndRef: React.RefObject<HTMLDivElement>
  sessionName: string
  isLeftPanelOpen: boolean
  isRightPanelOpen: boolean
  onLeftPanelToggle: () => void
  onRightPanelToggle: () => void
}

export const ChatArea = ({
  messages,
  isProcessing,
  chatInput,
  setChatInput,
  onChatSend,
  onAddToMemo,
  chatEndRef,
  sessionName,
  isLeftPanelOpen,
  isRightPanelOpen,
  onLeftPanelToggle,
  onRightPanelToggle
}: ChatAreaProps) => {
  // 메시지가 변경되거나 처리 중일 때 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing, chatEndRef])

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative border-r border-gray-200">
      {/* 패널 펼치기 버튼 (왼쪽) */}
      {!isLeftPanelOpen && (
        <div className="absolute top-4 left-4 z-20">
          <button 
            onClick={onLeftPanelToggle} 
            className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-bold"
          >
            ➜
          </button>
        </div>
      )}

      {/* 패널 펼치기 버튼 (오른쪽) */}
      {!isRightPanelOpen && (
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={onRightPanelToggle} 
            className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-bold"
          >
            ⬅
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4 opacity-20">💬</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {sessionName}
            </h3>
            <p className="text-sm">왼쪽 하단 '소스'에 파일을 올려 대화를 시작하세요.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl flex gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.isSummary && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border ${
                  msg.isUser ? 'bg-black text-white border-black' : 'bg-white text-blue-600 border-gray-200'
                }`}>
                  {msg.isUser ? '나' : 'AI'}
                </div>
              )}

              <div
                className={`relative p-4 rounded-2xl shadow-sm text-base leading-relaxed ${
                  msg.isSummary 
                    ? 'bg-blue-50 border border-blue-100 w-full ml-0' 
                    : msg.isUser 
                      ? 'bg-black text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 rounded-tl-none'
                }`}
              >
                {msg.isSummary && (
                  <div className="font-bold text-blue-800 mb-2 pb-2 border-b border-blue-100 flex items-center gap-2">
                    <span>📑</span> 문서 분석 결과
                  </div>
                )}

                <p className={`whitespace-pre-wrap ${msg.isSummary ? 'text-gray-800' : ''}`}>
                  {msg.text}
                </p>

                {!msg.isUser && (
                  <div className="flex justify-end mt-3 pt-2">
                    <button
                      onClick={() => onAddToMemo(msg.text, msg.fileName)}
                      className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${
                        msg.isSummary 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>📝</span> 메모에 추가
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 text-xs">AI</div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="text-xs text-gray-400 ml-1">분석 중...</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 z-10">
        <form onSubmit={onChatSend} className="max-w-4xl mx-auto relative flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="문서 내용에 대해 질문해보세요..."
            className="flex-1 pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isProcessing}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
