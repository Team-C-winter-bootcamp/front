import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'

// 1. 인터페이스 수정 (id 대신 case_No 사용)
export interface SearchResult {
  case_No: string;   // 이제 고유 ID 역할을 합니다.
  case_name: string; // 실제 사건 번호 형식이 담긴 이름
  title: string;     // 사건 제목
  content: string;
  court: string;
  date: string;
  caseType: string;
  judgmentType: string;
  similarity?: number;
}

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 2. 선택 상태 타입을 string[]으로 변경
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [caseId, setCaseId] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const state = location.state as { results?: any[]; caseId?: number } | null

    if (state?.results) {
      console.log('--- 백엔드 원본 데이터 ---', state.results);
      const mappedResults: SearchResult[] = state.results.map((result) => ({
        // 백엔드 필드명(case_No, case_name 등)이 정확한지 콘솔에서 확인하세요.
        case_No: String(result.case_No), 
        case_name: result.case_name,
        title: result.case_title,
        content: result.preview,
        court: result.court,
        date: result.judgment_date,
        caseType: result.law_category,
        judgmentType: result.law_subcategory,
        similarity: Math.round((result.similarity || 0) * 100),
      }))
      setSearchResults(mappedResults)
    }

    if (state?.caseId) {
      setCaseId(state.caseId)
    }
  }, [location.state])

  // 3. 클릭 시 이동 경로 수정
  const handleResultClick = (case_No: string) => {
  // URL 이동과 함께 현재 진행 중인 사건의 ID(caseId)를 넘겨줍니다.
    navigate(`/judgment/${case_No}`, {
      state: {
        caseId: caseId // useEffect에서 설정된 현재 사용자 사건 ID
      }
    });
  };

  const handleSelectClick = (e: React.MouseEvent, case_No: string) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(case_No) ? prev.filter((id) => id !== case_No) : [...prev, case_No]
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <button onClick={() => navigate('/')} className="text-2xl font-black tracking-tighter text-indigo-600">LAWDING</button>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-4">
          {searchResults.map((result: SearchResult) => {
            // 4. 고유 식별자를 case_No로 변경
            const isSelected = selectedIds.includes(result.case_No)
            
            return (
              <motion.div
                key={result.case_No} // key값 수정
                onClick={() => handleResultClick(result.case_No)}
                className={`relative rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer flex flex-col ${
                  isSelected ? 'bg-purple-50 border-2 border-purple-300 shadow-md' : 'bg-white border border-slate-200 shadow-sm'
                }`}
                animate={isSelected ? { scale: 1.01 } : { scale: 1 }}
              >
                <div className="flex items-center gap-2 mb-3 text-sm text-slate-700 flex-wrap">
                  <span className="font-bold text-indigo-600">{result.case_name}</span> {/* 실제 사건번호 출력 */}
                  <span className="text-slate-300">|</span>
                  <span className="font-medium">{result.court}</span>
                  <span className="text-slate-300">|</span>
                  <span>{result.date}</span>
                  <span className="text-green-600 font-semibold ml-2">유사도 {result.similarity}%</span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-1 leading-snug line-clamp-2">{result.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-7 line-clamp-2">{result.content}</p>

                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={(e) => handleSelectClick(e, result.case_No)} // 파라미터 수정
                    className={`text-xs px-4 py-1.5 rounded-lg transition-all font-medium ${
                      isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isSelected ? '선택됨' : '선택'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={() => {
              // 5. 다음 단계 버튼 로직 수정
              const selectedCaseNo = selectedIds.length > 0 ? selectedIds[0] : searchResults[0]?.case_No
              
              navigate('/answer', {
                state: {
                  caseId,
                  precedentsId: selectedCaseNo, // string 형태의 case_No 전달
                },
              })
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl"
          >
            내 사건 예상 결과 확인하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage