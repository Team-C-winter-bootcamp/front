
import React from 'react';

const stats = [
  {
    icon: '📂',
    title: '총 판례 데이터 수',
    value: '6만 건 +',
    description: '대한민국 법원의 핵심 판례 6만 건 이상을 실시간으로 검색할 수 있으며, 매일 새로운 판결 데이터가 자동으로 업데이트되어 최신 법률 트렌드를 반영합니다.',
  },
  {
    icon: '📈',
    title: '생산성 향상',
    value: '43.9%',
    description: '다수의 고객이 평균 43.9%의 생산성 향상을 체감했으며, LAWDING를 통해 리서치와 초안 작성 시간을 줄이고 업무 효율을 1.5배 높여 핵심 업무에 집중하고 있습니다.',
  },
  {
    icon: '⭐',
    title: '고객만족도',
    value: '95.2%',
    description: 'LAWDING는 실제 법률 업무를 수행하는 유료 고객들로부터 압도적인 만족도를 기록하고 있으며, 사용자 중심의 UI와 정교한 분석 결과로 높은 신뢰를 받고 있습니다.',
  }
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500"
            >
              <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <h4 className="text-indigo-600 font-bold mb-4">{stat.title}</h4>
              <p className="text-4xl font-black mb-6 text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-slate-500 text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
