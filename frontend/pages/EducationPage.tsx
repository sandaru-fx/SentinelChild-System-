import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';
import { Resource } from '../types';

const EducationCard = ({ resource, delay }: { resource: Resource, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        onClick={() => resource.link && window.open(resource.link, '_blank')}
        className="backdrop-blur-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.2rem] overflow-hidden group 
                   hover:bg-blue-50/50 dark:hover:bg-blue-900/10 
                   hover:border-blue-400/50 dark:hover:border-blue-500/50
                   hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer h-full flex flex-col relative"
    >
        <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative group-hover:bg-blue-600 transition-colors shrink-0">
            <i className={`fas ${resource.type === 'VIDEO' ? 'fa-play-circle' :
                resource.type === 'GUIDE' ? 'fa-book-open' : 'fa-file-alt'
                } text-4xl text-slate-300 group-hover:text-white transition-colors`}></i>
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-slate-900">
                {resource.type}
            </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {resource.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2 flex-grow">
                {resource.description}
            </p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                <span>{resource.readTime || '5 Min Read'}</span>
                <i className="fas fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
            </div>
        </div>
        {/* Interactive Blue Glow Line */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
    </motion.div>
);

export default function EducationPage() {
    const { t, language } = useTranslation();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                // Fetch resources filtered by current language
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

    return (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-slate-100 dark:border-slate-800 pb-12">
                <div className="space-y-4">
                    <span className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px]">Resource Hub</span>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                        Knowledge <br /> <span className="text-slate-300 dark:text-slate-700">Is Your Shield.</span>
                    </h1>
                </div>
                <div className="max-w-xs text-right">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed mb-6">
                        Explore our curated list of resources designed to empower children, parents, and teachers with safety knowledge.
                    </p>
                    <button className="px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all">
                        View All Resources
                    </button>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem]"></div>
                    ))
                ) : resources.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest">No resources found for this language</p>
                        <p className="text-xs text-slate-500 mt-2">Check back later or switch language</p>
                    </div>
                ) : (
                    resources.map((resource, index) => (
                        <EducationCard
                            key={resource.id}
                            resource={resource}
                            delay={index * 0.1}
                        />
                    ))
                )}
            </div>

            {/* Featured NGO Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-white overflow-hidden relative group">
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Global Outreach Partnerships
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">"We believe every child <br /> deserves a childhood."</h2>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale brightness-200">
                        <i className="fas fa-handshake-angle text-4xl"></i>
                        <i className="fas fa-people-group text-4xl"></i>
                        <i className="fas fa-globe text-4xl"></i>
                        <i className="fas fa-heart-pulse text-4xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}
