import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Admin, ChatSession } from '../types';
import AdminChatQueue from '../components/AdminChatQueue';

export default function AdminChatPage({ user }: { user: Admin | null }) {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [notification, setNotification] = useState<{ title: string, msg: string } | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedSession && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedSession?.messages]);

    const selectedSessionRef = useRef<ChatSession | null>(null);

    useEffect(() => {
        selectedSessionRef.current = selectedSession;
    }, [selectedSession]);

    useEffect(() => {
        if (selectedSession && socketRef.current?.readyState === WebSocket.OPEN) {
            console.log('👁️ Sending Seen Event for:', selectedSession.sessionId);
            socketRef.current.send(JSON.stringify({
                type: 'seen',
                sessionId: selectedSession.sessionId
            }));
        }
    }, [selectedSession?.messages?.length, selectedSession?.sessionId]);

    useEffect(() => {
        if (!user?.token || !user?.id) return;

        console.log('🔄 Attempting Admin WS Connection...');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${protocol}//${window.location.hostname}:8080/ws?role=admin&id=${user.id}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('✅ Admin WS Connected');
            fetchChats();
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📩 Admin Received WS Message:', data);

            if (data.type === 'queue_update') {
                setChatSessions(data.payload.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            } else if (data.type === 'chat') {
                const msg = data.payload;
                const targetSessionId = data.sessionId;

                setChatSessions(prev => {
                    const exists = prev.find(s => s.sessionId === targetSessionId);
                    if (exists) {
                        return prev.map(s => {
                            if (s.sessionId === targetSessionId) {
                                return {
                                    ...s,
                                    messages: [...s.messages, msg],
                                    updatedAt: new Date().toISOString(),
                                    unreadCount: selectedSessionRef.current?.sessionId === targetSessionId ? 0 : (s.unreadCount || 0) + 1
                                };
                            }
                            return s;
                        });
                    } else {
                        // If it doesn't exist, we might have missed the queue update. 
                        fetchChats();
                        return prev;
                    }
                });

                if (selectedSessionRef.current?.sessionId === targetSessionId) {
                    setSelectedSession(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
                } else if (msg.senderId === 'user') {
                    setNotification({ title: `New Message`, msg: msg.text });
                    setTimeout(() => setNotification(null), 5000);
                }
            }
        };

        socket.onclose = () => console.log('❌ Admin WS Disconnected');

        return () => {
            socket.close();
        };
    }, [user?.token, user?.id]); // Only reset if user changes

    const fetchChats = async () => {
        if (!user?.token) return;
        const sessions = await api.getChatSessions(user.token);
        setChatSessions(sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !selectedSession || !user || !socketRef.current) return;

        const chatMsg = {
            id: `MSG-${Date.now()}`,
            senderId: user.id || 'admin',
            senderName: user.name,
            text: chatInput,
            timestamp: new Date().toISOString()
        };

        socketRef.current.send(JSON.stringify({
            type: 'chat',
            sessionId: selectedSession.sessionId,
            payload: chatMsg
        }));

        setChatSessions(prev => prev.map(s =>
            s.sessionId === selectedSession.sessionId
                ? { ...s, messages: [...s.messages, chatMsg], updatedAt: new Date().toISOString() }
                : s
        ));
        setSelectedSession(prev => prev ? { ...prev, messages: [...prev.messages, chatMsg] } : null);
        setChatInput('');
    };

    const handleBlockUser = async () => {
        if (!selectedSession || !window.confirm(`Block user by IP: ${selectedSession.ip}?`)) return;
        // In real system, this would call an API to add IP to blacklist
        alert(`User with IP ${selectedSession.ip} has been blocked.`);
        setSelectedSession(null);
    };

    const handleAcceptChat = (sess: ChatSession) => {
        setSelectedSession(sess);
        // Optional: Send "accept" event to backend if needed
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

            {/* Sidebar / Queue */}
            <AdminChatQueue
                sessions={chatSessions}
                onAccept={handleAcceptChat}
                onView={setSelectedSession}
                activeSessionId={selectedSession?.sessionId}
            />

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
