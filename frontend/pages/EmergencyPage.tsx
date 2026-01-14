import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';
import { Hotline } from '../types';

const EmergencyCard = ({ name, number, description, delay }: { name: string, number: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 transition-all group"
    >
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <i className="fas fa-phone-volume text-xl"></i>
            </div>
            <a
                href={`tel:${number}`}
                className="px-4 py-2 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-none"
            >
                Call Now
            </a>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight line-clamp-1">{name}</h2>
        <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mb-4 tracking-tighter">{number}</div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed line-clamp-2 italic">
            "{description}"
        </p>
    </motion.div>
);

export default function EmergencyPage() {
    const { t, language } = useTranslation();
    const [hotlines, setHotlines] = useState<Hotline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotlines = async () => {
            setLoading(true);
            try {
                const data = await api.getHotlines(language);
                setHotlines(data);
            } catch (error) {
                console.error('Error fetching hotlines:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotlines();
    }, [language]);

    return (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-20">
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-6 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-full"
                >
                    <span className="text-rose-600 dark:text-rose-400 font-black uppercase tracking-[0.3em] text-[10px]">Critical Support</span>
                </motion.div>
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                    Immediate <br /> <span className="text-slate-300 dark:text-slate-700">Assistance.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">
                    If you are in immediate danger or suspect a child is being harmed, please use the verified hotlines below.
                </p>
            </div>

            {/* Hotlines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]"></div>
                    ))
                ) : hotlines.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-lg">No emergency contacts found</p>
                        <p className="text-sm text-slate-500 mt-2">Please call local police in case of emergency</p>
                    </div>
                ) : (
                    hotlines.map((hotline, index) => (
                        <EmergencyCard
                            key={hotline.id}
                            name={hotline.name}
                            number={hotline.number}
                            description={hotline.description}
                            delay={index * 0.1}
                        />
                    ))
                )}
            </div>

            {/* Safety Guidelines */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Report Guidelines</h2>
                        <ul className="space-y-4">
                            {[
                                "Keep your location and phone charged.",
                                "Find a quiet, safe place to speak if possible.",
                                "Provide clear details about the immediate threat.",
                                "Stay on the line until the operator confirms help is on the way."
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4 items-start text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-slate-900 dark:text-white font-black">
                                        {i + 1}
                                    </div>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-[2rem] h-64 flex items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div>
                            <i className="fas fa-map-location-dot text-4xl text-slate-300 mb-4"></i>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Regional Station Map Integration (Optional Focus Area)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
