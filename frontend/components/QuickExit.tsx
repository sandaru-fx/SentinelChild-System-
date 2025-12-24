
import React from 'react';

export default function SafetyCluster({ onOpenHelp }: { onOpenHelp: () => void }) {
  const handleExit = () => {
    // Redirect to a neutral high-traffic site immediately
    window.location.href = 'https://www.google.com/search?q=weather';
  };

  return (
    <div className="fixed bottom-8 left-8 z-[150] flex flex-col gap-3">
      {/* Live Help Trigger - Now tied to the safety cluster */}
      <button 
        onClick={onOpenHelp}
        className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:ring-4 hover:ring-indigo-600/20 hover:ring-offset-4 transition-all flex items-center gap-2 group border-2 border-indigo-400/20"
      >
        <i className="fas fa-headset group-hover:rotate-12 transition-transform"></i>
        Live Help
      </button>

      {/* Quick Exit */}
      <button 
        onClick={handleExit}
        className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2 group border-2 border-red-400/20"
        title="Instantly close this site"
      >
        <i className="fas fa-person-running group-hover:animate-bounce"></i>
        Quick Exit
      </button>
    </div>
  );
}
