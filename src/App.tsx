import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// [핵심] Clerk 인증 컴포넌트 불러오기
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SearchResultsPage from './pages/SearchResultsPage'
import DocumentPage from './pages/DocumentPage'
import JudgmentDetailPage from './pages/JudgmentDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 누구나 접속 가능한 공개 페이지 (Public Routes) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/judgment/:id" element={<JudgmentDetailPage />} />

        {/* 2. 로그인이 필수인 비공개 페이지 (Protected Routes) 
            - SignedIn 내부: 로그인된 사용자만 볼 수 있음
            - SignedOut 내부: 로그인 안 된 사용자는 로그인 페이지로 강제 이동
        */}
        <Route
          path="/document"
          element={
            <>
              <SignedIn>
                <DocumentPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* 3. 없는 페이지로 접근 시 메인으로 리다이렉트 (선택 사항) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App