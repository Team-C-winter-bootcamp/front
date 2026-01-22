import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'

export interface SearchResult {
  id: number
  title: string
  content: string
  court: string
  date: string
  caseType: string
  judgmentType: string
  similarity?: number
}

export const MOCK_RESULTS: SearchResult[] = [
  {
    id: 1,
    title: '서울고등법원 2014. 7. 11. 선고 2014노1188 판결 강간미수, 유사강간',
    content: '항소이유의 요지 피고인의 이 사건 범행은 강간미수와 유사강간의 실체적 경합범으로 판단하여야 함에도...',
    court: '서울고등법원',
    date: '2014. 7. 11.',
    caseType: '형사',
    judgmentType: '판결',
    similarity: 92
  },
  {
    id: 2,
    title: '대법원 2020. 3. 12. 선고 2019도12345 판결 계약금반환',
    content: '계약금은 계약 이행의 담보로서 교부되는 것으로, 계약이 해제되면 계약금도 반환되어야 한다는 것이 원칙이다.',
    court: '대법원',
    date: '2020. 3. 12.',
    caseType: '민사',
    judgmentType: '판결',
    similarity: 88
  },
  {
    id: 3,
    title: '서울지방법원 2018. 5. 20. 선고 2017가단12345 판결 손해배상',
    content: '불법행위로 인한 손해배상 청구에서 과실상계가 적용될 수 있으며, 피해자의 과실 비율에 따라 배상액이 조정된다.',
    court: '서울지방법원',
    date: '2018. 5. 20.',
    caseType: '민사',
    judgmentType: '판결',
    similarity: 85
  },
  {
    id: 4,
    title: '대법원 2021. 8. 15. 결정 2021마1234 상고기각',
    content: '상고이유가 법령위반을 주장하는 것이나, 구체적인 위반 내용을 지적하지 아니한 경우 상고는 이유 없다.',
    court: '대법원',
    date: '2021. 8. 15.',
    caseType: '형사',
    judgmentType: '결정',
    similarity: 82
  },
  {
    id: 5,
    title: '부산고등법원 2019. 11. 25. 선고 2019노5678 판결 교통사고',
    content: '교통사고로 인한 상해의 경우, 가해자의 과실이 인정되고 인과관계가 입증되면 손해배상 책임이 발생한다.',
    court: '부산고등법원',
    date: '2019. 11. 25.',
    caseType: '형사',
    judgmentType: '판결',
    similarity: 80
  }
]

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [caseId, setCaseId] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // location state에서 caseId 가져오기
  useEffect(() => {
    const state = location.state as { caseId?: number } | null;
    if (state?.caseId) {
      setCaseId(state.caseId);
    }
  }, [location]);

  // 판례 검색 결과 조회 (현재는 MOCK 데이터 사용, 실제 API 연동 필요 시 추가)
  useEffect(() => {
    // TODO: caseId를 사용하여 실제 판례 검색 API 호출
    // 현재는 MOCK 데이터 사용
    setSearchResults(MOCK_RESULTS.slice(0, 5));
  }, [caseId]);

  // 5개만 표시
  const displayedResults = searchResults

  const handleResultClick = (id: number) => {
    navigate(`/judgment/${id}`, { state: { from: 'search', caseId } })
  }

  const handleSelectClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    )
  }

  // [삭제] Logout 관련 핸들러 삭제

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
                onClick={() => handleResultClick(result.id)}
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
              // 선택된 첫 번째 판례의 ID를 precedentsId로 전달
              const firstSelectedId = selectedIds.length > 0 ? selectedIds[0] : displayedResults[0]?.id;
              navigate('/solution', { 
                state: { 
                  caseId, 
                  precedentsId: firstSelectedId 
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