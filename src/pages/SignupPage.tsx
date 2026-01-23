import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logotextb from '../assets/logotextb.png'

const SignupPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }
    // TODO: 회원가입 로직 구현
    console.log('Signup:', { email, password })
    // 임시로 로그인 페이지로 이동
    navigate('/login')
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
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">회원가입</h2>
        
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg shadow-indigo-200 transition"
          >
            회원가입
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-slate-600">이미 계정이 있으신가요? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignupPage