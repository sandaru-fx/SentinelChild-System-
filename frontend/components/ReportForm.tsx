
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import { GeminiLiveAssistant } from '../services/geminiService';

interface FormErrors {
  reporterName?: string;
  reporterNic?: string;
  reporterPhone?: string;
  description?: string;
  age?: string;
  declaration?: string;
  evidence?: string;
}

const ENVIRONMENTS = [
  { id: 'HOME', label: 'Private Residence (Home)', icon: 'fa-house-chimney-user', color: 'text-amber-600' },
  { id: 'OUTDOOR', label: 'Public Space / Outdoor', icon: 'fa-tree-city', color: 'text-emerald-600' },
  { id: 'SCHOOL', label: 'School / Educational', icon: 'fa-school', color: 'text-blue-600' },
  { id: 'RELIGIOUS', label: 'Religious Location', icon: 'fa-place-of-worship', color: 'text-purple-600' }
];

export default function ReportForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Voice State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const assistantRef = useRef<GeminiLiveAssistant | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    reporterName: '',
    reporterNic: '',
    reporterPhone: '',
    childName: '',
    age: '',
    description: '',
    locationType: 'HOME',
    locationText: '',
    declaration: false,
    evidence: [] as string[]
  });

  useEffect(() => {
    if (isVoiceMode) {
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isVoiceMode]);

  const startVoiceRecording = async () => {
    setIsVoiceMode(true);
    try {
      assistantRef.current = new GeminiLiveAssistant();
      await assistantRef.current.start((text, isUser) => {
        if (!isUser) { 
          setFormData(prev => ({
            ...prev,
            description: prev.description + (prev.description ? ' ' : '') + text
          }));
        }
      });
    } catch (err) {
      alert("Microphone access denied. Please use text input.");
      setIsVoiceMode(false);
    }
  };

  const stopVoiceRecording = () => {
    assistantRef.current?.stop();
    assistantRef.current = null;
    setIsVoiceMode(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (step === 1) {
      if (!formData.reporterName.trim()) newErrors.reporterName = "Full legal name is required.";
      const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
      if (!nicRegex.test(formData.reporterNic.trim())) {
        newErrors.reporterNic = "Invalid NIC (Use 9 digits + V/X or 12 digits).";
      }
      const phoneRegex = /^(?:\+94|0)7[0-9]{8}$/;
      if (!phoneRegex.test(formData.reporterPhone.replace(/\s/g, ''))) {
        newErrors.reporterPhone = "A valid Sri Lankan phone number is required.";
      }
    }

    if (step === 2) {
      if (!formData.description.trim() || formData.description.length < 20) {
        newErrors.description = "Please provide a detailed statement. Voice inquiry is available below.";
      }
    }

    if (step === 3) {
      if (formData.evidence.length === 0) {
        newErrors.evidence = "For legal validity, at least one piece of photographic or video evidence must be attached.";
      }
      if (!formData.declaration) {
        newErrors.declaration = "You must accept the legal declaration.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validate()) setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const result = await api.submitReport({
        description: `[ENV: ${formData.locationType}] [LOC: ${formData.locationText}] ${formData.description}`,
        childName: formData.childName,
        age: formData.age,
        reporter: {
          name: formData.reporterName,
          phone: formData.reporterPhone
        },
        evidence: formData.evidence
      });
      
      if (result.success) {
        setSuccessId(result.reportId);
      }
    } catch (err) {
      alert("Submission failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      (Array.from(files) as File[]).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, evidence: [...prev.evidence, reader.result as string] }));
          if (errors.evidence) setErrors(prev => ({ ...prev, evidence: undefined }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (successId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-[3rem] shadow-2xl text-center border border-slate-100">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
          <i className="fas fa-check-shield"></i>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Inquiry Verified</h2>
        <p className="text-slate-500 font-bold mb-10">Your voice statement and evidence have been logged securely.</p>
        <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 shadow-2xl relative border-b-8 border-blue-600">
          <span className="text-white text-4xl font-mono font-black tracking-widest">{successId}</span>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Tracking Reference ID</div>
        </div>
        <button onClick={() => navigate('/status')} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">
          Monitor Case Progress
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-12 px-4 flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Progress */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl border-l-8 border-blue-600">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-10">Official Protocol</h3>
          <div className="space-y-12 relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-white/5"></div>
            {[
              { s: 1, label: 'Identity Check', icon: 'fa-id-card' },
              { s: 2, label: 'Statement Log', icon: 'fa-microphone-lines' },
              { s: 3, label: 'Evidence Upload', icon: 'fa-folder-open' }
            ].map(item => (
              <div key={item.s} className="flex items-center gap-5 relative z-10">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm transition-all duration-500 ${step >= item.s ? 'bg-blue-600 shadow-xl shadow-blue-500/20 text-white scale-110' : 'bg-white/5 text-white/20'}`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div className="flex flex-col">
                   <span className={`text-[11px] font-black uppercase tracking-widest ${step >= item.s ? 'text-white' : 'text-white/20'}`}>{item.label}</span>
                   {step === item.s && <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest animate-pulse mt-1">Active Stage</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-slate-50">
             <i className="fas fa-gavel text-4xl"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authority Notice</p>
          <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic relative z-10">All voice statements are analyzed for forensic consistency. Providing misleading information to the Bureau is a serious criminal offense.</p>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-grow bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col ring-1 ring-slate-900/5 min-h-[700px]">
        <div className="bg-slate-950 p-12 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Safe Inquiry Hub</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Verified Submission Terminal</p>
          </div>
          <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-2xl text-white/30 border border-white/5 relative z-10">
             <i className="fas fa-shield-halved"></i>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-12 flex-grow flex flex-col">
          
          {step === 1 && (
            <div className="space-y-12 animate-fade-in flex-grow flex flex-col justify-center">
              <section className="space-y-10">
                <div className="border-l-4 border-blue-600 pl-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Citizen Verification</h2>
                  <p className="text-sm text-slate-500 font-bold mt-1">Required for legal filing of an official inquiry.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.reporterName}
                      onChange={e => setFormData({...formData, reporterName: e.target.value})}
                      className={`w-full px-8 py-5 bg-slate-50 border-2 ${errors.reporterName ? 'border-red-500' : 'border-slate-100'} rounded-[1.5rem] focus:border-blue-600 outline-none font-bold text-sm transition-all focus:ring-4 focus:ring-blue-600/10`}
                      placeholder="As per Identity Document"
                    />
                    {errors.reporterName && <p className="text-[9px] font-black text-red-500 uppercase ml-2">{errors.reporterName}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">National ID (NIC)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.reporterNic}
                      onChange={e => setFormData({...formData, reporterNic: e.target.value})}
                      className={`w-full px-8 py-5 bg-slate-50 border-2 ${errors.reporterNic ? 'border-red-500' : 'border-slate-100'} rounded-[1.5rem] outline-none focus:border-blue-600 font-mono text-sm uppercase tracking-[0.2em] transition-all focus:ring-4 focus:ring-blue-600/10`}
                      placeholder="9 Digits+V or 12 Digits"
                    />
                    {errors.reporterNic && <p className="text-[9px] font-black text-red-500 uppercase ml-2">{errors.reporterNic}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Contact Number</label>
                    <input 
                      type="text" 
                      required
                      value={formData.reporterPhone}
                      onChange={e => setFormData({...formData, reporterPhone: e.target.value})}
                      className={`w-full px-8 py-5 bg-slate-50 border-2 ${errors.reporterPhone ? 'border-red-500' : 'border-slate-100'} rounded-[1.5rem] outline-none focus:border-blue-600 font-bold text-sm transition-all focus:ring-4 focus:ring-blue-600/10`}
                      placeholder="+94 7X XXX XXXX"
                    />
                    {errors.reporterPhone && <p className="text-[9px] font-black text-red-500 uppercase ml-2">{errors.reporterPhone}</p>}
                  </div>
                </div>
              </section>

              <div className="pt-12 border-t border-slate-50 flex justify-end">
                <button type="button" onClick={nextStep} className="bg-slate-950 text-white px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl hover:scale-105 active:scale-95">
                  Confirm Identity <i className="fas fa-arrow-right ml-4"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-fade-in flex-grow flex flex-col">
              <section className="space-y-10 flex-grow">
                <div className="border-l-4 border-emerald-600 pl-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Statement Submission</h2>
                  <p className="text-sm text-slate-500 font-bold mt-1">Provide incident context via Voice or Text below.</p>
                </div>

                <div className="space-y-6">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Occurrence Location Category</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ENVIRONMENTS.map(env => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => setFormData({...formData, locationType: env.id})}
                          className={`flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all duration-500 group ${formData.locationType === env.id ? 'bg-slate-950 border-slate-950 text-white shadow-2xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                        >
                          <i className={`fas ${env.icon} text-2xl ${formData.locationType === env.id ? 'text-blue-400' : 'group-hover:text-slate-600'} transition-colors`}></i>
                          <span className="text-[9px] font-black uppercase text-center leading-tight tracking-[0.1em]">{env.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* New Voice Statement Hub */}
                <div className={`relative p-10 rounded-[2.5rem] border-2 transition-all duration-700 ${isVoiceMode ? 'bg-indigo-950 border-indigo-600 shadow-2xl ring-8 ring-indigo-600/10' : 'bg-slate-50 border-slate-100'}`}>
                   <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="shrink-0">
                         <button 
                          type="button"
                          onClick={isVoiceMode ? stopVoiceRecording : startVoiceRecording}
                          className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl transition-all duration-500 shadow-xl ${isVoiceMode ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-blue-600 hover:scale-110'}`}
                         >
                           <i className={`fas ${isVoiceMode ? 'fa-square' : 'fa-microphone-lines'}`}></i>
                         </button>
                      </div>
                      <div className="flex-grow space-y-4 text-center md:text-left">
                         <div className="flex items-center justify-center md:justify-start gap-3">
                            <h3 className={`text-lg font-black uppercase tracking-tight ${isVoiceMode ? 'text-white' : 'text-slate-900'}`}>
                               {isVoiceMode ? 'Transmitting Voice Statement...' : 'Record Your Statement'}
                            </h3>
                            {isVoiceMode && <span className="text-xs font-mono text-red-400 bg-red-400/10 px-3 py-1 rounded-lg animate-pulse">{formatTime(recordingSeconds)}</span>}
                         </div>
                         <p className={`text-xs font-bold leading-relaxed ${isVoiceMode ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {isVoiceMode ? 'The AI is listening and structuring your inquiry in real-time. Speak clearly about who, what, and where.' : 'Speak naturally to describe the situation. Our Voice Guardian will automatically generate a structured inquiry for you.'}
                         </p>
                      </div>
                      {!isVoiceMode && (
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-2 border-slate-200 px-4 py-2 rounded-full">
                          No typing required
                        </div>
                      )}
                   </div>

                   {/* Statement Preview */}
                   <div className="mt-8 space-y-3">
                      <div className="flex justify-between items-center px-1">
                         <label className={`text-[10px] font-black uppercase tracking-widest ${isVoiceMode ? 'text-indigo-400' : 'text-slate-400'}`}>Structured Statement Preview</label>
                         <span className={`text-[9px] font-black uppercase ${formData.description.length > 20 ? 'text-emerald-500' : 'text-amber-500'}`}>{formData.description.length} Chars Captured</span>
                      </div>
                      <textarea 
                        required
                        rows={5}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Click the microphone to begin voice inquiry, or type manually here..."
                        className={`w-full px-8 py-6 rounded-[2rem] border-2 outline-none font-medium text-sm leading-relaxed transition-all ${isVoiceMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5'}`}
                      ></textarea>
                      {errors.description && <p className="text-[9px] font-black text-red-500 uppercase mt-2 ml-2 tracking-widest">{errors.description}</p>}
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Area of Occurrence / Street Name</label>
                   <div className="relative">
                      <i className="fas fa-location-dot absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input 
                        type="text"
                        value={formData.locationText}
                        onChange={e => setFormData({...formData, locationText: e.target.value})}
                        placeholder="e.g. Near Galle Face Green, or 123 Main St, Kandy"
                        className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-emerald-600 font-bold text-sm transition-all"
                      />
                   </div>
                </div>
              </section>

              <div className="pt-12 border-t border-slate-50 flex gap-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Previous Stage</button>
                <button type="button" onClick={nextStep} className="flex-[2] bg-slate-950 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl hover:scale-105 active:scale-95">
                  Confirm Statement Details <i className="fas fa-arrow-right ml-4"></i>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-fade-in flex-grow flex flex-col justify-center">
              <section className="space-y-12">
                <div className="border-l-4 border-indigo-600 pl-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Final Verification & Evidence</h2>
                  <p className="text-sm text-slate-500 font-bold mt-1">Every official inquiry MUST be accompanied by forensic evidence.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence Vault (Mandatory)</label>
                    <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">{formData.evidence.length} / 10 Files</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                     {formData.evidence.map((src, i) => (
                       <div key={i} className="aspect-square rounded-[2rem] bg-slate-100 border-2 border-slate-100 overflow-hidden relative group shadow-sm">
                          <img src={src} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setFormData(p => ({ ...p, evidence: p.evidence.filter((_, idx) => idx !== i) }))}
                            className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center font-black text-[9px] uppercase tracking-widest gap-2"
                          >
                            <i className="fas fa-trash-alt text-lg"></i>
                            Discard
                          </button>
                       </div>
                     ))}
                     {formData.evidence.length < 10 && (
                       <label className={`aspect-square rounded-[2rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer group shadow-sm ${errors.evidence ? 'bg-red-50 border-red-200 text-red-400' : 'bg-slate-50 border-slate-200 text-slate-300 hover:bg-white hover:border-blue-600 hover:text-blue-600'}`}>
                          <i className={`fas fa-cloud-arrow-up text-3xl mb-3 group-hover:-translate-y-2 transition-transform ${errors.evidence ? 'text-red-400' : ''}`}></i>
                          <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Secure Upload</span>
                          <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                       </label>
                     )}
                  </div>
                  {errors.evidence && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-4 ml-2 animate-bounce flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> {errors.evidence}</p>}
                </div>

                <div className="bg-amber-50 p-10 rounded-[3rem] border-2 border-amber-100 space-y-6 shadow-sm">
                   <div className="flex items-start gap-6">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          required
                          id="final-dec"
                          checked={formData.declaration}
                          onChange={e => setFormData({...formData, declaration: e.target.checked})}
                          className="w-8 h-8 rounded-xl text-blue-600 border-amber-200 bg-white cursor-pointer transition-all" 
                        />
                        {formData.declaration && <i className="fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none text-xs"></i>}
                      </div>
                      <label htmlFor="final-dec" className="text-xs font-bold text-slate-700 leading-relaxed cursor-pointer select-none">
                        I, <span className="text-blue-700 font-black">{formData.reporterName || 'undersigned'}</span>, solemnly declare that the voice statement and evidence provided are factual. I acknowledge that my identity (NIC: <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-200">{formData.reporterNic || '...'}</span>) is legally bound to this inquiry.
                      </label>
                   </div>
                   {errors.declaration && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-14">{errors.declaration}</p>}
                </div>
              </section>

              <div className="pt-12 border-t border-slate-50 flex flex-col sm:flex-row gap-6">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-6 rounded-[2rem] font-black text-xs uppercase text-slate-400 hover:bg-slate-50 transition-all">Back to Statement</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {loading ? <i className="fas fa-shield-halved fa-spin mr-3"></i> : <i className="fas fa-lock mr-3"></i>}
                  {loading ? 'Transmitting Secure Data...' : 'Authorize Official Filing'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
