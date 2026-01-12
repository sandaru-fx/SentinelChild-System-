import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Admin, AdminRole } from '../types';

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
          setError('Access Denied. Invalid terminal credentials.');
        }
      }
    } catch (err) {
      setError('Connection timeout. Authentication server unreachable.');
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
    <div className="max-w-xl w-full mx-auto px-6 py-20 animate-fade-in">
      <div className="bg-white rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden p-12 lg:p-16">
        {/* Forensic Header Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--admin-accent)]"></div>
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[var(--admin-accent)]/5 to-transparent -z-0"></div>

        <div className="relative z-10">
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-white shadow-2xl shadow-slate-200 border border-slate-50 text-[var(--admin-accent)] rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl transition-transform hover:scale-110 duration-500">
              <i className="fas fa-shield-halved"></i>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Command Authority</h1>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px w-8 bg-slate-200"></div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Authorized Access Only</p>
              <div className="h-px w-8 bg-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <i className="fas fa-at text-[var(--admin-accent)]"></i> Terminal Identity
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-[var(--admin-accent)]/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-sm shadow-inner placeholder:text-slate-300"
                  placeholder="name@agency.gov"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <i className="fas fa-key text-[var(--admin-accent)]"></i> Secure Passcode
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-[var(--admin-accent)]/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-sm shadow-inner placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center gap-4 animate-slide-up shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[var(--admin-accent)] transition-all flex items-center justify-center gap-5 disabled:opacity-70 shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              {loading ? <i className="fas fa-sync fa-spin"></i> : (
                <>
                  Establish Terminal Link
                  <i className="fas fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
                </>
              )}
            </button>
          </form>

          {/* Quick-Link for Authorized Devs */}
          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <button
              onClick={handleQuickLogin}
              className="text-[10px] font-black text-slate-400 hover:text-[var(--admin-accent)] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 mx-auto px-6 py-3 rounded-xl hover:bg-slate-50"
            >
              <i className="fas fa-bolt-lightning"></i>
              Bypass for Emergency Ops
            </button>
            <p className="mt-3 text-[10px] font-bold text-slate-200 uppercase tracking-widest">
              Security Protocol: admin@chars.gov / admin123
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center space-y-2 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Government Property</p>
        <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">System usage is monitored and recorded. Unauthorized access is punishable under federal cyber-security regulations.</p>
      </div>
    </div>
  );
}
