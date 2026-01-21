
import React from 'react';

const Hero: React.FC = () => {
  return (
    <header className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          변호사 없이도 법률 문제를 <br />
          <span className="gradient-text">쉽게 해결하세요</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          변호사 선임이 부담스러우신가요? <br />
          간단한 질문과 상황 입력만으로 유사 판례를 찾고, 문서 작성을 도와드립니다.<br />
          금전적, 시간적 부담 없이 법률 문제를 해결해보세요.
        </p>

        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-purple-200 p-2">
            <input
              type="text" 
              placeholder="무단횡단자와 사고가 발생하였던 법례를 찾아줘!! " 
              className="flex-1 bg-transparent px-6 py-3 text-base disabled:opacity-100 outline-none text-black placeholder:text-black"
              
            />
            <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center" disabled>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-20 relative reveal active">
          <img 
            src="https://picsum.photos/seed/legal-dashboard/1200/800" //사진 집어넣기
            alt="Dashboard Preview" 
            className="rounded-3xl shadow-2xl border border-slate-100 mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-700"
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block animate-bounce">
            <p className="text-sm font-semibold">대법원 2019. 11. 25. 선고 판례...</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
