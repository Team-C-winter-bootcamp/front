import { useNavigate } from 'react-router-dom'
import { SignIn } from "@clerk/clerk-react"
import logotextb from '../assets/logotextb.png'

const LoginPage = () => {
  const navigate = useNavigate()

  return (
    // 배경색 및 폰트 설정 (기존 유지)
    <div className="min-h-screen bg-[#F5F3EB] font-serif flex flex-col items-center justify-center py-10">

      {/* 메인 로고 영역 (기존 유지) */}
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

      {/* Clerk 로그인 컴포넌트 */}
      <SignIn 
        path="/login" 
        routing="path" 
        signUpUrl="/signup" 
        
        appearance={{
          variables: {
            colorPrimary: '#C8A45D', // 기존 '로그인' 버튼 색상 (Gold)
            colorText: '#1A233B',    // 기존 텍스트 색상 (Charcoal)
            borderRadius: '0.5rem',
          },
          elements: {
            // 카드 배경을 투명하게 하거나 깔끔한 흰색 박스로 유지
            card: "shadow-xl border border-[#E5E7EB]",
            
            // 입력창 스타일
            formFieldInput: "border-gray-300 focus:border-[#C8A45D]",
            
            // 로그인 버튼 스타일 (기존 btn-minimal-primary 느낌)
            formButtonPrimary: "bg-[#C8A45D] hover:bg-[#b8934d] text-white",
            
            // 하단 링크 (회원가입 등) 색상
            footerActionLink: "text-[#C8A45D] hover:text-[#b8934d] font-bold",
          }
        }}
      />
      
    </div>
  )
}

export default LoginPage