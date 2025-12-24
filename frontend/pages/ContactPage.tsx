
import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';

export default function ContactPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !formMessage) return;

    setIsSubmitting(true);
    const result = await api.sendInquiry({
      category: selectedCategory,
      email: formEmail,
      location: formLocation,
      message: formMessage
    });

    if (result.success) {
      setIsSuccess(true);
      setFormEmail('');
      setFormLocation('');
      setFormMessage('');
      setTimeout(() => setSelectedCategory(null), 3000);
    } else {
      alert("Submission failed. Please try again later.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white antialiased">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-white dark:bg-background-dark">
        <div className="sticky top-0 z-50 bg-alert px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2 text-left">
              <span className="material-symbols-outlined text-white text-xl shrink-0 mt-0.5">warning</span>
              <p className="text-white text-sm font-bold leading-snug">
                {t('dangerWarning')}
              </p>
            </div>
            <button 
              onClick={() => window.location.href = 'tel:911'}
              className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wide transition-colors shrink-0"
            >
              {t('callEmergency')}
            </button>
          </div>
        </div>

        <header className="flex items-center justify-between p-5 pb-2">
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('contactTitle')}</h1>
            <p className="text-sm font-medium text-text-secondary">{t('contactSub')}</p>
          </div>
          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center cursor-pointer" onClick={() => setSelectedCategory(null)}>
            <span className="material-symbols-outlined text-primary">{selectedCategory ? 'arrow_back' : 'shield'}</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col gap-6 p-5">
          {selectedCategory ? (
            <section className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-surface-border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary">chat_bubble</span>
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedCategory}</h3>
                   <p className="text-[10px] text-slate-500 uppercase font-black">Secure Inquiry Portal</p>
                </div>
              </div>

              {isSuccess ? (
                <div className="py-12 text-center space-y-4 animate-slide-up">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold">Message Received</h3>
                  <p className="text-sm text-slate-500 font-medium">An officer will review your inquiry shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Your Email (Optional)</label>
                    <input 
                      type="email" 
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Location of Incident/Area (Optional)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
                      <input 
                        type="text" 
                        value={formLocation}
                        onChange={e => setFormLocation(e.target.value)}
                        placeholder="Street, Town, or Landmark"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium" 
                      />
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">Helps authorities identify outdoor or public hotspots.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
                    <textarea 
                      required
                      rows={5}
                      value={formMessage}
                      onChange={e => setFormMessage(e.target.value)}
                      placeholder="Describe your inquiry or tip..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Send Secure Message'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="w-full text-slate-400 py-2 text-[10px] font-black uppercase tracking-widest hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </section>
          ) : (
            <>
              <section className="text-left animate-fade-in">
                <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  {t('supportCategories')}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <button 
                    onClick={() => handleCategorySelect(t('genInquiry'))}
                    className="group flex items-center gap-4 p-5 rounded-[2rem] border-2 border-gray-100 dark:border-surface-border bg-white dark:bg-surface-dark hover:border-primary hover:ring-4 hover:ring-primary/20 hover:ring-offset-4 transition-all text-left shadow-sm"
                  >
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t('genInquiry')}</span>
                      <span className="text-sm text-text-secondary">{t('genInquiryDesc')}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                  </button>

                  <button 
                    onClick={() => handleCategorySelect(t('techSupport'))}
                    className="group flex items-center gap-4 p-5 rounded-[2rem] border-2 border-gray-100 dark:border-surface-border bg-white dark:bg-surface-dark hover:border-emerald-500 hover:ring-4 hover:ring-emerald-500/20 hover:ring-offset-4 transition-all text-left shadow-sm"
                  >
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">cloud_upload</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{t('techSupport')}</span>
                      <span className="text-sm text-text-secondary">{t('techSupportDesc')}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-emerald-600 transition-colors">chevron_right</span>
                  </button>

                  <button 
                    onClick={() => handleCategorySelect(t('mediaPress'))}
                    className="group flex items-center gap-4 p-5 rounded-[2rem] border-2 border-gray-100 dark:border-surface-border bg-white dark:bg-surface-dark hover:border-purple-500 hover:ring-4 hover:ring-purple-500/20 hover:ring-offset-4 transition-all text-left shadow-sm"
                  >
                    <div className="h-12 w-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">campaign</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{t('mediaPress')}</span>
                      <span className="text-sm text-text-secondary">{t('mediaPressDesc')}</span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-purple-600 transition-colors">chevron_right</span>
                  </button>
                </div>
              </section>

              <section className="text-left">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('locateBureau')}</h2>
                  <button className="text-primary text-sm font-medium hover:underline">{t('viewLarger')}</button>
                </div>
                <div className="relative w-full h-48 rounded-[2rem] overflow-hidden border-2 border-gray-100 dark:border-surface-border bg-surface-dark group cursor-pointer shadow-inner hover:border-primary hover:ring-4 hover:ring-primary/10 hover:ring-offset-4 transition-all">
                  <img 
                    alt="Map showing office locations" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjIGVG-A7ZciR79AKTC-4_zuk94koHZ5yqpCcwhQl8VM_5igU9CzLTgB8FZCDLdd8O45uBq6wXE_kB6Wt-tYamyhz1mTF6LWF2wc7cORYe5TNYYLV2qqYpvriDgv5mQMQuK0iqhK4MHeNSI_MtjzP50HQj8TzCbprQvgjkOmpXuOmzBFNc--TEtPBc3asMX4xX1-gb4kDvoZ19BU11PmD7wewcGXm4Qi4pdb7YObljIwx5YMQA-fJOsCG-TEEpAXuum4CtKtTIZDiy" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                  <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="material-symbols-outlined text-alert text-3xl drop-shadow-md">location_on</span>
                  </div>
                  <div className="absolute bottom-1/3 right-1/3 transform flex flex-col items-center">
                    <span className="material-symbols-outlined text-primary text-3xl drop-shadow-md">location_on</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-white text-sm">my_location</span>
                      <span className="text-xs text-white font-medium">{t('nearestBureau')}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="text-left">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('quickHelp')}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  <details className="group bg-white dark:bg-surface-dark border-2 border-gray-50 dark:border-surface-border rounded-2xl hover:border-primary hover:ring-2 hover:ring-primary/10 transition-all">
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Can I change my report after submitting?</span>
                      <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                      For security reasons, reports cannot be edited once submitted. Please contact your case officer or submit a supplementary addendum referencing your Case ID.
                    </div>
                  </details>
                  <details className="group bg-white dark:bg-surface-dark border-2 border-gray-50 dark:border-surface-border rounded-2xl hover:border-primary hover:ring-2 hover:ring-primary/10 transition-all">
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">How do I request data for an NGO?</span>
                      <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                      Data requests must be submitted through the 'General Inquiries' portal with a valid organizational verified ID.
                    </div>
                  </details>
                </div>
              </section>

              <section className="mb-6 text-left">
                <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('altMethods')}</h2>
                <div className="bg-white dark:bg-surface-dark border-2 border-gray-100 dark:border-surface-border rounded-[2.5rem] divide-y divide-gray-100 dark:divide-surface-border overflow-hidden shadow-sm">
                  <div 
                    onClick={() => handleCopy('contact@chars.gov.lk', 'Email')}
                    className="flex items-center justify-between p-5 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">mail</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-text-secondary uppercase font-semibold tracking-wider group-hover:text-blue-600 transition-colors">{t('officialEmail')}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">contact@chars.gov.lk</span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined ${copyFeedback === 'Email' ? 'text-emerald-500' : 'text-primary'} text-lg`}>
                      {copyFeedback === 'Email' ? 'check' : 'content_copy'}
                    </span>
                  </div>
                  <div 
                    onClick={() => handleCopy('+94 11 234 5679', 'Fax')}
                    className="flex items-center justify-between p-5 hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">fax</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-text-secondary uppercase font-semibold tracking-wider group-hover:text-emerald-600 transition-colors">{t('secureFax')}</span>
                          <span className="material-symbols-outlined text-emerald-500 text-[10px]">lock</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">+94 11 234 5679</span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined ${copyFeedback === 'Fax' ? 'text-emerald-500' : 'text-primary'} text-lg`}>
                      {copyFeedback === 'Fax' ? 'check' : 'content_copy'}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
        
        <div className="h-6 w-full bg-white dark:bg-background-dark"></div>
      </div>
    </div>
  );
}
