import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Link2, Bookmark, BookmarkCheck } from 'lucide-react';
import { caseService } from '../api';
import { GetPrecedentDetailResponse } from '../api/types';

const JudgmentDetailPage = () => {
  const navigate = useNavigate();
  const { case_No: precedentId } = useParams<{ case_No: string }>();
  const [activeTab, setActiveTab] = useState<'ai' | 'original'>('original');
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [precedentDetail, setPrecedentDetail] = useState<GetPrecedentDetailResponse | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrecedentDetail = async () => {
      if (!precedentId) {
        console.warn(`상세 정보를 불러올 수 없습니다: Precedent ID가 유효하지 않습니다.`);
        return;
      }
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
    if (!precedentId) return false;
    const raw = localStorage.getItem('bookmarked_judgments');
    if (!raw) return false;
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.includes(precedentId) : false;
    } catch {
      return false;
    }
  });

  const judgmentData = useMemo(() => {
    const detail = precedentDetail?.status === 'success' ? precedentDetail.data : null;

    if (!detail) {
      return {
        id: precedentId,
        title: '데이터를 불러오는 중...',
        summary: '',
        aiSummary: {
          title: 'AI 판결 요약',
          resultSummary: ['AI 요약 정보를 불러오는중...'],
        },
        judgment: {
          court: '',
          case_no: '',
          case_name: '',
          plaintiff: '검사',
          defendant: '피고인',
          judgment_date: '',
          order: ['주문 정보를 불러오는 중...'],
          reasons: '내용을 불러오는 중...',
        },
        caseType: '',
        judgmentType: '판결',
      };
    }

    return {
      id: detail.precedent_id,
      title: detail.case_title,
      summary: `${detail.court} ${detail.judgment_date} 선고`,
      aiSummary: {
        title: 'AI 판결 요약',
        resultSummary: [detail.summary || '결과 요약 정보가 없습니다.'],
      },
      judgment: {
        court: detail.court,
        case_no: detail.case_no,
        case_name: detail.case_name,
        plaintiff: '검사',
        defendant: '피고인',
        judgment_date: detail.judgment_date,
        reasons: detail.content || '판결 정보가 없습니다.',
      },
      caseType: '형사',
      judgmentType: '판결',
    };
  }, [precedentDetail, precedentId]);

  const scrollToSection = (sectionId: 'ai' | 'original') => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        // @ts-ignore
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${judgmentData.title}.pdf`);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 저장 중 오류가 발생했습니다.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert('링크가 복사되었습니다.');
    } catch {
      window.prompt('Ctrl+C를 눌러 복사하세요.', window.location.href);
    }
  };

  const handleToggleBookmark = () => {
    if (!precedentId) return;
    const raw = localStorage.getItem('bookmarked_judgments');
    let list: string[] = [];
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      list = Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
    } catch {
      list = [];
    }

    const next = list.includes(precedentId)
      ? list.filter((v) => v !== precedentId)
      : [...list, precedentId];
    localStorage.setItem('bookmarked_judgments', JSON.stringify(next));
    setIsBookmarked(!isBookmarked);
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
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-slate-800 leading-tight break-keep tracking-tight">
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
                AI 요약
              </button>
              <button
                onClick={() => scrollToSection('original')}
                className={`px-6 py-3 text-sm border-b-2 transition-all duration-200 ${
                  activeTab === 'original' 
                    ? 'border-indigo-600 text-indigo-600 font-semibold' 
                    : 'border-transparent text-slate-600 hover:text-indigo-600 font-normal'
                }`}
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
                        <h3 className="text-slate-800 font-semibold mb-4 text-lg">판례 분석</h3>
                          <ul className="space-y-4">
                            {judgmentData.aiSummary.resultSummary.map((item, idx) => (
                              <li key={`summary-${idx}`} className="flex items-start gap-3 text-slate-700 text-base font-light">
                                {/* 기존의 커다란 ● 대신 세련된 파란색 작은 점 적용 */}
                                  <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                {/* whitespace-pre-wrap을 유지하여 들여쓰기를 살리되, 불필요한 줄바꿈 방지 */}
                            <span className="whitespace-pre-wrap leading-snug">{item}</span>
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
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                <h3 className="font-light text-slate-800 mb-4">사건 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-light">법원</span>
                    <span className="font-light text-slate-700">{judgmentData.judgment.court}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-light">사건번호</span>
                    <span className="font-light text-slate-700">{judgmentData.judgment.case_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-light">사건명</span>
                    <span className="font-light text-slate-700">{judgmentData.judgment.case_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-light">선고일</span> 
                    <span className="font-light text-slate-700">{judgmentData.judgment.judgment_date}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 w-full font-medium px-4 py-2 rounded-lg transition-all shadow-sm text-slate-700 hover:text-indigo-600"
                  >
                    ← 뒤로가기
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default JudgmentDetailPage;
