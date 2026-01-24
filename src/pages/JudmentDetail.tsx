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
      if (!case_No) {
        console.error('❌ 사건 식별자가 URL 파라미터에 없습니다.');
        return;
      }

      try {
        // 백엔드 명세 api/cases/<str:precedents_id>/ 호출
        const response = await caseService.getPrecedentDetail(case_No);
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

  // 북마크 토글
  const handleToggleBookmark = () => {
    if (!case_No) return;
    const raw = localStorage.getItem('bookmarked_judgments');
    let list: string[] = [];
    try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
    const next = list.includes(case_No) ? list.filter(v => v !== case_No) : [...list, case_No];
    localStorage.setItem('bookmarked_judgments', JSON.stringify(next));
    setIsBookmarked(!isBookmarked);
  };

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    } catch { alert('링크 복사에 실패했습니다.'); }
  };

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
    <div className="min-h-screen bg-white">
      {/* 상단 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <button onClick={() => navigate('/')} className="text-2xl font-black text-indigo-600">LAWDING</button>
      </header>

      <div className="pt-24 max-w-6xl mx-auto px-6 py-8">
        {/* 헤더 섹션: 사건번호 및 제목 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">
              {judgmentData.judgment.caseNo || '사건번호 확인 중'}
            </span>
            <span className="text-sm text-slate-500 font-light">{judgmentData.summary}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight break-keep">
            {judgmentData.title}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1" ref={contentRef}>
            {/* 탭 네비게이션 */}
            <div className="flex border-b border-slate-200 mb-8">
              <button 
                onClick={() => scrollToSection('ai')} 
                className={`px-6 py-3 font-medium transition-all ${activeTab === 'ai' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}
              >
                AI 분석 요약
              </button>
              <button 
                onClick={() => scrollToSection('original')} 
                className={`px-6 py-3 font-medium transition-all ${activeTab === 'original' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}
              >
                판결문 전문
              </button>
            </div>

            {/* AI 요약 섹션 */}
            <div id="ai" className="scroll-mt-32 mb-12">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-600 rounded-full"></span> AI 판결 분석
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wider">요약 결과</h3>
                    {judgmentData.aiSummary.resultSummary.map((s, i) => <p key={i} className="text-slate-700 leading-relaxed text-lg font-light">{s}</p>)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wider">사실관계 및 쟁점</h3>
                    {judgmentData.aiSummary.facts.map((f, i) => <p key={i} className="text-slate-700 leading-relaxed text-lg font-light">{f}</p>)}
                  </div>
                </div>
              </div>
            </div>

            {/* 판결문 전문 섹션 */}
            <div id="original" className="scroll-mt-32">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b">판결문 전문</h2>
                <section className="mb-10">
                  <h3 className="text-lg font-bold mb-4 text-slate-900">[주 문]</h3>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 italic">
                    {judgmentData.judgment.order.map((o, i) => <p key={i} className="mb-2 text-slate-800 font-medium">{o}</p>)}
                  </div>
                </section>
                <section>
                  <h3 className="text-lg font-bold mb-4 text-slate-900">[이 유]</h3>
                  <p className="whitespace-pre-wrap text-slate-700 leading-9 text-justify font-serif text-lg">
                    {judgmentData.judgment.reasons}
                  </p>
                </section>
              </div>
            </div>
          </div>

          {/* 우측 사이드바 (사건 요약 정보) */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-2 mb-6">
                  <button onClick={handleDownloadPDF} className="flex-1 flex justify-center p-3 border rounded-xl hover:bg-slate-50 transition" title="PDF 저장"><Download size={20} className="text-slate-600"/></button>
                  <button onClick={handleCopyLink} className="flex-1 flex justify-center p-3 border rounded-xl hover:bg-slate-50 transition" title="링크복사"><Link2 size={20} className="text-slate-600"/></button>
                  <button onClick={handleToggleBookmark} className={`flex-1 flex justify-center p-3 border rounded-xl transition ${isBookmarked ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50'}`}>
                    {isBookmarked ? <BookmarkCheck size={20} className="text-indigo-600 fill-current"/> : <Bookmark size={20} className="text-slate-600"/>}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgmentDetailPage;