import { UseCase } from '../../types/landing';

const useCases: UseCase[] = [
  { category: '공통', items: ['문서 요약', '쟁점 정리/분석', '법률검토'] },
  { category: '사건 자료', items: ['증인신문사항 작성', '피고인신문사항 작성', '최후변론서 작성'] },
  { category: '상담 메모/서면 초안', items: ['고소장 작성', '내용증명 작성', '의견서 작성'] },
  { category: '계약서', items: ['계약 탬플릿 제공', '계약서 독소조항 분석', '수정 제안'] },
  { category: '상대방 준비서면', items: ['반박서면 작성', '주장 분석', '방어논리 구성'] },
  { category: '본인 준비서면', items: ['판례 법령 인용', '주장 보강', '종합서면 작성'] },
  { category: '판결문', items: ['항소이유서 작성', '판결 분석', '승소율 예측'] },
  { category: '문서 파일', items: ['사실 관계 정리', '증거 사진 분석', '문서 스캐닝'] },
];

const UseCases = () => {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4">문서/사건 기반 대화 활용 예시</h2>
          <p className="text-slate-400">LAWDING은 다양한 법률 실무 영역에서 최고의 효율을 자랑합니다.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {useCases.map((useCase, idx) => (
            <div 
              key={idx} 
              className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-colors"
            >
              <h3 className="font-bold text-indigo-400 mb-4 text-lg">{useCase.category}</h3>
              <ul className="space-y-3">
                {useCase.items.map((item, iIdx) => (
                  <li key={iIdx} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
