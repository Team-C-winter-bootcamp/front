import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CaseProvider } from './context/CaseContext';
import { Landing } from './pages/Landing';
import { CaseCreation } from './pages/CaseCreation';
import { DocumentEditor } from './pages/DocumentEditor';
import { CaseLaw } from './pages/CaseLaw';
import { SubmissionGuidance } from './pages/SubmissionGuidance';
import { SendFile } from './pages/SendFile';
import { Response } from './pages/Response';
import { Resolution } from './pages/Resolution';
export function App() {
  return (
    <CaseProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<Landing />} />
          <Route path="/case/new" element={<CaseCreation />} />
          <Route path="/case/:id/document" element={<DocumentEditor />} />
          <Route path="/case/:id/caselaw" element={<CaseLaw />} />
          <Route path="/case/:id/submit" element={<SubmissionGuidance />} />
          <Route path="/case/:id/send" element={<SendFile />} />
          <Route path="/case/:id/response" element={<Response />} />
          <Route path="/case/:id/resolution" element={<Resolution />} />
        </Routes>
      </Router>
    </CaseProvider>);

}