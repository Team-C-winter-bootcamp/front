import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CaseProvider } from './context/CaseContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const CaseLaw = lazy(() => import('./pages/CaseLaw'));
const CaseCreation = lazy(() => import('./pages/CaseCreation'));
const Solution = lazy(() => import('./pages/Solution'));
const SearchResult = lazy(() => import('./pages/SearchResult'));
const JudmentDetail = lazy(() => import('./pages/JudmentDetail'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AgreeDocument = lazy(() => import('./pages/AgreeDocument'));
const GosoDocument = lazy(() => import('./pages/GosoDocument'));
const ProofDocument = lazy(() => import('./pages/ProofDocument'));

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
            <Route path="/case/:id/caselaw" element={<CaseLaw />} />
            <Route path="/judgment/:case_No" element={<JudmentDetail />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/answer" element={<Solution />} />
            <Route path="/document/agree" element={<AgreeDocument />} />
            <Route path="/document/goso" element={<GosoDocument />} />
            <Route path="/document/proof" element={<ProofDocument />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </CaseProvider>
  );
}

export default App;