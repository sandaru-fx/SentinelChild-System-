import React, { useState, useEffect } from 'react';
import {
    Save,
    X,
    Shield,
    FileText,
    Languages,
    AlertCircle,
    CheckCircle2,
    RefreshCcw,
    Globe
} from 'lucide-react';
import { api } from '../services/api';
import { Setting } from '../types';

const AdminSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'privacy' | 'legal'>('privacy');
    const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const token = localStorage.getItem('adminToken') || '';

    useEffect(() => {
        fetchSetting();
    }, [activeTab, lang]);

    const fetchSetting = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const key = activeTab === 'privacy' ? 'privacy_policy' : 'legal_text';
            const data = await api.getSetting(key, lang);
            setContent(data?.value || '');
        } catch (error) {
            console.error('Error fetching setting:', error);
            setStatus({ type: 'error', message: 'Failed to load policy content.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const key = activeTab === 'privacy' ? 'privacy_policy' : 'legal_text';
            const success = await api.updateSetting(key, content, lang, token);
            if (success) {
                setStatus({ type: 'success', message: 'Policy updated successfully!' });
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Error saving setting:', error);
            setStatus({ type: 'error', message: 'Failed to save changes.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Policy Editor</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage legal, privacy, and system-wide textual content</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'privacy'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span className="font-bold text-sm">Privacy Policy</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('legal')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'legal'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span className="font-bold text-sm">Legal Terms</span>
                    </button>

                    <div className="pt-8 space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-4">Edit Language</label>
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                            {(['en', 'si', 'ta'] as const).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${lang === l
                                            ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {activeTab === 'privacy' ? 'Privacy Policy' : 'Legal Terms'} — {lang.toUpperCase()}
                                </span>
                            </div>
                            {loading && <RefreshCcw className="w-4 h-4 text-rose-600 animate-spin" />}
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={loading || saving}
                            placeholder="Enter policy content here (HTML supported)..."
                            className="flex-1 p-6 bg-transparent outline-none resize-none font-medium text-slate-700 dark:text-slate-300 leading-relaxed disabled:opacity-50"
                        />

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {status && (
                                    <div className={`flex items-center gap-2 text-sm font-bold ${status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                        {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {status.message}
                                    </div>
                                )}
                            </div>
                            <button
                                disabled={loading || saving}
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-2 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl flex gap-4">
                        <Info className="w-6 h-6 text-blue-600 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-300">Formatting Tip</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed font-medium">
                                You can use standard HTML tags like {`<b>, <i>, <br>, <ul>, <li>`} to format your policy text. These changes will reflect immediately on the user-facing site once saved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Info = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default AdminSettingsPage;
