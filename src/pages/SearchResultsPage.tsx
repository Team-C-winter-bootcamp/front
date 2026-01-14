import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from '../components/Header'
import { SearchBar } from '../components/search/SearchBar'
import { FilterSidebar } from '../components/search/FilterSidebar'
import { SearchResultItem } from '../components/search/SearchResultItem'
import { Pagination } from '../components/search/Pagination'
import { useSearchFilters } from '../hooks/useSearchFilters'

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

const CASE_TYPES = ['민사', '형사', '행정', '가사', '특허', '선거']
const COURT_TYPES = ['대법원', '고등/특허/고등법원', '지방법원', '행정/가정/회생/군사법원', '헌법재판소']
const JUDGMENT_TYPES = ['전체', '판결', '결정', '명령']
const PERIOD_TYPES = ['전체 기간', '최근 1년', '최근 3년', '최근 5년']

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // 1. URL 파라미터 읽기
  const query = searchParams.get('q') || ''
  const tabParam = searchParams.get('tab')

  const { isAuthenticated } = useStore()
  const [searchInput, setSearchInput] = useState(query)
  const [mobileFilterOpen, setMobileFilterOpen] = useState<string | null>(null)

  // 2. 초기 탭 상태를 URL 파라미터 기반으로 설정 (없으면 'expert')
  const [activeTab, setActiveTab] = useState<'expert' | 'all' | 'ai'>(
    (tabParam as 'expert' | 'all' | 'ai') || 'expert'
  )

  const filters = useSearchFilters(MOCK_RESULTS, query, activeTab)

  // 3. 브라우저 뒤로가기 등으로 URL이 변경될 때 탭 상태 동기화
  useEffect(() => {
    const currentTab = searchParams.get('tab') as 'expert' | 'all' | 'ai'
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab)
    }
    // 검색어도 동기화
    const currentQuery = searchParams.get('q') || ''
    if (currentQuery !== searchInput) {
      setSearchInput(currentQuery)
    }
  }, [searchParams])

  // 4. 탭 변경 핸들러: 상태 변경 + URL 업데이트
  const handleTabChange = (newTab: 'expert' | 'all') => {
    setActiveTab(newTab)
    // 기존 검색어(q)는 유지하고 탭(tab) 정보를 URL에 추가
    setSearchParams({ q: query, tab: newTab })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 검색 시 현재 탭 정보도 유지
    setSearchParams({ q: searchInput, tab: activeTab })
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

  const handleResultClick = (id: number) => {
    navigate(`/judgment/${id}`, { state: { from: 'search' } })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* SearchBar 영역 */}
      <div className="w-full flex justify-center lg:justify-start lg:pl-[5%] pt-2 pb-4 px-4 bg-white border-b border-gray-100">
        <div className="w-full max-w-[1400px]">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearch={handleSearch}
            onClear={() => {
              setSearchInput('')
              setSearchParams({ tab: activeTab }) // 검색어 지울 때 탭은 유지
            }}
          />
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden px-4 py-3 border-b bg-gray-50 overflow-x-auto whitespace-nowrap">
        {/* ... (필터 버튼 코드 기존 유지) ... */}
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
        {mobileFilterOpen && (
          <div className="mt-3 p-4 bg-white border rounded shadow-lg animate-fade-in-down">
            {mobileFilterOpen === '사건종류' && (
              <div className="flex flex-wrap gap-2">
                {CASE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => filters.handleCaseTypeChange(type)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.selectedCaseTypes.includes(type) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
                {filters.selectedCaseTypes.length > 0 && (
                  <button
                    onClick={() => filters.handleCaseTypeChange('')}
                    className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700"
                  >
                    초기화
                  </button>
                )}
              </div>
            )}
            {/* ... (나머지 모바일 필터 내용 기존 유지) ... */}
             {mobileFilterOpen === '법원' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {COURT_TYPES.map(court => (
                    <button
                      key={court}
                      onClick={() => filters.handleCourtChange(court)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.selectedCourts.includes(court) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                      }`}
                    >
                      {court}
                    </button>
                  ))}
                  {filters.selectedCourts.length > 0 && (
                    <button
                      onClick={() => filters.handleCourtChange('')}
                      className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700"
                    >
                      초기화
                    </button>
                  )}
                </div>
              </div>
            )}
            {mobileFilterOpen === '재판유형' && (
              <div className="flex flex-col gap-2">
                {JUDGMENT_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mobileJudgmentType"
                      checked={filters.selectedJudgmentType === type}
                      onChange={() => filters.setSelectedJudgmentType(type)}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            )}
            {mobileFilterOpen === '기간' && (
              <div className="flex flex-col gap-2">
                {PERIOD_TYPES.map(period => (
                  <label key={period} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mobilePeriod"
                      checked={filters.selectedPeriod === period}
                      onChange={() => filters.setSelectedPeriod(period)}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{period}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-1 py-6 max-w-[1400px] mx-auto lg:mx-0 lg:ml-[5%]">
        
        {/* Main Content */}
        <div className="flex-1 order-2 lg:order-1 lg:min-w-[1200px]">
          {/* Tabs: onClick 핸들러를 handleTabChange로 교체 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleTabChange('expert')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'expert' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전문판례
            </button>
            <button
              onClick={() => handleTabChange('all')}
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
               나의 유사 판례 찾기
            </button>
          </div>

          {/* Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">검색 결과</span>
              <span className="text-blue-600 font-bold">{filters.filteredResults.length}건</span>
            </div>
            <select className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500">
              <option>정확도순</option>
              <option>최신순</option>
            </select>
          </div>

          {/* Search Results List */}
          <div className="space-y-4">
            {filters.paginatedResults.length > 0 ? (
              filters.paginatedResults.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  onClick={handleResultClick}
                />
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <p className="text-black text-3xl font-bold">검색 결과가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">단어의 철자가 정확한지 확인해 보세요.</p>
              </div>
            )}
          </div>

          <Pagination
            currentPage={filters.currentPage}
            totalPages={filters.totalPages}
            onPageChange={filters.setCurrentPage}
          />
        </div>

        {/* Sidebar Filters */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 order-1 lg:order-2">
          <FilterSidebar
            selectedCaseTypes={filters.selectedCaseTypes}
            selectedCourts={filters.selectedCourts}
            selectedJudgmentType={filters.selectedJudgmentType}
            selectedPeriod={filters.selectedPeriod}
            onCaseTypeChange={filters.handleCaseTypeChange}
            onCourtChange={filters.handleCourtChange}
            onJudgmentTypeChange={filters.setSelectedJudgmentType}
            onPeriodChange={filters.setSelectedPeriod}
          />
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage