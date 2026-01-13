import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import ProtectionShield from '../components/3d/ProtectionShield';
import happyKids from '../assets/happy_kids.jpg';

const GlassCard = ({ icon, title, desc, delay }: { icon: string, title: string, desc: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 p-8 rounded-3xl hover:bg-white/60 dark:hover:bg-white/10 transition-colors group cursor-default shadow-lg shadow-blue-900/5"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <i className={`fas ${icon} text-blue-600 dark:text-blue-400 text-2xl`}></i>
    </div>
    <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-grow flex flex-col overflow-x-hidden selection:bg-blue-500/30">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col pt-20">

        {/* 1. Cinematic Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={happyKids}
            alt="Futures we protect"
            className="w-full h-full object-cover brightness-100 dark:brightness-75 grayscale-[0.1]"
          />
          {/* Theme-aware Gradients for Seamless Blend */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 lg:via-slate-50/80 to-transparent dark:from-slate-950 dark:lg:via-slate-950/90 dark:to-slate-950/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-slate-950"></div>
        </div>

        {/* 2. 3D Experience Layer (Desktop Only) */}
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full z-10 pointer-events-none lg:pointer-events-auto hidden lg:block opacity-80">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <ProtectionShield />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Suspense>
          </Canvas>
        </div>

        {/* 3. Content Layer */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 flex-1 flex flex-col justify-center w-full">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 pt-20 lg:pt-0">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-white/50 dark:bg-blue-900/20 backdrop-blur-md shadow-sm"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-blue-300">System Operational</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tighter text-slate-900 dark:text-white"
              >
                The Future <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                  Is Safe.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-medium"
              >
                The National Child Protection Authority's next-generation portal.
                <span className="block mt-2 text-slate-900 dark:text-white font-bold">Anonymous. Encrypted. Immediate.</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5 pt-4"
              >
                <Link to="/report" className="relative group overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <span className="relative z-10 flex items-center gap-3">
                    Submit Report <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </span>
                </Link>

                <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-voice-assistant'))} className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm border-2 border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all flex items-center gap-3 text-slate-900 dark:text-white hover:-translate-y-1">
                  <i className="fas fa-microphone text-blue-600 dark:text-blue-400 animate-pulse"></i> Voice Report
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-10 flex items-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <i className="fas fa-lock text-slate-600 dark:text-slate-300"></i>
                  </div>
                  <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 leading-tight">End-to-End<br />Encrypted</span>
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-white/20"></div>
                <div className="flex items-center gap-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Emblem_of_Sri_Lanka.svg" className="h-10 w-auto" alt="Gov" />
                  <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 leading-tight">Official<br />Gov. Portal</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50 pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Scroll to Explore</span>
          <i className="fas fa-chevron-down text-slate-400"></i>
        </div>
      </section>


      {/* --- FEATURES GRID (Glassmorphism) --- */}
      <section className="relative py-32 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 block">Core Infrastructure</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Speed & Safety</span></h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 mx-auto rounded-full opacity-80"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard
              delay={0.2}
              icon="fa-mask"
              title="Zero-Knowledge"
              desc="We strip all metadata from your submissions. Your identity is cryptographically protected and never stored unless you choose to reveal it."
            />
            <GlassCard
              delay={0.4}
              icon="fa-bolt"
              title="Instant Routing"
              desc="Reports are intelligently routed to the nearest available Child Protection unit within milliseconds, bypassing bureaucratic delays."
            />
            <GlassCard
              delay={0.6}
              icon="fa-fingerprint"
              title="Tamper-Proof"
              desc="Evidence is hashed and digitally signed upon capture. This ensures chain of custody and legality in court proceedings."
            />
          </div>
        </div>
      </section>

    </div>
  );
}
