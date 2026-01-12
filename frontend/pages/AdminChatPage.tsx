import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { mockApi } from '../services/mockApi';
import { Admin, ChatSession } from '../types';

export default function AdminChatPage({ user }: { user: Admin | null }) {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [notification, setNotification] = useState<{ title: string, msg: string } | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedSession && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedSession?.messages]);

    useEffect(() => {
        if (!user?.token) return;
        fetchChats();

        const chatInterval = setInterval(async () => {
            if (!user?.token) return;
            const sessions = await api.getChatSessions(user.token);

            // Notifications logic
            sessions.forEach(sess => {
                const oldSess = chatSessions.find(s => s.sessionId === sess.sessionId);
                if (oldSess && sess.messages.length > oldSess.messages.length) {
                    const lastMsg = sess.messages[sess.messages.length - 1];
                    if (lastMsg.senderId === 'user' && selectedSession?.sessionId !== sess.sessionId) {
                        setNotification({ title: `New Message: ${sess.userName}`, msg: lastMsg.text });
                        setTimeout(() => setNotification(null), 5000);
                    }
                }
            });

            setChatSessions(sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

            if (selectedSession) {
                const updated = sessions.find(s => s.sessionId === selectedSession.sessionId);
                if (updated) {
                    setSelectedSession(updated);
                    // Mark as read logic would go here
                }
            }
        }, 3000);

        return () => clearInterval(chatInterval);
    }, [user, chatSessions, selectedSession]);

    const fetchChats = async () => {
        if (!user?.token) return;
        const sessions = await api.getChatSessions(user.token);
        setChatSessions(sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !selectedSession || !user) return;
        await api.sendMessage(selectedSession.sessionId, user.id, user.name, chatInput);
        setChatInput('');
        fetchChats();
    };

    const handleBlockUser = async () => {
        if (!selectedSession || !window.confirm(`Block ${selectedSession.userName} permanently?`)) return;
        const reason = prompt("Reason for block:");
        if (reason) {
            await mockApi.blockUser(selectedSession.userId, selectedSession.userPhone, reason);
            fetchChats();
            setSelectedSession(null);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex overflow-hidden relative">
            {/* Notification Toast */}
            {notification && (
                <div className="absolute top-4 right-4 z-50 bg-[var(--color-surface)] shadow-lg rounded-xl p-4 border border-[var(--color-border)] animate-slide-up flex gap-3 max-w-sm">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <i className="fas fa-comment-dots"></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-[var(--color-text-primary)]">{notification.title}</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{notification.msg}</p>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-80 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h2 className="font-bold text-[var(--color-text-primary)] mb-4">Live Support</h2>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div className="flex-grow overflow-y-auto">
                    {chatSessions.map(sess => (
                        <button
                            key={sess.id}
                            onClick={() => setSelectedSession(sess)}
                            className={`w-full text-left p-4 hover:bg-[var(--color-bg)] transition-colors border-b border-[var(--color-border)] last:border-0 ${selectedSession?.id === sess.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-semibold text-sm ${sess.unreadCount > 0 ? 'text-blue-600' : 'text-[var(--color-text-primary)]'}`}>
                                    {sess.userName}
                                </span>
                                {sess.unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{sess.unreadCount}</span>
                                )}
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] truncate">{sess.messages[sess.messages.length - 1]?.text || 'No messages'}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${sess.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                <span className="text-[10px] uppercase text-[var(--color-text-secondary)] tracking-wider">{sess.status}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col bg-[var(--color-bg)]">
                {selectedSession ? (
                    <>
                        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedSession.userName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--color-text-primary)]">{selectedSession.userName}</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{selectedSession.userPhone} • ID: {selectedSession.userId.slice(0, 8)}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleBlockUser}
                                className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <i className="fas fa-ban mr-2"></i> Block User
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-4">
                            {selectedSession.messages.map((m, i) => {
                                const isMe = m.senderId !== 'user';
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] space-y-1`}>
                                            <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-none'
                                                }`}>
                                                {m.text}
                                            </div>
                                            <div className={`text-[10px] text-[var(--color-text-secondary)] ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                            {/* Canned Responses */}
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                                {['Hello, how can we help?', 'Please stay calm.', 'Is it safe to talk?', 'We are dispatching a team.', 'Location confirmed.'].map((msg, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setChatInput(msg)}
                                        className="whitespace-nowrap px-3 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full text-[10px] text-[var(--color-text-secondary)] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                    >
                                        {msg}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handleSendChat} className="flex gap-4 max-w-4xl mx-auto">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-grow px-6 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] opacity-50 space-y-4">
                        <i className="fas fa-comments text-6xl"></i>
                        <p className="text-sm font-medium">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
