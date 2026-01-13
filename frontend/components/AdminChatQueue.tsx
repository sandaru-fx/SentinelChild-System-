import React from 'react';
import { ChatSession } from '../types';

interface QueueProps {
    sessions: ChatSession[];
    onAccept: (session: ChatSession) => void;
    onView: (session: ChatSession) => void;
    activeSessionId?: string;
}

export default function AdminChatQueue({ sessions, onAccept, onView, activeSessionId }: QueueProps) {
    const pending = sessions.filter(s => s.status === 'PENDING' || s.status === 'ACTIVE');

    return (
        <div className="w-80 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] h-full">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] z-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-[var(--color-text-primary)]">Live Queue</h2>
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {pending.length} Waiting
                    </span>
                </div>
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-xs"></i>
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto">
                {pending.length === 0 ? (
                    <div className="p-8 text-center space-y-3 opacity-40">
                        <i className="fas fa-clock text-4xl"></i>
                        <p className="text-xs font-medium">No pending requests</p>
                    </div>
                ) : (
                    pending.map(session => (
                        <button
                            key={session.sessionId}
                            onClick={() => onView(session)}
                            className={`w-full text-left p-4 hover:bg-[var(--color-bg)] transition-all border-b border-[var(--color-border)] last:border-0 relative group ${activeSessionId === session.sessionId ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-xs text-[var(--color-text-primary)] truncate max-w-[120px]">
                                    {session.userName || 'Anonymous'}
                                </span>
                                <span className="text-[9px] text-[var(--color-text-secondary)] font-mono">
                                    {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1 mb-3">
                                {session.messages[session.messages.length - 1]?.text || 'No messages yet...'}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${session.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                    <span className="text-[9px] uppercase font-bold tracking-tighter text-[var(--color-text-secondary)]">
                                        {session.status}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAccept(session); }}
                                    className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                >
                                    Accept
                                </button>
                            </div>

                            {session.unreadCount > 0 && (
                                <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
