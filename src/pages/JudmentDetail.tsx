import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, Link2, Bookmark, BookmarkCheck } from 'lucide-react'
import { MOCK_RESULTS } from './SearchResult'
import { caseService } from '../api'

const JudgmentDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  
  // [변경 2] Clerk useUser 훅 사용
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<'ai' | 'original'>('ai')
  const [isAiExpanded, setIsAiExpanded] = useState(false)
  const [caseId, setCaseId] = useState<number | null>(null)
  const [precedentDetail, setPrecedentDetail] = useState<any>(null)
  
  // [삭제] LogoutModal 관련 state 삭제
  // const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  
  const numericId = id ? Number(id) : 0
  const contentRef = useRef<HTMLDivElement>(null)

  // location state에서 caseId 가져오기
  useEffect(() => {
    const state = location.state as { caseId?: number } | null;
    if (state?.caseId) {
      setCaseId(state.caseId);
    }
  }, [location]);

  // 판례 상세 정보 조회
  useEffect(() => {
    const fetchPrecedentDetail = async () => {
      if (caseId && numericId && !isNaN(numericId)) {
        try {
          const response = await caseService.getPrecedentDetail(caseId, numericId);
          if (response.status === 'success' && 'data' in response) {
            setPrecedentDetail(response.data);
          }
        } catch (error: any) {
          console.error('판례 상세 조회 오류:', error);
        }
      }
    };

    fetchPrecedentDetail();
  }, [caseId, numericId]);

  const [isBookmarked, setIsBookmarked] = useState(() => {
    const raw = localStorage.getItem('bookmarked_judgments')
    if (!raw) return false
    try {
      const list = JSON.parse(raw)
      return Array.isArray(list) ? list.includes(numericId) : false
    } catch {
      return false
    }
  })


  const foundResult = useMemo(() => {
    return MOCK_RESULTS.find(r => r.id === numericId)
  }, [numericId])

  // API 응답 또는 MOCK 데이터 사용
  const displayData = precedentDetail?.case_info ? {
    title: precedentDetail.case_info.title,
    content: precedentDetail.case_info.full_text,
    court: precedentDetail.case_info.court,
    date: precedentDetail.case_info.judgment_date,
    caseType: '형사',
    judgmentType: '판결'
  } : foundResult || {
    title: '데이터를 찾을 수 없습니다.',
    content: '',
    court: '',
    date: '',
    caseType: '',
    judgmentType: ''
  }

  const judgmentData = {
    id: id,
    title: displayData.title,
    summary: `${displayData.court} ${displayData.date} 선고`,
    aiSummary: {
      title: 'AI 판결 요약',
      resultSummary: precedentDetail?.ai_analysis?.key_points || [
        '내수면어업개발촉진법상 공유수면에는 하천법의 적용 또는 준용을 받는 하천도 포함됨을 판시함.',
        '하천법의 적용 또는 준용을 받는 하천부지의 무단점용은 공유수면관리법 위반죄가 아닌 하천법 위반죄에 해당함을 판시하며, 원심의 공유수면관리법 위반죄 적용을 파기 환송함.'
      ],
      facts: [
        precedentDetail?.ai_analysis?.overview || '피고인은 하천법의 적용 또는 준용을 받는 하천부지에서 송어양식어업을 영위하며 하천부지를 무단으로 점용함.',
        '원심은 피고인의 행위를 내수면어업개발촉진법 위반 및 공유수면관리법 위반죄로 판단함.',
        '피고인은 이에 불복하여 상고함.',
        displayData.content
      ]
    },
    judgment: {
      court: displayData.court,
      caseNo: precedentDetail?.case_info?.case_number || displayData.title.match(/\d{4}[노도마가구]\d+/)?.[0] || '2014노1188',
      caseName: displayData.title.split('선고')[1]?.trim() || '강간미수, 유사강간',
      plaintiff: '검사',
      defendant: '피고인',
      judgmentDate: displayData.date,
      order: [
        '1. 원심판결을 파기하고, 사건을 서울고등법원에 환송한다.',
        '2. 피고인의 나머지 상고를 기각한다.'
      ],
      reasons: displayData.content || '항소이유의 요지 피고인의 이 사건 범행은 강간미수와 유사강간의 실체적 경합범으로 판단하여야 함에도...'
    },
    relatedCases: [
      { name: '대법원 2012도1234', desc: '유사한 사실관계 판례' },
      { name: '서울고법 2013노5678', desc: '양형 부당 주장에 대한 판례' }
    ]
  }

  const scrollToSection = (sectionId: 'ai' | 'original') => {
    setActiveTab(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 180
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
  
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    try {
      const canvas = await html2canvas(contentRef.current, {
        // @ts-ignore
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' 
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${judgmentData.title}.pdf`)
    } catch (error) {
      console.error('PDF 생성 실패:', error)
      alert('PDF 저장 중 오류가 발생했습니다.')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      window.alert('링크가 복사되었습니다.')
    } catch {
      window.prompt('Ctrl+C를 눌러 복사하세요.', window.location.href)
    }
  }

  const handleToggleBookmark = () => {
    const raw = localStorage.getItem('bookmarked_judgments')
    let list: number[] = []
    try {
      const parsed = raw ? JSON.parse(raw) : []
      list = Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'number') : []
    } catch {
      list = []
    }

    const next = list.includes(numericId) ? list.filter((v) => v !== numericId) : [...list, numericId]
    localStorage.setItem('bookmarked_judgments', JSON.stringify(next))
    setIsBookmarked(!isBookmarked)
  }

  // [삭제] Logout 관련 핸들러 삭제

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-70 transition-opacity"
        >
          LAWDING
        </button> 
        
        {/*  헤더 우측 로그인/로그아웃 버튼 Clerk 컴포넌트로 교체 */}
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

      {/* Main Container */}
      <div className="pt-24 max-w-[1600px] mx-auto px-4 md:px-6 py-8 lg:ml-[5%]">
        
        {/* Header Info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
              {displayData.judgmentType || '판결'}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg">
              {displayData.caseType || '형사'}
            </span>
            <span className="text-sm text-slate-600 ml-1 font-light">
              {judgmentData.judgment.court} • {judgmentData.judgment.judgmentDate} 선고
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-slate-800 leading-tight break-keep tracking-tight">
            {judgmentData.title}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Main Content (PDF 변환 대상) */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            
            {/* Tabs (Navigation) */}
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
              
              {/* === AI 요약 섹션 === */}
              <div id="ai" className="scroll-mt-32">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 md:p-8 relative">
                  
                  {/* 헤더 영역 */}
                  <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-4">
                    <div className="w-[90px] h-auto rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                      AI 요약 
                    </div>
                  </div>

                  {/* Collapsible Content Area */}
                  <div className={`relative transition-all duration-500 ease-in-out ${!isAiExpanded ? 'max-h-[300px] overflow-hidden' : ''}`}>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-slate-800 font-light mb-3">결과 요약</h3>
                        <ul className="space-y-3">
                          {judgmentData.aiSummary.resultSummary.map((item: string, idx: number) => (
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

                    {/* Gradient Overlay */}
                    {!isAiExpanded && (
                      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                    )}
                  </div>

                  {/* 더보기 버튼 */}
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

              {/* === 판결문 전문 섹션 === */}
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

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-4">
              
              {/* Action Buttons */}
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

              {/* Quick Info */}
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

              {/* Navigation */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate('/search')}
                    className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 w-full font-medium px-4 py-2 rounded-lg transition-all shadow-sm text-slate-700 hover:text-indigo-600"
                  >
                    ← 뒤로가기
                  </button>
                </div>
              </div>

              {/* Related Cases */}
              {judgmentData.relatedCases.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 mb-4">관련 판례</h3>
                  <ul className="space-y-3">
                    {judgmentData.relatedCases.map((c, idx) => (
                      <li key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                        <div className="font-medium text-sm text-slate-800 mb-1">{c.name}</div>
                        <div className="text-xs text-slate-500 font-normal">{c.desc}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* LogoutAlertModal 삭제됨 */}
    </div>
  )
}

export default JudgmentDetailPage