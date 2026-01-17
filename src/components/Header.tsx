import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import logo from '../assets/logo.png'
import LogoutAlertModal from '../components/AlertModal/LogoutAlertModal'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useStore()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    setIsLogoutModalOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className="flex justify-between items-center px-8 py-2 border-b border-minimal-gray bg-[#F5F3EB] font-serif">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-medium text-minimal-charcoal hover:opacity-70 transition-opacity"
        >
          <div className="inline-block p-1 rounded-full">
            <img 
                src={logo} 
                alt="logo" 
            className="w-10 h-10 object-contain justify-center items-center opacity-50" />
                </div>
        </button>
        
        <div className="flex gap-4 items-center">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-minimal-dark-gray font-light">환영합니다 {user.id}님!</span>
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

      <LogoutAlertModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  )
}

export default Header
