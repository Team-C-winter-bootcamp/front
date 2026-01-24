import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Link2, Bookmark, BookmarkCheck } from 'lucide-react';
import { caseService } from '../api';
import { GetPrecedentDetailResponse } from '../api/types';

const JudgmentDetailPage = () => {
  const navigate = useNavigate();
  // 1. URL 파라미터에서 case_No(사건 식별자)를 가져옵니다.
  const { case_No } = useParams<{ case_No: string }>();
  
  const [activeTab, setActiveTab] = useState<'ai' | 'original'>('original');
  const [precedentDetail, setPrecedentDetail] = useState<GetPrecedentDetailResponse | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 2. API 호출 로직 (경로 오류 수정 반영)
  useEffect(() => {
    const fetchPrecedentDetail = async () => {
      const numericCaseId = Number(caseId);
      if (!caseId || isNaN(numericCaseId) || !precedentId) {
        console.warn(`상세 정보를 불러올 수 없습니다: Case ID(${caseId}) 또는 Precedent ID(${precedentId})가 유효하지 않습니다.`);
        return;
      }
      try {
        const response = await caseService.getPrecedentDetail(numericCaseId, precedentId);
        setPrecedentDetail(response);
      } catch (error: any) {
        console.error('🔥 판례 상세 조회 오류:', error);
      }
    };
    fetchPrecedentDetail();
  }, [case_No]);

  // 북마크 상태 관리 (case_No 기준)
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (!case_No) return false;
    const raw = localStorage.getItem('bookmarked_judgments');
    if (!raw) return false;
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.includes(case_No) : false;
    } catch { return false; }
  });

  // 3. 데이터 가공 로직 (types.ts의 PrecedentDetailData 필드 매핑)
  const judgmentData = useMemo(() => {
    const detail = precedentDetail?.status === 'success' ? precedentDetail.data : null;

    if (!detail) {
      return {
        title: '데이터를 불러오는 중...',
        summary: '',
        aiSummary: {
          resultSummary: ['내용을 불러오는 중...'],
          facts: ['내용을 불러오는 중...'],
        },
        judgment: {
          court: '',
          caseNo: '',
          caseName: '',
          judgmentDate: '',
          order: ['주문 정보를 불러오는 중...'],
          reasons: '내용을 불러오는 중...',
        },
      };
    }

    return {
      title: detail.case_title,
      summary: `${detail.court} ${detail.judgment_date} 선고`,
      aiSummary: {
        // summary 필드 -> 결과 요약 / issue 필드 -> 사실관계
        resultSummary: [detail.summary || 'AI 분석 요약 정보가 없습니다.'],
        facts: [detail.issue || '주요 사실관계 정보가 없습니다.'],
      },
      judgment: {
        court: detail.court,
        caseNo: detail.case_number, 
        caseName: detail.case_name,   
        judgmentDate: detail.judgment_date,
        // holding 필드 -> 주문 / content 필드 -> 판결 이유(전문)
        order: [detail.holding || '주문 정보가 없습니다.'],
        reasons: detail.content || '전체 판결문 정보가 없습니다.',
      },
    };
  }, [precedentDetail]);

  const scrollToSection = (sectionId: 'ai' | 'original') => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

  // 섹션 스크롤 이동
  const scrollToSection = (id: string) => {
    setActiveTab(id as 'ai' | 'original');
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
    }
  };

  // PDF 저장
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`${judgmentData.title}.pdf`);
    } catch (e) { alert('PDF 생성 중 오류가 발생했습니다.'); }
  };

  return (
    <main className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-70 transition-opacity"
        >
          LAWDING
        </button> 
        
        <div className="pr-[3%] flex gap-4 items-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
          >
            로그인
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
          >
            회원가입
          </button>
        </div>
      </header>

      <div className="pt-24 max-w-[1600px] mx-auto px-4 md:px-6 py-8 lg:ml-[5%]">
        <article className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
              {judgmentData.judgmentType || '판결'}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
              {judgmentData.caseType || '형사'}
            </span>
            <span className="text-sm text-slate-600 ml-1 font-light">
              {judgmentData.summary}
            </span>
            <span className="text-sm text-slate-500 font-light">{judgmentData.summary}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight break-keep">
            {judgmentData.title}
          </h1>
        </article>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0" ref={contentRef}>
            <nav className="flex border-b border-slate-200 mb-6 bg-white pt-2 rounded-t-xl" aria-label="판례 정보 탭">
              <button
                onClick={() => scrollToSection('ai')}
                className={`px-6 py-3 text-sm border-b-2 transition-all duration-200 ${
                  activeTab === 'ai' 
                    ? 'border-indigo-600 text-indigo-600 font-semibold' 
                    : 'border-transparent text-slate-600 hover:text-indigo-600 font-normal'
                }`}
              >
                AI 분석 요약
              </button>
              <button 
                onClick={() => scrollToSection('original')} 
                className={`px-6 py-3 font-medium transition-all ${activeTab === 'original' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}
              >
                판결문 전문
              </button>
            </nav>

            <div className="space-y-8">
              <section id="ai" className="scroll-mt-32">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 md:p-8 relative">
                  <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-4">
                    <h2 className="w-[90px] h-auto rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0 py-1">
                      AI 요약 
                    </h2>
                  </div>

                  <div className={`relative transition-all duration-500 ease-in-out ${!isAiExpanded ? 'max-h-[300px] overflow-hidden' : ''}`}>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-slate-800 font-light mb-3">결과 요약</h3>
                        <ul className="space-y-3">
                          {judgmentData.aiSummary.resultSummary.map((item, idx) => (
                            <li key={`summary-${idx}`} className="flex items-start gap-2 text-slate-700 leading-relaxed text-base font-light">
                              <span className="text-slate-400 mt-1.5 text-xs">●</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-slate-800 font-light mb-3">사실관계</h3>
                        <ul className="space-y-3">
                          {judgmentData.aiSummary.facts.map((item, idx) => (
                            <li key={`fact-${idx}`} className="flex items-start gap-2 text-slate-700 leading-relaxed text-base font-light">
                              <span className="text-slate-400 mt-1.5 text-xs">●</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {!isAiExpanded && (
                      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => setIsAiExpanded(!isAiExpanded)}
                      className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 flex items-center gap-1 px-6 py-2 rounded-full font-light shadow-md transition-all"
                    >
                      {isAiExpanded ? '접기' : '더 보기'}
                      <span className={`transform transition-transform ${isAiExpanded ? 'rotate-180' : ''}`} aria-hidden="true">
                        ∨
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              <section id="original" className="scroll-mt-32">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4 tracking-tight">판결문 전문</h2>
                  
                  <div className="space-y-8 text-slate-700 leading-8 text-justify font-light">
                    <section>
                      <h3 className="text-lg font-light text-slate-800 mb-4">주문</h3>
                      <ol className="list-decimal pl-6 space-y-2 mb-6">
                        {judgmentData.judgment.order.map((line, idx) => (
                          <li key={`order-${idx}`} className="text-slate-700 font-light">{line}</li>
                        ))}
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-light text-slate-800 mb-4">이유</h3>
                      <div className="whitespace-pre-wrap text-slate-700 font-light">
                        {judgmentData.judgment.reasons}
                      </div>
                    </section>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3 justify-between">
                  <button 
                    onClick={handleDownloadPDF} 
                    className="bg-white hover:bg-slate-50 border border-slate-200 p-2.5 flex-1 flex justify-center rounded-lg transition-all shadow-sm hover:border-indigo-300"
                    title="PDF 다운로드"
                    aria-label="PDF 다운로드"
                  >
                    <Download size={18} className="text-slate-600 hover:text-indigo-600" />
                  </button>
                  <button 
                    onClick={handleCopyLink} 
                    className="bg-white hover:bg-slate-50 border border-slate-200 p-2.5 flex-1 flex justify-center rounded-lg transition-all shadow-sm hover:border-indigo-300"
                    title="링크 복사"
                    aria-label="링크 복사"
                  >
                    <Link2 size={18} className="text-slate-600 hover:text-indigo-600" />
                  </button>
                  <button
                    onClick={handleToggleBookmark}
                    className={`p-2.5 border rounded-lg transition-all duration-200 flex-1 flex justify-center shadow-sm ${
                      isBookmarked 
                        ? 'border-indigo-300 bg-indigo-50' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300'
                    }`}
                    title="북마크"
                    aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={18} className="text-indigo-600 fill-current" />
                    ) : (
                      <Bookmark size={18} className="text-slate-600 hover:text-indigo-600" />
                    )}
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 mb-4">사건 상세</h3>
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-light">관할 법원</dt>
                    <dd className="font-medium text-slate-900">{judgmentData.judgment.court || '-'}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-light">사건 번호</dt>
                    <dd className="font-medium text-slate-900">{judgmentData.judgment.caseNo || '-'}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-light">선고 일자</dt>
                    <dd className="font-medium text-slate-900">{judgmentData.judgment.judgmentDate || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 font-light">사건명</dt>
                    <dd className="font-medium text-slate-900 text-right break-keep">{judgmentData.judgment.caseName || '-'}</dd>
                  </div>
                </dl>
              </div>
              <button 
                onClick={() => navigate(-1)} 
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                ← 리스트로 돌아가기
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default JudgmentDetailPage;