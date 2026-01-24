import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { CaseResult } from '../api/types'

export interface SearchResult {
  id: number
  caseNo: string
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
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [caseId, setCaseId] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const state = location.state as { results?: CaseResult[]; caseId?: number } | null

    if (state?.results) {
      const mappedResults: SearchResult[] = state.results.map((result) => ({
        id: result.id,
        caseNo: result.case_number,
        title: result.case_title,
        content: result.preview,
        court: result.court,
        date: result.judgment_date,
        caseType: result.law_category,
        judgmentType: result.law_subcategory,
        similarity: Math.round(result.similarity * 100),
      }))
      setSearchResults(mappedResults)
    }

    if (state?.caseId) {
      setCaseId(state.caseId)
    }
  }, [location.state])

  const displayedResults = searchResults.slice(0, 5);

  const handleResultClick = (caseNo: string) => {
    const encodedCaseNo = encodeURIComponent(caseNo)
    navigate(`/judgment/${caseId}/${encodedCaseNo}`)
  }

  const handleSelectClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    )
  }

  return (
    <main className="min-h-screen bg-white pt-20">
      <h1 className="sr-only">판례 검색 결과</h1>
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

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">유사 판례 검색 결과</h2>
        <div className="space-y-4">
          {displayedResults.map((result: SearchResult) => {
            const isSelected = selectedIds.includes(result.id)
            return (
              <motion.div
                key={result.id}
                onClick={() => handleResultClick(result.caseNo)}
                className={`relative rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer flex flex-col ${
                  isSelected
                    ? 'bg-purple-50 border-2 border-purple-300 shadow-md'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
                animate={isSelected ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3 text-sm text-slate-700 flex-wrap">
                  <span className="font-medium shrink-0">{result.court}</span>
                  <span className="text-slate-300">|</span>
                  <span className="shrink-0">{result.date}</span>
                  <span className="text-green-600 font-semibold ml-2 shrink-0">
                    유사도 {result.similarity || 85}%
                  </span>
                  <div className="ml-auto flex gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
                        isSelected
                          ? 'bg-purple-100 border border-purple-300 text-purple-700'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {result.caseType}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
                        isSelected
                          ? 'bg-purple-100 border border-purple-300 text-purple-700'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {result.judgmentType}
                    </span>
                  </div>
                </div>

                {/* 제목: 2줄까지 허용, 높이 자동 조절 */}
                <h3 className="text-base font-semibold text-slate-900 mb-1 leading-snug line-clamp-2 break-keep">
                  {result.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed mb-7 line-clamp-2 break-all">
                  {result.content}
                </p>

                {/* 선택 버튼: 절대 위치 유지 */}
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

        {selectedIds.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            현재 {selectedIds.length}개의 유사 판례가 선택되었습니다
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={() => {
              const selectedId =
                selectedIds.length > 0 ? selectedIds[0] : displayedResults[0]?.id
              const selectedResult = searchResults.find((r) => r.id === selectedId)
              const precedentIdentifier = selectedResult ? selectedResult.caseNo : ''

              navigate('/solution', {
                state: {
                  caseId,
                  precedentsId: precedentIdentifier,
                },
              })
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-200 transition active:scale-95"
          >
            내 사건 예상 결과 확인하기
          </Button>
        </div>
      </div>
    </main>
  )
}

export default SearchResultsPage