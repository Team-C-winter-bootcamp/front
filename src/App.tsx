import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CaseProvider } from './context/CaseContext';
import { HomePage } from './pages/HomePage';
import { CaseLaw } from './pages/CaseLaw';

// CaseCreation도 lazy load (framer-motion 사용)
const CaseCreation = lazy(() => import('./pages/CaseCreation').then(module => ({ default: module.CaseCreation })));

// 큰 라이브러리를 사용하는 페이지들을 lazy load
const Solution = lazy(() => import('./pages/Solution').then(module => ({ default: module.Solution })));
const SearchResult = lazy(() => import('./pages/SearchResult'));
const JudmentDetail = lazy(() => import('./pages/JudmentDetail'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AgreeDocument = lazy(() => import('./pages/AgreeDocument').then(module => ({ default: module.AgreeDocument })));
const GosoDocument = lazy(() => import('./pages/GosoDocument').then(module => ({ default: module.GosoDocument })));
const ProofDocument = lazy(() => import('./pages/ProofDocument').then(module => ({ default: module.ProofDocument })));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">로딩 중...</p>
    </div>
  </div>
);

export function App() {
  return (
    <CaseProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 공개 페이지 */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Case 관련 페이지 */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/case" element={<CaseCreation />} />
            <Route path="/case/new" element={<CaseCreation />} />
            <Route path="/case/:id/caselaw" element={<CaseLaw />} />
            <Route path="/judgment/:caseId/:precedentId" element={<JudmentDetail />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/solution" element={<Solution />} />
            <Route path="/document/agree" element={<AgreeDocument />} />
            <Route path="/document/goso" element={<GosoDocument />} />
            <Route path="/document/proof" element={<ProofDocument />} />

            {/* 없는 페이지로 접근 시 메인으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </CaseProvider>
  );
}

export default App;