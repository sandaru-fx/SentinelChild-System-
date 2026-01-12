
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Admin } from '../types';
import { useTranslation } from '../context/LanguageContext';

export const Navbar = ({ user, onLogout }: { user: Admin | null; onLogout: () => void }) => {
  const location = useLocation();
  const { language, setLanguage, t } = useTranslation();

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('submitReport'), path: '/report' },
    { name: t('checkStatus'), path: '/status' },
    { name: t('about'), path: '/about' },
    { name: t('contact'), path: '/contact' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex h-24 items-center justify-between">

          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all shadow-lg shadow-blue-600/20">
                <i className="fas fa-shield-cat text-white text-xl"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none uppercase">CHARS</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mt-1">National Portal</span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex flex-grow justify-center items-center gap-10">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative group py-2 ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-transform duration-500 origin-left ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
              </Link>
            ))}
          </div>

          {/* Right: Language & Auth */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('si')}
                className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${language === 'si' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                සිං
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 hidden lg:block"></div>

            {!user ? (
              <Link
                to="/admin-login"
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-lg flex items-center gap-3 group"
              >
                <i className="fas fa-lock text-[10px] group-hover:text-blue-400 transition-colors"></i>
                <span className="hidden sm:inline">Personnel Access</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/dashboard"
                  title={t('dashboard')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${location.pathname === '/admin/dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  <i className="fas fa-grid-2"></i>
                </Link>
                <Link
                  to="/admin/profile"
                  title={t('adminProfile')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${location.pathname === '/admin/profile' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  <i className="fas fa-id-card"></i>
                </Link>
                <button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                  title={t('logout')}
                >
                  <i className="fas fa-power-off text-sm"></i>
                </button>
              </div>
            )}

            {/* Mobile Menu Icon */}
            <button className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
              <i className="fas fa-bars-staggered"></i>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
