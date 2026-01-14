import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';

export default function PrivacyPage() {
    const { t, language } = useTranslation();
    const [privacyContent, setPrivacyContent] = useState('');
    const [legalContent, setLegalContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const [privacy, legal] = await Promise.all([
                    api.getSetting('privacy_policy', language),
                    api.getSetting('legal_text', language)
                ]);
                setPrivacyContent(privacy?.value || '');
                setLegalContent(legal?.value || '');
            } catch (error) {
                console.error('Error fetching policies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [language]);

    return (
        <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto space-y-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30 text-[10px] font-black uppercase tracking-widest"
                >
                    Legal & Security Framework
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                    Your Safety. <br /> <span className="text-slate-300 dark:text-slate-700">Legally Protected.</span>
                </h1>
            </div>

            {loading ? (
                <div className="space-y-12">
                    <div className="h-64 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-[3rem]"></div>
                    <div className="h-64 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-[3rem]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {/* Privacy Section */}
                    {privacyContent ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 shadow-sm">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                                <span className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-lg">
                                    <i className="fas fa-user-shield"></i>
                                </span>
                                Privacy Policy
                            </h2>
                            <div
                                className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: privacyContent }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                            <p className="text-slate-400 font-black uppercase tracking-widest">Privacy Policy not yet configured</p>
                        </div>
                    )}

                    {/* Legal Section */}
                    {legalContent && (
                        <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                                <span className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 text-lg">
                                    <i className="fas fa-file-contract"></i>
                                </span>
                                Legal Framework & Terms
                            </h2>
                            <div
                                className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: legalContent }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
