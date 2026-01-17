import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from '../components/Header'
import LoginAlertModal from '../components/AlertModal/LoginAlertModal'
import logotext from '../assets/logotext.png'

// 1. DynamicGraph 컴포넌트 import
import DynamicGraph from '../components/Graph/DynamicGraph' 

const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 핸들러
  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetPath, setTargetPath] = useState<string>('')

  const handleModalConfirm = () => {
    setIsModalOpen(false)
    navigate('/login', { state: { from: targetPath } })
  }

  // 파란 버튼 (AI 채팅)
  const handleAIChatClick = () => {
    if (!isAuthenticated) {
      setTargetPath('/ai-chat')
      setIsModalOpen(true)
      return
    }
    navigate('/ai-chat')
  }
  
  // 빨간 버튼 (문서 작성)
  const handleDocumentClick = () => {
    if (!isAuthenticated) {
      setTargetPath('/document')
      setIsModalOpen(true)
      return
    }
    navigate('/document')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 메인 검색 부분 */}
      <div className="flex flex-col items-center justify-center px-4 pt-4 pb-4">
        

        {/* 상단 로고 & 검색 섹션 */}
        <div 
          className="w-full flex flex-col items-center justify-center py-20 px-6 mb-12 shadow-sm"
          style={{
            backgroundImage: `url(${background2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 콘텐츠 래퍼 */}
          <div className="w-full max-w-5xl flex flex-col items-center gap-10">
            
            {/* 로고 영역 */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => navigate('/')} 
                className="mb-2 transition-opacity hover:opacity-80 focus:outline-none" 
              >
                <img 
                  src={logotext} 
                  alt="LAWDING" 
                  className="w-[320px] h-auto object-contain" 
                />
              </button>
              
              {/* 슬로건: 리디바탕이 적용되어 진중한 느낌 */}
              <p className="text-sm text-[#F5F3EB] font-medium tracking-wide drop-shadow-md">
                국내 최초 AI 판례 검색 로딩중
              </p>
            </div>

            {/* 검색창 영역 */}
            <form onSubmit={handleSearch} className="w-full flex justify-center">
              <div className="relative w-full max-w-2xl">
                {/* [변경 포인트] Input은 가독성을 위해 font-sans(고딕) 유지, 원하시면 font-serif로 변경 가능 */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="키워드를 입력하세요"
                  className="w-full pl-6 pr-16 py-4 rounded-lg border border-gray-200 text-lg outline-none focus:border-[#CFB982] transition-colors placeholder:text-gray-400 shadow-lg font-sans"
                />
                {/* 검색 버튼 */}
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-[#C8A45D] hover:bg-[#b8934d] text-[#F5F3EB] rounded-md w-12 flex items-center justify-center transition-colors"
                >
                  <Search size={24} />
                </button>
              </div>
            </form>

          </div>

          {/* 검색창 영역 */}
          <form onSubmit={handleSearch} className="w-full flex justify-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="키워드를 입력하세요"
              className="w-full max-w-2xl px-6 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </form>
        </div>

        <div className="w-full max-w-7xl mt-8 mb-9 mb-2 px-1">
          <h2 className="text-2xl font-bold text-gray-800">로딩중 활용하기</h2>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-10 w-full max-w-5xl">
          <button
            onClick={handleAIChatClick}
            className={`flex-1 px-1 py-6 rounded-lg transition-colors ${
              isAuthenticated
                ? 'bg-yellow-100 font-bold text-xl text-black hover:bg-yellow-200 shadow-lg'
                : 'bg-yellow-100 font-bold text-xl text-black hover:bg-yellow-200 shadow-lg'
            }`}
          >
            {/* 1. 왼쪽 텍스트 영역 */}
            <div className="flex flex-col items-start text-left pl-7">
              <span className="text-2xg font-bold font-semibold text-black mb-1">
                나와 유사한 판례 찾기
              </span>
              <span className="text-sm text-gray-600">
                Ai 챗봇으로 필요한 판례를 찾아보세요!
              </span>
            </div>

          </button>
          <button
            onClick={handleDocumentClick}
            className={`flex-1 px-1 py-6 rounded-lg transition-colors ${
              isAuthenticated
                ? 'bg-purple-100 font-bold text-xl text-black hover:bg-purple-200 shadow-lg'
                : 'bg-purple-100 font-bold text-xl text-black hover:bg-purple-200 shadow-lg'
            }`}
          >
              <div className="flex flex-col items-start text-left pl-7">
              <span className="text-2xg font-bold font-semibold text-black mb-1">
                문서 작성하러 가기
              </span>
              <span className="text-sm text-gray-600">
                문서 정리를 Ai로 간단하게!
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 그래프 섹션 */}
      <div className="px-6 py-8 w-full max-w-7xl mx-auto">
        <DynamicGraph />
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