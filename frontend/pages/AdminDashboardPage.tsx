import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Report, ReportStatus, Admin, ChatSession } from '../types';

export default function AdminDashboardPage({ user }: { user: Admin | null }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (user?.token) {
      const fetchData = async () => {
        const r = await api.getAllReports(user.token);
        setReports(r);
        const c = await api.getChatSessions(user.token);
        setChats(c);
      }
      fetchData();
    }
  }, [user]);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === ReportStatus.PENDING).length,
    active: reports.filter(r => r.status === ReportStatus.INVESTIGATING).length,
    chats: chats.filter(s => s.status === 'ACTIVE').length
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Command Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Total Reports</div>
          <div className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.total}</div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Pending Review</div>
          <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Active Cases</div>
          <div className="text-3xl font-bold text-blue-500">{stats.active}</div>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Active Chats</div>
          <div className="text-3xl font-bold text-emerald-500">{stats.chats}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
            <h3 className="font-bold text-[var(--color-text-primary)]">Recent Intake</h3>
            <a href="#/admin/cases" className="text-xs font-semibold text-blue-600 hover:underline">View All</a>
          </div>
          <div className="p-6 space-y-4">
            {reports.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{r.childName || 'Anonymized'}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">{r.id.slice(0, 8)} • {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">System Status: Operational</h3>
            <p className="text-blue-100 text-sm mb-6">All channels are secure and active. No critical alerts.</p>
            <div className="flex gap-3">
              <a href="#/admin/analytics" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors">
                View Intelligence
              </a>
              <a href="#/admin/chat" className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                Open Comms
              </a>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6">
            <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-lg bg-[var(--color-bg)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group">
                <i className="fas fa-file-export text-slate-400 group-hover:text-blue-500 mb-2"></i>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">Export Data</div>
              </button>
              <button className="p-4 rounded-lg bg-[var(--color-bg)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group">
                <i className="fas fa-user-plus text-slate-400 group-hover:text-emerald-500 mb-2"></i>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">Add User</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
