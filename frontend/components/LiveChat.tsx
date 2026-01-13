
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
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
  const [step, setStep] = useState<'GREETING' | 'CHAT'>('GREETING');
  const [nickName, setNickName] = useState('');
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('chars_chat_session');
    if (saved) return saved;
    const newId = `SESS-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chars_chat_session', newId);
    return newId;
  });

  const [session, setSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we already have a session in DB with a name
    const checkExisting = async () => {
      if (sessionId) {
        const savedName = localStorage.getItem('chars_chat_name');
        if (savedName) {
          setNickName(savedName);
          setStep('CHAT');
        }
      }
    };
    checkExisting();
  }, [sessionId]);

  useEffect(() => {
    if (externalOpen !== undefined) setIsOpen(externalOpen);
  }, [externalOpen]);

  const closeWindow = () => {
    setIsOpen(false);
    if (setExternalOpen) setExternalOpen(false);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [session?.messages]);

  useEffect(() => {
    if (!isOpen || step !== 'CHAT') return;

    // Initialize WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.hostname}:8080/ws?role=user&sessionId=${sessionId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ User WS Connected');
      fetchSession();
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        const msg = data.payload;
        if (data.sessionId === sessionId) {
          setSession(prev => {
            if (!prev) return null;
            const exists = prev.messages.some(m => m.id === msg.id);
            if (exists) {
              // Update status if it changed
              return { ...prev, messages: prev.messages.map(m2 => m2.id === msg.id ? { ...m2, status: msg.status } : m2) };
            }
            return { ...prev, messages: [...prev.messages, msg] };
          });
        }
      } else if (data.type === 'seen') {
        if (data.sessionId === sessionId) {
          setSession(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map(m => m.senderId === 'user' ? { ...m, status: 'SEEN' } : m)
            };
          });
        }
      }
    };

    return () => {
      socket.close();
    };
  }, [isOpen, sessionId, step]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickName.trim()) return;
    localStorage.setItem('chars_chat_name', nickName);
    setStep('CHAT');
    // WS will auto-connect due to step change
  };

  const fetchSession = async () => {
    const sess = await api.startChatSession(sessionId, "anonymous", nickName || "Anonymous User");
    setSession(sess);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    const chatMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      senderId: 'user',
      senderName: nickName || 'Anonymous',
      text: input,
      timestamp: new Date().toISOString(),
      status: 'SENT'
    };

    console.log('📤 Sending message via WS:', chatMsg);
    socketRef.current.send(JSON.stringify({
      type: 'chat',
      sessionId: sessionId,
      payload: chatMsg
    }));

    setSession(prev => {
      if (!prev) return null;
      return { ...prev, messages: [...prev.messages, chatMsg] };
    });
    setInput('');
  };

  const resetChat = () => {
    if (window.confirm("Delete this session and start a new anonymous chat?")) {
      localStorage.removeItem('chars_chat_session');
      localStorage.removeItem('chars_chat_name');
      window.location.reload();
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
        ) : step === 'GREETING' ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl">
              <i className="fas fa-child"></i>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900">Protecting Our Future</h4>
              <p className="text-xs text-slate-500 font-medium px-4">
                Pin sidda wenawa machan meyata sambanda unata. Api okkoma ekathu wela innocent childrenwa save karagamu.
              </p>
            </div>
            <form onSubmit={startChat} className="w-full space-y-3 px-4">
              <input
                autoFocus
                required
                value={nickName}
                onChange={e => setNickName(e.target.value)}
                placeholder="Oyata kiyanna ona nama mokakda?"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
              />
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-indigo-700 transition-all">
                Chat eka Start karamu
              </button>
            </form>
          </div>
        ) : (
          <div ref={scrollRef} className="h-[350px] space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-8">
            {session?.messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.senderId === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium shadow-sm transition-all relative ${m.senderId === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : m.senderId === 'bot' ? 'bg-slate-200 text-slate-600 rounded-tl-none border border-slate-300' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none ring-1 ring-slate-100 ring-offset-2'}`}>
                  {m.text}
                  {m.isEdited && <span className="block text-[8px] opacity-60 mt-1 italic text-right">(edited)</span>}

                  {/* Message Ticks */}

                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase mt-1 px-1 flex items-center gap-1">
                  {m.senderId === 'user' ? 'You' : m.senderId === 'bot' ? 'SafeGuard Bot' : 'Officer'} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {m.senderId === 'user' && (
                    <span className="ml-1 flex items-center">
                      {m.status === 'SENT' ? (
                        <i className="fas fa-check text-[7px]"></i>
                      ) : m.status === 'DELIVERED' ? (
                        <i className="fas fa-check-double text-[7px]"></i>
                      ) : m.status === 'SEEN' ? (
                        <i className="fas fa-check-double text-[7px] text-blue-500"></i>
                      ) : null}
                    </span>
                  )}
                </span>
              </div>
            ))}
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
