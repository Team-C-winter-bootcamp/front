import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
// [변경 1] Clerk 관련 Hook과 컴포넌트 import
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

// [삭제] 기존 useStore 및 LogoutModal 제거
// import { useStore } from '../store/useStore'
// import LogoutAlertModal from '../components/AlertModal/LogoutAlertModal'

import { SearchBar } from '../components/search/SearchBar'
import logo from '../assets/logo.png'
import { FilterSidebar } from '../components/search/FilterSidebar'
import { SearchResultItem } from '../components/search/SearchResultItem'
import { Pagination } from '../components/search/Pagination'
import { useSearchFilters } from '../hooks/useSearchFilters'
import SearchPageAlertModal from '../components/AlertModal/SearchPageAlertModal'

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

  // [변경 2] Clerk useUser 훅 사용 (기존 useStore 대체)
  const { isSignedIn, user, isLoaded } = useUser()
  
  const [searchInput, setSearchInput] = useState(query)
  const [mobileFilterOpen, setMobileFilterOpen] = useState<string | null>(null)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  
  // [삭제] LogoutModal 관련 state 삭제 (UserButton이 대신함)
  // const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // 2. 초기 탭 상태를 URL 파라미터 기반으로 설정 (없으면 'expert')
  const [activeTab, setActiveTab] = useState<'expert' | 'all'>(
    (tabParam as 'expert' | 'all') || 'expert'
  )

  const filters = useSearchFilters(MOCK_RESULTS, query, activeTab)

  // 3. 브라우저 뒤로가기 등으로 URL이 변경될 때 탭 상태 동기화
  useEffect(() => {
    const currentTab = searchParams.get('tab') as 'expert' | 'all'
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
    setSearchParams({ q: query, tab: newTab })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchInput, tab: activeTab })
  }

  const handleAlertModalConfirm = () => {
    setIsAlertModalOpen(false)
    navigate('/login', { state: { from: '/search' } })
  }

  const handleResultClick = (id: number) => {
    navigate(`/judgment/${id}`, { state: { from: 'search' } })
  }

  // [삭제] Logout 관련 핸들러 삭제

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <button
          onClick={() => navigate('/home')}
          className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-70 transition-opacity"
        >
          LAWDING
        </button> 
        
        {/* 중앙 SearchBar */}
        <div className="flex-1 max-w-2xl mx-4">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearch={handleSearch}
            onClear={() => {
              setSearchInput('')
              setSearchParams({ tab: activeTab })
            }} 
          />
        </div>
        
        {/* [변경 4] 헤더 우측 로그인/로그아웃 버튼 Clerk 컴포넌트로 교체 */}
        <div className="pr-[3%] flex gap-4 items-center">
          <SignedIn>
            <span className="text-sm text-minimal-dark-gray font-light">
              환영합니다 {user?.firstName || user?.username}님!
            </span>
            {/* Clerk 제공 유저 버튼 (로그아웃 포함) */}
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

      <div className="pt-20">
      {/* Mobile Filter Toggle */}
      <div className="xl:hidden px-4 py-3 border-b border-slate-200 bg-white overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2">
          {['사건종류', '법원', '재판유형', '기간'].map((filter) => (
            <button 
              key={filter}
              onClick={() => setMobileFilterOpen(mobileFilterOpen === filter ? null : filter)}
              className={`px-3 py-1.5 text-sm border rounded-full font-light transition-all ${
                mobileFilterOpen === filter 
                  ? 'bg-white text-indigo-600 border-indigo-300 font-medium shadow-lg' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {filter} ▼
            </button>
          ))}
        </div>
        {mobileFilterOpen && (
          <div className="mt-3 p-4 bg-white rounded-xl shadow-xl border border-slate-200 animate-fade-in-down">
            {mobileFilterOpen === '사건종류' && (
              <div className="flex flex-wrap gap-2">
                {CASE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => filters.handleCaseTypeChange(type)}
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                      filters.selectedCaseTypes.includes(type) 
                        ? 'bg-indigo-600 text-white font-medium shadow-lg scale-105' 
                        : 'bg-white text-slate-700 hover:bg-slate-50 font-light border border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
                {filters.selectedCaseTypes.length > 0 && (
                  <button
                    onClick={() => filters.handleCaseTypeChange('')}
                    // 초기화 버튼: 붉은 계열(Rose)로 구분
                    className="px-3 py-1 text-sm rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium transition-colors"
                  >
                    초기화
                  </button>
                )}
              </div>
            )}
             {mobileFilterOpen === '법원' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {COURT_TYPES.map(court => (
                    <button
                      key={court}
                      onClick={() => filters.handleCourtChange(court)}
                      className={`px-3 py-1 text-sm rounded-full transition-all ${
                        filters.selectedCourts.includes(court) 
                          ? 'bg-indigo-600 text-white font-medium shadow-lg scale-105' 
                          : 'bg-white text-slate-700 hover:bg-slate-50 font-light border border-slate-200'
                      }`}
                    >
                      {court}
                    </button>
                  ))}
                  {filters.selectedCourts.length > 0 && (
                    <button
                      onClick={() => filters.handleCourtChange('')}
                      // 초기화 버튼: 붉은 계열(Rose)로 구분
                      className="px-3 py-1 text-sm rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium transition-colors"
                    >
                      초기화
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* ... 재판유형, 기간 필터는 기존 유지 ... */}
            {mobileFilterOpen === '재판유형' && (
              <div className="flex flex-col gap-2">
                {JUDGMENT_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mobileJudgmentType"
                      checked={filters.selectedJudgmentType === type}
                      onChange={() => filters.setSelectedJudgmentType(type)}
                      className="text-minimal-charcoal focus:ring-minimal-charcoal w-4 h-4 border-minimal-gray"
                    />
                    <span className="text-sm text-minimal-dark-gray font-light">{type}</span>
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
                      className="text-minimal-charcoal focus:ring-minimal-charcoal w-4 h-4 border-minimal-gray"
                    />
                    <span className="text-sm text-minimal-dark-gray font-light">{period}</span>
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
        <div className="flex-1 order-2 lg:order-1 lg:min-w-[1100px]">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <button
              onClick={() => handleTabChange('expert')}
              className={`px-5 py-2.5 rounded-full text-sm transition-all duration-200 ${
                activeTab === 'expert' 
                  ? 'bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-200 scale-105' 
                  : 'shadow-md bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-light border border-slate-200'
              }`}
            >
              전문판례
            </button>
            
            <div className="h-4 w-px bg-minimal-gray/50 hidden sm:block"></div>
            
            <button
              onClick={() => handleTabChange('all')}
              className={`px-5 py-2.5 rounded-full text-sm transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-200 scale-105' 
                  : 'shadow-md bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-light border border-slate-200'
              }`}
            >
              전체
            </button>
          </div>

          {/* Results Header - w-full 및 justify-between으로 양 끝 정렬 보장 */}
          <div className="flex flex-row w-full justify-between items-center mb-4 pb-4 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-slate-800">검색 결과</span>
              <span className="text-slate-600 font-light">{filters.filteredResults.length}건</span>
            </div>
            <select className="px-3 py-1.5 text-sm w-auto bg-white border border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
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
              <div className="text-center py-20 bg-white rounded-xl shadow-xl border border-slate-200">
                <p className="text-slate-800 text-2xl font-light">검색 결과가 없습니다.</p>
                <p className="text-slate-500 text-sm mt-2 font-light">단어의 철자가 정확한지 확인해 보세요.</p>
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

      <SearchPageAlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onConfirm={handleAlertModalConfirm}
      />

      {/* [변경 5] LogoutAlertModal 제거 (UserButton 사용으로 불필요) */}
    </div>
  )
}

export default SearchResultsPage