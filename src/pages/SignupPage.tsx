import { useState, useEffect , FormEvent} from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import SignupAlertModal from '../components/AlertModal/SignupAlertModal'
const SignupPage = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // 입력값 상태
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })

  // 약관 동의 상태 (ckeckbox 일 거니까)
  const [agreeToAll, setAgreeToAll] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  // 유효성 검사 메시지 상태들
  const [emailMessage, setEmailMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string>('')
  const [matchMessage, setMatchMessage] = useState<string>('')

  // 테스트용 가짜(Mock) 데이터베이스 
  const MOCK_EXISTING_EMAILS = ['test@gmail.com', 'lawding@gmail.com', 'admin@lawyers.com']

  // 아이디(이메일) 중복 검사 - useEffect: 일단 한 번 실행 뒤 조건에 따라 몇 번 할 지 정해짐짐
  useEffect(() => {
    const email = formData.id
    if (!email) { //이메일이 없으면 
      setEmailMessage(null) // emailMessage가 null
      return
    }

    // 이메일 형식 정규식 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) { //email 확인했는데 정규식과 다르면 flase 같으면 true 값 줌줌
      setEmailMessage({ text: '올바른 이메일 형식이 아닙니다.', isError: true })
    } else if (MOCK_EXISTING_EMAILS.includes(email)) {//이미 포함하고 있으면  T 아니면 F
      setEmailMessage({ text: '이미 존재하는 계정입니다.', isError: true })
    } else {
      setEmailMessage({ text: '사용 가능한 계정입니다.', isError: false })
    }
  }, [formData.id]) //입력값 id가 바뀔 때마다 실행 

  // 비밀번호 검사 
  useEffect(() => {
    const pwd = formData.password
    if (!pwd) { // passward가 없다면 
      setPasswordMessage('') // password 없음 
      return
    }

    // 영문, 숫자, 특수문자(!@#$%^&*) 포함 8자 이상 정규식
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/

    if (!passwordRegex.test(pwd)) {// 입력값 비밀번호가 정규식과 맞냐 안맞냐 T/F
      setPasswordMessage('영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.')
    } else {
      setPasswordMessage('') // 통과하면 메시지 삭제
    }
  }, [formData.password]) //입력값 비밀번호가 바뀔 때마다

  // 비밀번호 일치 검사 
  useEffect(() => {
    const { password, confirmPassword } = formData
    if (!confirmPassword) { //아무것도 안적으면 
      setMatchMessage('') // 메시지 안날려
      return
    }

    if (password !== confirmPassword) { //일치 안하면 
      setMatchMessage('비밀번호가 일치하지 않습니다.')
    } else {
      setMatchMessage('') // 통과하면 메시지 삭제
    }
  }, [formData.password, formData.confirmPassword]) //각각 입력할 때마다 


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // 최종 제출 전 한 번 더 안전장치 (에러가 하나라도 있으면 제출 막기)
    if (emailMessage?.isError || passwordMessage || matchMessage || !agreeTerms || !agreePrivacy) {
      // 경고장이 다 지워진다면 즉, 모두 flase라면 
      alert('입력 정보를 다시 확인하거나 필수 약관에 동의해주세요.')
      return
    }

    setIsModalOpen(true)
  }


  // 모달에서 '확인' 눌렀을 때 실행할 함수
  const handleConfirmModal = () => {
    setIsModalOpen(false) // 모달 끄고
    navigate('/login')    // 로그인 페이지로 이동!
  }

  const handleAgreeToAll = (checked: boolean) => {
    setAgreeToAll(checked)
    setAgreeTerms(checked)
    setAgreePrivacy(checked)
  } 

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}

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

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {/* 1. 아이디 입력 */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              아이디 (이메일)
            </label>
            <input
              type="text" // 이메일 형식이므로 email 추천하지만 text도 무관
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="예) Lawding@gmail.com"
              className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                emailMessage?.isError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
              }`}
            />
            {/* 아이디 유효성 메시지 */}
            {emailMessage && (
              <p className={`text-xs mt-1 ${emailMessage.isError ? 'text-red-500' : 'text-green-500'}`}>
                {emailMessage.text}
              </p>
            )}
          </div>

          {/* 2. 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordMessage ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
              }`}
            />
            {/* 비밀번호 복잡도 에러 메시지 */}
            {passwordMessage && (
              <p className="text-red-500 text-xs mt-1">{passwordMessage}</p>
            )}
          </div>

          {/* 3. 비밀번호 확인 */}
          <div>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="비밀번호를 다시 한 번 입력해주세요."
              className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                matchMessage ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
              }`}
            />
            {/* 불일치 에러 메시지 */}
            {matchMessage && (
              <p className="text-red-500 text-xs mt-1">{matchMessage}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="ex) 010-1234-5678"
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Agreements (기존 코드 유지) */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToAll"
                checked={agreeToAll}
                onChange={(e) => handleAgreeToAll(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="agreeToAll" className="text-sm font-semibold text-black">
                모두 동의합니다
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked)
                  setAgreeToAll(agreePrivacy && e.target.checked)
                }}
                className="mr-2"
              />
              <label htmlFor="agreeTerms" className="text-sm text-black">
                (필수) 서비스 이용약관 동의
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreePrivacy"
                checked={agreePrivacy}
                onChange={(e) => {
                  setAgreePrivacy(e.target.checked)
                  setAgreeToAll(agreeTerms && e.target.checked)
                }}
                className="mr-2"
              />
              <label htmlFor="agreePrivacy" className="text-sm text-black">
                (필수) 개인정보 수집 및 이용동의
              </label>
            </div>
          </div>

          <button
            type="submit"
            // 에러가 있거나 약관 동의 안 하면 버튼 비활성화 (선택사항, 원하면 disabled 제거)
            disabled={!!(emailMessage?.isError || passwordMessage || matchMessage || !agreeTerms || !agreePrivacy)}
            className={`w-full py-4 rounded transition-colors mt-6 text-white font-bold
              ${(emailMessage?.isError || passwordMessage || matchMessage || !agreeTerms || !agreePrivacy) 
                ? 'bg-gray-400 cursor-not-allowed' // 조건 불만족 시 회색
                : 'bg-gray-800 hover:bg-gray-700'  // 조건 만족 시 검은색
              }`}
          >
            회원가입 완료
          </button>
        </form>
      </div>
      <SignupAlertModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // 배경 누르면 닫기
        onConfirm={handleConfirmModal}        // 확인 누르면 로그인 페이지로
      />
    </div>
  )
}

export default SignupPage