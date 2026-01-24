import { useEffect } from 'react';
import { FeatureSection } from '../../types/landing';
import pick from '../../assets/pick.png';
import checklist from '../../assets/checklist.png';
import pan from '../../assets/pan.png';
import solu from '../../assets/solu.png';


const features: FeatureSection[] = [
  {
    id: 'select',
    title: '1. 사건 종류 선택',
    description: '못받은 돈, 근로/알바 계약서, 부동산/임대차 등 사건 유형을 간단히 선택하세요.',
    details: [
      '6가지 주요 사건 카테고리 제공',
      '명확한 사건 분류로 빠른 시작',
      '기타 사건도 직접 설명 가능'
    ],
    image: pick
  },
  {
    id: 'matching',
    title: '2. 간단한 체크리스트와 상황 작성',
    description: '버튼으로 간단한 체크리스트를 작성하고 현재 상황을 자유롭게 설명하세요.',
    details: [
      '대화형 질문으로 상황 파악',
      '자세한 상황 입력으로 정확도 향상',
      '모든 정보는 비공개로 안전하게 보관'
    ],
    image: checklist,
    reverse: true
  },
  {
    id: 'precedent',
    title: '3. 유사 판례 5개 제공',
    description: '입력하신 정보를 바탕으로 가장 유사한 판례 5개를 찾아드립니다.',
    details: [
      'AI 기반 유사 판례 매칭',
      '유사도 표시로 신뢰도 확인',
      '판례 클릭 시 상세 정보 및 요약 제공'
    ],
    image: pan
  },
  {
    id: 'advice',
    title: '4. 예상 합의금 및 해결 방안',
    description: '유사 판례 데이터를 바탕으로 예상 합의금과 문제 해결 방안을 제시합니다.',
    details: [
      'AI 기반 합의금 예측',
      '상황별 맞춤 해결 방안 조언',
      '문서 선택 가이드 제공'
    ],
    image: solu,
    reverse: true
  },
  {
    id: 'draft',
    title: '5. 법률 문서 자동 작성',
    description: '합의서, 내용증명서, 고소장 중 선택하여 자동으로 문서를 작성하고 다운로드하세요.',
    details: [
      '표준 법률 문서 양식 제공',
      '입력 정보 자동 반영',
      'PDF 다운로드 지원'
    ],
    image: 'https://picsum.photos/seed/editor/800/600'
  }
];

const Features = () => {
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
