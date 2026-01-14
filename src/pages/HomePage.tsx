import { useState, FormEvent } from 'react' // useState import , 제출이벤트 까지 
import { useNavigate } from 'react-router-dom' // 이동 시켜주는 놈 import
import { useStore } from '../store/useStore' // Zustand에 박아놓은 함수들 import
import Header from '../components/Header' // Header가 공통되어 있어 만들어왔음 
import LoginAlertModal from '../components/LoginAlertModal' //로그인 필요 시 알림창 import
import logotext from '../assets/logotext.png'

const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useStore() //로그인 여부
  const [searchQuery, setSearchQuery] = useState('')//키워드

  // 검색앤진에 검색에 검색했을 때;
  const handleSearch = (event: FormEvent) => { //이벤트가 제출되면 이벤트 객체를 받아옴
    event.preventDefault() // 이벤트의 기본 동작을 방지
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`) // 해당 경로로 이동 
    }
  }

 //모달 상태 관리 state 추가
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetPath, setTargetPath] = useState<string>('')

 //확인 누르면 창 닫기기
  const handleModalConfirm = () => {
    setIsModalOpen(false) // 모달 
    navigate('/login', { state: { from: targetPath } }) // 최종적으로 targetPath로 보내기
  }

  //파란 버튼 클릭 시 
  const handleAIChatClick = () => {
    if (!isAuthenticated) {
      setTargetPath('/ai-chat') //targetPath 가 
      setIsModalOpen(true)
      return
    }
    navigate('/ai-chat')
  }
  
 //빨간 버튼 클릭 시 
  const handleDocumentClick = () => {
    if (!isAuthenticated) {
      setTargetPath('/document')
      setIsModalOpen(true)
      return
    }
    navigate('/document')
  }

   //키워드 부분 여기는 그리기 모델 뭐 그런 것이 필요할 듯 
   const initialKeywords = [
    "전세사기", "이혼", "폭행"
  ]

  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null) 
  // <string | null>은 문자열 또는 null을 저장할 거다 초기값은 null

  const relatedKeywords: Record<string, string[]> = { // 
    "전세사기": ["보증금반환", "임차권등기명령", "HUG", "깡통전세"],
    "이혼": ["재산분할", "양육비", "위자료", "협의이혼"],
    "폭행": ["합의금", "반의사불벌죄", "상해진단서"]
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 메인 검색 부분분 */}
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-gray-100 rounded-lg p-12 w-full max-w-4xl flex flex-col items-center">
          {/* 로고 버튼 수정됨 */}
          <button 
            onClick={() => navigate('/')} 
            className="mb-1 transition-opacity hover:opacity-80" 
          >
            <img 
              src={logotext} 
              alt="logotext" 
              className="w-[220px] h-auto object-contain" 
            />
          </button>
          
          <p className="text-sm text-black text-center mb-3 font-bold">
            국내 최초 Ai 판례 검색 로딩중
          </p>
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="키워드를 입력하세요"
              className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        {/* 바로가기 버튼 2개 */}
        <div className="flex gap-4 mt-8 w-full max-w-4xl">
          <button
            onClick={handleAIChatClick}
            
            className={`flex-1 px-6 py-4 rounded-lg transition-colors ${
              isAuthenticated
                ? 'bg-blue-200 font-bold text-black hover:bg-blue-300'
                : 'bg-blue-200 font-bold text-black hover:bg-blue-300 '
            }`}
          >
            Ai로 나와 유사한 판례찾기
          </button>
          <button
            onClick={handleDocumentClick}
            
            className={`flex-1 px-6 py-4 rounded-lg transition-colors ${
              isAuthenticated
                ? 'bg-pink-200 font-bold text-black hover:bg-pink-300'
                : 'bg-pink-200 font-bold text-black hover:bg-pink-300 '
            }`}
          >
            문서 작성하러 가기
          </button>
        </div>
      </div>

      {/* 키워드 부분 여기는 어떻게 할 지 논의가 필요하다 */}
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-black mb-10">최근 핫 키워드</h2>
        <div className="flex flex-wrap gap-4"> {/*flex-wrap는 자동 줄바꿈*/}
          {initialKeywords.map((keyword, index) => (
            <button
              key={index}
              onClick={() => setSelectedKeyword(selectedKeyword === keyword ? null : keyword)}
              className={`px-5 py-2 rounded-lg transition-colors ${
                selectedKeyword === keyword
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-black hover:bg-blue-200'
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>
        
        {selectedKeyword && relatedKeywords[selectedKeyword] && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">관련 키워드</h3>
            <div className="flex flex-wrap gap-3">
              {relatedKeywords[selectedKeyword].map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-green-100 text-black rounded-lg"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <LoginAlertModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}

export default HomePage
