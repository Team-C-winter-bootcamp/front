import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from '../components/Header'
import LoginAlertModal from '../components/AlertModal/LoginAlertModal'
import logotext from '../assets/logotext.png'

// 1. DynamicGraph 컴포넌트 import
// (폴더명이 component인지 components인지 확인해주세요. 기존 코드 패턴에 맞춰 components로 작성했습니다.)
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
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-gray-100 rounded-lg p-12 w-full max-w-4xl flex flex-col items-center">
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

      {/* 3. [교체됨] 키워드 섹션을 DynamicGraph로 대체 */}
      <div className="px-6 py-8 w-full max-w-5xl mx-auto">
        {/* 그래프 컴포넌트 렌더링 */}
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