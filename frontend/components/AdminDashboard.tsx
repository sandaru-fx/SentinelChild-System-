
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { Report, ReportStatus, Admin } from '../types';

const StatusBadge = ({ status }: { status: ReportStatus }) => {
  const configs = {
    [ReportStatus.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-700' },
    [ReportStatus.VERIFIED]: { bg: 'bg-blue-100', text: 'text-blue-700' },
    [ReportStatus.INVESTIGATING]: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    [ReportStatus.FORWARDED]: { bg: 'bg-purple-100', text: 'text-purple-700' },
    [ReportStatus.CLOSED]: { bg: 'bg-slate-100', text: 'text-slate-700' },
  };
  const config = configs[status];
  return (
    <span className={`${config.bg} ${config.text} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>
      {status}
    </span>
  );
};

export default function AdminDashboard({ user }: { user: Admin | null }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editingStatus, setEditingStatus] = useState<ReportStatus | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/admin-login');
      return;
    }
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    const data = await mockApi.getAllReports();
    setReports(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!selectedReport || !editingStatus) return;
    setUpdating(true);
    await mockApi.updateReportStatus(selectedReport.id, editingStatus, editingNotes);
    await fetchReports();
    setSelectedReport(prev => prev ? {...prev, status: editingStatus, adminNotes: editingNotes} : null);
    setUpdating(false);
  };

  if (!user) return null;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Case Management</h1>
          <p className="text-slate-500">Secure overview of all incoming reports.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <i className="fas fa-file-alt"></i>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{reports.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Cases</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{reports.filter(r => r.status === ReportStatus.PENDING).length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pending</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search cases..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Loading cases...
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                <i className="fas fa-folder-open text-4xl mb-4"></i>
                <p>No reports found in the database.</p>
              </div>
            ) : (
              reports.map(report => (
                <button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    setEditingStatus(report.status);
                    setEditingNotes(report.adminNotes || '');
                  }}
                  className={`w-full text-left p-4 border-b border-slate-100 transition-all hover:bg-slate-50 ${selectedReport?.id === report.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono font-bold text-slate-900 text-sm">{report.id}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">{report.description}</p>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    <span>{report.reporter ? 'Identified' : 'Anonymous'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2 space-y-8">
          {selectedReport ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in flex flex-col h-[700px]">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Case {selectedReport.id}</h2>
                  <p className="text-slate-400 text-xs">Submitted on {new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors"><i className="fas fa-print"></i></button>
                  <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors"><i className="fas fa-download"></i></button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-10">
                {/* Information Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Victim Info</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-slate-500 block">Name</span>
                        <span className="text-slate-900 font-medium">{selectedReport.childName || 'Not Provided'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Age</span>
                        <span className="text-slate-900 font-medium">{selectedReport.age || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Reporter Info</h3>
                    {selectedReport.reporter ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-slate-500 block">Name</span>
                          <span className="text-slate-900 font-medium">{selectedReport.reporter.name}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Contact</span>
                          <span className="text-slate-900 font-medium">{selectedReport.reporter.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic text-sm py-2">
                        <i className="fas fa-mask"></i> Submitted Anonymously
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Description</h3>
                  <div className="bg-slate-50 p-6 rounded-2xl text-slate-800 leading-relaxed text-sm whitespace-pre-wrap italic">
                    "{selectedReport.description}"
                  </div>
                </div>

                {selectedReport.evidence.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Attachments ({selectedReport.evidence.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedReport.evidence.map((src, i) => (
                        <a key={i} href={src} target="_blank" className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                          {src.startsWith('data:image') ? (
                            <img src={src} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"><i className="fas fa-file-video text-2xl"></i></div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <i className="fas fa-eye text-white"></i>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update Form */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Update Investigation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2">New Status</label>
                      <select 
                        value={editingStatus || ''}
                        onChange={e => setEditingStatus(e.target.value as ReportStatus)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.values(ReportStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-2">Admin Notes (Visible to Reporter)</label>
                      <textarea 
                        value={editingNotes}
                        onChange={e => setEditingNotes(e.target.value)}
                        rows={3}
                        placeholder="Provide details on investigation progress..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdate}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {updating ? <i className="fas fa-spinner fa-spin"></i> : 'Apply Updates & Notify'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-[700px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <i className="fas fa-hand-pointer text-5xl mb-6 text-slate-200"></i>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Select a case to view details</h3>
              <p className="max-w-xs mx-auto">Click on any report in the left column to view descriptions, evidence, and update its current investigation status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
