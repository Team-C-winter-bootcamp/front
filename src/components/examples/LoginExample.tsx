import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { setSessionId } from '../../utils/sessionStorage'
import { userService } from '../../api'

export const LoginExample = () => {
  const navigate = useNavigate()
  const { login } = useStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 로그인 API 호출
      const response = await userService.login({ email, password })

      // session_id 저장
      setSessionId(response.session_id)

      // Zustand store에 사용자 정보 저장
      login(response.user.id, response.user.email, response.session_id)

      // 홈으로 이동
      navigate('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('로그인에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}
