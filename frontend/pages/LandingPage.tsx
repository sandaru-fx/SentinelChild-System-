
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { imageService } from '../services/imageService';

const FeatureCard = ({ icon, title, description, color, hoverBorder, hoverRing, onClick, to }: { 
  icon: string; 
  title: string; 
  description: string; 
  color: string; 
  hoverBorder: string; 
  hoverRing: string;
  onClick?: () => void;
  to?: string;
}) => {
  const content = (
    <div className={`h-full bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 ${hoverBorder} ${hoverRing} hover:ring-offset-8 hover:scale-[1.02] hover:-translate-y-3 transition-all duration-500 cursor-pointer group relative text-left w-full ring-1 ring-slate-900/5`}>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-8 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors uppercase text-[15px] tracking-widest">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm font-medium">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Secure Access <i className="fas fa-arrow-right"></i>
      </div>
    </div>
  );

  if (to) return <Link to={to} className="block h-full">{content}</Link>;
  return <button onClick={onClick} className="block h-full w-full">{content}</button>;
};

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const fetchBackground = async () => {
      setIsGenerating(true);
      const image = await imageService.generateHeroBackground();
      if (image) setBgImage(image);
      setIsGenerating(false);
    };
    fetchBackground();
  }, []);

  const triggerVoiceAssistant = () => {
    window.dispatchEvent(new CustomEvent('toggle-voice-assistant'));
  };

  return (
    <div className="space-y-32 pb-32 overflow-x-hidden">
      {/* Official Gov Header */}
      <div className="bg-slate-950 text-white/60 py-2 px-4 flex justify-center items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/5">
         <div className="flex items-center gap-2"><i className="fas fa-landmark text-blue-400"></i> Government of Sri Lanka</div>
         <div className="w-1 h-1 bg-white/20 rounded-full"></div>
         <div className="flex items-center gap-2"><i className="fas fa-shield-halved text-blue-400"></i> Authorized Portal</div>
      </div>

      <section className="relative pt-24 pb-32 px-4 overflow-hidden min-h-[700px] flex items-center">
        <div 
          className="absolute top-0 left-0 w-full h-full -z-10 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: bgImage ? 0.4 : 0
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-fade-in shadow-2xl shadow-blue-500/30 border border-blue-400">
            <i className={`fas ${isGenerating ? 'fa-circle-notch fa-spin' : 'fa-certificate'}`}></i> 
            {isGenerating ? 'Initialising Secure Layers...' : 'Department of Child Protection'}
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-950 mb-10 tracking-tighter leading-[0.9] drop-shadow-sm uppercase">
            {t('heroTitle').split(',')[0]}<br/>
            <span className="text-blue-600">{t('heroTitle').split(',')[1]}</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-16 leading-relaxed font-bold">
            {t('heroDesc')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/report" className="w-full sm:w-auto bg-slate-950 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 group">
              <i className="fas fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i> Launch Report Portal
            </Link>
            <Link to="/status" className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-200 px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:border-slate-950 transition-all flex items-center justify-center gap-4">
              <i className="fas fa-search"></i> Case Verification
            </Link>
          </div>
        </div>

        {/* Floating Official Seal Decoration */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden lg:block">
           <i className="fas fa-shield-cat text-[40rem]"></i>
        </div>
      </section>

      {/* Trust/Legal Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
         <div className="space-y-10">
            <div className="space-y-4">
               <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em]">Privacy Protocol</span>
               <h2 className="text-4xl font-black text-slate-950 tracking-tight uppercase leading-tight">Your Identity is <br/>End-to-End Encrypted</h2>
            </div>
            <p className="text-slate-500 font-bold leading-relaxed">
               In accordance with the National Data Privacy Act, CHARS employs military-grade AES-256 encryption. Your report metadata is automatically scrubbed, ensuring that your courage remains confidential.
            </p>
            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <i className="fas fa-user-secret text-blue-600 text-2xl mb-4"></i>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-950 mb-2">No IP Logging</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Metadata Purge Enabled</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <i className="fas fa-fingerprint text-blue-600 text-2xl mb-4"></i>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-950 mb-2">Verified Hub</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Police Network Direct</p>
               </div>
            </div>
         </div>
         <div className="relative">
            <div className="aspect-square bg-slate-900 rounded-[4rem] p-12 flex flex-col justify-center text-white relative overflow-hidden shadow-2xl border-b-8 border-blue-600">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-8">
                  <i className="fas fa-balance-scale"></i>
               </div>
               <h3 className="text-3xl font-black mb-6 tracking-tight uppercase leading-tight">The Child's <br/>Rights Charter</h3>
               <p className="text-blue-200 font-bold mb-8 leading-relaxed italic">"Every report is a lifeline. We ensure that every submission receives a forensic review by a qualified duty officer within 60 minutes."</p>
               <div className="flex items-center gap-4 pt-8 border-t border-white/10">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black">SL</div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest">National Bureau of Protection</p>
                     <p className="text-[8px] text-white/40 uppercase font-black">Authorized Operations Center</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
           <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] mb-4">Core Safety Infrastructure</h2>
           <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon="fa-mask"
            title={t('anonymousTitle')}
            description={t('anonymousDesc')}
            color="bg-slate-900 text-white"
            hoverBorder="hover:border-slate-950"
            hoverRing="hover:ring-4 hover:ring-slate-900/10"
            to="/report"
          />
          <FeatureCard 
            icon="fa-microphone-lines"
            title={t('voiceTitle')}
            description={t('voiceDesc')}
            color="bg-blue-600 text-white"
            hoverBorder="hover:border-blue-600"
            hoverRing="hover:ring-4 hover:ring-blue-600/20"
            onClick={triggerVoiceAssistant}
          />
          <FeatureCard 
            icon="fa-vault"
            title="Evidence Vault"
            description="Forensic data is secured in a centralized national vault with biometric access protocols for officers."
            color="bg-emerald-600 text-white"
            hoverBorder="hover:border-emerald-500"
            hoverRing="hover:ring-4 hover:ring-emerald-500/20"
            to="/about"
          />
        </div>
      </section>

      {/* Final Safety Notice */}
      <section className="max-w-4xl mx-auto text-center px-4">
         <div className="bg-slate-50 p-12 rounded-[3.5rem] border-2 border-slate-100 ring-1 ring-slate-900/5">
            <i className="fas fa-circle-exclamation text-red-600 text-4xl mb-6"></i>
            <h3 className="text-xl font-black text-slate-950 mb-4 uppercase tracking-widest">Immediate Danger Notice</h3>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">
               If a child is in immediate physical danger, please do not use this portal. <br/> Call the Emergency Services Dispatch directly at <span className="text-red-600">911</span> or <span className="text-red-600">1929</span> (Sri Lanka).
            </p>
            <div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-500"></i> ISO 27001</span>
               <span className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-500"></i> SSL Secure</span>
               <span className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-500"></i> GDPR Ready</span>
            </div>
         </div>
      </section>
    </div>
  );
}
