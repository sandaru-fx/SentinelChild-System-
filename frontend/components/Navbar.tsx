
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Admin } from '../types';
import { useTranslation } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';

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
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 font-sans">
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm"></div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex h-20 items-center justify-between">

          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                <i className="fas fa-shield-cat text-white text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">CHARS</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mt-0.5">National Portal</span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex flex-grow justify-center items-center gap-10">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative group py-2 
                  ${location.pathname === link.path
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 transition-transform duration-300 origin-center rounded-full ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                  }`}></span>
              </Link>
            ))}
          </div>

          {/* Right: Language & Auth */}
          <div className="flex items-center gap-4">

            {/* Language Switcher */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('si')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${language === 'si' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                සිං
              </button>
            </div>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-2 hidden lg:block"></div>

            <ThemeToggle />

            {!user ? (
              <Link
                to="/admin-login"
                className="hidden lg:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/10 items-center gap-2 group"
              >
                <i className="fas fa-lock text-[10px] opacity-70 group-hover:opacity-100 transition-opacity"></i>
                <span className="hidden sm:inline">Portal Access</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/dashboard"
                  title={t('dashboard')}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${location.pathname === '/admin/dashboard' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  <i className="fas fa-grid-2"></i>
                </Link>
                <button
                  onClick={onLogout}
                  className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all flex items-center justify-center"
                  title={t('logout')}
                >
                  <i className="fas fa-power-off text-xs"></i>
                </button>
              </div>
            )}

            {/* Mobile Menu Icon (Placeholder for now) */}
            <button className="lg:hidden w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <i className="fas fa-bars-staggered"></i>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
