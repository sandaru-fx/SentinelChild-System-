
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function OnboardingModal() {
  const { t, language, setLanguage } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(-1); // -1 is the language selection step

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('chars_onboarded');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const slides = [
    {
      title: t('privacyTitle'),
      desc: t('privacyDesc'),
      icon: 'fa-shield-halved',
      color: 'text-blue-600 bg-blue-50',
      frame: 'ring-blue-600/20'
    },
    {
      title: t('voiceGuardianTitle'),
      desc: t('voiceGuardianDesc'),
      icon: 'fa-microphone-lines',
      color: 'text-indigo-600 bg-indigo-50',
      frame: 'ring-indigo-600/20'
    },
    {
      title: t('vaultTitle'),
      desc: t('vaultDesc'),
      icon: 'fa-vault',
      color: 'text-emerald-600 bg-emerald-50',
      frame: 'ring-emerald-600/20'
    },
    {
      title: t('trackingTitle'),
      desc: t('trackingDesc'),
      icon: 'fa-magnifying-glass-location',
      color: 'text-slate-600 bg-slate-50',
      frame: 'ring-slate-600/20'
    }
  ];

  const handleFinish = () => {
    localStorage.setItem('chars_onboarded', 'true');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const selectLanguage = (lang: 'en' | 'si') => {
    setLanguage(lang);
    setStep(0);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"></div>
      
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-slide-up border border-white/20">
        
        {step === -1 ? (
          <div className="p-12 text-center space-y-10">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto shadow-xl shadow-blue-200">
                <i className="fas fa-shield-child"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Choose Language</h2>
              <p className="text-slate-500 font-bold">භාෂාව තෝරන්න • Select your preferred language to begin.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button 
                onClick={() => selectLanguage('en')}
                className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-blue-600 hover:ring-4 hover:ring-blue-600/10 hover:ring-offset-8 transition-all duration-500 bg-slate-50/50"
              >
                <span className="block text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">English</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Default</span>
              </button>
              <button 
                onClick={() => selectLanguage('si')}
                className="group p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-emerald-500 hover:ring-4 hover:ring-emerald-500/10 hover:ring-offset-8 transition-all duration-500 bg-slate-50/50"
              >
                <span className="block text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">සිංහල</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">දේශීය භාෂාව</span>
              </button>
            </div>
            
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
              Secure Official Portal • Government of Sri Lanka
            </p>
          </div>
        ) : (
          <div className="p-12 text-center space-y-8">
            <div className="flex justify-center">
               <div className={`w-24 h-24 ${slides[step].color} rounded-[2rem] flex items-center justify-center text-4xl transition-all duration-500 ring-4 ring-offset-8 ${slides[step].frame}`}>
                 <i className={`fas ${slides[step].icon}`}></i>
               </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight transition-all duration-300">
                {slides[step].title}
              </h2>
              <p className="text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">
                {slides[step].desc}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {slides.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}></div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                {step === slides.length - 1 ? t('getStarted') : t('next')}
              </button>
              <button 
                onClick={handleFinish}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Skip System Tour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
