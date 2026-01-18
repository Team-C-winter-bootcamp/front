import { useState, FormEvent, Dispatch, SetStateAction } from 'react' //Dispatch :  ,SetStateAction
import { useNavigate, useLocation } from 'react-router-dom' //이동 시켜주는 놈 import
import { useStore } from '../store/useStore' //Zustand에 박아놓은 함수들 import
import Header from '../components/Header'//헤더 가져오기
import logotextb from '../assets/logotextb.png'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useStore()
  // 일반인/변호사 구분분
  const [activeTab, setActiveTab] = useState<'lawding' | 'lawyers'>('lawding')
  //ID
  const [id, setId] = useState('')
  //비번
  const [password, setPassword] = useState('')
  //ID 기억하기
  const [rememberId, setRememberId] = useState(false)
  // 아이디 비밀번호 비어있을 때 버튼 색깔 변경
  const isFormFilled = id !== '' && password !== ''
  //에러 메시지 상태 추가
  const [errorMessage, setErrorMessage] = useState('')
  // 이전 페이지 경로 (다른 페이지에서 로그인 요청 시)
  const from = (location.state as { from?: string })?.from || '/'
  // useLocation : location.state(pathname(주소), search(검색어), hash(#))
  // as : 강제로 타입 지정, { from?: string } from 이 있을 수도 없을 수도 있음 
  // ( ... )?.from [옵셔널 체이닝] : 앞이 null or undefined라면? 바로 undefined 내뱉음 있다면 .from 꺼냄냄
  
  //로그인 시
  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    if (!id) {
      setErrorMessage('아이디 또는 전화번호를 입력해 주세요.')
      return 
    }
    
    if (!password) {
      setErrorMessage('비밀번호를 입력해 주세요.')
      return 
    }

    // 로그인 성공 시 (실제로는 API 호출 후 처리)
    // 데모용: 간단한 검증
    if (password.length >= 4) {
      login(id, id) // id를 email로도 사용
      navigate(from, { replace: true })
    } else {
      setErrorMessage('비밀번호가 올바르지 않습니다.')
    }
  }

  // 입력 시 에러 메시지 초기화 헬퍼 함수
  const handleInputChange = (setter: Dispatch<SetStateAction<string>>, value: string) => {
    setter(value) // useState 값이 문자열만 받을 거고 새 값도 문자로 받을 거임 
    if (errorMessage) setErrorMessage('')
  } 
 
  return (
    <div className="min-h-screen bg-[#F5F3EB] font-serif">
      <Header />

      {/* 메인 로고  */}
      <div className="flex flex-col items-center justify-center px-4 py-16 max-w-lg mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="mb-7 hover:opacity-80 transition-opacity" // mb-12 -> 10으로 살짝 줄임, hover 효과 추가
        >
          <img 
            src={logotextb}  
            alt="Lawding Logo" 
            // w-12(48px) -> w-40(160px) ~ w-48(192px) 정도로 키움
            // h-auto: 비율 유지
            className="w-72 md:w-78 h-auto object-contain" 
          />
        </button>

        {/* 유저 선택택 */}
        <div className="flex w-full mb-8 border-b border-minimal-gray">
          <button
            onClick={() => setActiveTab('lawding')}
            className={`flex-1 py-4 text-center transition-colors ${
              activeTab === 'lawding'
                ? 'border-b-2 border-minimal-charcoal font-medium text-minimal-charcoal'
                : 'text-minimal-medium-gray font-light'
            }`}
          >
            Law딩중 계정 로그인
          </button>

          <button
            onClick={() => setActiveTab('lawyers')}
            className={`flex-1 py-4 text-center transition-colors ${
              activeTab === 'lawyers'
                ? 'border-b-2 border-minimal-charcoal font-medium text-minimal-charcoal'
                : 'text-minimal-medium-gray font-light'
            }`}
          >
            로이어스원 계정 로그인
          </button>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-light text-minimal-dark-gray mb-2">
              아이디 또는 전화번호
            </label>
            <input
              type="email"
              value={id}
              onChange={(e) => handleInputChange(setId, e.target.value)}
              placeholder={
                activeTab === 'lawding'
                  ? '예) Lawding@gmail.com'
                  : '로이어스원 계정 이메일을 입력해 주세요.'
              }
              className="input-minimal"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-minimal-dark-gray mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleInputChange(setPassword, e.target.value)}
              placeholder="비밀번호를 입력해주세요."
              className="input-minimal"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberId"
              checked={rememberId}
              onChange={(e) => setRememberId(e.target.checked)}
              className="mr-2 w-4 h-4 text-minimal-charcoal border-minimal-gray rounded focus:ring-minimal-charcoal"
            />
            <label htmlFor="rememberId" className="text-sm text-minimal-dark-gray font-light">
              아이디 기억하기
            </label>
          </div>

          {/* 에러 메시지 표시 영역 */}
          {errorMessage && (
            <div className="text-red-600 text-sm font-light mt-2">
              {errorMessage}
            </div>
          )}
          
          <button
            type="submit"
            className={`w-full py-3.5 rounded-minimal transition-all duration-200 ${
              isFormFilled
                ? 'btn-minimal-primary'
                : 'bg-minimal-gray text-minimal-medium-gray cursor-not-allowed opacity-40'
            }`}
            disabled={!isFormFilled}
          >
            로그인
          </button>
        </form>

        {/* Footer Links */}
        <div className="flex gap-6 mt-10 text-sm">
          <button className="text-minimal-medium-gray hover:text-minimal-charcoal font-light transition-colors">비밀번호 찾기</button>
          <button className="text-minimal-medium-gray hover:text-minimal-charcoal font-light transition-colors">아이디 찾기</button>
          <button
            onClick={() => navigate('/signup')}
            className="text-minimal-medium-gray hover:text-minimal-charcoal font-light transition-colors"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage