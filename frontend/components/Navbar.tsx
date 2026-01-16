
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Admin } from '../types';
import { useTranslation } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import {
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Menu
} from 'lucide-react';

export const Navbar = ({ user, onLogout }: { user: Admin | null; onLogout: () => void }) => {
  const location = useLocation();
  const { language, setLanguage, t } = useTranslation();

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('submitReport'), path: '/report' },
    { name: t('checkStatus'), path: '/status' },
    { name: t('resources'), path: '/resources' },
    { name: t('about'), path: '/about' },
    { name: t('contact'), path: '/contact' },
    { name: t('emergency'), path: '/emergency' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 font-sans">
      {/* Premium Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-none"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Left Side: Brand & Status */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-9 h-9 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-blue-500/20">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">CHARS</h1>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mt-0.5 opacity-80">National Portal</span>
              </div>
            </Link>

            {/* In-line System Status Indicator */}
            <div className="hidden xl:flex px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full items-center gap-1.5 ml-2">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-500">Secured Ops</span>
            </div>
          </div>

          {/* Center: Navigation Groups */}
          <div className="hidden lg:flex flex-grow justify-center items-center gap-1">
            <div className="flex items-center gap-1 bg-slate-900/5 dark:bg-white/5 p-1 rounded-xl mr-4">
              {navLinks.slice(1, 3).map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all
                    ${location.pathname === link.path
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-8 px-4">
              {navLinks.slice(3, 6).concat(navLinks.slice(0, 1)).map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] font-bold tracking-wide transition-all relative group py-2 
                    ${location.pathname === link.path
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Tools & Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/emergency"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 flex items-center gap-2 group mr-2 h-9"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              {t('emergency')}
            </Link>

            <div className="hidden sm:flex items-center gap-1 mr-2 px-2 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg h-9">
              {['en', 'si', 'ta'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={`w-7 h-7 flex items-center justify-center text-[9px] font-black rounded transition-all
                    ${language === lang
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ml-2">
                <Link
                  to="/admin/dashboard"
                  title="Admin Dashboard"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
                <button
                  onClick={onLogout}
                  className="h-8 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-2 group active:scale-95 shadow-md shadow-red-500/10"
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Logout</span>
                </button>
              </div>
            )}

            <button className="lg:hidden w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
