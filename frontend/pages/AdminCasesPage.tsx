import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Report, ReportStatus, Admin } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { GoogleGenAI } from "@google/genai";

export default function AdminCasesPage({ user }: { user: Admin | null }) {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(false);
    const [editingStatus, setEditingStatus] = useState<ReportStatus | null>(null);
    const [editingNotes, setEditingNotes] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    useEffect(() => {
        if (user?.token) {
            fetchReports();
        }
    }, [user]);

    const fetchReports = async () => {
        if (!user?.token) return;
        setLoading(true);
        const data = await api.getAllReports(user.token);
        setReports(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
    };

    const handleUpdate = async () => {
        if (!selectedReport || !editingStatus || !user?.token) return;
        setUpdating(true);
        const success = await api.updateReportStatus(selectedReport.id, editingStatus, editingNotes, user.token);
        if (success) {
            await fetchReports();
            setSelectedReport(prev => prev ? { ...prev, status: editingStatus, adminNotes: editingNotes, updatedAt: new Date().toISOString() } : null);
        }
        setUpdating(false);
    };

    const generateAiSummary = async () => {
        if (!selectedReport) return;
        setIsSummarizing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Analyze the following child harassment report. Status: ${selectedReport.status}. 
            Report Description: "${selectedReport.description}"
            Provide a concise summary and recommended next steps for a case officer.`,
            });
            setAiSummary(response.text || "Summary generation failed.");
        } catch (err) {
            console.error('AI Summary Error:', err);
            setAiSummary("Unable to generate summary. Please check API configuration.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesFilter = filter === 'ALL' || report.status === filter;
        const matchesSearch =
            report.id.toLowerCase().includes(search.toLowerCase()) ||
            (report.description || '').toLowerCase().includes(search.toLowerCase()) ||
            (report.childName || '').toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <div className="p-12 text-center text-slate-400">Loading cases...</div>;

    return (
        <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List View */}
            <div className="lg:col-span-4 flex flex-col bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[var(--color-border)] space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-[var(--color-text-primary)]">Case Files</h2>
                        <button
                            onClick={() => import('../utils/export').then(mod => mod.exportToCSV(filteredReports, 'case_files'))}
                            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <i className="fas fa-file-csv"></i> Export
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search cases..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['ALL', ...Object.values(ReportStatus)].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === s
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto divide-y divide-[var(--color-border)]">
                    {filteredReports.map(report => (
                        <button
                            key={report.id}
                            onClick={() => { setSelectedReport(report); setEditingStatus(report.status); setEditingNotes(report.adminNotes || ''); setAiSummary(null); }}
                            className={`w-full text-left p-4 hover:bg-[var(--color-bg)] transition-all ${selectedReport?.id === report.id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-xs text-[var(--color-text-secondary)]">#{report.id.slice(0, 8)}</span>
                                <span className="text-[10px] text-[var(--color-text-secondary)]">{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-semibold text-sm mb-1 text-[var(--color-text-primary)]">{report.childName || "Anonymized Subject"}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <StatusBadge status={report.status} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-8 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col">
                {selectedReport ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{selectedReport.childName}</h1>
                                    <StatusBadge status={selectedReport.status} size="lg" />
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                                    <span><i className="fas fa-calendar mr-1"></i> {new Date(selectedReport.createdAt).toLocaleString()}</span>
                                    <span><i className="fas fa-map-marker-alt mr-1"></i> {selectedReport.location?.address || 'Location Hidden'}</span>
                                </div>
                            </div>
                            <button
                                onClick={generateAiSummary}
                                disabled={isSummarizing}
                                className="px-4 py-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                {isSummarizing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                                AI Analysis
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            {aiSummary && (
                                <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                    <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <i className="fas fa-robot"></i> AI Summary
                                    </h4>
                                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{aiSummary}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Incident Details</h3>
                                    <div className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] min-h-[120px]">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-primary)]">{selectedReport.description}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 border border-[var(--color-border)] rounded-xl">
                                        <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-3">Reporter Profile</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Name:</span> <span className="font-medium">{selectedReport.reporter?.name || 'Anonymous'}</span></div>
                                            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Contact:</span> <span className="font-medium">{selectedReport.reporter?.phone || 'N/A'}</span></div>
                                            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Relation:</span> <span className="font-medium">Confidential</span></div>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-[var(--color-border)] rounded-xl">
                                        <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-3">Subject Profile</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Age Est:</span> <span className="font-medium">{selectedReport.age || 'Unknown'}</span></div>
                                            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">School:</span> <span className="font-medium">Not Listed</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Media Evidence</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {[1, 2].map((_, i) => (
                                        <div key={i} className="aspect-square bg-[var(--color-bg)] rounded-xl flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                            <i className="fas fa-image text-2xl opacity-20"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Status Bar */}
                        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)] space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-medium text-[var(--color-text-secondary)]">Update Status</label>
                                    <select
                                        value={editingStatus || ''}
                                        onChange={e => setEditingStatus(e.target.value as ReportStatus)}
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        {Object.values(ReportStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-[2] space-y-2">
                                    <label className="text-xs font-medium text-[var(--color-text-secondary)]">Officer Notes</label>
                                    <input
                                        type="text"
                                        value={editingNotes}
                                        onChange={e => setEditingNotes(e.target.value)}
                                        placeholder="Add investigation notes..."
                                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleUpdate}
                                        disabled={updating}
                                        className="px-6 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] font-medium rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 h-[38px] whitespace-nowrap"
                                    >
                                        {updating ? 'Saving...' : 'Update Case'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] opacity-50 space-y-4">
                        <i className="fas fa-folder-open text-6xl"></i>
                        <p className="text-sm font-medium">Select a case file to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
