import {useMemo, useState} from 'react'
import { useNavigate, useParams} from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from '../components/Header'
// MOCK_RESULTS를 가져오거나, 실제 API 호출로 대체할 준비
import { MOCK_RESULTS } from './SearchResultsPage' 
//이미지
import download from '../assets/download.png'
import link from '../assets/link.png'
import bookmark from '../assets/bookmark.png'
import Search from '../assets/Search.png'

const JudgmentDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isAuthenticated } = useStore()
  

  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    } else {
      navigate('/search')
    }
  }

  // URL 파라미터(id)에 맞는 데이터를 임시시 DB에서 찾아옴
  // 나중에 이 부분을 API fetch로 바꾸면 됨됨
  const foundResult = useMemo(() => {
    return MOCK_RESULTS.find(r => r.id === Number(id))
  }, [id])

  // 데이터가 없을 때의 대비책 (실제론 404 페이지 등)
  const displayData = foundResult || {
    title: '데이터를 찾을 수 없습니다.',
    content: '',
    court: '',
    date: '',
    caseType: '',
    judgmentType: ''
  }

  // 실제 판결문 상세 데이터 (구조 유지하되 제목 등은 동적으로 연결)
  const judgmentData = {
    id: id,
    title: displayData.title, // 검색 결과와 동일한 제목 보여줌
    summary: `${displayData.court} ${displayData.date} 선고`, // 동적 데이터
    aiSummary: {
      title: 'AI 요약 결과', // 실제론 API에서 받아와야 함
      resultSummary: [
        '판결 결과를 요약한 내용입니다.',
        '항소 기각됨.'
      ],
      facts: [
        '사실관계 1',
        '사실관계 2',
        displayData.content // 검색 목록에 있던 내용을 여기에 보여줄 수도 있음
      ]
    },
    judgment: {
      court: displayData.court,
      case: '사건 번호 (API 필요)',
      plaintiff: '원고 A',
      defendant: '피고 B',
      firstInstance: '1심 판결 정보',
      conclusionDate: '2023.01.01',
      judgmentDate: displayData.date,
      order: [
        '1. 피고의 항소를 기각한다.',
        '2. 소송비용은 피고가 부담한다.'
      ],
      claim: '청구 취지 내용...',
      reasons: displayData.content // 본문 내용 연결
    },
    relatedCases: [
      '유사 판례 1',
      '유사 판례 2'
    ]
  }

  if (!isAuthenticated) {
    // navigate('/')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Search Bar - SearchResultsPage와 동일한 위치 및 디자인 */}
      <div className="px-4 md:px-6 py-4 border-b sticky top-0 bg-white z-10">
        <div className="pl-16 flex items-center gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="inline-block p-1 rounded-full ">
                  <img 
                    src={Search} 
                    alt="search" 
                    className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
                  />
                </div>
              </span>
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
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Title Section */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{judgmentData.summary}</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{judgmentData.title}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded">
            <div className="inline-block p-1 rounded-full ">
            <img 
              src={download} 
              alt="download" 
              className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
            />
          </div>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
            <div className="inline-block p-1 rounded-full ">
            <img 
              src={link} 
              alt="link" 
              className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
            />
          </div>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
            <div className="inline-block p-1 rounded-full ">
            <img 
              src={bookmark} 
              alt="bookmark" 
              className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
            />
          </div>
            </button>
          </div>
        </div>

        {/* ... (이하 탭, AI 요약, 상세 내용 UI는 기존 코드와 동일) ... */}
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
             {/* ... */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* ... */}
             <div className="lg:col-span-2 space-y-6">
                {/* AI Summary Section using judgmentData */}
                {/* Judgment Details Section using judgmentData */}
             </div>
             {/* Sidebar */}
        </div>
      </div>
    </div>
  )
}

export default JudgmentDetailPage