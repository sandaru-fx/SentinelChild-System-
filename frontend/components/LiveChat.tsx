
import React, { useState, useEffect, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { ChatSession, ChatMessage } from '../types';

interface LiveChatProps {
  externalOpen?: boolean;
  setExternalOpen?: (val: boolean) => void;
}

interface ValidationErrors {
  name?: string;
  userId?: string;
  phone?: string;
}

export default function LiveChat({ externalOpen, setExternalOpen }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'LOGIN' | 'OTP' | 'CHOICE' | 'CHAT'>('LOGIN');
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [correctOtp, setCorrectOtp] = useState('');
  const [session, setSession] = useState<ChatSession | null>(null);
  const [existingSessions, setExistingSessions] = useState<ChatSession[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalOpen !== undefined) setIsOpen(externalOpen);
  }, [externalOpen]);

  const closeWindow = () => {
    setIsOpen(false);
    if (setExternalOpen) setExternalOpen(false);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [session?.messages, step]);

  useEffect(() => {
    let interval: any;
    if (step === 'CHAT' && session) {
      interval = setInterval(async () => {
        const chats = await mockApi.getChatSessions();
        const current = chats.find(s => s.id === session.id);
        if (current) setSession(current);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [step, session?.id]);

  const validateLogin = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Name validation
    if (!name.trim()) newErrors.name = "Name is required.";
    
    // Sri Lankan NIC Validation
    // 9 digits + V/X OR 12 digits
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(userId.trim())) {
      newErrors.userId = "Invalid NIC format (9 digits + V/X or 12 digits).";
    }
    
    // Phone validation (Sri Lankan)
    const phoneRegex = /^(?:\+94|0)7[0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = "Invalid phone number format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setLoading(true);
    const blocked = await mockApi.checkBlockedStatus(userId, phone);
    if (blocked) {
      setIsBlocked(true);
      setLoading(false);
      return;
    }
    const code = await mockApi.sendOtp(phone);
    setCorrectOtp(code);
    setStep('OTP');
    setLoading(false);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === correctOtp) {
      const allSessions = await mockApi.getChatSessions();
      const previous = allSessions.filter(s => (s.userId === userId || s.userPhone === phone) && s.status !== 'CLOSED');
      
      if (previous.length > 0) {
        setExistingSessions(previous);
        setStep('CHOICE');
      } else {
        startNewChat();
      }
    } else {
      alert("Invalid Security Code.");
    }
  };

  const startNewChat = async () => {
    const sess = await mockApi.startChatSession(userId, phone, name);
    setSession(sess);
    setStep('CHAT');
  };

  const resumeChat = (sess: ChatSession) => {
    setSession(sess);
    setStep('CHAT');
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || !session) return;
    const msg = await mockApi.sendMessage(session.id, 'user', name, textToSend);
    if (!customText) setInput('');
    setSession(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
  };

  const resetChat = () => {
    if (window.confirm("Start a completely new chat session?")) {
      setStep('LOGIN');
      setSession(null);
      setUserId('');
      setPhone('');
      setName('');
      setOtp('');
      setErrors({});
    }
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-28 right-8 z-[120] w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ring-4 ring-indigo-600/10 ring-offset-8"
    >
      <i className="fas fa-comment-dots text-2xl"></i>
    </button>
  );

  return (
    <div className="fixed bottom-8 right-8 z-[200] w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[600px] animate-slide-up">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
            <i className="fas fa-headset text-sm"></i>
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">Live Support</h3>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Authorized Police Line</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {step === 'CHAT' && (
            <button onClick={resetChat} title="New Chat" className="text-white/40 hover:text-white transition-colors">
              <i className="fas fa-plus-circle text-lg"></i>
            </button>
          )}
          <button onClick={closeWindow} className="text-white/40 hover:text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-y-auto bg-slate-50/50">
        {isBlocked ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <i className="fas fa-user-slash text-red-500 text-4xl"></i>
             <h4 className="text-lg font-black text-slate-900">Access Restricted</h4>
             <p className="text-xs text-slate-500 font-medium px-6">Your identity has been flagged by system administrators.</p>
          </div>
        ) : step === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-xs text-slate-500 font-bold mb-6">Verification required to connect with an officer.</p>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
              <input 
                required 
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors({...errors, name: undefined});
                }} 
                className={`w-full px-4 py-3 bg-white border ${errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all`} 
                placeholder="e.g. John Doe" 
              />
              {errors.name && <p className="text-[9px] font-black text-red-500 uppercase ml-1 mt-1 tracking-widest">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">National ID Number (NIC)</label>
              <input 
                required 
                value={userId} 
                onChange={e => {
                  setUserId(e.target.value);
                  if (errors.userId) setErrors({...errors, userId: undefined});
                }} 
                className={`w-full px-4 py-3 bg-white border ${errors.userId ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 font-mono transition-all uppercase`} 
                placeholder="e.g. 199512345678" 
              />
              {errors.userId && <p className="text-[9px] font-black text-red-500 uppercase ml-1 mt-1 tracking-widest">{errors.userId}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
              <input 
                required 
                value={phone} 
                onChange={e => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({...errors, phone: undefined});
                }} 
                className={`w-full px-4 py-3 bg-white border ${errors.phone ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'} rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all`} 
                placeholder="+94 XX XXX XXXX" 
              />
              {errors.phone && <p className="text-[9px] font-black text-red-500 uppercase ml-1 mt-1 tracking-widest">{errors.phone}</p>}
            </div>

            <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Send Security Code'}
            </button>
          </form>
        ) : step === 'OTP' ? (
          <form onSubmit={verifyOtp} className="space-y-6 py-8 text-center">
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900">Verify Identity</h4>
              <p className="text-xs text-slate-500 font-medium">We sent a 4-digit code to {phone}</p>
              <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[10px] font-black text-amber-700 uppercase tracking-widest mt-4">
                [DEMO] CODE: {correctOtp}
              </div>
            </div>
            <input autoFocus required maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} className="w-32 text-center text-3xl font-black tracking-[0.5em] py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600" placeholder="0000" />
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">Connect</button>
          </form>
        ) : step === 'CHOICE' ? (
          <div className="space-y-6 py-4 animate-fade-in">
             <div className="flex flex-col items-start gap-3">
               <div className="max-w-[85%] px-4 py-3 bg-slate-200 text-slate-600 rounded-2xl rounded-tl-none text-xs font-medium shadow-sm border border-slate-300">
                  Hello {name}, how can I help you? Don't be afraid, we protect your privacy.
               </div>
               <div className="max-w-[85%] px-4 py-3 bg-slate-200 text-slate-600 rounded-2xl rounded-tl-none text-xs font-medium shadow-sm border border-slate-300">
                  I found your previous conversation. Shall I connect you with your previous details or start a new chat?
               </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4 mt-8">
               <button 
                  onClick={() => resumeChat(existingSessions[0])}
                  className="w-full p-5 bg-white border-2 border-indigo-600 rounded-2xl text-left hover:bg-indigo-50 transition-all shadow-lg group"
               >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-indigo-600 uppercase text-[10px] tracking-widest">Connect Previous</span>
                    <i className="fas fa-chevron-right text-indigo-600 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase">Case ID: {existingSessions[0].id.split('-')[1]}</p>
               </button>
               
               <button 
                  onClick={startNewChat}
                  className="w-full p-5 bg-slate-100 border-2 border-transparent rounded-2xl text-left hover:bg-slate-200 transition-all"
               >
                  <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Start New Inquiry</span>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Create fresh session</p>
               </button>
             </div>
          </div>
        ) : (
          <div ref={scrollRef} className="h-[350px] space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-8">
            {session?.messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.senderId === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium shadow-sm ${m.senderId === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : m.senderId === 'bot' ? 'bg-slate-200 text-slate-600 rounded-tl-none border border-slate-300' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none ring-1 ring-slate-100 ring-offset-2'}`}>
                  {m.text}
                  {m.isEdited && <span className="block text-[8px] opacity-60 mt-1 italic text-right">(edited)</span>}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase mt-1 px-1">
                  {m.senderId === 'user' ? 'You' : m.senderId === 'bot' ? 'System Bot' : 'Officer'} • {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))}
            
            {session?.messages.length === 3 && session.messages[2].text.includes("connect you with an authorized duty officer") && (
              <div className="flex flex-col gap-2 mt-4 animate-fade-in items-start">
                <button 
                  onClick={() => handleSend(undefined, "Yes, please connect me with the admin/officer.")}
                  className="bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  <i className="fas fa-shield-halved mr-2"></i> Connect with Admin
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {step === 'CHAT' && !isBlocked && (
        <form onSubmit={(e) => handleSend(e)} className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 font-medium" placeholder="Type message..." />
          <button type="submit" className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 shadow-lg"><i className="fas fa-paper-plane"></i></button>
        </form>
      )}
    </div>
  );
}
