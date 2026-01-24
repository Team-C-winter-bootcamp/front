import { useNavigate } from 'react-router-dom'; 
import solu from '../../assets/solu.png';

const Hero = () => {
  const navigate = useNavigate(); 

  return (
    <header className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          변호사 없이 법률 문제를 <br />
          <span className="gradient-text">쉽게 해결하세요</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
          변호사 선임이 부담스러우신가요? <br />
          간단한 질문과 상황 입력만으로 유사 판례를 찾고, 문서 작성을 도와드립니다.<br />
          금전적, 시간적 부담 없이 법률 문제를 해결해보세요.
        </p>

        <div className="relative inline-flex group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          
          <button 
            onClick={() => {
              navigate('/home')
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }, 100)
            }}
            className="relative flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition shadow-xl active:scale-95"
          >
            무료 체험 시작하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-20 relative reveal active">
          <img 
            src= {solu}
            alt="Dashboard Preview" 
            width={800}
            height={600}
            className="rounded-3xl shadow-2xl border border-slate-100 mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-700"
          />
        </div>
      </div>
    </header>
  );
};

export default Hero;