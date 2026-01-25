import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ChevronRight, Landmark, Calendar, Search, CheckCircle2 } from 'lucide-react';

export interface SearchResult {
  case_No: string;
  case_name: string;
  title: string;
  content: string;
  court: string;
  date: string;
  caseType: string;
  judgmentType: string;
  similarity?: number;
}

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [caseId, setCaseId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const state = location.state as { case_id: number; results: any[] };

    if (state?.results) {
      const mappedResults: SearchResult[] = state.results.map((result) => ({
        case_No: result.case_No,
        case_name: result.case_name || result.case_number || '사건번호 없음',
        title: result.case_title || result.title || '제목 정보 없음',
        content: result.preview || result.content || '내용 요약 정보 없음',
        court: result.court || '법원 미정',
        date: result.judgment_date || result.date || '날짜 미상',
        caseType: result.law_category || result.case_type || '분류 없음',
        judgmentType: result.law_subcategory || result.judgment_type || '유형 없음',
        similarity: Math.round((result.similarity || 0) * 100),
      }));
      setSearchResults(mappedResults);
    }

    if (state?.case_id) {
      setCaseId(state.case_id);
    }
  }, [location.state]);

  const handleResultClick = (case_No: string) => {
    navigate(`/judgment/${case_No}`, { state: { caseId } });
  };

  const handleSelectClick = (e: React.MouseEvent, case_No: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(case_No) ? prev.filter((id) => id !== case_No) : [...prev, case_No]
    );
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      {/* 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 border-b border-slate-200 bg-white/70 backdrop-blur-lg shadow-sm">
        <button 
          onClick={() => navigate('/')} 
          className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-80 transition-opacity"
        >
          LAWDING
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        <header className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-3">
            <Search size={14} />
            <span>AI 맞춤 분석 완료</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            유사 판례 검색 결과
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            입력하신 사례와 가장 유사한 {searchResults.length}개의 판례를 찾았습니다.
          </p>
        </header>

        <section className="space-y-5">
          {searchResults.map((result, index) => {
            const isSelected = selectedIds.includes(result.case_No);
            
            return (
              <motion.div
                key={result.case_No}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleResultClick(result.case_No)}
                className={`group relative rounded-2xl p-6 transition-all cursor-pointer border-2 ${
                  isSelected 
                    ? 'bg-white border-indigo-500 shadow-indigo-100 shadow-xl' 
                    : 'bg-white border-transparent shadow-sm hover:shadow-md hover:border-slate-200'
                }`}
              >
                {/* 상단 메타 정보 */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
                    {result.case_name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Landmark size={14} />
                    <span>{result.court}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={14} />
                    <span>{result.date}</span>
                  </div>
                  
                  {/* 유사도 배지 */}
                  <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                    result.similarity && result.similarity > 80 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    유사도 {result.similarity}%
                  </div>
                </div>

                {/* 제목 및 내용 */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                  {result.title}
                  <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {result.content}
                </p>

                {/* 하단 버튼 영역 */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-100">
                      {result.caseType}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleSelectClick(e, result.case_No)}
                    className={`flex items-center gap-1.5 text-xs px-5 py-2 rounded-full transition-all font-bold ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={14} />}
                    {isSelected ? '선택됨' : '선택하기'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* 하단 고정 액션 가이드 */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-xs text-slate-400">
            가장 유사하다고 판단되는 판례들을 선택하여 심층 분석을 진행하세요.
          </p>
          <Button
            size="lg"
            onClick={() => {
              const lastSelected = selectedIds[selectedIds.length - 1];
              const targetCaseNo = lastSelected || searchResults[0]?.case_No;
              if (!targetCaseNo) {
                alert("분석할 판례를 선택해주세요.");
                return;
              }
              navigate(`/answer/${encodeURIComponent(targetCaseNo)}`, {
                state: { caseId: caseId },
              });
            }}
            className="group relative bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-7 rounded-2xl font-black text-xl shadow-2xl transition-all hover:-translate-y-1"
          >
            내 사건 결과 예측하기
            <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </main>
  );
};

export default SearchResultsPage;