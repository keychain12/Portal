import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComponentsPage from './pages/ComponentsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WorkspacePage from './pages/WorkspacePage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import SearchPage from './pages/SearchPage';
import InvitationPage from './pages/InvitationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/workspace/:slug" element={<WorkspaceDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/invitation" element={<InvitationPage />} />
        <Route path="/accept" element={<InvitationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
