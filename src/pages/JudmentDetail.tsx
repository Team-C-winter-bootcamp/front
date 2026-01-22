import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Link2, Bookmark, BookmarkCheck } from 'lucide-react';
import { caseService } from '../api';
import { GetPrecedentDetailResponse } from '../api/types';

const JudgmentDetailPage = () => {
  const navigate = useNavigate();
  const { caseId, precedentId: precedentIdStr } = useParams<{ caseId: string; precedentId: string }>();

  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'ai' | 'original'>('original');
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [precedentDetail, setPrecedentDetail] = useState<GetPrecedentDetailResponse | null>(null);

  const precedentId = precedentIdStr || '';
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrecedentDetail = async () => {
      // CaseCreation 페이지에서 caseId를 정상적으로 받아오지 못하면, URL에 'null'이 포함될 수 있습니다.
      // 이는 caseService.createCase API가 응답에 case_id를 포함하지 않을 경우 발생합니다.
      if (!caseId || caseId === 'null' || !precedentId) {
        console.error(
          `API 호출 실패: Case ID 또는 Precedent ID가 유효하지 않습니다. (caseId: ${caseId}, precedentId: ${precedentId})
          - 백엔드의 사건 생성(POST /cases/) API가 응답 데이터에 'case_id'를 포함하는지 확인해주세요.`
        );
        return;
      }

      try {
        const response = await caseService.getPrecedentDetail(Number(caseId), precedentId);
        setPrecedentDetail(response);
      } catch (error: any) {
        console.error('판례 상세 조회 오류:', error);
      }
    };

    fetchPrecedentDetail();
  }, [caseId, precedentId]);

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
          resultSummary: ['AI 요약 정보가 없습니다.'],
          facts: ['사실관계 정보가 없습니다.'],
        },
        judgment: {
          court: '',
          caseNo: '',
          caseName: '',
          plaintiff: '검사',
          defendant: '피고인',
          judgmentDate: '',
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
        facts: [detail.issue || '사실관계 정보가 없습니다.'],
      },
      judgment: {
        court: detail.court,
        caseNo: detail.case_number,
        caseName: detail.case_name,
        plaintiff: '검사',
        defendant: '피고인',
        judgmentDate: detail.judgment_date,
        order: [detail.holding || '주문 정보가 없습니다.'],
        reasons: detail.content || '판결 이유 정보가 없습니다.',
      },
      caseType: '형사', // API 응답에 없으므로 임시 하드코딩
      judgmentType: '판결',
    };
  }, [precedentDetail, precedentId]);

  const scrollToSection = (sectionId: 'ai' | 'original') => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

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
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-70 transition-opacity"
        >
          LAWDING
        </button> 
        
        <div className="pr-[3%] flex gap-4 items-center">
          <SignedIn>
            <span className="text-sm text-slate-700 font-light">
              환영합니다 {user?.firstName || user?.username}님!
            </span>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          
          <SignedOut>
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
          </SignedOut>
        </div>
      </header>

      <div className="pt-24 max-w-[1600px] mx-auto px-4 md:px-6 py-8 lg:ml-[5%]">
        
        <div className="mb-8">
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
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 min-w-0" ref={contentRef}>
            
            <div className="flex border-b border-slate-200 mb-6 bg-white pt-2 rounded-t-xl">
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
            </div>

            <div className="space-y-8">
              
              <div id="ai" className="scroll-mt-32">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 md:p-8 relative">
                  
                  <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-4">
                    <div className="w-[90px] h-auto rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                      AI 요약 
                    </div>
                  </div>

                  <div className={`relative transition-all duration-500 ease-in-out ${!isAiExpanded ? 'max-h-[300px] overflow-hidden' : ''}`}>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-slate-800 font-light mb-3">결과 요약</h3>
                        <ul className="space-y-3">
                          {judgmentData.aiSummary.resultSummary.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed text-base font-light">
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
                            <li key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed text-base font-light">
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
                      <span className={`transform transition-transform ${isAiExpanded ? 'rotate-180' : ''}`}>
                        ∨
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div id="original" className="scroll-mt-32">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4 tracking-tight">판결문 전문</h2>
                  
                  <div className="space-y-8 text-slate-700 leading-8 text-justify font-light">
                    <section>
                      <h3 className="text-lg font-light text-slate-800 mb-4">주문</h3>
                      <ol className="list-decimal pl-6 space-y-2 mb-6">
                        {judgmentData.judgment.order.map((line, idx) => (
                          <li key={idx} className="text-slate-700 font-light">{line}</li>
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
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-4">
              
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3 justify-between">
                  <button 
                    onClick={handleDownloadPDF} 
                    className="bg-white hover:bg-slate-50 border border-slate-200 p-2.5 flex-1 flex justify-center rounded-lg transition-all shadow-sm hover:border-indigo-300"
                    title="PDF 다운로드"
                  >
                    <Download size={18} className="text-slate-600 hover:text-indigo-600" />
                  </button>
                  <button 
                    onClick={handleCopyLink} 
                    className="bg-white hover:bg-slate-50 border border-slate-200 p-2.5 flex-1 flex justify-center rounded-lg transition-all shadow-sm hover:border-indigo-300"
                    title="링크 복사"
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
                    <span className="font-light text-slate-700">{judgmentData.judgment.caseNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-light">사건명</span>
                    <span className="font-light text-slate-700">{judgmentData.judgment.caseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-light">선고일</span>
                    <span className="font-light text-slate-700">{judgmentData.judgment.judgmentDate}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgmentDetailPage;
