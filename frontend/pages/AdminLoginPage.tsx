
import React from 'react';
import AdminLogin from '../components/AdminLogin';
import { Admin } from '../types';

export default function AdminLoginPage({ onLogin }: { onLogin: (admin: Admin) => void }) {
  return (
    <div className="py-20 bg-slate-900/5 min-h-[calc(100vh-64px)] flex items-center justify-center">
      <AdminLogin onLogin={onLogin} />
    </div>
  );
}
