import logoImage from '../../assets/logo.png'
import enter from '../../assets/enter.png'
interface WelcomeScreenProps {
  input: string
  setInput: (value: string) => void
  onSend: (e: React.FormEvent) => void
}

export const WelcomeScreen = ({ input, setInput, onSend }: WelcomeScreenProps) => {
  const prompts = ['계약서 검토', '임금 체불 상담', '부동산 분쟁', '교통사고 과실']

  return ( 
    <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20 overflow-y-auto bg-[#F5F3EB] font-serif">

      <div className="text-center max-w-2xl w-full">
        <div className="mb-8">
        <div className="inline-block p-4 rounded-full mb-4">
            <img 
              src={logoImage} 
              alt="Law딩중 로고" 
              className="w-20 h-20 object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            무엇을 도와드릴까요?
          </h1>
          <p className="text-gray-500">
            Law딩중 AI가 판례 검색과 법률 조언을 도와드립니다.
          </p>
        </div>
        
        <form onSubmit={onSend} className="relative w-full shadow-lg rounded-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예) 전세 보증금을 돌려받지 못하고 있어요..."
            className="w-full p-5 pr-16 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-300 transition-colors"
          >
            <div className="inline-block p-1 rounded-full ">
            <img 
              src={enter} 
              alt="enter" 
              className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
            />
          </div>
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
