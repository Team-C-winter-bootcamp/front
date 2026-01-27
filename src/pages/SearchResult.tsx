import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/ui/Layout';
import { ChevronRight, Landmark, Calendar, Search, CheckCircle2, Filter, ArrowRight, Check } from 'lucide-react';
import PrecedentSelectionAlertModal from '../components/AlertModal/PrecedentSelectionAlertModal';

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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('similarity');

  // 정렬된 결과 계산
  const sortedResults = useMemo(() => {
    const results = [...searchResults];
    if (activeFilter === 'similarity') {
      return results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    } else if (activeFilter === 'date') {
      // 날짜 내림차순 (최신순)
      return results.sort((a, b) => b.date.localeCompare(a.date));
    } else if (activeFilter === 'court') {
      // 법정명 오름차순
      return results.sort((a, b) => a.court.localeCompare(b.court));
    }
    return results;
  }, [searchResults, activeFilter]);

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
    if (selectedIds.length === 0) {
      setIsAlertOpen(true);
      return;
    }

    // 1. 타겟 판례 번호 결정
    const targetCaseNo = selectedIds[selectedIds.length - 1];

    if (!targetCaseNo) {
      setIsAlertOpen(true);
      return;
    }

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

  const isSelectionEmpty = selectedIds.length === 0;

  return (
    <Layout>
      <main className="min-h-screen bg-white relative pt-10 pb-32">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
        
        {/* 상단 그라데이션 데코 */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <header className="mb-10">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black mb-4 border border-indigo-100/50 shadow-sm"
            >
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-indigo-600"
              />
              <Search size={14} strokeWidth={2.5} />
              <span>AI 분석 완료</span>
            </motion.div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">유사 판례 검색 결과</h2>
                <p className="text-slate-500 mt-3 text-lg font-medium">입력하신 사례와 유사한 <span className="text-indigo-600 font-bold">{searchResults.length}개</span>의 판례를 분석했습니다.</p>
              </div>
              
              {/* 필터 칩 */}
              <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                {[
                  { id: 'similarity', label: '유사도순', icon: Filter },
                  { id: 'date', label: '최신순', icon: Calendar },
                  { id: 'court', label: '법정별', icon: Landmark }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeFilter === filter.id 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    <filter.icon size={14} strokeWidth={2.5} />
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <section className="space-y-6">
            <AnimatePresence mode="popLayout">
              {sortedResults.length > 0 ? (
                sortedResults.map((result, index) => {
                  const isSelected = selectedIds.includes(result.case_No);
                  
                  return (
                    <motion.div
                      key={result.case_No}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: isSelected ? -10 : 0,
                        scale: isSelected ? 1.01 : 1,
                        zIndex: isSelected ? 20 : 10
                      }}
                      whileHover={{ y: -5 }}
                      transition={{ 
                        y: { type: "spring", stiffness: 400, damping: 25 },
                        scale: { type: "spring", stiffness: 400, damping: 25 },
                        opacity: { duration: 0.3, delay: index * 0.05 }
                      }}
                      onClick={() => handleResultClick(result.case_No)}
                      className={`group relative rounded-[2rem] p-6 transition-all duration-500 cursor-pointer border-2 ${
                        isSelected 
                          ? 'bg-white border-indigo-500 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] ring-4 ring-indigo-50/50' 
                          : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200'
                      }`}
                    >
                      {/* 카드 상단 정보 */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                          ID: {result.case_No}
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Landmark size={14} />
                          <span>{result.court}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Calendar size={14} />
                          <span>{result.date}</span>
                        </div>

                        {/* 유사도 바 비주얼 */}
                        <div className="ml-auto flex items-center gap-3">
                          <div className="hidden sm:flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Similarity</span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.similarity}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full rounded-full ${
                                  result.similarity! >= 70 ? 'bg-emerald-500' : 
                                  result.similarity! >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                                }`}
                              />
                            </div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${
                            result.similarity! >= 70 ? 'bg-emerald-50 text-emerald-600' : 
                            result.similarity! >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {result.similarity}% 매칭
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {result.title}
                        <ChevronRight size={22} strokeWidth={3} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </h3>
                      
                      <p className="text-[16px] text-slate-600 line-clamp-2 mb-6 leading-relaxed font-medium">
                        {result.content}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex gap-2">
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                            {result.caseType}
                          </span>
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-indigo-400 border border-indigo-50">
                            {result.judgmentType}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => handleSelectClick(e, result.case_No)}
                          className={`flex items-center gap-2 text-sm px-6 py-2.5 rounded-2xl transition-all font-black shadow-sm ${
                            isSelected 
                            ? 'bg-indigo-600 text-white shadow-indigo-200 scale-105' 
                            : 'bg-white text-indigo-600 border-2 border-indigo-50 hover:border-indigo-200 hover:bg-indigo-50/30'
                          }`}
                        >
                          {isSelected ? <Check size={16} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border-2 border-indigo-200" />}
                          {isSelected ? '분석 대상 선택됨' : '분석 판례로 선택'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-slate-500">다른 키워드로 검색하거나 사건 내용을 더 상세히 입력해 보세요.</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* 하단 플로팅 바 */}
        <AnimatePresence>
          {!isSelectionEmpty && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-0 right-0 z-50 px-6 pointer-events-none"
            >
              <div className="max-w-3xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-4 pl-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-lg leading-tight">{selectedIds.length}개의 판례 선택됨</span>
                    <span className="text-slate-400 text-xs font-bold">선택하신 데이터를 기반으로 결과를 예측합니다.</span>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  onClick={handleGoToPredict}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-7 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center gap-3 active:scale-95 group"
                >
                  내 사건 결과 예측하기
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PrecedentSelectionAlertModal 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)} 
      />
    </Layout>
  );
};

export default SearchResultsPage;
