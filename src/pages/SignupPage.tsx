import { useNavigate } from 'react-router-dom'
import { SignUp } from "@clerk/clerk-react"
import logotextb from '../assets/logotextb.png'

const SignupPage = () => {
  const navigate = useNavigate()

  return (
    // 배경 및 폰트 스타일 (기존 유지)
    <div className="min-h-screen bg-[#F5F3EB] font-serif flex flex-col items-center justify-center py-10">
      
      {/* 로고 영역 (기존 유지) */}
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

      {/* Clerk 회원가입 컴포넌트 */}
      <SignUp 
        path="/signup" 
        routing="path" 
        signInUrl="/login" 
        
        // LoginPage와 동일한 디자인 테마 적용
        appearance={{
          variables: {
            colorPrimary: '#C8A45D', // 버튼 색상 (Gold)
            colorText: '#1A233B',    // 텍스트 색상 (Charcoal)
            borderRadius: '0.5rem',
            fontFamily: 'serif',     // 폰트 통일
          },
          elements: {
            // 카드 스타일: 그림자 및 테두리 적용
            card: "shadow-xl border border-[#E5E7EB] bg-white",
            
            // 입력창 스타일: 포커스 시 금색 테두리
            formFieldInput: "border-gray-300 focus:border-[#C8A45D] transition-colors",
            
            // 메인 버튼 스타일
            formButtonPrimary: "bg-[#C8A45D] hover:bg-[#b8934d] text-white transition-all",
            
            // 하단 링크 (이미 계정이 있으신가요?) 스타일
            footerActionLink: "text-[#C8A45D] hover:text-[#b8934d] font-bold",
            
            // 에러 메시지 스타일
            formFieldWarningText: "text-red-500 text-xs",
            formFieldErrorText: "text-red-500 text-xs",
          }
        }}
      />
    </div>
  )
}

export default SignupPage