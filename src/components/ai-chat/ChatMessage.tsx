import { Message } from '../../store/useStore'

interface ChatMessageProps {
  message: Message
  onResultClick?: (resultId: number) => void
}

export const ChatMessage = ({ message, onResultClick }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm border ${
          message.isUser ? 'bg-black text-white border-black' : 'bg-white text-blue-600 border-gray-200'
        }`}>
          {message.isUser ? '나' : 'AI'}
        </div>

        <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-base leading-relaxed ${
          message.isUser 
            ? 'bg-black text-white rounded-tr-none' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
        }`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
          
          {!message.isUser && message.resultId && onResultClick && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => onResultClick(message.resultId!)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
              >
                📄 관련 판결문 분석 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
