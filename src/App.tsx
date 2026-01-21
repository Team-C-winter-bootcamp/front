import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CaseProvider } from './context/CaseContext';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { HomePage } from './pages/HomePage';
import { CaseCreation } from './pages/CaseCreation';
import { CaseLaw } from './pages/CaseLaw';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export function App() {
  return (
    <CaseProvider>
      <Router>
        <Routes>
          {/* 공개 페이지 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Case 관련 페이지 */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<CaseCreation />} />
          <Route path="/case/new" element={<CaseCreation />} />
          <Route path="/case/:id/caselaw" element={<CaseLaw />} />
          
          {/* 보호된 페이지 */}
          <Route
            path="/document"
            element={
              <>
                <SignedIn>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* 없는 페이지로 접근 시 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CaseProvider>
  );
}

export default App;