import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SearchResultsPage from './pages/SearchResultsPage'
import AIChatPage from './pages/AIChatPage'
import DocumentPage from './pages/DocumentPage'
import JudgmentDetailPage from './pages/JudgmentDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/document" element={<DocumentPage />} />
        <Route path="/judgment/:id" element={<JudgmentDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
