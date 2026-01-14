import { useMemo, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { SearchBar } from '../components/search/SearchBar'
import { MOCK_RESULTS } from './SearchResultsPage'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// 이미지 assets
import download from '../assets/download.png'
import link from '../assets/link.png'
import bookmark from '../assets/bookmark.png'

const JudgmentDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [searchInput, setSearchInput] = useState('')
  // 현재 보고 있는 섹션 상태 (스크롤 스파이 용도)
  const [activeTab, setActiveTab] = useState<'ai' | 'original'>('ai')
  // AI 요약 펼치기/접기 상태
  const [isAiExpanded, setIsAiExpanded] = useState(false)
  
  const numericId = Number(id)
  const contentRef = useRef<HTMLDivElement>(null) // PDF 변환 영역 참조

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    } else {
      navigate('/search')
    }
  }

  const foundResult = useMemo(() => {
    return MOCK_RESULTS.find(r => r.id === numericId)
  }, [numericId])

  const displayData = foundResult || {
    title: '데이터를 찾을 수 없습니다.',
    content: '',
    court: '',
    date: '',
    caseType: '',
    judgmentType: ''
  }

  // 데이터 구조화
  const judgmentData = {
    id: id,
    title: displayData.title,
    summary: `${displayData.court} ${displayData.date} 선고`,
    aiSummary: {
      title: 'AI 판결 요약',
      resultSummary: [
        '내수면어업개발촉진법상 공유수면에는 하천법의 적용 또는 준용을 받는 하천도 포함됨을 판시함.',
        '하천법의 적용 또는 준용을 받는 하천부지의 무단점용은 공유수면관리법 위반죄가 아닌 하천법 위반죄에 해당함을 판시하며, 원심의 공유수면관리법 위반죄 적용을 파기 환송함.'
      ],
      facts: [
        '피고인은 하천법의 적용 또는 준용을 받는 하천부지에서 송어양식어업을 영위하며 하천부지를 무단으로 점용함.',
        '원심은 피고인의 행위를 내수면어업개발촉진법 위반 및 공유수면관리법 위반죄로 판단함.',
        '피고인은 이에 불복하여 상고함.',
        displayData.content // 실제 데이터 연결
      ]
    },
    judgment: {
      court: displayData.court,
      caseNo: '2014노1188',
      caseName: '강간미수, 유사강간',
      plaintiff: '검사',
      defendant: '피고인',
      judgmentDate: displayData.date,
      order: [
        '1. 원심판결을 파기하고, 사건을 서울고등법원에 환송한다.',
        '2. 피고인의 나머지 상고를 기각한다.'
      ],
      reasons: displayData.content.repeat(5) // 스크롤 테스트를 위해 내용 반복
    },
    relatedCases: [
      { name: '대법원 2012도1234', desc: '유사한 사실관계 판례' },
      { name: '서울고법 2013노5678', desc: '양형 부당 주장에 대한 판례' }
    ]
  }

  // 스크롤 이동 함수
  const scrollToSection = (sectionId: 'ai' | 'original') => {
    setActiveTab(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      // 헤더 높이(약 150px)를 고려하여 스크롤 위치 조정
      const headerOffset = 180
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
  
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // 실제 PDF 다운로드 기능
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    try {
      // PDF 생성 중임을 알리는 로딩 상태가 필요하다면 추가 가능
      const canvas = await html2canvas(contentRef.current, {
        // @ts-ignore - scale 옵션은 html2canvas에서 지원하지만 타입 정의에 없을 수 있음
        scale: 2, // 해상도 2배
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 너비
      const pageHeight = 297 // A4 높이
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // 내용이 길어서 페이지가 넘어가는 경우 처리
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

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      
      {/* SearchBar */}
      <div className="w-full flex justify-center lg:justify-start lg:pl-[5%] pt-2 pb-4 px-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full max-w-[1400px]">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearch={handleSearch}
            onClear={() => setSearchInput('')}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 lg:ml-[5%]">
        
        {/* Header Info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-md">
              {displayData.judgmentType || '판결'}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
              {displayData.caseType || '형사'}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              {judgmentData.judgment.court} • {judgmentData.judgment.judgmentDate} 선고
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight break-keep">
            {judgmentData.title}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Main Content (PDF 변환 대상) */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            
            {/* Tabs (Navigation) */}
            <div className="flex border-b border-gray-200 mb-6 sticky top-[80px] bg-[#F9FAFB] z-40 pt-2">
              <button
                onClick={() => scrollToSection('ai')}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'ai' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                AI 요약
              </button>
              <button
                onClick={() => scrollToSection('original')}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'original' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                판결문 전문
              </button>
            </div>

            <div className="space-y-8">
              
              {/* === AI 요약 섹션 === */}
              <div id="ai" className="scroll-mt-32">
                <div className="bg-white border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      AI
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{judgmentData.title} 요약</h2>
                  </div>

                  {/* Collapsible Content Area */}
                  <div className={`relative transition-all duration-500 ease-in-out ${!isAiExpanded ? 'max-h-[300px] overflow-hidden' : ''}`}>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-blue-600 font-bold mb-3">결과 요약</h3>
                        <ul className="space-y-3">
                          {judgmentData.aiSummary.resultSummary.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-800 leading-relaxed text-base">
                              <span className="text-blue-400 mt-1.5 text-xs">●</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-blue-600 font-bold mb-3">사실관계</h3>
                        <ul className="space-y-3">
                          {judgmentData.aiSummary.facts.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700 leading-relaxed text-base">
                              <span className="text-gray-400 mt-1.5 text-xs">●</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Gradient Overlay (접혔을 때만 표시) */}
                    {!isAiExpanded && (
                      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                    )}
                  </div>

                  {/* 더보기 버튼 */}
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => setIsAiExpanded(!isAiExpanded)}
                      className="flex items-center gap-1 px-6 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors bg-white shadow-sm"
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
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">판결문 전문</h2>
                  
                  <div className="space-y-8 text-gray-800 leading-8 text-justify">
                    <section>
                      <h3 className="text-lg font-bold text-black mb-4">주문</h3>
                      <ol className="list-decimal pl-6 space-y-2 mb-6">
                        {judgmentData.judgment.order.map((line, idx) => (
                          <li key={idx} className="text-gray-800">{line}</li>
                        ))}
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-black mb-4">이유</h3>
                      <div className="whitespace-pre-wrap text-gray-800">
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
            <div className="sticky top-[180px] space-y-4">
              {/* Action Buttons */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 justify-between">
                  {/* 수정된 PDF 저장 버튼 */}
                  <button 
                    onClick={handleDownloadPDF} 
                    className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1 flex justify-center"
                    title="PDF 다운로드"
                  >
                    <img
                      src={download}
                      alt="download"
                      className="w-4 h-4 object-contain opacity-60"
                    />
                  </button>
                  <button 
                    onClick={handleCopyLink} 
                    className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1 flex justify-center"
                    title="링크 복사"
                  >
                    <img
                      src={link}
                      alt="link"
                      className="w-4 h-4 object-contain opacity-60"
                    />
                  </button>
                  <button
                    onClick={handleToggleBookmark}
                    className={`p-2.5 border rounded-lg transition-colors flex-1 flex justify-center ${
                      isBookmarked 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title="북마크"
                  >
                    <img
                      src={bookmark}
                      alt="bookmark"
                      className={`w-4 h-4 object-contain ${isBookmarked ? 'opacity-100' : 'opacity-60'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">사건 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">법원</span>
                    <span className="font-medium text-gray-900">{judgmentData.judgment.court}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">사건번호</span>
                    <span className="font-medium text-gray-900">{judgmentData.judgment.caseNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">사건명</span>
                    <span className="font-medium text-gray-900">{judgmentData.judgment.caseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">선고일</span>
                    <span className="font-medium text-gray-900">{judgmentData.judgment.judgmentDate}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    ← 뒤로가기
                  </button>
                  <button
                    onClick={() => navigate('/search')}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    검색으로
                  </button>
                </div>
              </div>

              {/* Related Cases */}
              {judgmentData.relatedCases.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">관련 판례</h3>
                  <ul className="space-y-3">
                    {judgmentData.relatedCases.map((c, idx) => (
                      <li key={idx} className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="font-medium text-sm text-gray-900 mb-1">{c.name}</div>
                        <div className="text-xs text-gray-600">{c.desc}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JudgmentDetailPage