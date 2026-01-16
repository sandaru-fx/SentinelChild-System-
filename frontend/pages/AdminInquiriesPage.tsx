import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Admin, Inquiry } from '../types';
import { InquiryReport } from '../components/admin/InquiryReport';
import { SlideOver } from '../components/admin/SlideOver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AdminInquiriesPage({ user }: { user: Admin | null }) {
    const { theme } = useTheme();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

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
            setInquiries((data || []).filter(i => i.is_voice));
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

    const handleDownloadPDF = async () => {
        if (!selectedInquiry) return;

        console.log("📄 Starting PDF Generation for:", selectedInquiry.id);
        setIsDownloading(true);

        try {
            // Small delay to ensure DOM is ready and styled
            await new Promise(resolve => setTimeout(resolve, 500));

            const reportElement = document.getElementById(`report-${selectedInquiry.id}`);
            if (!reportElement) {
                console.error("❌ Report element not found ID:", `report-${selectedInquiry.id}`);
                throw new Error("Report element not found");
            }

            const canvas = await html2canvas(reportElement, {
                scale: 1.5, // Reduced from 2 for better memory handling
                useCORS: true,
                logging: true, // Enable logging for debugging
                backgroundColor: '#ffffff',
                allowTaint: true,
                onclone: (doc) => {
                    // Ensure the cloned document has the report visible
                    const el = doc.getElementById(`report-${selectedInquiry.id}`);
                    if (el) el.style.display = 'block';
                }
            });

            console.log("✅ Canvas generated successfully");
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Intelligence_Report_${selectedInquiry.id.slice(-8).toUpperCase()}.pdf`);
            console.log("📂 PDF Saved!");
        } catch (error) {
            console.error('PDF Generation Error Detail:', error);
            alert('Failed to generate PDF. Machan, try again in a second or check if the report is fully loaded.');
        } finally {
            setIsDownloading(false);
        }
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
                                        <i className={`fas ${inquiry.is_voice ? 'fa-microphone-lines' : 'fa-envelope-open-text'}`}></i>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {inquiry.name && <span className="text-sm font-bold text-slate-700 dark:text-white">{inquiry.name}</span>}
                                            {inquiry.department && <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-2 rounded-full border border-blue-100">{inquiry.department}</span>}
                                        </div>
                                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                            {new Date(inquiry.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {inquiry.is_voice && (
                                        <button
                                            onClick={() => toggleAudio(inquiry.audio_url || '')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <i className="fas fa-play"></i> Play Audio
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedInquiry(inquiry)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                    >
                                        <i className="fas fa-file-invoice text-blue-500"></i> View Intelligence
                                    </button>
                                    <button
                                        onClick={() => handleDelete(inquiry.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Delete Inquiry"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                                    {inquiry.transcription || inquiry.message || "No content available."}
                                </div>

                                {!inquiry.is_voice && inquiry.email && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <i className="fas fa-reply"></i>
                                        <span>Reply to: <a href={`mailto:${inquiry.email}`} className="text-blue-500 hover:underline">{inquiry.email}</a></span>
                                    </div>
                                )}
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

            {/* Intelligence Report Modal */}
            <SlideOver
                isOpen={!!selectedInquiry}
                onClose={() => setSelectedInquiry(null)}
                title="Intelligence Case Report"
            >
                {selectedInquiry && (
                    <div className="space-y-6">
                        <div className="flex justify-end gap-3 mb-4">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                                ) : (
                                    <><i className="fas fa-download"></i> Download PDF</>
                                )}
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                            >
                                <i className="fas fa-print"></i> Print Official Report
                            </button>
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <InquiryReport inquiry={selectedInquiry} />
                        </div>
                    </div>
                )}
            </SlideOver>
        </div>
    );
}
