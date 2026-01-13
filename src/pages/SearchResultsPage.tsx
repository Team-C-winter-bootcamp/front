import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from '../components/Header'

interface SearchResult {
  id: number
  title: string
  content: string
  court: string
  date: string
  caseType: string
  judgmentType: string
}

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { isAuthenticated } = useStore()
  const [searchInput, setSearchInput] = useState(query)
  const [activeTab, setActiveTab] = useState<'expert' | 'all' | 'ai'>('expert')
  
  // 필터 상태
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([])
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [selectedJudgmentType, setSelectedJudgmentType] = useState<string>('전체')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('전체 기간')
  
  // 모바일 필터 드롭다운
  const [mobileFilterOpen, setMobileFilterOpen] = useState<string | null>(null)

  // 검색어가 URL에서 변경되면 입력창 업데이트
  useEffect(() => {
    setSearchInput(query)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput })
    }
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

  // 모든 검색 결과 데이터 (실제로는 API에서 가져옴)
  const allResults: SearchResult[] = useMemo(() => [
    {
      id: 1,
      title: '서울고등법원 2014. 7. 11. 선고 2014노1188 판결 강간미수, 유사강간',
      content: '항소이유의 요지 피고인의 이 사건 범행은 강간미수와 유사강간의 실체적 경합범으로 판단하여야 함에도, 원심은 피고인의 강간미수 범행에 대하여는 유죄를 인정하면서도 경합범으로 기소된 유사강간 범행에 대하여는 강간미수에 흡수되어 강간미수죄 1죄만 성립하고 별도로 유사강간죄는 성립하지 않는다는 이유로 무죄로 판단하였다.',
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
  ], [])

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  // 필터링된 결과
  const filteredResults = useMemo(() => {
    let results = allResults

    // 전문판례 필터 (예: 대법원, 고등법원 판결만)
    if (activeTab === 'expert') {
      results = results.filter(r => 
        r.court.includes('대법원') || r.court.includes('고등법원') || r.court.includes('특허법원')
      )
    }

    // 사건종류 필터
    if (selectedCaseTypes.length > 0) {
      results = results.filter(r => selectedCaseTypes.includes(r.caseType))
    }

    // 법원 필터
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

    // 재판유형 필터
    if (selectedJudgmentType !== '전체') {
      results = results.filter(r => r.judgmentType === selectedJudgmentType)
    }

    return results
  }, [allResults, activeTab, selectedCaseTypes, selectedCourts, selectedJudgmentType])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredResults.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredResults, currentPage, itemsPerPage])

  // 필터 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, selectedCaseTypes, selectedCourts, selectedJudgmentType])

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Search Bar */}
      <div className="px-4 md:px-6 py-4 border-b">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => navigate('/')} className="text-lg">
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
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Mobile Filters - Only visible on mobile */}
      <div className="md:hidden px-4 py-3 border-b bg-gray-50">
        <div className="space-y-2">
          <button
            onClick={() => setMobileFilterOpen(mobileFilterOpen === 'caseType' ? null : 'caseType')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-left flex justify-between items-center"
          >
            <span>사건 종류 {selectedCaseTypes.length > 0 && `(${selectedCaseTypes.length})`}</span>
            <span>▼</span>
          </button>
          {mobileFilterOpen === 'caseType' && (
            <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
              {['형사', '민사', '행정', '헌법', '특허'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCaseTypes.includes(type)}
                    onChange={() => handleCaseTypeChange(type)}
                    className="mr-2"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={() => setMobileFilterOpen(mobileFilterOpen === 'court' ? null : 'court')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-left flex justify-between items-center"
          >
            <span>법원 {selectedCourts.length > 0 && `(${selectedCourts.length})`}</span>
            <span>▼</span>
          </button>
          {mobileFilterOpen === 'court' && (
            <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
              {['대법원', '고등/특허/고등법원', '지방법원', '행정/가정/회생/군사법원', '헌법재판소'].map((court) => (
                <label key={court} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCourts.includes(court)}
                    onChange={() => handleCourtChange(court)}
                    className="mr-2"
                  />
                  <span>{court}</span>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={() => setMobileFilterOpen(mobileFilterOpen === 'judgment' ? null : 'judgment')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-left flex justify-between items-center"
          >
            <span>재판유형</span>
            <span>▼</span>
          </button>
          {mobileFilterOpen === 'judgment' && (
            <div className="bg-white border border-gray-300 rounded p-2 space-y-2">
              {['전체', '판결', '결정'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="judgment"
                    checked={selectedJudgmentType === type}
                    onChange={() => setSelectedJudgmentType(type)}
                    className="mr-2"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={() => setMobileFilterOpen(mobileFilterOpen === 'period' ? null : 'period')}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-left flex justify-between items-center"
          >
            <span>기간</span>
            <span>▼</span>
          </button>
          {mobileFilterOpen === 'period' && (
            <div className="bg-white border border-gray-300 rounded p-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option>전체 기간</option>
                <option>최근 1년</option>
                <option>최근 3년</option>
                <option>최근 5년</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 px-4 md:px-6 py-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
            <button
              onClick={() => setActiveTab('expert')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'expert' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              전문판례
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded ${
                activeTab === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              전체
            </button>
            <button
              onClick={handleAITabClick}
              className={`px-4 py-2 rounded ${
                activeTab === 'ai' ? 'bg-blue-200' : 'hover:bg-blue-100'
              }`}
            >
              AI로 나와 유사한 판례찾기
            </button>
          </div>

          {/* Results Count */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span>🔍</span>
              <span>Q {filteredResults.length}건의 검색결과</span>
              {totalPages > 1 && (
                <span className="text-gray-500 text-sm">
                  ({currentPage}/{totalPages} 페이지)
                </span>
              )}
            </div>
            <select className="px-3 py-1 border border-gray-300 rounded">
              <option>정렬 옵션</option>
            </select>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {paginatedResults.length > 0 ? (
              paginatedResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => navigate(`/judgment/${result.id}`)}
                  className="border-b pb-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <h3 className="font-bold text-lg mb-2">{result.title}</h3>
                  <p className="text-gray-700 mb-2">{result.content}</p>
                  <div className="text-sm text-gray-500">
                    {result.court} | {result.date} | {result.caseType} | {result.judgmentType}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-2 hover:bg-gray-100 rounded"
                >
                  이전
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded ${
                        currentPage === page
                          ? 'bg-gray-800 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
              
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-2 hover:bg-gray-100 rounded"
                >
                  다음
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Filters - Hidden on mobile */}
        <div className="hidden md:block w-64 flex-shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">사건종류</h3>
            <div className="space-y-2">
              {['형사', '민사', '행정', '헌법', '특허'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCaseTypes.includes(type)}
                    onChange={() => handleCaseTypeChange(type)}
                    className="mr-2"
                  />
                  <span>{type}</span>
                </label>
              ))}
              <button className="text-blue-500 text-sm">+ 더보기</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">법원</h3>
            <div className="space-y-2">
              {['대법원', '고등/특허/고등법원', '지방법원', '행정/가정/회생/군사법원', '헌법재판소'].map((court) => (
                <label key={court} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCourts.includes(court)}
                    onChange={() => handleCourtChange(court)}
                    className="mr-2"
                  />
                  <span>{court}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">재판유형</h3>
            <div className="space-y-2">
              {['전체', '판결', '결정'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="judgment"
                    checked={selectedJudgmentType === type}
                    onChange={() => setSelectedJudgmentType(type)}
                    className="mr-2"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">기간</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option>전체 기간</option>
              <option>최근 1년</option>
              <option>최근 3년</option>
              <option>최근 5년</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage
