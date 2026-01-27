import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CaseProvider } from './context/CaseContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const CaseCreation = lazy(() => import('./pages/CaseCreation'));
const Solution = lazy(() => import('./pages/Solution'));
const SearchResult = lazy(() => import('./pages/SearchResult'));
const JudmentDetail = lazy(() => import('./pages/JudmentDetail'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AgreementDocument = lazy(() => import('./pages/AgreeDocument'));
const ComplaintDocument = lazy(() => import('./pages/GosoDocument'));
const NoticeDocument = lazy(() => import('./pages/ProofDocument'));

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/case" element={<CaseCreation />} />
            <Route path="/case/new" element={<CaseCreation />} />
            <Route path="/judgment/:case_No" element={<JudmentDetail />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/answer/:precedentsId" element={<Solution />} />
            <Route path="/document/agree" element={<AgreementDocument />} />
            <Route path="/document/goso" element={<ComplaintDocument />} />
            <Route path="/document/proof" element={<NoticeDocument />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </CaseProvider>
  );
}

export default App;