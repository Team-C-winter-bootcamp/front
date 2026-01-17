import logoImage from '../../assets/logo.png'
import { Send, Mic } from 'lucide-react'

interface WelcomeScreenProps {
  input: string
  setInput: (value: string) => void
  onSend: (e: React.FormEvent) => void
}

export const WelcomeScreen = ({ input, setInput, onSend }: WelcomeScreenProps) => {
  const prompts = [
    { text: '판례 검색', style: 'bg-[#254775] text-white hover:bg-[#5a7ca1]' },
    { text: '계약서 검토', style: 'bg-[#C8A45D] text-white hover:bg-[#b8934d]' },
    { text: '법률 상담', style: 'bg-[#254775] text-white hover:bg-[#5a7ca1]' },
    { text: '최신 법률 정보', style: 'bg-[#C8A45D] text-white hover:bg-[#b8934d]' }
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20 overflow-y-auto bg-[#F5F3EB] font-serif">
      <div className="text-center max-w-2xl w-full">
        <div className="mb-8">
          <div className="inline-block p-4 rounded-full mb-4">
            <img 
              src={logoImage} 
              alt="법례를 찾아드립니다" 
              className="w-24 h-24 object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-minimal-charcoal mb-2 tracking-tight">
            법례를 찾아드립니다
          </h1>
          <p className="text-minimal-medium-gray font-medium">
            판례 검색, 법률 자문, 문서 작성을 AI가 도와드립니다.
          </p>
        </div>
        
        <form onSubmit={onSend} className="relative w-full shadow-lg rounded-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예) 최근 5년간 전세 사기 관련 대법원 판례를 찾아줘..."
            className="w-full p-5 pr-24 text-lg border border-[#CFB982] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8A45D] focus:border-transparent transition-all placeholder-gray-400 bg-[#F5F3EB] text-minimal-charcoal font-sans"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Mic size={24} />
            </button>
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-[#C8A45D] text-white rounded-lg disabled:opacity-50 hover:bg-[#b8934d] transition-all duration-200 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap gap-3 justify-center font-sans">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setInput(prompt.text)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md ${prompt.style}`}
            >
              {prompt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}