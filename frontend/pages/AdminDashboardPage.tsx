
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { mockApi } from '../services/mockApi';
import { Report, ReportStatus, Admin, ChatSession, ChatMessage } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { GoogleGenAI } from "@google/genai";

type ViewMode = 'CASES' | 'LIVE_CHAT';

export default function AdminDashboardPage({ user }: { user: Admin | null }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('CASES');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  
  // Chat State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [notification, setNotification] = useState<{title: string, msg: string} | null>(null);

  const [updating, setUpdating] = useState(false);
  const [editingStatus, setEditingStatus] = useState<ReportStatus | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin-login');
      return;
    }
    fetchReports();
    fetchChats();
    
    // Poll for chats & handle notifications
    const chatInterval = setInterval(async () => {
      const sessions = await mockApi.getChatSessions();
      
      // Check for new messages from non-selected sessions
      sessions.forEach(sess => {
        const oldSess = chatSessions.find(s => s.id === sess.id);
        if (oldSess && sess.messages.length > oldSess.messages.length) {
          const lastMsg = sess.messages[sess.messages.length - 1];
          if (lastMsg.senderId === 'user' && selectedSession?.id !== sess.id) {
            setNotification({ title: `New Message from ${sess.userName}`, msg: lastMsg.text });
            setTimeout(() => setNotification(null), 5000);
          }
        }
      });
      
      setChatSessions(sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      
      if (selectedSession) {
        const updated = sessions.find(s => s.id === selectedSession.id);
        if (updated) {
          setSelectedSession(updated);
          if (updated.unreadCount > 0) {
            await mockApi.markAsRead(updated.id);
          }
        }
      }
    }, 3000);

    return () => clearInterval(chatInterval);
  }, [user, chatSessions, selectedSession]);

  const fetchReports = async () => {
    if (!user?.token) return;
    setLoading(true);
    const data = await api.getAllReports(user.token);
    setReports(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const fetchChats = async () => {
    const sessions = await mockApi.getChatSessions();
    setChatSessions(sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSession || !user) return;
    await mockApi.sendMessage(selectedSession.id, user.id, user.name, chatInput);
    setChatInput('');
    fetchChats();
  };

  const handleEditChat = async (msgId: string) => {
    if (!selectedSession || !editingText.trim()) return;
    await mockApi.editChatMessage(selectedSession.id, msgId, editingText);
    setEditingMsgId(null);
    fetchChats();
  };

  const handleDeleteChat = async (msgId: string) => {
    if (!selectedSession || !window.confirm("Delete this message?")) return;
    await mockApi.deleteChatMessage(selectedSession.id, msgId);
    fetchChats();
  };

  const handleBlockUser = async () => {
    if (!selectedSession || !window.confirm(`Block ${selectedSession.userName} permanently?`)) return;
    const reason = prompt("Reason for block:");
    if (reason) {
      await mockApi.blockUser(selectedSession.userId, selectedSession.userPhone, reason);
      fetchChats();
    }
  };

  const generateAiSummary = async () => {
    if (!selectedReport) return;
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze the following child harassment report for an authorized duty officer brief. 
        Report ID: ${selectedReport.id}
        Report Description: "${selectedReport.description}"
        
        Provide:
        1. Criticality Level (Low/Medium/High/Extreme)
        2. Key Allegations
        3. Potential Intervention Priority
        4. Any identified locations or persons of interest.
        
        Tone: Professional, clinical, and forensic.`,
      });
      setAiSummary(response.text || "Summary generation failed.");
    } catch (err) {
      console.error('AI Summary Error:', err);
      setAiSummary("Unable to reach AI analysis engine. Please review manually.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedReport || !editingStatus || !user?.token) return;
    setUpdating(true);
    const success = await api.updateReportStatus(selectedReport.id, editingStatus, editingNotes, user.token);
    if (success) {
      await fetchReports();
      setSelectedReport(prev => prev ? {...prev, status: editingStatus, adminNotes: editingNotes, updatedAt: new Date().toISOString()} : null);
    }
    setUpdating(false);
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'ALL' || report.status === filter;
    const matchesSearch = 
      report.id.toLowerCase().includes(search.toLowerCase()) || 
      (report.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (report.childName || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!user) return null;

  const unreadTotal = chatSessions.reduce((acc, s) => acc + s.unreadCount, 0);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-100">
      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-8 z-[300] bg-white p-6 rounded-[2rem] shadow-2xl border-2 border-indigo-600 ring-4 ring-indigo-600/10 ring-offset-8 animate-slide-up flex gap-4 items-center max-w-sm">
           <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
             <i className="fas fa-bell"></i>
           </div>
           <div>
             <h4 className="text-sm font-black text-slate-900">{notification.title}</h4>
             <p className="text-xs text-slate-500 line-clamp-2">{notification.msg}</p>
           </div>
           <button onClick={() => setNotification(null)} className="text-slate-300 hover:text-slate-600 ml-2">
             <i className="fas fa-times"></i>
           </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-8 border-r border-slate-800">
         <button onClick={() => setViewMode('CASES')} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${viewMode === 'CASES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-900' : 'text-slate-500 hover:text-white'}`}>
           <i className="fas fa-folder-open text-xl"></i>
         </button>
         <button onClick={() => { setViewMode('LIVE_CHAT'); setNotification(null); }} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${viewMode === 'LIVE_CHAT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-900' : 'text-slate-500 hover:text-white'}`}>
           <i className="fas fa-headset text-xl"></i>
           {unreadTotal > 0 && (
             <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
               {unreadTotal}
             </span>
           )}
         </button>
      </div>

      {viewMode === 'CASES' ? (
        <>
          <div className="w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-lg z-10">
            <div className="p-6 space-y-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Case Intake</h2>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input type="text" placeholder="Search Reference ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-bold" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['ALL', ...Object.values(ReportStatus)].map(s => (
                  <button key={s} onClick={() => setFilter(s as any)} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap border ${filter === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-600'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-grow overflow-y-auto bg-slate-50/30 p-2 space-y-3">
              {filteredReports.map(report => (
                <button key={report.id} onClick={() => { setSelectedReport(report); setEditingStatus(report.status); setEditingNotes(report.adminNotes || ''); setAiSummary(null); }} className={`w-full text-left p-6 border-2 transition-all rounded-2xl ${selectedReport?.id === report.id ? 'bg-white border-blue-600 shadow-xl ring-4 ring-blue-600/10 ring-offset-4' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-black text-sm text-slate-900">{report.id}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">{report.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow bg-[#F8FAFC] overflow-y-auto p-12">
            {selectedReport ? (
              <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
                 <div className="flex justify-between items-end border-b border-slate-200 pb-10">
                    <div className="space-y-2">
                      <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Case {selectedReport.id}</h1>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={selectedReport.status} size="lg" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intake: {new Date(selectedReport.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={generateAiSummary} className="bg-indigo-600 px-6 py-3 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
                      {isSummarizing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>} 
                      Officer Intelligence
                    </button>
                 </div>
                 
                 {aiSummary && (
                    <div className="bg-white p-10 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"></div>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 flex items-center gap-2">
                         <i className="fas fa-brain"></i> AI Forensic Brief
                       </h4>
                       <div className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                         {aiSummary}
                       </div>
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Victim Records</h3>
                       <div className="space-y-2">
                          <p className="text-sm font-black text-slate-900">{selectedReport.childName || 'Anonymized Victim'}</p>
                          <p className="text-xs text-slate-500 font-bold">Age Group: {selectedReport.age || 'Unknown'}</p>
                       </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reporter Records</h3>
                       <div className="space-y-2">
                          <p className="text-sm font-black text-slate-900">{selectedReport.reporter ? selectedReport.reporter.name : 'Citizen Informant (Anonymous)'}</p>
                          <p className="text-xs text-slate-500 font-bold">{selectedReport.reporter ? selectedReport.reporter.phone : 'Metadata Purged for Privacy'}</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 italic shadow-sm leading-relaxed text-slate-800">
                    "{selectedReport.description}"
                 </div>

                 <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <i className="fas fa-terminal"></i> Command Authority
                    </h3>
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Update Phase</label>
                             <select value={editingStatus || ''} onChange={e => setEditingStatus(e.target.value as ReportStatus)} className="w-full bg-white/5 p-4 rounded-xl text-xs font-bold outline-none border border-white/10 hover:border-indigo-500 transition-colors">
                               {Object.values(ReportStatus).map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Investigation Notes</label>
                             <textarea value={editingNotes} onChange={e => setEditingNotes(e.target.value)} placeholder="Provide encrypted updates for reporter tracking..." className="w-full bg-white/5 p-4 rounded-xl text-xs font-bold outline-none border border-white/10 h-14 hover:border-indigo-500 transition-colors" />
                          </div>
                       </div>
                       <button onClick={handleUpdate} disabled={updating} className="w-full bg-indigo-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                         {updating ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-shield-check mr-2"></i>}
                         Commit Case Update
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <i className="fas fa-shield-halved text-6xl opacity-10"></i>
                <p className="text-xs font-black uppercase tracking-widest">Select an incident file for forensic review</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* LIVE CHAT VIEW */
        <>
          <div className="w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-lg z-10">
            <div className="p-6 space-y-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Live Support</h2>
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                Secure Server Hub
              </div>
            </div>
            <div className="flex-grow overflow-y-auto bg-slate-50/30 p-2 space-y-3">
              {chatSessions.map(sess => (
                <button 
                  key={sess.id} 
                  onClick={() => setSelectedSession(sess)}
                  className={`w-full text-left p-6 border-2 transition-all rounded-2xl relative ${selectedSession?.id === sess.id ? 'bg-white border-indigo-600 shadow-xl ring-4 ring-indigo-600/10 ring-offset-4' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}
                >
                  {sess.unreadCount > 0 && (
                    <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-sm text-slate-900">{sess.userName}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${sess.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{sess.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sess.userPhone}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow bg-[#F8FAFC] flex flex-col">
            {selectedSession ? (
              <>
                <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">
                       <i className="fas fa-user-shield"></i>
                     </div>
                     <div>
                       <h2 className="text-xl font-black text-slate-900">{selectedSession.userName}</h2>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">NIC: {selectedSession.userId} • Phone: {selectedSession.userPhone}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleBlockUser} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                      Restrict Access
                    </button>
                    <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                      Export Logs
                    </button>
                  </div>
                </div>

                <div className="flex-grow p-12 overflow-y-auto space-y-6 bg-slate-50/50">
                  {selectedSession.messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.senderId === 'user' ? 'items-start' : 'items-end'}`}>
                      <div className="group relative max-w-[70%]">
                        <div className={`px-5 py-4 rounded-3xl text-sm font-medium shadow-sm ${m.senderId === 'user' ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none ring-1 ring-slate-100 ring-offset-2' : m.senderId === 'bot' ? 'bg-slate-200 text-slate-600 rounded-tr-none border border-slate-300' : 'bg-indigo-600 text-white rounded-tr-none ring-4 ring-indigo-600/10 ring-offset-4'}`}>
                          {editingMsgId === m.id ? (
                            <div className="space-y-2">
                               <input value={editingText} onChange={e => setEditingText(e.target.value)} className="w-full bg-indigo-500 text-white p-2 rounded outline-none border-b-2 border-white" />
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingMsgId(null)} className="text-[8px] font-black uppercase tracking-widest opacity-60">Cancel</button>
                                  <button onClick={() => handleEditChat(m.id)} className="text-[8px] font-black uppercase tracking-widest">Apply</button>
                               </div>
                            </div>
                          ) : (
                            <>
                              {m.text}
                              {m.isEdited && <span className="block text-[8px] opacity-60 mt-1 italic">(edited by authority)</span>}
                            </>
                          )}
                        </div>
                        
                        {m.senderId !== 'user' && m.senderId !== 'bot' && editingMsgId !== m.id && (
                          <div className="absolute top-0 -left-12 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                             <button onClick={() => { setEditingMsgId(m.id); setEditingText(m.text); }} className="w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-lg shadow-sm flex items-center justify-center transition-all"><i className="fas fa-pen text-[10px]"></i></button>
                             <button onClick={() => handleDeleteChat(m.id)} className="w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-lg shadow-sm flex items-center justify-center transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
                          </div>
                        )}
                        {m.senderId === 'user' && (
                           <div className="absolute top-0 -right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDeleteChat(m.id)} title="Delete user message" className="w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-lg shadow-sm flex items-center justify-center transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
                           </div>
                        )}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase mt-2 px-1">
                        {m.senderName} • {new Date(m.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="p-8 bg-white border-t border-slate-100 flex gap-4">
                   <input 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    placeholder="Enter official response..." 
                    className="flex-grow px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" 
                   />
                   <button type="submit" className="bg-indigo-600 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                     Transmit Message
                   </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                 <i className="fas fa-headset text-6xl opacity-10"></i>
                 <p className="text-xs font-black uppercase tracking-widest">Select a witness support session</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
