import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { CaseResult } from '../api/types'; // Import the new type

export interface SearchResult {
  id: number
  caseNo: string;
  title: string
  content: string
  court: string
  date: string
  caseType: string
  judgmentType: string
  similarity?: number
}

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [caseId, setCaseId] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const state = location.state as { results?: CaseResult[], caseId?: number } | null;

    if (state?.results) {
      // Map the API response to the local SearchResult interface
      const mappedResults: SearchResult[] = state.results.map(result => ({
        id: result.id,
        caseNo: result.case_number,
        title: result.case_title,
        content: result.preview,
        court: result.court,
        date: result.judgment_date,
        caseType: result.law_category,
        judgmentType: result.law_subcategory,
        similarity: Math.round(result.similarity_score * 100)
      }));
      setSearchResults(mappedResults);
    }
    
    if (state?.caseId) {
      setCaseId(state.caseId);
    }
  }, [location.state]);


  const displayedResults = searchResults

  const handleResultClick = (caseNo: string) => {
    navigate(`/judgment/${caseId}/${caseNo}`);
  }

  const handleSelectClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20"> 
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

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Search Results List */}
        <div className="space-y-4">
          {displayedResults.map((result: SearchResult) => {
            const isSelected = selectedIds.includes(result.id)
            return (
              <motion.div
                key={result.id}
                onClick={() => handleResultClick(result.caseNo)}
                className={`relative rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-purple-50 border-2 border-purple-300 shadow-md' 
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
                animate={isSelected ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2 text-sm text-slate-700">
                  <span className="font-medium">{result.court}</span>
                  <span>|</span>
                  <span>{result.date}</span>
                  <span className="text-green-600 font-semibold ml-2">
                    유사도 {result.similarity || 85}%
                  </span>
                  <div className="ml-auto flex gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                      isSelected
                        ? 'bg-purple-100 border border-purple-300 text-purple-700'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}>
                      {result.caseType}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                      isSelected
                        ? 'bg-purple-100 border border-purple-300 text-purple-700'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}>
                      {result.judgmentType}
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2 leading-tight">
                  {result.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {result.content}
                </p>
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={(e) => handleSelectClick(e, result.id)}
                    className={`text-xs px-4 py-1.5 rounded-lg transition-all font-medium ${
                      isSelected
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? '선택됨' : '선택'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 선택된 판례 개수 표시 */}
        {selectedIds.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            현재 {selectedIds.length}개의 유사 판례가 선택되었습니다
          </div>
        )}

        {/* 다음 단계 버튼 */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={() => {
              // 선택된 첫 번째 판례의 사건번호를 precedentsId로 전달
              const selectedId = selectedIds.length > 0 ? selectedIds[0] : displayedResults[0]?.id;
              const selectedResult = searchResults.find(r => r.id === selectedId);
              const precedentIdentifier = selectedResult ? selectedResult.caseNo : '';

              navigate('/solution', { 
                state: { 
                  caseId, 
                  precedentsId: precedentIdentifier
                } 
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-200 transition active:scale-95"
          >
            내 사건 예상 결과 확인하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage