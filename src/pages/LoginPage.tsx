import { useNavigate } from 'react-router-dom'
import { SignIn } from "@clerk/clerk-react"
import logotextb from '../assets/logotextb.png'

const LoginPage = () => {
  const navigate = useNavigate()

  return (
    // 배경색 및 폰트 설정
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center py-10">

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
            colorPrimary: '#6366f1', // Indigo 악센트 색상
            colorText: '#1e293b',    // Slate 텍스트 색상
            borderRadius: '0.75rem',
          },
          elements: {
            // 카드 배경을 깔끔한 흰색 박스로 유지
            card: "shadow-xl border border-slate-200 rounded-xl",
            
            // 입력창 스타일
            formFieldInput: "border-slate-300 focus:border-indigo-500 rounded-lg shadow-sm",
            
            // 로그인 버튼 스타일
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-200",
            
            // 하단 링크 (회원가입 등) 색상
            footerActionLink: "text-indigo-600 hover:text-indigo-700 font-bold",
          }
        }}
      />
      
    </div>
  )
}

export default LoginPage