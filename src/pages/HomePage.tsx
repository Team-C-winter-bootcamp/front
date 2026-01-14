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
        
        {/* 회색 박스 */}
        <div className="bg-gray-100 rounded-lg p-12 w-full h-[340px] max-w-7xl flex flex-col items-center justify-center gap-6">
          
          {/* 로고 영역 */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => navigate('/')} 
              className="mb-2 transition-opacity hover:opacity-80" 
            >
              <img 
                src={logotext} 
                alt="logotext" 
                className="w-[300px] h-auto object-contain" 
              />
            </button>
            <p className="text-base text-gray-600 text-center font-bold">
              국내 최초 Ai 판례 검색 로딩중
            </p>
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

        {/* ▼▼▼ [추가된 부분] 텍스트 영역 ▼▼▼ */}
        {/* 버튼 박스와 너비(max-w-4xl)를 맞춰서 라인을 정렬했습니다 */}
        <div className="w-full max-w-6xl mt-10 mb-7 mb-2 px-1">
          <h2 className="text-2xl font-bold text-gray-800">로딩중 활용하기</h2>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-4 w-full max-w-4xl">
          <button
            onClick={handleAIChatClick}
            className={`flex-1 px-1 py-6 rounded-lg transition-colors shadow-sm ${
              isAuthenticated
                ? 'bg-blue-200 font-bold text-xl text-black hover:bg-blue-300'
                : 'bg-blue-200 font-bold text-xl text-black hover:bg-blue-300 '
            }`}
          >
            Ai로 나와 유사한 판례찾기
          </button>
          <button
            onClick={handleDocumentClick}
            className={`flex-1 px-1 py-6 rounded-lg transition-colors shadow-sm ${
              isAuthenticated
                ? 'bg-pink-200 font-bold text-xl text-black hover:bg-pink-300'
                : 'bg-pink-200 font-bold text-xl text-black hover:bg-pink-300 '
            }`}
          >
            문서 작성하러 가기
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