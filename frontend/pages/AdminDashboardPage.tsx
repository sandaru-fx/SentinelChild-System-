import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Report, ReportStatus, Admin, ChatSession } from '../types';
import { MetricCard } from '../components/admin/MetricCard';
import { AdminDataTable } from '../components/admin/AdminDataTable';

export default function AdminDashboardPage({ user }: { user: Admin | null }) {
  const [voiceCount, setVoiceCount] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.token) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await api.getAllReports(user.token);
          setReports(response.data);
          const c = await api.getChatSessions(user.token);
          setChats(c);

          // Fetch Voice Inquiries Count
          const inq = await api.getInquiries(user.token);
          setVoiceCount((inq || []).filter((i: any) => i.is_voice).length);
        } catch (error) {
          console.error("Dashboard fetch error:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchData();
    }
  }, [user]);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === ReportStatus.PENDING).length,
    cases: reports.filter(r => r.status === ReportStatus.INVESTIGATING).length,
    voice: voiceCount
  };

  const reportColumns = [
    {
      header: 'Subject',
      accessor: (r: Report) => (
        <div className="flex flex-col">
          <span className="font-bold">{r.childName || 'Anonymized Case'}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">ID: {r.id.slice(0, 8)}</span>
        </div>
      )
    },
    { header: 'Date', accessor: (r: Report) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Status',
      accessor: (r: Report) => (
        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
          r.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
          {r.status}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">COMMAND CENTER</h1>
          <p className="text-[var(--color-text-secondary)] font-medium text-sm mt-1">Real-time system intelligence and operational oversight.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
            <i className="fas fa-download text-slate-400"></i> Export OSINT
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <i className="fas fa-plus"></i> NEW REPORT
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reports"
          value={stats.total}
          icon="fa-folder-tree"
          color="blue"
          trend={{ value: '12%', positive: true }}
          sparklineData={[{ value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 20 }, { value: 45 }]}
        />
        <MetricCard
          title="Voice Intake"
          value={stats.voice}
          icon="fa-microphone"
          color="purple"
          trend={{ value: '5%', positive: false }}
          sparklineData={[{ value: 40 }, { value: 30 }, { value: 35 }, { value: 20 }, { value: 25 }, { value: 15 }]}
        />
        <MetricCard
          title="Active Investigations"
          value={stats.cases}
          icon="fa-shield-halved"
          color="emerald"
          trend={{ value: '8%', positive: true }}
          sparklineData={[{ value: 5 }, { value: 10 }, { value: 8 }, { value: 15 }, { value: 12 }, { value: 20 }]}
        />
        <MetricCard
          title="Critical Pending"
          value={stats.pending}
          icon="fa-triangle-exclamation"
          color="amber"
          trend={{ value: '2%', positive: false }}
          sparklineData={[{ value: 15 }, { value: 20 }, { value: 18 }, { value: 10 }, { value: 12 }, { value: 8 }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Live Intake Stream</h3>
            <a href="#/admin/cases" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Intelligence</a>
          </div>
          <AdminDataTable
            data={reports.slice(0, 5)}
            columns={reportColumns}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="No reports in current intake."
          />
        </div>

        {/* System Intelligence / Quick Control */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Security Protocol Alpha</span>
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight line-height-tight">SYSTEM STATUS:<br />FULLY OPERATIONAL</h3>
              <p className="text-white/60 text-xs font-medium mb-8 leading-relaxed">Encryption levels optimal. All sensor nodes reporting active status. No breach detected.</p>
              <div className="flex flex-col gap-2">
                <a href="#/admin/analytics" className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all backdrop-blur-md border border-white/10">
                  Detailed Analytics
                </a>
                <a href="#/admin/chat" className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest text-center hover:bg-white/90 transition-all shadow-xl">
                  Open Comms Node
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 overflow-hidden relative">
            <div className="flex flex-col gap-4 relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Quick Command</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--color-bg)] rounded-xl border border-transparent hover:border-blue-500/30 hover:shadow-md transition-all group">
                  <i className="fas fa-file-export text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Logs</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--color-bg)] rounded-xl border border-transparent hover:border-emerald-500/30 hover:shadow-md transition-all group">
                  <i className="fas fa-user-plus text-slate-400 group-hover:text-emerald-500 transition-colors"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Access</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--color-bg)] rounded-xl border border-transparent hover:border-purple-500/30 hover:shadow-md transition-all group">
                  <i className="fas fa-gear text-slate-400 group-hover:text-purple-500 transition-colors"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Config</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--color-bg)] rounded-xl border border-transparent hover:border-red-500/30 hover:shadow-md transition-all group">
                  <i className="fas fa-bullhorn text-slate-400 group-hover:text-red-500 transition-colors"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
