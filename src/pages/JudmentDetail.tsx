import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Link2, Bookmark, BookmarkCheck, ChevronLeft, FileText, Info, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseService } from '../api';
import { GetPrecedentDetailResponse } from '../api/types';

const JudgmentDetailPage = () => {
  const navigate = useNavigate();
  const { case_No: precedentId } = useParams<{ case_No: string }>();
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  
  // [캐싱 로직] 초기 상태 설정 시 로컬 스토리지 확인
  const [precedentDetail, setPrecedentDetail] = useState<GetPrecedentDetailResponse | null>(() => {
    if (precedentId) {
      const saved = localStorage.getItem(`precedent_detail_${precedentId}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // 데이터가 이미 있으면 로딩을 생략
  const [isLoading, setIsLoading] = useState(!precedentDetail);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrecedentDetail = async () => {
      if (!precedentId) return;

      // 이미 캐시된 데이터가 있다면 API 호출을 중단
      if (precedentDetail) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await caseService.getPrecedentDetail(precedentId);
        
        // 데이터 저장 (캐싱)
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

  // 북마크 상태 관리
  const [isBookmarked, setIsBookmarked] = useState(() => {
    const list = JSON.parse(localStorage.getItem('bookmarked_judgments') || '[]');
    return Array.isArray(list) && precedentId ? list.includes(precedentId) : false;
  });

  // 데이터 가공 로직
  const judgmentData = useMemo(() => {
    const detail = precedentDetail?.status === 'success' ? precedentDetail.data : null;
    if (!detail) {
      return {
        title: '판례를 불러올 수 없습니다.',
        summary: '-',
        judgment: { court: '-', case_no: '-', case_name: '-', judgment_date: '-', reasons: '데이터가 존재하지 않습니다.' },
        aiSummary: { resultSummary: ['데이터 분석 결과가 없습니다.'] },
        judgmentType: '판결'
      };
    }

    const court = detail.court || '정보 없음';
    const date = detail.judgment_date || '날짜 미상';

    return {
      title: detail.case_title || detail.case_name || '제목 정보 없음',
      summary: `${court} ${date} 선고`,
      aiSummary: { resultSummary: [detail.summary || 'AI 요약 결과가 존재하지 않습니다.'] },
      judgment: {
        court: court,
        case_no: detail.case_no || '-',
        case_name: detail.case_name || '-',
        judgment_date: date,
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

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-indigo-500 mb-4" size={40} />
          <p className="font-bold text-slate-600">판례 전문을 분석 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100">
      {/* 헤더 및 컨텐츠 레이아웃 기존과 동일 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <button onClick={() => navigate('/')} className="text-2xl font-black tracking-tighter text-indigo-600">LAWDING</button>
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"><ChevronLeft size={24} /></button>
      </header>

      <div className="bg-gradient-to-br pt-28 max-w-6xl mx-auto px-4 md:px-8 pb-20">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-[0.1em]">{judgmentData.judgmentType}</span>
            <span className="text-slate-400 text-sm font-semibold tracking-tight">{judgmentData.summary}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.2] tracking-tighter break-keep">
            {judgmentData.title}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-10" ref={contentRef}>
            
            {/* 1. AI 요약 섹션 */}
            <section id="ai-summary">
              <motion.div 
                layout
                className="bg-gradient-to-br from-indigo-100 via-white to-blue-100 rounded-[2.5rem] shadow-xl md:p-12 text-slate-800 relative overflow-hidden border border-indigo-200"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg text-white">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI 판례 정밀 분석</h2>
                      <p className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">AI Case Insights</p>
                    </div>
                  </div>
                  
                  <motion.div animate={{ height: isAiExpanded ? 'auto' : '160px' }} className="overflow-hidden relative">
                    <div className="space-y-6">
                      {judgmentData.aiSummary.resultSummary.map((item, idx) => (
                        <div key={idx} className="flex gap-6">
                          <div className="w-1.5 h-auto bg-indigo-500/30 rounded-full flex-shrink-0" />
                          <p className="text-slate-700 leading-[2] text-[1.1rem] font-semibold break-keep tracking-tight italic">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                    {!isAiExpanded && <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-indigo-50/50 to-transparent pointer-events-none" />}
                  </motion.div>

                  <button 
                    onClick={() => setIsAiExpanded(!isAiExpanded)}
                    className="mt-8 text-indigo-700 font-bold text-sm flex items-center gap-1.5 hover:text-indigo-900 transition-colors bg-white/50 px-4 py-2 rounded-full border border-indigo-100"
                  >
                    {isAiExpanded ? '분석 내용 접기' : '분석 내용 전체 보기'}
                    <motion.div animate={{ rotate: isAiExpanded ? 180 : 0 }}><ChevronDown size={16} /></motion.div>
                  </button>
                </div>
              </motion.div>
            </section>

            {/* 2. 판결문 전문 */}
            <section id="original-content">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12">
                <div className="flex items-center gap-2 mb-8 text-slate-300 font-bold tracking-[0.2em] text-[10px] border-b border-slate-100 pb-4 uppercase">
                  <FileText size={14} />
                  <span>Full Court Transcript</span>
                </div>
                <div className="font-sans whitespace-pre-wrap text-slate-800 leading-[2.3] text-lg md:text-xl tracking-tight text-justify">
                  {judgmentData.judgment.reasons}
                </div>
              </div>
            </section>
          </div>

          {/* 사이드바 */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Download, label: 'PDF', action: handleDownloadPDF },
                  { icon: Link2, label: '링크', action: () => { navigator.clipboard.writeText(window.location.href); alert('링크가 복사되었습니다.'); } },
                  { icon: isBookmarked ? BookmarkCheck : Bookmark, label: '저장', action: handleToggleBookmark, active: isBookmarked }
                ].map((item, i) => (
                  <button key={i} onClick={item.action} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border ${item.active ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50 border-transparent'} group`}>
                    <item.icon size={22} className={item.active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} />
                    <span className={`text-[10px] font-bold ${item.active ? 'text-indigo-600' : 'text-slate-500'}`}>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-50 pb-2">
                  <Info size={16} className="text-indigo-600" /> 사건 상세 정보
                </div>
                {[
                  { label: '담당 법원', value: judgmentData.judgment.court },
                  { label: '사건 번호', value: judgmentData.judgment.case_no },
                  { label: '선고 날짜', value: judgmentData.judgment.judgment_date },
                ].map((info, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{info.label}</span>
                    <span className="text-sm font-semibold text-slate-700">{info.value}</span>
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
