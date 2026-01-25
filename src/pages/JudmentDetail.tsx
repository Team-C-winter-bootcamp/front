import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Link2, Bookmark, BookmarkCheck, ChevronLeft, Scale, FileText, Info, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseService } from '../api';
import { GetPrecedentDetailResponse } from '../api/types';

const JudgmentDetailPage = () => {
  const navigate = useNavigate();
  const { case_No: precedentId } = useParams<{ case_No: string }>();
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [precedentDetail, setPrecedentDetail] = useState<GetPrecedentDetailResponse | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrecedentDetail = async () => {
      if (!precedentId) return;
      try {
        const response = await caseService.getPrecedentDetail(precedentId);
        setPrecedentDetail(response);
      } catch (error: any) {
        console.error('판례 상세 조회 오류:', error);
      }
    };
    fetchPrecedentDetail();
  }, [precedentId]);

  const [isBookmarked, setIsBookmarked] = useState(() => {
    const list = JSON.parse(localStorage.getItem('bookmarked_judgments') || '[]');
    return Array.isArray(list) && precedentId ? list.includes(precedentId) : false;
  });

  const judgmentData = useMemo(() => {
    const detail = precedentDetail?.status === 'success' ? precedentDetail.data : null;
    if (!detail) {
      return {
        title: '데이터 로딩 중...',
        summary: '로딩 중',
        judgment: { court: '-', case_no: '-', case_name: '-', judgment_date: '-', reasons: '데이터를 불러오는 중입니다...' },
        aiSummary: { resultSummary: ['AI 분석 데이터를 생성 중입니다...'] },
        judgmentType: '판결'
      };
    }

    const court = detail.court || '정보 없음';
    const date = detail.judgment_date || '날짜 미상';

    return {
      id: detail.precedent_id,
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

  const handleGoToSimulation = () => {
    if (precedentId) {
      navigate(`/answer/${precedentId}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <button onClick={() => navigate('/')} className="text-2xl font-black tracking-tighter text-indigo-600">LAWDING</button>
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"><ChevronLeft size={24} /></button>
      </header>

      <div className="pt-28 max-w-6xl mx-auto px-4 md:px-8 pb-20 font-sans">
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
                className="bg-gradient-to-br from-indigo-100 via-white to-blue-100 rounded-[2.5rem] shadow-xl shadow-indigo-200/40 p-8 md:p-12 text-slate-800 relative overflow-hidden border border-indigo-200"
              >
                <div className="absolute -top-12 -right-12 opacity-[0.08] rotate-12 text-indigo-700">
                  <Scale size={280} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-300 text-white">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI 판례 정밀 분석</h2>
                      <p className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest font-sans">AI Case Insights</p>
                    </div>
                  </div>
                  
                  <motion.div animate={{ height: isAiExpanded ? 'auto' : '160px' }} className="overflow-hidden relative">
                    <div className="space-y-6">
                      {judgmentData.aiSummary.resultSummary.map((item, idx) => (
                        <div key={idx} className="flex gap-6">
                          <div className="w-1.5 h-auto bg-indigo-500/30 rounded-full flex-shrink-0" />
                          <p className="text-slate-700 leading-[2] text-[1.1rem] font-semibold break-keep tracking-tight">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                    {!isAiExpanded && <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />}
                  </motion.div>

                  <button 
                    onClick={() => setIsAiExpanded(!isAiExpanded)}
                    className="mt-8 text-indigo-700 font-bold text-sm flex items-center gap-1.5 hover:text-indigo-900 transition-colors bg-white/50 px-4 py-2 rounded-full border border-indigo-100 w-fit"
                  >
                    {isAiExpanded ? '분석 내용 접기' : '분석 내용 전체 보기'}
                    <motion.div animate={{ rotate: isAiExpanded ? 180 : 0 }}><ChevronDown size={16} /></motion.div>
                  </button>
                </div>
              </motion.div>
            </section>

            {/* 2. 시뮬레이션 이동 섹션 */}
            <section id="simulation-cta">
              <button 
                onClick={handleGoToSimulation}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3 tracking-tighter">
                      내 사건 결과 예측하기 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </h3>
                    <p className="text-slate-400 text-sm md:text-base group-hover:text-indigo-50 transition-colors tracking-tight">
                      이 판례를 바탕으로 나의 승소 확률과 적정 합의금을 시뮬레이션 합니다.
                    </p>
                  </div>
                  <div className="px-10 py-4 bg-indigo-500 text-white rounded-2xl font-black group-hover:bg-white group-hover:text-indigo-600 transition-all shadow-xl shadow-indigo-900/40 border border-white/10">
                    분석 시작하기
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-400/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-300/20 transition-all" />
              </button>
            </section>

            {/* 3. 판결문 전문 (폰트 고딕 통일 및 행간 최적화) */}
            <section id="original-content">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10 md:p-16">
                <div className="flex items-center gap-2 mb-12 text-slate-300 font-bold tracking-[0.2em] text-[10px] border-b border-slate-100 pb-4 uppercase font-sans">
                  <FileText size={14} />
                  <span>Full Court Transcript</span>
                </div>
                {/* font-sans로 통일하되 leading-[2.3]으로 행간을 대폭 늘려 가독성 확보 */}
                <div className="font-sans whitespace-pre-wrap text-slate-800 leading-[2.3] text-lg md:text-xl tracking-tight text-justify selection:bg-indigo-50">
                  {judgmentData.judgment.reasons}
                </div>
              </div>
            </section>
          </div>

          {/* 사이드바 */}
          <aside className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-3 gap-3 mb-8 font-sans">
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

              <div className="space-y-6 pt-2 font-sans">
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
            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 font-sans">
               <p className="text-[11px] text-indigo-600 font-bold leading-relaxed tracking-tight">
                 본 AI 요약 서비스는 판례 전문의 법리적 흐름을 분석하여 제공하며, 실제 법적 효력을 보장하지 않습니다. 자세한 상담은 변호사와 진행하세요.
               </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default JudgmentDetailPage;