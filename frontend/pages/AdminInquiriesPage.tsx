import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Admin, Inquiry } from '../types';

export default function AdminInquiriesPage({ user }: { user: Admin | null }) {
    const { theme } = useTheme();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);

    useEffect(() => {
        if (user?.token) {
            fetchInquiries();
        }
    }, [user]);

    const fetchInquiries = async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const data = await api.getInquiries(user.token);
            setInquiries(data || []);
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user?.token) return;
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            const success = await api.deleteInquiry(id, user.token);
            if (success) {
                setInquiries(inquiries.filter(i => i.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete inquiry:', error);
        }
    };

    const toggleAudio = (url: string) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const fullUrl = `${API_URL}${url}`;
        const audio = new Audio(fullUrl);
        audio.play().catch(e => console.error("Audio Play Error:", e));
    };

    return (
        <div className={`p-6 space-y-6 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Voice & Text Inquiries</h1>
                    <p className="text-slate-400 text-sm">Review incoming reports from the Voice Assistant.</p>
                </div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">
                    {inquiries.length} Total
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i></div>
            ) : (
                <div className="grid gap-4">
                    {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inquiry.is_voice ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                        <i className={`fas ${inquiry.is_voice ? 'fa-microphone-lines' : 'fa-keyboard'}`}></i>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {new Date(inquiry.created_at).toLocaleString()}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inquiry.is_voice ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                            {inquiry.is_voice ? 'Voice Report' : 'Text Inquiry'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {inquiry.is_voice && (
                                        <button
                                            onClick={() => toggleAudio(inquiry.audio_url)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <i className="fas fa-play"></i> Play Audio
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(inquiry.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Delete Inquiry"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                                {inquiry.transcription || "No transcription available."}
                            </div>
                        </div>
                    ))}

                    {inquiries.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <i className="fas fa-inbox text-4xl mb-4 opacity-50"></i>
                            <p>No inquiries found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
