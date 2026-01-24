import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logotextb from '../assets/logotextb.webp'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 로그인 로직 구현
    console.log('Login:', { email, password })
    // 임시로 홈으로 이동
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center py-10">
      <button 
        onClick={() => navigate('/')} 
        className="mb-8 hover:opacity-80 transition-opacity"
      >
        <img 
          src={logotextb}  
          alt="Lawding Logo" 
          className="w-72 md:w-78 h-auto object-contain" 
        />
      </button>

      <div className="w-full max-w-md bg-white shadow-xl border border-slate-200 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">로그인</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg shadow-indigo-200 transition"
          >
            로그인
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-slate-600">계정이 없으신가요? </span>
          <button
            onClick={() => navigate('/signup')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage