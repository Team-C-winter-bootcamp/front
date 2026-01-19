import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
// [변경 1] Clerk 관련 Hook과 컴포넌트 import
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

// [삭제] useStore는 더 이상 사용하지 않음
// import { useStore } from '../store/useStore'

// [변경 2] LogoutAlertModal은 UserButton에 기능이 포함되어 있어 삭제 (LoginAlertModal은 유지)
import LoginAlertModal from '../components/AlertModal/LoginAlertModal'
// import LogoutAlertModal from '../components/AlertModal/LogoutAlertModal'

import logotext from '../assets/logotext.png'
import background2 from '../assets/background2.png'
import logow from '../assets/logow.png'
import { Search, Gavel, FileText } from 'lucide-react'
import DynamicGraph from '../components/Graph/DynamicGraph' 

const HomePage = () => {
  const navigate = useNavigate()
  
  // [변경 3] Clerk의 useUser 훅을 통해 로그인 상태(isSignedIn)와 유저 정보(user)를 가져옴
  const { isSignedIn, user } = useUser()
  
  const [searchQuery, setSearchQuery] = useState('')
  // LogoutModal 관련 state 삭제

  // 검색 핸들러
  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // 모달 상태 관리 (로그인 유도용)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetPath, setTargetPath] = useState<string>('')

  const handleModalConfirm = () => {
    setIsModalOpen(false)
    navigate('/login', { state: { from: targetPath } })
  }

  // [변경 4] isAuthenticated -> isSignedIn으로 변경
  // 파란 버튼 (AI 채팅)
  const handleAIChatClick = () => {
    if (!isSignedIn) {
      setTargetPath('/ai-chat')
      setIsModalOpen(true)
      return
    }
    navigate('/ai-chat')
  }
  
  // [변경 4] isAuthenticated -> isSignedIn으로 변경
  // 빨간 버튼 (문서 작성)
  const handleDocumentClick = () => {
    if (!isSignedIn) {
      setTargetPath('/document')
      setIsModalOpen(true)
      return
    }
    navigate('/document')
  }

  // [삭제] handleLogoutClick, handleLogoutConfirm 함수는 UserButton이 대체하므로 삭제

  return (
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
          {/* [변경 5] Clerk 컴포넌트로 분기 처리 */}
          
          {/* 로그인 된 상태일 때 보이는 화면 */}
          <SignedIn>
            <span className="text-sm text-white font-light">
              {/* user.firstName이나 username 등을 표시 */}
              환영합니다 {user?.firstName || user?.username}님!
            </span>
            {/* Clerk이 제공하는 강력한 유저 버튼 (로그아웃, 프로필 관리 포함) */}
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>

          {/* 로그인 안 된 상태일 때 보이는 화면 */}
          <SignedOut>
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
          </SignedOut>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 (변경 없음) */}
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
              
              <p className="text-sm text-[#F5F3EB] font-medium tracking-wide drop-shadow-md">
                국내 최초 AI 판례 검색 로딩중
              </p>
            </div>

            {/* 검색창 영역 */}
            <form onSubmit={handleSearch} className="w-full flex justify-center">
              <div className="relative w-full max-w-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="키워드를 입력하세요"
                  className="w-full pl-6 pr-16 py-4 rounded-lg border border-gray-200 text-lg outline-none focus:border-[#CFB982] transition-colors placeholder:text-gray-400 shadow-lg font-sans"
                />
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
                <h3 className="text-xl font-bold text-[#E2CD8C] mb-2">
                  나와 유사한 판례 찾기
                </h3>
                <p className="text-sm text-gray-300 font-light opacity-90">
                  AI 챗봇으로 필요한 판례를 찾아보세요!
                </p>
              </div>
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
                <h3 className="text-xl font-bold text-[#E2CD8C] mb-2">
                  문서 작성하러 가기
                </h3>
                <p className="text-sm text-gray-300 font-light opacity-90">
                  문서 정리를 AI로 간단하게!
                </p>
              </div>
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
      
      {/* LogoutAlertModal은 UserButton으로 대체되어 삭제되었습니다. */}
    </div>
  )
}

export default HomePage