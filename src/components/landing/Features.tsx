
import React, { useEffect } from 'react';
import { FeatureSection } from '../../types/landing';

const features: FeatureSection[] = [
  {
    id: 'search',
    title: '고급 법례 검색',
    description: '키워드뿐만 아니라 사건 유형, 법원, 재판유형 등 정밀한 필터를 제공합니다.',
    details: [
      '형사, 민사, 가사 등 20여개 카테고리 필터링',
      '전문판례 및 선고 일자별 상세 조회',
      '유사 판례 하이라이트 시스템'
    ],
    image: 'https://picsum.photos/seed/search/800/600'
  },
  {
    id: 'matching',
    title: '나만의 맞춤형 법례 매칭',
    description: '현재 본인의 상황을 자연어로 설명하면 AI가 가장 유사한 판례를 매칭합니다.',
    details: [
      '대화형 AI 엔진의 상황 맥락 이해',
      '수십만 건의 판례 중 유사도 90% 이상 추출',
      '판결 핵심 쟁점 자동 정리'
    ],
    image: 'https://picsum.photos/seed/ai-chat/800/600',
    reverse: true
  },
  {
    id: 'draft',
    title: '문서 요약 및 편집 가이드',
    description: '방대한 판례와 계약서를 10초 만에 요약하고 필요한 초안을 작성합니다.',
    details: [
      '계약서 핵심 조항 리스크 분석',
      'OCR 기술을 통한 이미지 내 텍스트 인식',
      '고소장, 준비서면 등 법률 서식 자동 생성'
    ],
    image: 'https://picsum.photos/seed/editor/800/600'
  }
];

const Features: React.FC = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 reveal">
          <h2 className="text-4xl font-extrabold mb-4">강력한 주요 기능</h2>
          <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        {features.map((feature, idx) => (
          <div 
            key={feature.id} 
            className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 mb-32 last:mb-0 reveal`}
          >
            <div className="flex-1">
              <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase">Feature 0{idx + 1}</span>
              <h3 className="text-3xl font-bold mt-2 mb-6">{feature.title}</h3>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-4">
                {feature.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    </div>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="relative group">
                <div className="absolute -inset-4 bg-slate-100 rounded-[2.5rem] scale-95 group-hover:scale-100 transition duration-500"></div>
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="relative rounded-[2rem] shadow-xl border border-white z-10 w-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
