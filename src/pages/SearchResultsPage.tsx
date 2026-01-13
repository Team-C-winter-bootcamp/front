import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from '../components/Header'

export interface SearchResult {
  id: number
  title: string
  content: string
  court: string
  date: string
  caseType: string
  judgmentType: string
}

export const MOCK_RESULTS: SearchResult[] = [
    {
      id: 1,
      title: '서울고등법원 2014. 7. 11. 선고 2014노1188 판결 강간미수, 유사강간',
      content: '항소이유의 요지 피고인의 이 사건 범행은 강간미수와 유사강간의 실체적 경합범으로 판단하여야 함에도...',
      court: '서울고등법원',
      date: '2014. 7. 11.',
      caseType: '형사',
      judgmentType: '판결'
    },
    {
      id: 2,
      title: '대법원 2020. 3. 12. 선고 2019도12345 판결 계약금반환',
      content: '계약금은 계약 이행의 담보로서 교부되는 것으로, 계약이 해제되면 계약금도 반환되어야 한다는 것이 원칙이다.',
      court: '대법원',
      date: '2020. 3. 12.',
      caseType: '민사',
      judgmentType: '판결'
    },
    {
      id: 3,
      title: '서울지방법원 2018. 5. 20. 선고 2017가단12345 판결 손해배상',
      content: '불법행위로 인한 손해배상 청구에서 과실상계가 적용될 수 있으며, 피해자의 과실 비율에 따라 배상액이 조정된다.',
      court: '서울지방법원',
      date: '2018. 5. 20.',
      caseType: '민사',
      judgmentType: '판결'
    },
    {
      id: 4,
      title: '대법원 2021. 8. 15. 결정 2021마1234 상고기각',
      content: '상고이유가 법령위반을 주장하는 것이나, 구체적인 위반 내용을 지적하지 아니한 경우 상고는 이유 없다.',
      court: '대법원',
      date: '2021. 8. 15.',
      caseType: '형사',
      judgmentType: '결정'
    },
    {
      id: 5,
      title: '부산고등법원 2019. 11. 25. 선고 2019노5678 판결 교통사고',
      content: '교통사고로 인한 상해의 경우, 가해자의 과실이 인정되고 인과관계가 입증되면 손해배상 책임이 발생한다.',
      court: '부산고등법원',
      date: '2019. 11. 25.',
      caseType: '형사',
      judgmentType: '판결'
    },
    {
      id: 6,
      title: '서울행정법원 2022. 1. 10. 선고 2021구합12345 판결 과세처분',
      content: '과세처분의 취소를 구하는 소송에서 처분의 위법성과 피해 사실을 입증해야 한다.',
      court: '서울행정법원',
      date: '2022. 1. 10.',
      caseType: '행정',
      judgmentType: '판결'
    }
  ]

// 필터 옵션 상수 정의
const CASE_TYPES = ['민사', '형사', '행정', '가사', '특허', '선거'];
const COURT_TYPES = ['대법원', '고등/특허/고등법원', '지방법원', '행정/가정/회생/군사법원', '헌법재판소'];
const JUDGMENT_TYPES = ['전체', '판결', '결정', '명령'];
const PERIOD_TYPES = ['전체 기간', '최근 1년', '최근 3년', '최근 5년'];

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { isAuthenticated } = useStore()
  const [searchInput, setSearchInput] = useState(query)
  const [activeTab, setActiveTab] = useState<'expert' | 'all' | 'ai'>('expert')
  
  // 필터 상태 관리
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([])
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [selectedJudgmentType, setSelectedJudgmentType] = useState<string>('전체')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('전체 기간')
  
  const [mobileFilterOpen, setMobileFilterOpen] = useState<string | null>(null)

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchInput })
  }

  const handleAITabClick = () => {
    if (!isAuthenticated) {
      if (window.confirm('로그인이 필요합니다.\n확인 버튼을 누르면 이전 페이지로 돌아갑니다.')) {
        navigate(-1)
      }
      return
    }
    setActiveTab('ai')
    navigate('/ai-chat')
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 

  const filteredResults = useMemo(() => {
    let results = MOCK_RESULTS

    if (query) {
      results = results.filter(r => 
        r.title.includes(query) || r.content.includes(query)
      )
    }

    if (activeTab === 'expert') {
      results = results.filter(r => 
        r.court.includes('대법원') || r.court.includes('고등법원') || r.court.includes('특허법원')
      )
    }

    if (selectedCaseTypes.length > 0) {
      results = results.filter(r => selectedCaseTypes.includes(r.caseType))
    }

    if (selectedCourts.length > 0) {
      results = results.filter(r => 
        selectedCourts.some(court => {
          if (court === '대법원') return r.court.includes('대법원')
          if (court === '고등/특허/고등법원') return r.court.includes('고등법원') || r.court.includes('특허법원')
          if (court === '지방법원') return r.court.includes('지방법원')
          if (court === '행정/가정/회생/군사법원') return r.court.includes('행정법원') || r.court.includes('가정법원')
          if (court === '헌법재판소') return r.court.includes('헌법재판소')
          return false
        })
      )
    }

    if (selectedJudgmentType !== '전체') {
      results = results.filter(r => r.judgmentType === selectedJudgmentType)
    }

    // 날짜 필터 로직 (예시: 문자열 비교나 Date 변환 필요, 여기선 구조만 유지)
    // 실제 구현 시 date 문자열 파싱 필요

    return results
  }, [query, activeTab, selectedCaseTypes, selectedCourts, selectedJudgmentType])

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredResults.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredResults, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, activeTab, selectedCaseTypes, selectedCourts, selectedJudgmentType])

  const handleCaseTypeChange = (type: string) => {
    setSelectedCaseTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleCourtChange = (court: string) => {
    setSelectedCourts(prev =>
      prev.includes(court) ? prev.filter(c => c !== court) : [...prev, court]
    )
  }

  const handleResultClick = (id: number) => {
    navigate(`/judgment/${id}`, { state: { from: 'search' } })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Search Bar */}
      <div className="px-4 md:px-6 py-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => navigate('/')} className="text-lg p-2">
            ←
          </button>
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="키워드를 입력하세요"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setSearchParams({})
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Filter Toggle (모바일에서만 보임) */}
      <div className="md:hidden px-4 py-3 border-b bg-gray-50 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2">
           {['사건종류', '법원', '재판유형', '기간'].map((filter) => (
             <button 
                key={filter}
                onClick={() => setMobileFilterOpen(mobileFilterOpen === filter ? null : filter)}
                className={`px-3 py-1.5 text-sm border rounded-full ${
                    mobileFilterOpen === filter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
                }`}
             >
                {filter} ▼
             </button>
           ))}
        </div>
        {/* 모바일 필터 내용 영역 */}
        {mobileFilterOpen && (
            <div className="mt-3 p-4 bg-white border rounded shadow-lg animate-fade-in-down">
                {mobileFilterOpen === '사건종류' && (
                    <div className="flex flex-wrap gap-2">
                        {CASE_TYPES.map(type => (
                             <button
                                key={type}
                                onClick={() => handleCaseTypeChange(type)}
                                className={`px-3 py-1 text-sm rounded-full ${
                                    selectedCaseTypes.includes(type) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                }`}
                             >
                                {type}
                             </button>
                        ))}
                    </div>
                )}
                 {mobileFilterOpen === '법원' && (
                    <div className="flex flex-wrap gap-2">
                        {COURT_TYPES.map(type => (
                             <button
                                key={type}
                                onClick={() => handleCourtChange(type)}
                                className={`px-3 py-1 text-sm rounded-full ${
                                    selectedCourts.includes(type) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                }`}
                             >
                                {type}
                             </button>
                        ))}
                    </div>
                )}
                {/* 재판유형, 기간 등 추가 가능 */}
            </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 px-4 md:px-6 py-6 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 order-2 md:order-1">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('expert')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'expert' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전문판례
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={handleAITabClick}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'ai' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <span>🤖</span> AI 유사 판례 추천
            </button>
          </div>

          {/* Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">검색 결과</span>
              <span className="text-blue-600 font-bold">{filteredResults.length}건</span>
            </div>
            <select className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500">
              <option>정확도순</option>
              <option>최신순</option>
            </select>
          </div>

          {/* Search Results List */}
          <div className="space-y-4">
            {paginatedResults.length > 0 ? (
              paginatedResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result.id)}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all bg-white"
                >
                  <div className="flex gap-2 mb-2 text-sm">
                    <span className="text-blue-600 font-semibold">{result.court}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">{result.date}</span>
                    <span className="text-gray-400">|</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs flex items-center">{result.caseType}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs flex items-center">{result.judgmentType}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900 leading-tight hover:text-blue-600">{result.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{result.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <span className="text-4xl block mb-4">🔍</span>
                <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">단어의 철자가 정확한지 확인해 보세요.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded ${
                            currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    &gt;
                </button>
            </div>
          )}
        </div>

        {/* ✅ [복원됨] Sidebar Filters (PC 버전) */}
        <div className="hidden md:block w-64 flex-shrink-0 order-1 md:order-2">
           <div className="sticky top-24 space-y-8">
                {/* 1. 사건종류 필터 */}
                <div>
                    <h3 className="font-bold mb-3 flex justify-between items-center">
                        사건종류
                        {selectedCaseTypes.length > 0 && (
                            <button 
                                onClick={() => setSelectedCaseTypes([])}
                                className="text-xs text-gray-400 hover:text-blue-600 underline"
                            >
                                초기화
                            </button>
                        )}
                    </h3>
                    <div className="space-y-2">
                        {CASE_TYPES.map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                                <input
                                    type="checkbox"
                                    checked={selectedCaseTypes.includes(type)}
                                    onChange={() => handleCaseTypeChange(type)}
                                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* 2. 법원 필터 */}
                <div>
                    <h3 className="font-bold mb-3 flex justify-between items-center">
                        법원
                        {selectedCourts.length > 0 && (
                            <button 
                                onClick={() => setSelectedCourts([])}
                                className="text-xs text-gray-400 hover:text-blue-600 underline"
                            >
                                초기화
                            </button>
                        )}
                    </h3>
                    <div className="space-y-2">
                        {COURT_TYPES.map((court) => (
                            <label key={court} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                                <input
                                    type="checkbox"
                                    checked={selectedCourts.includes(court)}
                                    onChange={() => handleCourtChange(court)}
                                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{court}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* 3. 재판유형 필터 */}
                <div>
                    <h3 className="font-bold mb-3">재판유형</h3>
                    <div className="space-y-2">
                        {JUDGMENT_TYPES.map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                                <input
                                    type="radio"
                                    name="judgmentType"
                                    checked={selectedJudgmentType === type}
                                    onChange={() => setSelectedJudgmentType(type)}
                                    className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* 4. 기간 필터 */}
                <div>
                    <h3 className="font-bold mb-3">기간</h3>
                    <div className="space-y-2">
                        {PERIOD_TYPES.map((period) => (
                            <label key={period} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                                <input
                                    type="radio"
                                    name="period"
                                    checked={selectedPeriod === period}
                                    onChange={() => setSelectedPeriod(period)}
                                    className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{period}</span>
                            </label>
                        ))}
                    </div>
                </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage