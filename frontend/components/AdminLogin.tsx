import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Admin, AdminRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogin({ onLogin }: { onLogin: (admin: Admin) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(email, password);

      if (result.success && result.admin) {
        onLogin({
          ...result.admin,
          token: result.token || 'fallback-token'
        });
        navigate('/admin/dashboard');
      } else {
        // Fallback check for Demo/Local testing
        if (email === 'admin@chars.gov' && password === 'admin123') {
          const demoAdmin: Admin = {
            id: 'demo-1',
            name: 'Duty Officer',
            email: 'admin@chars.gov',
            role: AdminRole.SUPER_ADMIN,
            token: 'demo-jwt-token-' + Date.now(),
            avatar: ''
          };
          onLogin(demoAdmin);
          navigate('/admin/dashboard');
        } else {
          setError('AUTH_FAILED: ACCESS_DENIED - UNAUTHORIZED_TERMINAL_ID');
        }
      }
    } catch (err) {
      setError('SERVICE_UNAVAILABLE: NETWORK_TIMEOUT - AUTH_SERVER_OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('admin@chars.gov');
    setPassword('admin123');
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <div className="max-w-xl w-full mx-auto px-6 py-10 animate-fade-in relative">
      {/* Decorative Security Elements */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 dark:border-slate-800/50 relative overflow-hidden p-10 lg:p-14"
      >
        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/30"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/30"></div>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel.Secure_Access_V3</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Live Link</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.75rem] flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0 duration-500">
              <i className="fas fa-shield-halved"></i>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-600 text-[10px]">
              <i className="fas fa-fingerprint"></i>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Secure Personnel Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2 max-w-[280px] mx-auto opacity-70">Authorized Law Enforcement & Administration Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                Terminal Identity <span className="text-blue-500/50">| REQUIRED</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <i className="fas fa-id-badge text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
                  placeholder="name@agency.gov.lk"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                Secure Passcode <span className="text-blue-500/50">| ENCRYPTED</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <i className="fas fa-lock-hashtag text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                    <i className="fas fa-shield-xmark text-sm"></i>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Access Denied</p>
                    <p className="text-[11px] font-bold text-red-500/80 leading-none">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-70 overflow-hidden">
              {loading ? (
                <i className="fas fa-spinner-third fa-spin"></i>
              ) : (
                <>
                  <span className="relative z-10">Establish Terminal Link</span>
                  <i className="fas fa-arrow-right-long relative z-10 group-hover:translate-x-1 transition-transform"></i>
                </>
              )}
              {/* Button Glint */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[25deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out"></div>
            </div>
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-6">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2">
            <span className="flex items-center gap-2">
              <i className="fas fa-shield-check text-green-500"></i> Encrypted
            </span>
            <span className="flex items-center gap-2">
              <i className="fas fa-server text-blue-500"></i> Node: SG-1
            </span>
            <span className="flex items-center gap-2">
              <i className="fas fa-location-crosshairs text-indigo-500"></i> V-Audit
            </span>
          </div>

          <button
            onClick={handleQuickLogin}
            className="group w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-2xl transition-all"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-[0.3em] transition-colors">
                <i className="fas fa-bolt-lightning text-amber-500 animate-pulse"></i>
                Emergency System Override
              </div>
              <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Developer & Technical Access Only</span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Legal Footer */}
      <div className="mt-10 px-6 space-y-3 opacity-30 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          <div className="h-px w-8 bg-slate-300 dark:bg-slate-800"></div>
          Restricted Property
          <div className="h-px w-8 bg-slate-300 dark:bg-slate-800"></div>
        </div>
        <p className="text-[9px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
          All connection attempts and terminal actions are monitored, logged and reported to the National Security Division.
        </p>
      </div>
    </div>
  );
}
