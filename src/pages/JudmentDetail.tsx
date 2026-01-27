import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Download, Link2, Bookmark, BookmarkCheck, ChevronLeft, 
  FileText, Info, ChevronDown, Sparkles, Loader2, Gavel, Scale,
  AlignLeft, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { caseService } from '../api';
import { GetPrecedentDetailResponse } from '../api/types';

const JudgmentDetailPage = () => {
  const navigate = useNavigate();
  const { case_No: precedentId } = useParams<{ case_No: string }>();
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  
  const [precedentDetail, setPrecedentDetail] = useState<GetPrecedentDetailResponse | null>(() => {
    if (precedentId) {
      const saved = localStorage.getItem(`precedent_detail_${precedentId}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(!precedentDetail);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrecedentDetail = async () => {
      if (!precedentId) return;
      if (precedentDetail) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await caseService.getPrecedentDetail(precedentId);
        localStorage.setItem(`precedent_detail_${precedentId}`, JSON.stringify(response));
        setPrecedentDetail(response);
      } catch (error: any) {
        console.error('판례 상세 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrecedentDetail();
  }, [precedentId, precedentDetail]);

  const [isBookmarked, setIsBookmarked] = useState(() => {
    const list = JSON.parse(localStorage.getItem('bookmarked_judgments') || '[]');
    return Array.isArray(list) && precedentId ? list.includes(precedentId) : false;
  });

  const judgmentData = useMemo(() => {
    const detail = precedentDetail?.status === 'success' ? precedentDetail.data : null;
    
    if (!detail) {
      return {
        title: '판례를 불러올 수 없습니다.',
        summaryText: '-',
        judgment: { court: '-', case_no: '-', case_name: '-', judgment_date: '-', reasons: '데이터가 존재하지 않습니다.' },
        aiAnalysis: null,
        judgmentType: '판결'
      };
    }

    return {
      title: detail.case_name || '제목 정보 없음',
      summaryText: `${detail.court || '정보 없음'} · ${detail.judgment_date || '날짜 미상'} 선고`,
      aiAnalysis: detail.summary && typeof detail.summary === 'object' ? {
        core: detail.summary.core_summary,
        fact: detail.summary.key_fact,
        verdict: detail.summary.verdict,
        point: detail.summary.legal_point,
        tags: detail.summary.tags || []
      } : null,
      judgment: {
        court: detail.court || '-',
        case_no: detail.case_no || '-',
        case_name: detail.case_name || '-',
        judgment_date: detail.judgment_date || '-',
        reasons: detail.content || '판결문 전문이 존재하지 않습니다.',
      },
      judgmentType: '판결',
    };
  }, [precedentDetail]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`${judgmentData.title}.pdf`);
  };

  const handleToggleBookmark = () => {
    if (!precedentId) return;
    const list = JSON.parse(localStorage.getItem('bookmarked_judgments') || '[]');
    const next = list.includes(precedentId) ? list.filter((v: any) => v !== precedentId) : [...list, precedentId];
    localStorage.setItem('bookmarked_judgments', JSON.stringify(next));
    setIsBookmarked(!isBookmarked);
  };

  // 공통 텍스트 스타일 변수
  const sectionTitleStyle = "flex items-center gap-2 text-slate-900 font-bold text-xl mb-4";
  const bodyTextStyle = "text-slate-600 text-[16px] leading-[1.8] tracking-tight";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-indigo-500 mb-4" size={40} />
          <p className="font-bold text-slate-600">판례 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-start items-center px-6 md:px-12 py-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <button onClick={() => navigate('/')} className="text-2xl font-black tracking-tighter text-indigo-600">LAWDING</button>
      </header>

      <div className="pt-28 max-w-6xl mx-auto px-4 md:px-8 pb-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-widest">{judgmentData.judgmentType}</span>
            <span className="text-slate-400 text-sm font-medium">{judgmentData.summaryText}</span>
          </div>
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
              aria-label="이전 페이지로 돌아가기"
              title="이전 페이지로 돌아가기"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight break-keep">
              {judgmentData.title}
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-12" ref={contentRef}>
            
            {/* 1. AI 분석 섹션 */}
            <section id="ai-summary">
              <LayoutGroup>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Sparkles size={24} className="text-indigo-600" />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI 판례 분석</h2>
                  </div>
                  
                  {judgmentData.aiAnalysis && (
                    <div className="space-y-8">
                      {/* 핵심 분석 요약 (기본 표시) */}
                      <motion.div layout>
                        <div className={sectionTitleStyle}><Scale size={20} className="text-indigo-600" /> 핵심 분석 요약</div>
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                          <p className="text-indigo-900 text-[18px] font-extrabold leading-relaxed break-keep">
                            {judgmentData.aiAnalysis.core}
                          </p>
                        </div>
                      </motion.div>

                      {/* 확장 가능한 영역 */}
                      <div className="relative">
                        <motion.div
                          layout
                          animate={{ 
                            height: isAiExpanded ? 'auto' : '180px',
                          }}
                          transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* 주요 사실관계 */}
                              <div>
                                <div className={sectionTitleStyle}><AlignLeft size={20} className="text-indigo-600" /> 주요 사실관계</div>
                                <p className={bodyTextStyle}>{judgmentData.aiAnalysis.fact}</p>
                              </div>
                              {/* 법적 판단 근거 */}
                              <div>
                                <div className={sectionTitleStyle}><BookOpen size={20} className="text-indigo-600" /> 법적 판단 근거</div>
                                <p className={bodyTextStyle}>{judgmentData.aiAnalysis.point}</p>
                              </div>
                            </div>

                            {/* 판결 결과 및 태그 */}
                            <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Gavel size={20} /></div>
                                <span className="text-xl font-black text-slate-900">{judgmentData.aiAnalysis.verdict}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {judgmentData.aiAnalysis.tags.map((tag, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-md text-[12px] font-bold">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* 페이드 아웃 효과 (닫혀있을 때만) */}
                        <AnimatePresence>
                          {!isAiExpanded && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-10" 
                            />
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.div layout className="pt-2 flex justify-center relative z-20">
                        <button
                          onClick={() => setIsAiExpanded((prev) => !prev)}
                          className="text-slate-700 font-semibold text-sm flex items-center gap-2 hover:text-indigo-600 transition-colors"
                        >
                          {isAiExpanded ? '접기' : '더 보기'}
                          <motion.div animate={{ rotate: isAiExpanded ? 200 : 0 }}>
                            <ChevronDown size={18} />
                          </motion.div>
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </LayoutGroup>
            </section>

            {/* 2. 판결문 전문 (가독성 최적화) */}
            <section id="original-content">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                  <div className={sectionTitleStyle.replace("mb-4", "mb-0")}>
                    <FileText size={20} className="text-indigo-600" /> 판결문 전문
                  </div>
                </div>
                
                <div className="p-8 md:p-12">
                  {/* 가독성을 위해 font-sans 유지, 행간(leading-9)과 자간(tracking-tight)을 넉넉히 조정 */}
                  <div className="text-slate-800 leading-[2.1] text-[17px] md:text-[18px] tracking-normal font-normal text-left whitespace-pre-wrap break-keep">
                    {judgmentData.judgment.reasons}
                  </div>
                  
                  <div className="mt-16 flex justify-center opacity-20">
                    <div className="h-[1px] w-24 bg-slate-400" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 사이드바 */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="grid grid-cols-3 gap-3 mb-10">
                {[
                  { icon: Download, label: 'PDF', action: handleDownloadPDF },
                  { icon: Link2, label: '링크', action: () => { navigator.clipboard.writeText(window.location.href); alert('링크가 복사되었습니다.'); } },
                  { icon: isBookmarked ? BookmarkCheck : Bookmark, label: '저장', action: handleToggleBookmark, active: isBookmarked }
                ].map((item, i) => (
                  <button key={i} onClick={item.action} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border ${item.active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}>
                    <item.icon size={20} />
                    <span className="text-[12px] font-bold">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-50 pb-3">
                  <Info size={16} className="text-indigo-600" /> 사건 상세 정보
                </div>
                {[
                  { label: '담당 법원', value: judgmentData.judgment.court },
                  { label: '사건 번호', value: judgmentData.judgment.case_no },
                  { label: '선고 날짜', value: judgmentData.judgment.judgment_date },
                ].map((info, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-slate-300 uppercase tracking-wider">{info.label}</span>
                    <span className="text-[15px] font-semibold text-slate-700">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </aside>
        </div>
      </div>
    </main>
  );
};

export default JudgmentDetailPage;