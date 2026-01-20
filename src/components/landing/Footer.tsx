
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-3xl font-black text-indigo-600 tracking-tighter mb-6">LAWDING</span>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto mb-12">
            법률 전문가와 일반인을 위한 가장 똑똑한 법례 파트너.<br />
            AI 기반의 검색과 분석으로 법적 문제를 빠르게 해결합니다.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10">
          <p className="text-slate-400 text-xs mb-6 md:mb-0">
            © 2026 Techeer - LAWDING. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
