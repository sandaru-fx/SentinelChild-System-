import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import bannerImage from '../assets/banner_child.png';

const GlassCard = ({ icon, title, desc, delay }: { icon: string, title: string, desc: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="backdrop-blur-2xl bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-white/10 p-8 rounded-[2.5rem] hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all group cursor-default shadow-2xl shadow-blue-900/5 ring-1 ring-white/20"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
      <i className={`fas ${icon} text-blue-600 dark:text-blue-400 text-2xl`}></i>
    </div>
    <h3 className="text-slate-900 dark:text-white font-black text-xl mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-grow flex flex-col overflow-x-hidden selection:bg-blue-500/30">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">

        {/* 1. Background Layer (Blurred Image) */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: `url(${bannerImage})`, filter: 'blur(20px) brightness(0.9)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white/40 to-white dark:from-slate-950/90 dark:via-slate-950/60 dark:to-slate-950"></div>
        </div>

        {/* 2. Content Layer (60/40 Split) */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 flex-1 flex flex-col justify-center w-full">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-center">

            {/* Left Content (60%) */}
            <div className="lg:col-span-6 space-y-8 py-20 lg:py-0">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-white/50 dark:bg-blue-900/20 backdrop-blur-md shadow-sm ring-1 ring-blue-500/10"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-blue-300">System Operational • Secured</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-7xl lg:text-[85px] font-black leading-tight tracking-tighter text-slate-900 dark:text-white"
              >
                The Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 drop-shadow-sm">Is Safe.</span>
                <div className="text-3xl sm:text-4xl lg:text-[45px] mt-2 opacity-90 leading-tight">
                  <span className="text-slate-400 dark:text-slate-500 font-black italic">Your Voice, </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-black">Their Shield.</span>
                </div>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-bold"
              >
                The National Child Protection Authority's official portal.
                <span className="block mt-4 p-4 border-l-4 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-xl italic font-black text-slate-800 dark:text-blue-100">
                  "Protecting our most precious assets with anonymous, encrypted, and immediate action."
                </span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5 pt-8"
              >
                <Link to="/report" className="relative group overflow-hidden bg-slate-950 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/20 hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-500">
                  <span className="relative z-10 flex items-center gap-3">
                    Submit Official Report <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>

                <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-voice-assistant'))} className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all flex items-center gap-3 text-slate-900 dark:text-white hover:-translate-y-1 ring-1 ring-white/40">
                  <i className="fas fa-microphone text-blue-600 dark:text-blue-400 animate-pulse"></i> Voice Reporting
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-12 flex items-center gap-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
                    <i className="fas fa-shield-check text-blue-600"></i>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 leading-tight tracking-widest">End-to-End<br />Encrypted</span>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-white/10"></div>
                <div className="flex items-center gap-4">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Emblem_of_Sri_Lanka.svg" className="h-12 w-auto drop-shadow-md" alt="Gov" />
                  <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 leading-tight tracking-widest">Official<br />Gov. Portal</span>
                </div>
              </motion.div>
            </div>

            {/* Right Focal Image (40%) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="lg:col-span-4 relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                <img
                  src={bannerImage}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  alt="Child Safety"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="backdrop-blur-md bg-white/20 border border-white/30 p-4 rounded-2xl">
                    <p className="text-white text-xs font-black uppercase tracking-widest text-center">
                      Our Mission: Absolute Protection
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-30 pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Explore Portal</span>
          <i className="fas fa-chevron-down text-slate-400"></i>
        </div>
      </section>


      {/* --- FEATURES GRID --- */}
      <section className="relative py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] block">Global Standard Security</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">
              Built for <span className="text-slate-300 dark:text-slate-700">Speed & Absolute Privacy.</span>
            </h2>
            <div className="w-24 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard
              delay={0.2}
              icon="fa-shield-slash"
              title="Identity Shielding"
              desc="Our servers automatically strip metadata from evidence. Your location and device identity are never exposed to unauthorized personnel."
            />
            <GlassCard
              delay={0.4}
              icon="fa-microchip"
              title="Smart AI Routing"
              desc="Reports are analyzed and routed to the nearest available Child Protection unit in real-time, ensuring intervention happens within hours, not days."
            />
            <GlassCard
              delay={0.6}
              icon="fa-fingerprint"
              title="Forensic Integrity"
              desc="Uploaded evidence is cryptographically signed upon entry. This ensures the chain of custody is indisputable in a court of law."
            />
          </div>
        </div>
      </section>

    </div>
  );
}
