
import React from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-24 pb-32 animate-fade-in">
      <section className="pt-24 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 text-center transition-colors">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200/50 dark:border-blue-400/20">
            <i className="fas fa-bullseye"></i> Our Mission
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Mission: Zero Tolerance</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-bold leading-relaxed max-w-2xl mx-auto">
            CHARS (Child Harassment & Abuse Reporting System) was founded on a single principle: No child should ever suffer in silence. We provide the digital infrastructure for immediate justice.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12 text-left">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Forensic Lifecycle</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">How we turn anonymous data into actionable legal protection.</p>
          </div>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Submission', desc: 'Secure, encrypted intake of incident details and attachments through our web portal or voice assistant.' },
              { step: '02', title: 'AI Triage', desc: 'Gemini AI analyzes statements to prioritize high-risk cases for specialized forensic officers.' },
              { step: '03', title: 'Verification', desc: 'Authorized law enforcement units verify digital evidence and cross-reference with existing records.' },
              { step: '04', title: 'Intervention', desc: 'Rapid field response and legal intervention based on verified real-time digital briefs.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-8 group cursor-default p-8 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 hover:ring-4 hover:ring-blue-600/20 dark:hover:ring-blue-500/10 hover:ring-offset-4 dark:hover:ring-offset-slate-950 hover:-translate-y-2 transition-all duration-500 shadow-sm dark:shadow-none">
                <span className="text-5xl font-black text-blue-100 dark:text-slate-800 italic group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors duration-500 shrink-0">{item.step}</span>
                <div className="space-y-1 pt-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">{item.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl border-2 border-slate-800 hover:border-blue-500 hover:ring-8 hover:ring-blue-500/10 hover:ring-offset-8 transition-all duration-700 group">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-10"></div>

          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-2xl text-blue-400 mb-8 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <i className="fas fa-fingerprint"></i>
          </div>

          <h3 className="text-3xl font-black mb-6 tracking-tight">Our Security Pledge</h3>
          <p className="text-slate-400 font-medium leading-relaxed mb-10 text-lg italic">
            "We operate under a strict 'No-Logs' policy for anonymous reports. Your metadata, IP address, and browser fingerprint are scrubbed before any data reaches a human reviewer."
          </p>

          <div className="space-y-6">
            {[
              { icon: 'fa-check-circle', label: 'Military-Grade AES-256 Encryption' },
              { icon: 'fa-check-circle', label: 'ISO 27001 Information Security' },
              { icon: 'fa-check-circle', label: 'Biometric Authenticated Access' },
              { icon: 'fa-check-circle', label: 'GDPR & Child Data Compliance' }
            ].map((spec, i) => (
              <div key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-blue-400">
                <i className={`fas ${spec.icon} text-lg`}></i> {spec.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-12">Institutional Collaborators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 dark:opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter text-slate-900 dark:text-white">GOV.LK</div>
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter text-slate-900 dark:text-white">POLICE BUREAU</div>
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter text-slate-900 dark:text-white">UNICEF</div>
          <div className="flex items-center justify-center font-black text-2xl tracking-tighter text-slate-900 dark:text-white">NGOCouncil</div>
        </div>
      </section>
    </div>
  );
}
