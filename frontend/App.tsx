
import React, { useState } from 'react';
import AdminLayout from './layouts/AdminLayout';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Admin } from './types';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import StatusPage from './pages/StatusPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminCasesPage from './pages/AdminCasesPage';
import AdminChatPage from './pages/AdminChatPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminTaskBoardPage from './pages/AdminTaskBoardPage'; // Import AdminTaskBoardPage
import AdminUsersPage from './pages/AdminUsersPage'; // Import AdminUsersPage
import AdminInquiriesPage from './pages/AdminInquiriesPage';
import { Navbar } from './components/Navbar';

import VoiceAssistant from './components/VoiceAssistant';
import LiveChat from './components/LiveChat';
import OnboardingModal from './components/OnboardingModal';
import SafetyCluster from './components/SafetyCluster';
import Background3D from './components/Background3D';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const Footer = () => (
  <footer className="bg-slate-950 text-slate-500 py-16 px-4 border-t border-slate-900">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1 rounded-lg">
            <i className="fas fa-shield-child text-white"></i>
          </div>
          <span className="text-white font-black text-xl tracking-tight">CHARS</span>
        </div>
        <p className="text-sm font-bold leading-relaxed max-w-md">
          The Child Harassment & Abuse Reporting System is a secure, official platform dedicated to protecting vulnerable children through citizen empowerment and rapid law enforcement response.
        </p>
      </div>
      <div>
        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Support Lines</h4>
        <ul className="space-y-4 text-sm font-bold">
          <li className="text-white">Emergency: 911</li>
          <li>Help: 1-800-4-A-CHILD</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Resources</h4>
        <ul className="space-y-4 text-sm font-bold">
          <li className="hover:text-white transition-colors"><Link to="/about">Our Mission</Link></li>
          <li className="hover:text-white transition-colors"><Link to="/contact">Technical Support</Link></li>
          <li className="hover:text-white transition-colors cursor-pointer">Security Terms</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 text-center text-[10px] font-black uppercase tracking-widest">
      <p>&copy; {new Date().getFullYear()} Child Harassment & Abuse Reporting System. Government Portal.</p>
    </div>
  </footer>
);

export default function App() {
  const [user, setUser] = useState<Admin | null>(() => {
    const saved = localStorage.getItem('chars_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [chatOpen, setChatOpen] = useState(false);

  const handleLogin = (admin: Admin) => {
    setUser(admin);
    localStorage.setItem('chars_user', JSON.stringify(admin));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chars_user');
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100">
            <Background3D />

            <Routes>
              {/* Public Routes with Standard Navbar/Footer */}
              <Route path="/" element={<><Navbar user={user} onLogout={handleLogout} /><main className="flex-grow"><LandingPage /></main><Footer /><VoiceAssistant /><LiveChat externalOpen={chatOpen} setExternalOpen={setChatOpen} /><SafetyCluster onOpenHelp={() => setChatOpen(true)} /><OnboardingModal /></>} />
              <Route path="/report" element={<><Navbar user={user} onLogout={handleLogout} /><main className="flex-grow"><ReportPage /></main><Footer /><VoiceAssistant /><LiveChat externalOpen={chatOpen} setExternalOpen={setChatOpen} /><SafetyCluster onOpenHelp={() => setChatOpen(true)} /><OnboardingModal /></>} />
              <Route path="/status" element={<><Navbar user={user} onLogout={handleLogout} /><main className="flex-grow"><StatusPage /></main><Footer /><VoiceAssistant /><LiveChat externalOpen={chatOpen} setExternalOpen={setChatOpen} /><SafetyCluster onOpenHelp={() => setChatOpen(true)} /></>} />
              <Route path="/about" element={<><Navbar user={user} onLogout={handleLogout} /><main className="flex-grow"><AboutPage /></main><Footer /><VoiceAssistant /><LiveChat externalOpen={chatOpen} setExternalOpen={setChatOpen} /><SafetyCluster onOpenHelp={() => setChatOpen(true)} /></>} />
              <Route path="/contact" element={<><Navbar user={user} onLogout={handleLogout} /><main className="flex-grow"><ContactPage /></main><Footer /><VoiceAssistant /><LiveChat externalOpen={chatOpen} setExternalOpen={setChatOpen} /><SafetyCluster onOpenHelp={() => setChatOpen(true)} /></>} />
              <Route path="/admin-login" element={<><Navbar user={user} onLogout={handleLogout} /><main className="flex-grow"><AdminLoginPage onLogin={handleLogin} /></main><Footer /></>} />

              {/* Admin Routes with Sidebar Layout */}
              <Route path="/admin" element={<AdminLayout user={user} onLogout={handleLogout} />}>
                <Route path="dashboard" element={<AdminDashboardPage user={user} />} />
                <Route path="cases" element={<AdminCasesPage user={user} />} />
                <Route path="chat" element={<AdminChatPage user={user} />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="tasks" element={<AdminTaskBoardPage user={user} />} />
                <Route path="users" element={<AdminUsersPage user={user} />} />
                <Route path="inquiries" element={<AdminInquiriesPage user={user} />} />
                <Route path="profile" element={<AdminProfilePage user={user} />} />
              </Route>
            </Routes>

          </div>
        </HashRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
