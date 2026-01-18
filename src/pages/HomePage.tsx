import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import LoginAlertModal from '../components/AlertModal/LoginAlertModal'
import LogoutAlertModal from '../components/AlertModal/LogoutAlertModal'
import logotext from '../assets/logotext.png'
import background2 from '../assets/background2.png'
import logow from '../assets/logow.png'
// 아이콘 사용을 위해 lucide-react 추가
import { Search, Gavel, FileText } from 'lucide-react'

// 1. DynamicGraph 컴포넌트 import
import DynamicGraph from '../components/Graph/DynamicGraph' 

const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

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
  
  // 빨간 버튼 (문서 작성) -> 디자인 변경으로 파란 버튼 계열로 통일
  const handleDocumentClick = () => {
    if (!isAuthenticated) {
      setTargetPath('/document')
      setIsModalOpen(true)
      return
    }
    navigate('/document')
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    setIsLogoutModalOpen(false)
    navigate('/')
  }

  return (
    // [변경 포인트] font-serif 적용: 전체 폰트를 '리디바탕'으로 설정하여 법전 느낌 강조
    <div className="min-h-screen bg-[#F5F3EB] font-serif">
      <header className="flex justify-between items-center px-8 py-4 border-b border-minimal-gray bg-[#1A233B] font-serif">
        <button
          onClick={() => navigate('/')}
          className="pl-[3%] text-2xl font-medium text-minimal-charcoal hover:opacity-70 transition-opacity"
        >
          <div className="inline-block p-1 rounded-full">
            <img 
                src={logow} 
                alt="logo" 
            className="w-10 h-10 object-contain justify-center items-center " />
                </div>
        </button> 
        
        <div className="pr-[3%] flex gap-4 items-center">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-white font-light">환영합니다 {user.id}님!</span>
              <button
                onClick={handleLogoutClick}
                className="btn-minimal-primary text-sm"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="btn-minimal"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn-minimal-primary"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-col items-center justify-start w-full border-t-[3px] border-[#CFB982]">
        
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
        </div>

        {/* 액션 버튼 영역 */}
        <div className="flex gap-6 w-full max-w-5xl px-6 mb-16">
          {/* 버튼 1: 유사한 판례 찾기 */}
          <button
            onClick={handleAIChatClick}
            className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1A233B] via-[#253453] to-[#1A233B] p-8 text-left transition-all hover:shadow-lg hover:-translate-y-1 group"
          >
            <div className="relative z-10 flex justify-between items-center">
              <div>
                {/* 제목: 리디바탕체 적용 */}
                <h3 className="text-xl font-bold text-[#E2CD8C] mb-2">
                  나와 유사한 판례 찾기
                </h3>
                {/* 설명글: 리디바탕체 적용 (상속됨) */}
                <p className="text-sm text-gray-300 font-light opacity-90">
                  AI 챗봇으로 필요한 판례를 찾아보세요!
                </p>
              </div>
              {/* 아이콘 */}
              <div className="rounded-full p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                 <Gavel className="text-[#CFB982]" size={50} />
              </div>
            </div>
          </button>

          {/* 버튼 2: 문서 작성하러 가기 */}
          <button
            onClick={handleDocumentClick}
            className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1A233B] via-[#253453] to-[#1A233B] p-8 text-left transition-all hover:shadow-lg hover:-translate-y-1 group"
          >
            <div className="relative z-10 flex justify-between items-center">
              <div>
                {/* 제목: 리디바탕체 적용 */}
                <h3 className="text-xl font-bold text-[#E2CD8C] mb-2">
                  문서 작성하러 가기
                </h3>
                <p className="text-sm text-gray-300 font-light opacity-90">
                  문서 정리를 AI로 간단하게!
                </p>
              </div>
              {/* 아이콘 */}
              <div className="rounded-full p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                <FileText className="text-[#CFB982]" size={50} />
              </div>
            </div>
          </button>
        </div>

        {/* 그래프 섹션 */}
        <div className="w-full max-w-5xl px-6 mb-12">
            <div className="bg-[#F5F3EB] shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-[650px] bg-[#F3F4F6] relative">
                    <DynamicGraph />
                </div>
            </div>
        </div>

      </div>

      <LoginAlertModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />

      <LogoutAlertModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  )
}

export default HomePage