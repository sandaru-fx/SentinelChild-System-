
import React, { useState, useRef, useEffect } from 'react';
import { GeminiLiveAssistant } from '../services/geminiService';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ text: string; isUser: boolean }[]>([]);
  const assistantRef = useRef<GeminiLiveAssistant | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for global trigger from landing page cards
  useEffect(() => {
    const handleTrigger = () => {
      if (!isActive) {
        startAssistant();
      } else {
        setIsOpen(true); // Just show the window if already active
      }
    };
    window.addEventListener('toggle-voice-assistant', handleTrigger);
    return () => window.removeEventListener('toggle-voice-assistant', handleTrigger);
  }, [isActive]);

  const startAssistant = async () => {
    setIsOpen(true);
    setIsActive(true);
    setTranscriptions([]);
    try {
      // Always create a fresh instance to ensure clean audio contexts
      assistantRef.current = new GeminiLiveAssistant();
      await assistantRef.current.start((text, isUser) => {
        setTranscriptions(prev => [...prev, { text, isUser }]);
      });
    } catch (err) {
      console.error(err);
      setIsActive(false);
      setIsOpen(false);
      alert("Microphone access is required for the Voice Assistant.");
    }
  };

  const stopAssistant = () => {
    assistantRef.current?.stop();
    assistantRef.current = null;
    setIsActive(false);
    setIsOpen(false);
  };

  const toggleAssistant = () => {
    if (isActive) {
      stopAssistant();
    } else {
      startAssistant();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Assistant Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[500px] animate-fade-in animate-slide-up">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-microphone text-xs"></i>
              </div>
              <span className="font-bold text-sm">Voice Guardian</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 min-h-[300px]">
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-3">
                <i className="fas fa-wave-square text-2xl animate-pulse"></i>
                <p className="text-xs px-8">"Hello, I am here to listen and help you through the reporting process. Please speak clearly."</p>
              </div>
            ) : (
              transcriptions.map((t, i) => (
                <div key={i} className={`flex ${t.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-xs font-medium ${t.isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-tl-none'}`}>
                    {t.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-8 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-1.5 h-6 bg-blue-400 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Assistant Listening</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={toggleAssistant}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all hover:scale-110 active:scale-95 group ${isActive ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        <i className={`fas ${isActive ? 'fa-stop' : 'fa-microphone'} group-hover:rotate-12 transition-transform`}></i>
        {!isActive && (
          <span className="absolute right-20 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Voice Assistant
          </span>
        )}
      </button>
    </div>
  );
}
