import { useNavigate } from 'react-router-dom'
import { SignUp } from "@clerk/clerk-react"
import logotextb from '../assets/logotextb.png'

const SignupPage = () => {
  const navigate = useNavigate()

  return (
    // 배경 및 폰트 스타일
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center py-10">
      
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
            colorPrimary: '#6366f1', // Indigo 악센트 색상
            colorText: '#1e293b',    // Slate 텍스트 색상
            borderRadius: '0.75rem',
          },
          elements: {
            // 카드 스타일: 그림자 및 테두리 적용
            card: "shadow-xl border border-slate-200 bg-white rounded-xl",
            
            // 입력창 스타일: 포커스 시 indigo 테두리
            formFieldInput: "border-slate-300 focus:border-indigo-500 transition-colors rounded-lg shadow-sm",
            
            // 메인 버튼 스타일
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white transition-all rounded-lg shadow-lg shadow-indigo-200",
            
            // 하단 링크 (이미 계정이 있으신가요?) 스타일
            footerActionLink: "text-indigo-600 hover:text-indigo-700 font-bold",
            
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