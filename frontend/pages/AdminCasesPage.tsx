import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Report, ReportStatus, Admin, Inquiry } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { GoogleGenAI } from "@google/genai";
import { AnimatePresence } from 'framer-motion';
import EvidenceLocker from '../components/EvidenceLocker';

export default function AdminCasesPage({ user }: { user: Admin | null }) {
    const [viewMode, setViewMode] = useState<'CASES' | 'INQUIRIES'>('CASES');

    // Reports State
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');

    // Inquiries State
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    // Common State
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(false);

    const [editingStatus, setEditingStatus] = useState<ReportStatus | null>(null);
    const [editingNotes, setEditingNotes] = useState('');
    const [editingPriority, setEditingPriority] = useState<string>('MEDIUM');
    const [internalNote, setInternalNote] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'DETAILS' | 'TIMELINE' | 'INTERNAL'>('DETAILS');
    const [lockerSrc, setLockerSrc] = useState<string | null>(null);

    useEffect(() => {
        if (user?.token) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user?.token) return;
        setLoading(true);
        const [reportsData, inquiriesData] = await Promise.all([
            api.getAllReports(user.token),
            api.getInquiries(user.token)
        ]);

        setReports(reportsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setInquiries((inquiriesData || []).filter(i => !i.is_voice).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setLoading(false);
    };

    const handleUpdateReport = async () => {
        if (!selectedReport || !editingStatus || !user?.token) return;
        setUpdating(true);
        const success = await api.updateReport(selectedReport.id, editingStatus, editingNotes, editingPriority, user.token);
        if (success) {
            await fetchData();
            setSelectedReport(prev => prev ? {
                ...prev,
                status: editingStatus,
                adminNotes: editingNotes,
                priority: editingPriority as any,
                updatedAt: new Date().toISOString(),
                history: [...(prev.history || []), {
                    status: editingStatus,
                    officer: user.name || user.id,
                    timestamp: new Date().toISOString(),
                    note: editingNotes
                }]
            } : null);
        }
        setUpdating(false);
    };

    const handleAddInternalNote = async () => {
        if (!selectedReport || !internalNote || !user?.token) return;
        setUpdating(true);
        const success = await api.addInternalNote(selectedReport.id, internalNote, user.token);
        if (success) {
            setInternalNote('');
            const updatedReport = await api.getReportStatus(selectedReport.id);
            if (updatedReport) setSelectedReport(updatedReport);
        }
        setUpdating(false);
    };

    const handleDeleteInquiry = async (id: string) => {
        if (!user?.token || !window.confirm('Delete this inquiry?')) return;
        const success = await api.deleteInquiry(id, user.token);
        if (success) {
            setInquiries(prev => prev.filter(i => i.id !== id));
            if (selectedInquiry?.id === id) setSelectedInquiry(null);
        }
    };

    const generateAiSummary = async () => {
        if (!selectedReport) return;
        setIsSummarizing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Analyze the following child harassment report.Status: ${selectedReport.status}. 
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

    const filteredInquiries = inquiries.filter(inq =>
        inq.name?.toLowerCase().includes(search.toLowerCase()) ||
        inq.email?.toLowerCase().includes(search.toLowerCase()) ||
        inq.department?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-12 text-center text-slate-400">Loading data...</div>;

    return (
        <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List Sidebar */}
            <div className="lg:col-span-4 flex flex-col bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden h-full">
                <div className="p-4 border-b border-[var(--color-border)] space-y-4 bg-[var(--color-surface)] z-10">

                    {/* Modern Glass View Switcher */}
                    <div className="flex bg-[var(--color-bg)] p-1 rounded-xl border border-[var(--color-border)] overflow-hidden relative">
                        <button
                            onClick={() => setViewMode('CASES')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${viewMode === 'CASES' ? 'bg-[var(--color-surface)] shadow-sm text-blue-600' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/50'} `}
                        >
                            <i className="fas fa-folder-open"></i> Cases
                        </button>
                        <button
                            onClick={() => setViewMode('INQUIRIES')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${viewMode === 'INQUIRIES' ? 'bg-[var(--color-surface)] shadow-sm text-emerald-600' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]/50'} `}
                        >
                            <i className="fas fa-envelope-open-text"></i> Inquiries
                        </button>
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <i className="fas fa-search absolute left-3 text-[var(--color-text-secondary)] text-sm"></i>
                        <input
                            type="text"
                            placeholder={viewMode === 'CASES' ? "Search by name or ID..." : "Search by name, email..."}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-[var(--color-text-secondary)]/50"
                        />
                        {viewMode === 'CASES' && (
                            <button
                                onClick={() => import('../utils/export').then(mod => mod.exportToCSV(filteredReports, 'case_files'))}
                                className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-secondary)] hover:text-blue-600 hover:border-blue-500 transition-all font-medium"
                                title="Export CSV"
                            >
                                <i className="fas fa-file-csv"></i>
                            </button>
                        )}
                    </div>

                    {viewMode === 'CASES' && (
                        <div className="relative">
                            <i className="fas fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-xs"></i>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer text-[var(--color-text-primary)]"
                            >
                                <option value="ALL">All Statuses</option>
                                {Object.values(ReportStatus).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-xs pointer-events-none"></i>
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto">
                    {viewMode === 'CASES' ? (
                        <div className="divide-y divide-[var(--color-border)]">
                            {filteredReports.map(report => (
                                <button
                                    key={report.id}
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setEditingStatus(report.status);
                                        setEditingNotes(report.adminNotes || '');
                                        setEditingPriority(report.priority || 'MEDIUM');
                                        setAiSummary(null);
                                    }}
                                    className={`w-full text-left p-4 hover:bg-[var(--color-bg)] transition-all group ${selectedReport?.id === report.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''} `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${selectedReport?.id === report.id ? 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/40'} `}>
                                            {report.childName ? report.childName.charAt(0).toUpperCase() : '#'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-semibold text-sm truncate ${selectedReport?.id === report.id ? 'text-blue-700 dark:text-blue-300' : 'text-[var(--color-text-primary)]'} `}>
                                                    {report.childName || "Anonymized Subject"}
                                                </h4>
                                                <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0">{new Date(report.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">ID: {report.id.slice(0, 8)}</span>
                                            </div>
                                            <StatusBadge status={report.status} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--color-border)]">
                            {filteredInquiries.map(inq => (
                                <button
                                    key={inq.id}
                                    onClick={() => setSelectedInquiry(inq)}
                                    className={`w-full text-left p-4 hover:bg-[var(--color-bg)] transition-all group ${selectedInquiry?.id === inq.id ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''} `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${selectedInquiry?.id === inq.id ? 'bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/40'} `}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-semibold text-sm truncate ${selectedInquiry?.id === inq.id ? 'text-emerald-700 dark:text-emerald-300' : 'text-[var(--color-text-primary)]'} `}>
                                                    {inq.name || "Anonymous"}
                                                </h4>
                                                <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0">{new Date(inq.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-[var(--color-text-secondary)] truncate mb-2">{inq.email}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 uppercase tracking-wide">
                                                    {inq.department}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-8 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col">
                {viewMode === 'CASES' ? (
                    selectedReport ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{selectedReport.childName}</h1>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={selectedReport.status} size="lg" />
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedReport.priority === 'HIGH' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                                                    selectedReport.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                                        'bg-blue-100 text-blue-600 border border-blue-200'
                                                } `}>
                                                {selectedReport.priority || 'MEDIUM'}
                                            </span>
                                        </div>
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

                            {/* Detail Tabs */}
                            <div className="flex px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/30">
                                {(['DETAILS', 'TIMELINE', 'INTERNAL'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveDetailTab(tab)}
                                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeDetailTab === tab
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                            } `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-grow overflow-y-auto p-8 space-y-8">
                                {aiSummary && activeDetailTab === 'DETAILS' && (
                                    <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                        <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <i className="fas fa-robot"></i> AI Summary
                                        </h4>
                                        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{aiSummary}</p>
                                    </div>
                                )}

                                {activeDetailTab === 'TIMELINE' && (
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Case History</h3>
                                        <div className="space-y-4">
                                            {(selectedReport.history || []).map((update, i) => (
                                                <div key={i} className="flex gap-4 relative">
                                                    {i !== (selectedReport.history?.length || 0) - 1 && (
                                                        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>
                                                    )}
                                                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] z-10 ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                        } `}>
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                    <div className="flex-1 pb-6">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-sm font-bold text-[var(--color-text-primary)]">Status changed to {update.status}</span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)]">{new Date(update.timestamp).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--color-text-secondary)] font-medium">Officer: {update.officer}</p>
                                                        {update.note && (
                                                            <p className="mt-2 text-xs italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                                "{update.note}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!selectedReport.history || selectedReport.history.length === 0) && (
                                                <div className="text-center py-10 opacity-50">
                                                    <p className="text-sm font-medium">No history recorded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeDetailTab === 'INTERNAL' && (
                                    <div className="space-y-6 h-full flex flex-col">
                                        <div className="flex-grow space-y-4">
                                            {(selectedReport.internalNotes || []).map((note, i) => (
                                                <div key={i} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-500 tracking-widest">{note.author}</span>
                                                        <span className="text-[9px] text-amber-600/60">{new Date(note.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{note.text}</p>
                                                </div>
                                            ))}
                                            {(!selectedReport.internalNotes || selectedReport.internalNotes.length === 0) && (
                                                <div className="text-center py-10 opacity-50 flex-grow">
                                                    <p className="text-sm font-medium">No internal notes for this case</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                            <input
                                                type="text"
                                                value={internalNote}
                                                onChange={e => setInternalNote(e.target.value)}
                                                placeholder="Add private officer note..."
                                                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                                            />
                                            <button
                                                onClick={handleAddInternalNote}
                                                disabled={updating || !internalNote}
                                                className="px-6 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition-all disabled:opacity-50"
                                            >
                                                Add Note
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeDetailTab === 'DETAILS' && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
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
                                                {(selectedReport.evidence || []).length > 0 ? (
                                                    selectedReport.evidence.map((src, i) => (
                                                        <div key={i} className="aspect-square bg-[var(--color-bg)] rounded-xl relative group overflow-hidden border border-[var(--color-border)]">
                                                            <img src={src} alt="Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => setLockerSrc(src)}
                                                                    className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg text-white hover:bg-white/40 flex items-center justify-center transition-all hover:scale-110"
                                                                    title="View Securely"
                                                                >
                                                                    <i className="fas fa-eye text-sm"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => setLockerSrc(src)}
                                                                    className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg text-white hover:bg-white/40 flex items-center justify-center transition-all hover:scale-110"
                                                                    title="Apply Redaction"
                                                                >
                                                                    <i className="fas fa-shield-halved text-sm"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    [1, 2].map((_, i) => (
                                                        <div key={i} className="aspect-square bg-[var(--color-bg)] rounded-xl flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                                            <i className="fas fa-image text-2xl opacity-20"></i>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
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
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-medium text-[var(--color-text-secondary)]">AI Priority Override</label>
                                        <select
                                            value={editingPriority}
                                            onChange={e => setEditingPriority(e.target.value)}
                                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-sm focus:ring-2 focus:ring-rose-500/20"
                                        >
                                            <option value="LOW">LOW</option>
                                            <option value="MEDIUM">MEDIUM</option>
                                            <option value="HIGH">HIGH</option>
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
                                            onClick={handleUpdateReport}
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
                    )
                ) : (
                    // INQUIRY VIEW
                    selectedInquiry ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">{selectedInquiry.department} Inquiry</span>
                                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{selectedInquiry.name}</h1>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{selectedInquiry.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="flex-grow p-8">
                                <div className="p-6 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] font-mono text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-primary)]">
                                    {selectedInquiry.message}
                                </div>
                            </div>
                            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
                                <a href={`mailto:${selectedInquiry.email} `} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors">
                                    <i className="fas fa-reply"></i> Reply via Email
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] opacity-50 space-y-4">
                            <i className="fas fa-envelope-open text-6xl"></i>
                            <p className="text-sm font-medium">Select an inquiry to read</p>
                        </div>
                    )
                )}
            </div>

            <AnimatePresence>
                {lockerSrc && (
                    <EvidenceLocker
                        src={lockerSrc}
                        onClose={() => setLockerSrc(null)}
                        onSave={(blob) => {
                            console.log('Regacted blob ready:', blob);
                            setLockerSrc(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
