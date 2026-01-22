import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CaseProvider } from './context/CaseContext';
import { HomePage } from './pages/HomePage';
import { CaseCreation } from './pages/CaseCreation';
import { CaseLaw } from './pages/CaseLaw';
import { Solution } from './pages/Solution';
import SearchResult from './pages/SearchResult';
import JudmentDetail from './pages/JudmentDetail';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AgreeDocument } from './pages/AgreeDocument';
import { GosoDocument } from './pages/GosoDocument';
import { ProofDocument } from './pages/ProofDocument';

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
          <Route path="/judgment/:id" element={<JudmentDetail />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/solution" element={<Solution />} />
          <Route path="/document/agree" element={<AgreeDocument />} />
          <Route path="/document/goso" element={<GosoDocument />} />
          <Route path="/document/proof" element={<ProofDocument />} />

          {/* 없는 페이지로 접근 시 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CaseProvider>
  );
}

export default App;