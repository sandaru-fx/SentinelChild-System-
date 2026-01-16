import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';
import { Resource, ResourceType } from '../types';
import {
    Clock,
    ArrowRight,
    ChevronDown
} from 'lucide-react';

const EducationCard = ({ resource, delay }: { resource: Resource, delay: number }) => {
    // Determine the image path based on the icon field or a default
    const imagePath = resource.icon || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6, ease: "easeOut" }}
            onClick={() => resource.link && window.open(resource.link, '_blank')}
            className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden group 
                       hover:bg-white dark:hover:bg-slate-900 
                       hover:border-blue-400/50 dark:hover:border-blue-500/50
                       hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] transition-all duration-500 cursor-pointer h-full flex flex-col relative"
        >
            <div className="h-56 overflow-hidden relative">
                <img
                    src={imagePath.replace('/frontend', '')}
                    alt={resource.title}
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute top-6 right-6 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/20">
                    {resource.type}
                </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
                <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
                    {resource.category}
                </span>
                <h3 className="text-slate-900 dark:text-white font-bold text-xl leading-tight mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {resource.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {resource.description}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{resource.readTime || '5 Min Read'}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const FAQItem = ({ faq, index }: { faq: Resource, index: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ${isOpen ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex items-center justify-between text-left group"
            >
                <div className="flex items-center gap-6">
                    <span className="text-slate-300 dark:text-slate-700 font-black text-2xl tracking-tighter w-8">
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {faq.title}
                    </h4>
                </div>
                <div className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all duration-500 ${isOpen ? 'rotate-180 bg-blue-600 border-blue-600 text-white' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8 pl-14 pr-12">
                            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                                {faq.content}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function EducationPage() {
    const { t, language } = useTranslation();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const data = await api.getResources(language);
                setResources(data);
            } catch (error) {
                console.error('Error fetching resources:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [language]);

    const articles = resources.filter(r => r.type === ResourceType.ARTICLE);
    const faqs = resources.filter(r => r.type === ResourceType.FAQ);

    return (
        <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto space-y-32">
            {/* Header Section */}
            <div className="relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row justify-between items-end gap-12"
                >
                    <div className="space-y-6 max-w-3xl">
                        <span className="inline-block px-4 py-1.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-600/20">
                            Knowledge Hub
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.85]">
                            Knowledge <br />
                            <span className="text-transparent border-text-stroke-blue dark:border-text-stroke-white opacity-20">Is Your</span> <br />
                            Shield.
                        </h1>
                        <p className="border-l-4 border-blue-600 pl-8 text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                            Explore our curated list of professional guides and resources designed to empower children, parents, and educators.
                        </p>
                    </div>

                    <div className="lg:pb-12 text-right">
                        <div className="flex items-center justify-end gap-4 mb-8">
                            <div className="h-0.5 w-12 bg-blue-600"></div>
                            <span className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs">Official Guides</span>
                        </div>
                        <p className="text-slate-400 text-sm font-bold max-w-[240px] ml-auto">
                            Verified by law enforcement and child safety professionals.
                        </p>
                    </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
            </div>

            {/* Articles Grid */}
            <section className="space-y-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
                        Latest Articles
                    </h2>
                    <div className="h-px flex-grow mx-8 bg-slate-100 dark:bg-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]"></div>
                        ))
                    ) : articles.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No articles found in {language.toUpperCase()}</p>
                        </div>
                    ) : (
                        articles.map((resource, index) => (
                            <EducationCard
                                key={resource.id}
                                resource={resource}
                                delay={index * 0.1}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-slate-950 dark:bg-white rounded-[4rem] p-12 md:p-24 text-white dark:text-slate-900 overflow-hidden relative">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4 space-y-8">
                        <div className="space-y-3">
                            <span className="text-blue-500 font-black uppercase tracking-widest text-[10px]">Information</span>
                            <h2 className="text-5xl font-black tracking-tighter leading-none italic">Common <br /> Questions.</h2>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed">
                            Find quick answers to common concerns about child safety, the reporting process, and how our system protects you.
                        </p>
                        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105">
                            Submit a Question
                        </button>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="divide-y divide-slate-800 dark:divide-slate-200">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="h-20 bg-slate-800/50 dark:bg-slate-100/50 animate-pulse my-4 rounded-xl"></div>
                                ))
                            ) : faqs.length === 0 ? (
                                <p className="text-slate-500 py-10 italic">No FAQs available yet.</p>
                            ) : (
                                faqs.map((faq, index) => (
                                    <FAQItem key={faq.id} faq={faq} index={index} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative blur */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            </section>

            {/* Support CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-16 text-white text-center space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic">Still need help?</h2>
                    <p className="text-blue-100 text-lg font-medium">
                        Our AI Voice Guardian and human support team are available 24/7 to guide you and provide safety assistance.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <button className="px-10 py-5 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-blue-900/20">
                            Start Live Chat
                        </button>
                        <button className="px-10 py-5 bg-blue-500 text-white border border-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all">
                            Emergency Hotlines
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
