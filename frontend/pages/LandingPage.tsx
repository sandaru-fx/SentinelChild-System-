import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import ProtectionShield from '../components/3d/ProtectionShield';
import happyKids from '../assets/happy_kids.jpg'; // Ensure this matches exactly

const GlassCard = ({ icon, title, desc, delay }: { icon: string, title: string, desc: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="backdrop-blur-xl bg-white/20 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl hover:bg-white/30 dark:hover:bg-white/10 transition-colors group cursor-default shadow-sm dark:shadow-none"
  >
    <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <i className={`fas ${icon} text-blue-600 dark:text-blue-400 text-xl`}></i>
    </div>
    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{title}</h3>
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
            className="w-full h-full object-cover brightness-110 contrast-110 grayscale-[0.2]"
          />
          {/* Theme-aware Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-slate-950 from-0% via-slate-50/90 dark:via-slate-950/80 via-30% to-transparent to-60%"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent"></div>
        </div>

        {/* 2. 3D Experience Layer (Desktop Only) */}
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full z-10 pointer-events-none lg:pointer-events-auto hidden lg:block opacity-60">
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
            <div className="space-y-8 pt-10 lg:pt-0">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">System Operational</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-slate-900 dark:text-white"
              >
                The Future <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">
                  Is Protected.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl border-l-2 border-blue-500/50 pl-6"
              >
                The National Child Protection Authority's next-generation reporting system.
                Safe. Anonymous. Immediate.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/report" className="relative group overflow-hidden bg-red-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all">
                  <span className="relative z-10 flex items-center gap-3">
                    Make a Report <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </span>
                  <div className="absolute inset-0 bg-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </Link>

                <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-voice-assistant'))} className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm transition-all flex items-center gap-3 text-slate-900 dark:text-white">
                  <i className="fas fa-microphone text-blue-600 dark:text-blue-400"></i> Voice Assist
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-8 flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl"><i className="fas fa-shield-check"></i></span>
                  <span className="text-xs font-bold uppercase leading-none">End-to-End<br />Encrypted</span>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Emblem_of_Sri_Lanka.svg" className="h-8 w-auto" alt="Gov" />
                  <span className="text-xs font-bold uppercase leading-none">Official<br />Gov. Portal</span>
                </div>
              </motion.div>
            </div>

            {/* Right Side spacer for 3D element mobile visibility or just empty space */}
            <div className="hidden lg:block"></div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>


      {/* --- FEATURES GRID (Glassmorphism) --- */}
      <section className="relative py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-blue-600 dark:text-blue-500 font-bold uppercase tracking-widest text-xs">Core Infrastructure</span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 mb-6 text-slate-900 dark:text-white">Designed for <span className="text-blue-600 dark:text-white">Speed & Safety</span></h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard
              delay={0.2}
              icon="fa-mask"
              title="Total Anonymity"
              desc="Our zero-knowledge architecture ensures your identity remains hidden. We strip all metadata from submissions."
            />
            <GlassCard
              delay={0.4}
              icon="fa-bolt"
              title="Real-Time Response"
              desc="Reports are routed instantly to the nearest dedicated child protection unit. No paperwork delays."
            />
            <GlassCard
              delay={0.6}
              icon="fa-fingerprint"
              title="Secure Evidence"
              desc="Photos and audio recordings are encrypted on-device before transmission. Tamper-proof evidence logging."
            />
          </div>
        </div>
      </section>

    </div>
  );
}
