import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/ui/Layout';
import { 
  ChevronRight, Landmark, Calendar, Search, CheckCircle2 
} from 'lucide-react';

// 1. 데이터 인터페이스 정의
export interface SearchResult {
  case_No: string;      // 판례 고유 ID (문자열로 통일)
  case_name: string;    // 사건번호 (예: 2023도1234)
  title: string;        // 판례 제목
  content: string;      // 요약 내용
  court: string;        // 법원
  date: string;         // 선고 일자
  caseType: string;     // 사건 분류
  judgmentType: string; // 하위 분류
  similarity?: number;  // 유사도 백분율
}

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 상태 관리
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [caseId, setCaseId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // 2. 데이터 초기화 및 매핑
  useEffect(() => {
    const state = location.state as { case_id: number; results: any[] };

    if (state?.results) {
      const mappedResults: SearchResult[] = state.results.map((result) => ({
        // 타입 오류 방지를 위해 ID를 문자열로 강제 변환
        case_No: result.case_No,
        case_name: result.case_number || '사건번호 없음',
        title: result.case_title || '제목 정보 없음',
        content: result.preview || '내용 요약 정보 없음',
        court: result.court || '법원 미정',
        date: result.judgment_date || '날짜 미상',
        caseType: result.law_category || '분류 없음',
        judgmentType: result.law_subcategory || '유형 없음',
        similarity: Math.round((result.similarity || 0) * 100),
      }));
      setSearchResults(mappedResults);
    }

    if (state?.case_id) {
      setCaseId(state.case_id);
    }
  }, [location.state]);

  // 3. 카드 클릭 시 상세 페이지 이동
  const handleResultClick = (case_No: string) => {
    if (!case_No) return;
    navigate(`/judgment/${encodeURIComponent(case_No)}`, { 
      state: { caseId } 
    });
  };

  // 4. 선택 버튼 클릭 (이벤트 전파 방지 적용)
  const handleSelectClick = (e: React.MouseEvent, case_No: string) => {
    e.stopPropagation(); // 부모 div의 handleResultClick 실행 방지
    e.preventDefault();

    if (!case_No) return;
    
    setSelectedIds((prev) =>
      prev.includes(case_No) 
        ? prev.filter((id) => id !== case_No) 
        : [...prev, case_No]
    );
  };


  const handleGoToPredict = () => {  
  // 1. 타겟 판례 번호 결정
  const targetCaseNo = selectedIds.length > 0 
    ? selectedIds[selectedIds.length - 1] 
    : searchResults[0]?.case_No;

  if (!targetCaseNo) {
    alert("분석할 판례를 선택해주세요.");
    return;
  }

  // [중요] 여기서 caseId가 null인지 콘솔로 찍어보세요.
  console.log("현재 페이지의 caseId 상태:", caseId);

  if (!caseId) {
    alert("내 사건 정보를 찾을 수 없습니다. 다시 시작해주세요.");
    return;
  }

  // 2. navigate 시 변수명 통일 (Solution.tsx에서 받을 이름과 일치)
  navigate(`/answer/${encodeURIComponent(targetCaseNo)}`, {
    state: { 
      caseId: caseId, 
      precedentsId: targetCaseNo 
    },
  });
};

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50/50 pt-[20px] pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-3">
              <Search size={14} />
              <span>AI 분석 완료</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">유사 판례 검색 결과</h2>
            <p className="text-slate-500 mt-2 text-sm">입력하신 사례와 유사한 {searchResults.length}개의 판례를 분석했습니다.</p>
          </header>

          <section className="space-y-5">
            {searchResults.map((result, index) => {
              const isSelected = selectedIds.includes(result.case_No);
              
              return (
                <motion.div
                  key={result.case_No}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    y: isSelected ? -8 : 0,
                    scale: isSelected ? 1.01 : 1
                  }}
                  whileHover={{ y: -4 }}
                  transition={{ 
                    y: { type: "spring", stiffness: 400, damping: 25 },
                    scale: { type: "spring", stiffness: 400, damping: 25 },
                    opacity: { duration: 0.2, delay: index * 0.05 }
                  }}
                  onClick={() => handleResultClick(result.case_No)}
                  className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer border-2 ${
                    isSelected 
                      ? 'bg-indigo-50/80 border-indigo-500 shadow-xl z-10' 
                      : 'bg-white border-gray-200 shadow-sm hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">{result.case_name}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Landmark size={14} /><span>{result.court}</span></div>
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Calendar size={14} /><span>{result.date}</span></div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${result.similarity! > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      유사도 {result.similarity}%
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    {result.title}
                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{result.content}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-100">{result.caseType}</span>
                    <button
                      type="button"
                      onClick={(e) => handleSelectClick(e, result.case_No)}
                      className={`flex items-center gap-1.5 text-xs px-5 py-2 rounded-full transition-all font-bold ${
                        isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 size={14} /> : null}
                      {isSelected ? '선택됨' : '선택하기'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </section>

          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-xs text-slate-400">가장 적절한 판례를 선택하여 심층 분석을 진행하세요.</p>
            <Button
              size="lg"
              onClick={handleGoToPredict}
              className="group bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-7 rounded-2xl font-black text-xl shadow-2xl transition-all"
            >
              내 사건 결과 예측하기
              <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default SearchResultsPage;