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
  // 버튼은 사라졌지만 부모 컴포넌트와의 호환성을 위해 Props 타입은 유지하거나,
  // 필요 없다면 부모에서 전달하는 부분도 같이 수정해야 합니다.
  // 여기서는 타입 에러 방지를 위해 Props는 그대로 두었습니다.
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
}: ChatAreaProps) => {
  // 메시지가 변경되거나 처리 중일 때 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing, chatEndRef])

  return (
    <div className="flex-1 flex flex-col bg-[#F5F3EB] overflow-hidden relative border-r border-minimal-gray font-serif">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F3EB] custom-scrollbar">
        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full text-minimal-medium-gray">
            <h3 className="text-3xl font-light text-minimal-charcoal mb-2 tracking-tight">
              {sessionName}
            </h3>
            <p className="text-sm font-light">왼쪽 하단 '소스'에 파일을 올려 대화를 시작하세요.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl flex gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.isSummary && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border font-light ${
                  msg.isUser 
                    ? 'bg-[#111e31] text-white border-black' 
                    : 'bg-[#F5F3EB] text-minimal-dark-gray border-minimal-gray'
                }`}>
                  {msg.isUser ? '나' : 'AI'}
                </div>
              )}

              <div 
                className={`relative p-4 shadow-sm text-base leading-relaxed font-light ${
                  msg.isSummary 
                    ? 'bg-[#F5F3EB] border border-minimal-gray w-full ml-0 rounded-lg' 
                    : msg.isUser 
                      ? 'bg-[#111e31] text-white rounded-[20px] rounded-tr-none px-5 py-3.5' 
                      : 'bg-[#F5F3EB] text-minimal-charcoal border border-minimal-gray rounded-[20px] rounded-tl-none px-5 py-3.5'
                }`}
              >
                {msg.isSummary && (
                  <div className="font-medium text-minimal-charcoal mb-2 pb-2 border-b border-minimal-gray flex items-center gap-2 bg-[#F5F3EB]">
                    문서 분석 결과
                  </div>
                )}

                <p className={`whitespace-pre-wrap ${msg.isSummary ? 'text-minimal-charcoal bg-[#F5F3EB]' : ''}`}>
                  {msg.text}
                </p>

                {!msg.isUser && (
                  <div className="flex justify-end mt-3 pt-2">
                    <button
                      onClick={() => onAddToMemo(msg.text, msg.fileName)}
                      className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-all duration-200 font-light shadow-md bg-[#CFB982] text-white hover:bg-[#C8A45D]"
                    >
                      메모에 추가
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 bg-[#F5F3EB] border border-minimal-gray rounded-full flex items-center justify-center text-minimal-dark-gray text-xs font-light">AI</div>
            <div className="bg-[#F5F3EB] border border-minimal-gray rounded-[20px] rounded-tl-none px-5 py-3.5 flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 bg-minimal-medium-gray rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-minimal-medium-gray rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-minimal-medium-gray rounded-full animate-bounce delay-150"></span>
              <span className="text-xs text-minimal-medium-gray ml-1 font-light">분석 중...</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      <div className="p-4 bg-[#F5F3EB] border-t border-minimal-gray flex-shrink-0 z-10 p-8">
        <form onSubmit={onChatSend} className="max-w-5xl mx-auto relative flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="LAWDING에게 물어보기"
            className="flex-1 pl-4 pr-12 py-3 bg-[#F5F3EB] border border-minimal-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-minimal-charcoal focus:border-minimal-charcoal focus:bg-[#F5F3EB] transition-all font-light"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isProcessing}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
              chatInput.trim() && !isProcessing
                ? 'bg-[#C8A45D] text-white hover:bg-[#b8934d]'
                : 'bg-minimal-gray text-minimal-medium-gray cursor-not-allowed'
            }`}
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