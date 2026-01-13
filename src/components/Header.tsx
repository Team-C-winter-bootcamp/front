import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useStore()

  return (
    <header className="flex justify-between items-center px-7 py-3 border-b border-gray-200">
      <button
        onClick={() => navigate('/')}
        className="text-xl font-bold text-black hover:opacity-70 transition-opacity"
      >
        Law딩중
      </button>
      
      <div className="flex gap-5 items-center">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm">환영합니다 {user.id}님!</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
            >
              로그인
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
