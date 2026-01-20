import { useEffect } from 'react'
import { ChatMessage } from '../../hooks/useChatSessions'
import { WelcomeScreen } from './WelcomeScreen'

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

  // 메시지가 없고 처리 중이 아닐 때 WelcomeScreen 표시
  if (messages.length === 0 && !isProcessing) {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative border-r border-slate-200">
        <WelcomeScreen
          input={chatInput}
          setInput={setChatInput}
          onSend={onChatSend}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative border-r border-slate-200">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl flex gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.isSummary && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border font-light ${
                  msg.isUser 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-slate-600 border-slate-200'
                }`}>
                  {msg.isUser ? '나' : 'AI'}
                </div>
              )}

              <div 

                className={`relative p-4 shadow-sm text-base leading-relaxed font-light ${
                  msg.isSummary 
                    ? 'bg-slate-50 border border-slate-200 w-full ml-0 rounded-xl shadow-sm' 
                    : msg.isUser 
                      ? 'bg-indigo-600 text-white rounded-[20px] rounded-tr-none px-5 py-3.5 shadow-lg shadow-indigo-100' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-[20px] rounded-tl-none px-5 py-3.5 shadow-sm'
                }`}
              >
                {msg.isSummary && (
                  <div className="font-medium text-slate-800 mb-2 pb-2 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
                    문서 분석 결과
                  </div>
                )}

                <p className={`whitespace-pre-wrap ${msg.isSummary ? 'text-slate-800 bg-slate-50' : ''}`}>
                  {msg.text}
                </p>

                {!msg.isUser && (
                  <div className="flex justify-end mt-3 pt-2">
                    <button
                      onClick={() => onAddToMemo(msg.text.trim(), msg.fileName)}
                      className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-all duration-200 font-light shadow-md bg-indigo-600 text-white hover:bg-indigo-700"
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
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-light">AI</div>
            <div className="bg-white border border-slate-200 rounded-[20px] rounded-tl-none px-5 py-3.5 flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              <span className="text-xs text-slate-500 ml-1 font-light">분석 중...</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      <div className="p-8 bg-white border-t border-slate-200 flex-shrink-0 z-10">
        <form onSubmit={onChatSend} className="max-w-5xl mx-auto relative flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="LAWDING에게 물어보기"
            className="flex-1 pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all font-light shadow-sm"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isProcessing}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
              chatInput.trim() && !isProcessing
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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