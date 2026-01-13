
import React, { useState, useRef, useEffect } from 'react';
import { GeminiLiveAssistant } from '../services/geminiService';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const assistantRef = useRef<GeminiLiveAssistant | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Listen for global trigger from landing page cards
  useEffect(() => {
    const handleTrigger = () => {
      if (!isActive) {
        startAssistant();
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener('toggle-voice-assistant', handleTrigger);
    return () => window.removeEventListener('toggle-voice-assistant', handleTrigger);
  }, [isActive]);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startAssistant = async () => {
    setIsOpen(true);
    setIsActive(true);
    setShowSuccess(false);
    setTranscriptions([]);
    setHasAudio(false);
    audioChunksRef.current = [];

    try {
      assistantRef.current = new GeminiLiveAssistant();
      await assistantRef.current.start((text, isUser) => {
        setTranscriptions(prev => [...prev, { text, isUser }]);
      });

      // Start Recording User Audio in parallel
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          setHasAudio(true);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

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

    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsActive(false);
  };

  const toggleAssistant = () => {
    if (isActive) {
      stopAssistant();
    } else {
      startAssistant();
    }
  };

  const handleSubmitInquiry = async () => {
    if (audioChunksRef.current.length === 0 && transcriptions.length === 0) {
      alert("No data to submit.");
      return;
    }

    setIsSubmitting(true);
    stopAssistant(); // Ensure stopped

    // Create blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const fullText = transcriptions.map(t => `${t.isUser ? 'User' : 'AI'}: ${t.text}`).join('\n');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_inquiry.webm');
    formData.append('transcription', fullText || "(Audio Only Report)");

    try {
      // Use full URL for now since we haven't set up global API config yet
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        setTranscriptions([]);
        setHasAudio(false);
        // Auto close after 5 seconds if user desires, or let them close
        // setIsOpen(false); 
      } else {
        alert("Failed to submit inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error. Please ensure the backend server is running.");
    } finally {
      setIsSubmitting(false);
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
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[600px] animate-fade-in animate-slide-up font-sans">
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

          {showSuccess ? (
            <div className="flex-grow p-8 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 min-h-[300px]">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mb-2 animate-bounce">
                <i className="fas fa-check"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Report Submitted</h3>
              <p className="text-sm text-slate-500 max-w-[200px]">
                Your voice inquiry has been securely received. Reference ID: <span className="font-mono bg-slate-200 px-1 rounded">#{Math.floor(Math.random() * 90000) + 10000}</span>
              </p>
              <div className="pt-4 w-full">
                <button
                  onClick={() => { setShowSuccess(false); setIsOpen(false); }}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 min-h-[300px]">
                {transcriptions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-3">
                    <i className={`fas fa-wave-square text-2xl ${isActive ? 'animate-pulse text-red-500' : ''}`}></i>
                    <p className="text-xs px-8">
                      {isActive
                        ? "Listening... Speak clearly about what you witnessed."
                        : "Recording paused. Click 'Submit' to send your report."}
                    </p>
                    {isActive && (
                      <div className="text-2xl font-mono font-bold text-slate-800 mt-2">
                        {formatTime(recordingTime)}
                      </div>
                    )}
                    {hasAudio && !isActive && <p className="text-xs text-blue-600 font-bold mt-2"><i className="fas fa-check-circle"></i> Audio Recorded ({formatTime(recordingTime)})</p>}
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

              <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-3 text-slate-400">
                  {isActive ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-8 bg-red-400 rounded-full animate-bounce delay-150"></div>
                        <div className="w-1.5 h-6 bg-red-300 rounded-full animate-bounce delay-300"></div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-red-500">Recording Live • {formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                      <i className="fas fa-pause-circle"></i> Ready to Submit
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                {isActive ? (
                  <button
                    onClick={stopAssistant}
                    className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2 transition-all"
                  >
                    <i className="fas fa-stop-circle"></i> Stop Recording
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitInquiry}
                    disabled={isSubmitting || (!hasAudio && transcriptions.length === 0)}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                    ) : (
                      <><i className="fas fa-paper-plane"></i> Submit Official Inquiry</>
                    )}
                  </button>
                )}

              </div>
            </>
          )}
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
