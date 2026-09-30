import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { Home } from './pages/Home';
import { StoryboardStudio } from './pages/StoryboardStudio';
import { ClaimPurchase } from './pages/ClaimPurchase';
import { PluginSetup } from './pages/PluginSetup';
import { AdminDashboard } from './pages/AdminDashboard';
import { OAuthConsent } from './pages/OAuthConsent';

export const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <AuthProvider>
      <Router basename={basename}>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-red-500 selection:text-white">
          <Navbar />
          <main className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studio" element={<StoryboardStudio />} />
              <Route path="/claim" element={<ClaimPurchase />} />
              <Route path="/plugin-setup" element={<PluginSetup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/oauth/consent" element={<OAuthConsent />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
