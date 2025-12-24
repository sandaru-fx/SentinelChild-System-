
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
            token: 'demo-jwt-token-' + Date.now()
          };
          onLogin(demoAdmin);
          navigate('/admin/dashboard');
        } else {
          setError('Invalid credentials. Please try again.');
        }
      }
    } catch (err) {
      setError('Connection refused. Using mock authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('admin@chars.gov');
    setPassword('admin123');
    // We use setTimeout to ensure state updates before calling handleLogin
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-user-shield"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Login</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-sm"
              placeholder="admin@chars.gov"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-[10px] font-black uppercase bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3">
              <i className="fas fa-circle-exclamation"></i> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-slate-100"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "Sign In"}
          </button>
        </form>

        {/* Developer Quick-Login Helper */}
        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <button 
            onClick={handleQuickLogin}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <i className="fas fa-bolt"></i>
            Use Demo Credentials
          </button>
          <p className="mt-2 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            (admin@chars.gov / admin123)
          </p>
        </div>
      </div>
    </div>
  );
}
