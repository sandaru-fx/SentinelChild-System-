import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import heroBg from '../hero_bg.png';

const FeatureCard = ({ icon, title, description, to, onClick, highlight = false }: {
  icon: string;
  title: string;
  description: string;
  to?: string;
  onClick?: () => void;
  highlight?: boolean;
}) => {
  const content = (
    <div className={`h-full p-8 rounded-xl border transition-all duration-300 group relative text-left w-full
      ${highlight
        ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-900/20'
        : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
      }`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-xl transition-transform duration-300 group-hover:scale-110
         ${highlight ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className={`text-lg font-bold mb-3 ${highlight ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${highlight ? 'text-blue-100' : 'text-slate-600'}`}>{description}</p>

      {!highlight && (
        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          Access Portal <i className="fas fa-arrow-right"></i>
        </div>
      )}
    </div>
  );

  if (to) return <Link to={to} className="block h-full">{content}</Link>;
  return <button onClick={onClick} className="block h-full w-full">{content}</button>;
};

export default function LandingPage() {
  const { t } = useTranslation();

  const triggerVoiceAssistant = () => {
    window.dispatchEvent(new CustomEvent('toggle-voice-assistant'));
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* 1. Official Ribbon (30% Color - Navy/Dark) */}
      <div className="bg-slate-900 text-slate-300 py-3 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Emblem_of_Sri_Lanka.svg" alt="Emblem" className="h-6 w-auto opacity-80" />
            <span>Government of Sri Lanka Official Portal</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-2"><i className="fas fa-lock text-emerald-500"></i> Secure Connection</span>
            <span className="flex items-center gap-2"><i className="fas fa-clock text-blue-500"></i> 24/7 Monitoring</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section with Trust Image */}
      <section className="relative bg-slate-900 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Child Protection" className="w-full h-full object-cover opacity-60" />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-900/60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-600/30 text-blue-200 border border-blue-500/50 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm">
              <i className="fas fa-shield-halved"></i> National Child Protection Authority
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Protecting Children <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Empowering Citizens</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-xl leading-relaxed font-medium">
              The Child Harassment & Abuse Reporting System (CHARS) provides a secure, anonymous bridge to justice. Every report is investigated.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Primary Action (10% Color - Red/Action) */}
              <Link to="/report" className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-3">
                <i className="fas fa-exclamation-circle"></i> Submit Report
              </Link>

              {/* Secondary Action (30% Color - Blue/Neutral) */}
              <Link to="/status" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all backdrop-blur-sm flex items-center justify-center gap-3">
                <i className="fas fa-search"></i> Track Status
              </Link>
            </div>
          </div>

          {/* Hero Card/Stats - Optional "Trust" Element */}
          <div className="hidden lg:block">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md ml-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <h4 className="text-white font-bold">System Operational</h4>
                  <p className="text-slate-400 text-xs">Duty Officers Online</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Response Time</span>
                    <span className="text-emerald-400 font-bold">&lt; 15 Mins</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-emerald-500"></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Action Rate</span>
                    <span className="text-blue-400 font-bold">98.2%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-blue-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section (60% Color - White/Clean) */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Core Safety Infrastructure</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Built on military-grade encryption protocols to ensure reporter safety and data integrity.</p>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="fa-user-secret"
            title="Anonymous Reporting"
            description="Submit reports without revealing your identity. We use advanced metadata scrubbing to protect your digital footprint."
            to="/report"
          />
          <FeatureCard
            icon="fa-microphone-lines"
            title="Voice Assistant"
            description="Accessibility-first design allows for voice-guided reporting for faster intake during emergencies."
            onClick={triggerVoiceAssistant}
            highlight={true}
          />
          <FeatureCard
            icon="fa-shield-cat" // Changed icon for variety
            title="End-to-End Encryption"
            description="All data is encrypted in transit and at rest using AES-256 standards. Only authorized officers hold the decryption keys."
            to="/about"
          />
        </div>
      </section>

      {/* 4. Action Banner (Blue/Red Context) */}
      <section className="bg-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center px-6">
          <i className="fas fa-triangle-exclamation text-amber-500 text-4xl mb-6"></i>
          <h2 className="text-2xl font-bold mb-4">Is a child in immediate danger?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            This portal is for reporting incidents for investigation. If there is an ongoing emergency or life-threatening situation, do not use this website.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:119" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2">
              <i className="fas fa-phone"></i> Call 119
            </a>
            <a href="tel:1929" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2">
              <i className="fas fa-phone"></i> Call 1929 (Child Line)
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
