
import React, { useState } from 'react';
import { api } from '../services/api';
import { Report, ReportStatus } from '../types';
import { useTranslation } from '../context/LanguageContext';

const StatusCard = ({ status }: { status: ReportStatus }) => {
  const configs = {
    [ReportStatus.PENDING]: { bg: 'bg-yellow-400', icon: 'fa-hourglass' },
    [ReportStatus.VERIFIED]: { bg: 'bg-green-500', icon: 'fa-check-double' },
    [ReportStatus.INVESTIGATING]: { bg: 'bg-blue-600', icon: 'fa-shield-halved' },
    [ReportStatus.FORWARDED]: { bg: 'bg-indigo-600', icon: 'fa-share-nodes' },
    [ReportStatus.CLOSED]: { bg: 'bg-slate-400', icon: 'fa-circle-check' },
  };

  const config = configs[status];
  const { t } = useTranslation();

  return (
    <div className={`${config.bg} p-6 rounded-2xl flex items-center gap-4 text-white shadow-lg`}>
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl">
        <i className={`fas ${config.icon}`}></i>
      </div>
      <div>
        <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{t('caseStatus')}</span>
        <h4 className="text-xl font-black">{status}</h4>
      </div>
    </div>
  );
};

export default function StatusTracker() {
  const { t } = useTranslation();
  const [reportId, setReportId] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId.trim()) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const result = await api.getReportStatus(reportId);
      if (result) {
        setReport(result);
      } else {
        setError('Reference ID not found in system.');
      }
    } catch (err) {
      setError('System lookup error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-20 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 transition-colors">{t('trackProgress')}</h1>
      </div>

      <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 backdrop-blur-md transition-all duration-500 group relative overflow-hidden
                      hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 hover:shadow-indigo-500/10">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-10">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('enterId')}</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="CH-XXXXXX"
              value={reportId}
              onChange={e => setReportId(e.target.value)}
              className="flex-grow px-6 py-5 bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-blue-600 outline-none font-mono text-2xl uppercase tracking-widest text-slate-900 dark:text-white transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-5 rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : t('searchBtn')}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2 mb-6">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {report && (
          <div className="space-y-8 animate-fade-in">
            <StatusCard status={report.status} />
            <div className="bg-slate-50 dark:bg-slate-950/40 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white font-bold">
                <i className="fas fa-message text-blue-600 dark:text-blue-400"></i>
                {t('investigationNotes')}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                {report.adminNotes || "Case under review. Please check back later for official updates."}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Last Updated: {new Date(report.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
