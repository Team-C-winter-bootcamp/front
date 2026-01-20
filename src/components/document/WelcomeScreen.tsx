import logoImage from '../../assets/logo.png'
import { Send } from 'lucide-react'

interface WelcomeScreenProps {
  input: string
  setInput: (value: string) => void
  onSend: (e: React.FormEvent) => void
}

export const WelcomeScreen = ({ input, setInput, onSend }: WelcomeScreenProps) => {
  const prompts = [
    { text: '판례 검색', style: 'bg-indigo-600 text-white hover:bg-indigo-700' },
    { text: '계약서 검토', style: 'bg-purple-600 text-white hover:bg-purple-700' },
    { text: '법률 상담', style: 'bg-indigo-600 text-white hover:bg-indigo-700' },
    { text: '최신 법률 정보', style: 'bg-purple-600 text-white hover:bg-purple-700' }
  ]

  return ( 
    <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center max-w-2xl w-full">
        <div className="mb-8">
          <div className="inline-block p-4 rounded-full mb-4 bg-white shadow-lg border border-slate-200">
            <img 
              src={logoImage} 
              alt="법례를 찾아드립니다" 
              className="w-24 h-24 object-contain" 
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            법례를 찾아드립니다
          </h1>
          <p className="text-slate-500 font-medium">
            판례 검색, 법률 자문, 문서 작성을 AI가 도와드립니다.
          </p>
        </div>
        
        <form onSubmit={onSend} className="relative w-full">
          <div className="relative max-w-2xl w-full mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-700"></div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예) 최근 5년간 전세 사기 관련 대법원 판례를 찾아줘..."
            className="w-full p-4 pr-20 text-base border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all placeholder-slate-400 bg-white text-slate-800 shadow-xl"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <Send size={20} />
            </button>
          </div>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
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
