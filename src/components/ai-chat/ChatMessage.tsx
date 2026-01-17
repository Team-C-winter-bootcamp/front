import { Message } from '../../store/useStore'
import paper from '../../assets/paper.png'

interface ChatMessageProps {
  message: Message
  onResultClick?: (resultId: number) => void
}

export const ChatMessage = ({ message, onResultClick }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 프로필 아이콘 */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border font-light ${
          message.isUser 
            ? 'bg-[#111e31] text-white border-black' 
            : 'bg-[#F5F3EB] text-minimal-dark-gray border-minimal-gray'
        }`}>
          {message.isUser ? '나' : 'AI'}
        </div>

        {/* 메시지 버블 */}
        <div className={`px-5 py-3.5 shadow-sm text-base leading-relaxed font-light ${
          message.isUser 
            // 사용자: + 둥근 모서리 (오른쪽 위만 뾰족하게)
            ? 'bg-[#111e31] text-white rounded-[20px] rounded-tr-none' 
            // AI:  + 둥근 모서리 (왼쪽 위만 뾰족하게)
            : 'bg-[#F5F3EB] text-minimal-charcoal border border-minimal-gray rounded-[20px] rounded-tl-none'
        }`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
          
          {!message.isUser && message.resultId && onResultClick && (
            <div className="mt-4 pt-3 border-t border-minimal-gray">
              <button
                onClick={() => onResultClick(message.resultId!)}
                // 기존 hover 색상 변경 유지
                className="flex items-center gap-2 text-sm text-minimal-dark-gray hover:text-minimal-charcoal font-light transition-colors"
              >
                <div className="inline-block p-1 rounded-full">
                  <img 
                    src={paper} 
                    alt="paper" 
                    className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-50" 
                  />
                </div>
                {/* 텍스트에만 밑줄(underline)과 간격(offset) 추가 */}
                <span className="underline underline-gray underline-offset-2">
                  관련 판결문 분석 보기
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}