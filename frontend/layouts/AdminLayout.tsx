import React, { useState, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Admin } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function AdminLayout({ user, onLogout }: { user: Admin | null; onLogout: () => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        if (!user) {
            navigate('/admin-login');
        }
    }, [user, navigate]);

    // Command palette / Search focus shortcut
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('sidebar-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!user) return null;

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-chart-pie' },
        { name: 'Case Files', path: '/admin/cases', icon: 'fa-folder-open' },
        { name: 'Live Chat', path: '/admin/chat', icon: 'fa-headset' },
        { name: 'Analytics', path: '/admin/analytics', icon: 'fa-chart-line' },
        { name: 'Task Board', path: '/admin/tasks', icon: 'fa-clipboard-check' },
        { name: 'Inquiries', path: '/admin/inquiries', icon: 'fa-microphone-lines' },
        { name: 'Content Manager', path: '/admin/resources', icon: 'fa-book-open-reader' },
        { name: 'Emergency Contacts', path: '/admin/hotlines', icon: 'fa-phone-volume' },
        { name: 'Policy Editor', path: '/admin/settings', icon: 'fa-file-shield' },
        { name: 'Audit Logs', path: '/admin/audit', icon: 'fa-clipboard-list' },
        { name: 'Officers', path: '/admin/users', icon: 'fa-users-gear' },
        { name: 'Settings', path: '/admin/profile', icon: 'fa-cog' },
    ];

    const filteredItems = useMemo(() => {
        return menuItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-colors duration-200 font-sans overflow-hidden">
            {/* Left Sidebar */}
            <aside
                className={`bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)] justify-between overflow-hidden">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                            <i className="fas fa-shield-cat text-sm"></i>
                        </div>
                        <span className="font-bold text-lg tracking-tight whitespace-nowrap">CHARS <span className="text-xs font-medium text-[var(--color-text-secondary)] ml-1">Admin</span></span>
                    </div>
                    {sidebarCollapsed && (
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 absolute left-6">
                            <i className="fas fa-shield-cat text-sm"></i>
                        </div>
                    )}
                </div>

                {/* Sidebar Search */}
                {!sidebarCollapsed && (
                    <div className="px-4 py-4">
                        <div className="relative group">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-blue-500 transition-colors"></i>
                            <input
                                id="sidebar-search"
                                type="text"
                                placeholder="Quick find... (Ctrl+K)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <div className="flex-grow py-2 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {filteredItems.map(item => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={sidebarCollapsed ? item.name : ''}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium relative group ${isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                <i className={`fas ${item.icon} w-5 text-center text-xs ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`}></i>
                                {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                                {isActive && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"></div>
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* User Profile / Collapse Toggle */}
                <div className="p-4 border-t border-[var(--color-border)]">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-[var(--color-border)] shrink-0">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <i className="fas fa-user text-slate-400 text-xs"></i>}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate leading-none mb-1">{user.name}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] truncate">{user.role.replace('_', ' ')}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-full flex items-center justify-center py-2 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] rounded-lg transition-colors border border-dashed border-[var(--color-border)] mb-1"
                        >
                            <i className={`fas ${sidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'} ${!sidebarCollapsed && 'mr-2'}`}></i>
                            {!sidebarCollapsed && "Minimize"}
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <i className="fas fa-sign-out-alt"></i> {!sidebarCollapsed && "Sign Out"}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow h-full overflow-hidden flex flex-col relative">
                {/* Header Bar */}
                <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
                    <div className="flex flex-col gap-0.5">
                        <Breadcrumbs />
                        <h2 className="text-xl font-black capitalize tracking-tight text-[var(--color-text-primary)]">
                            {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-[var(--color-bg)] px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            Live Ops: 124.0.1
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:shadow-inner transition-all border border-transparent hover:border-[var(--color-border)]"
                                title="Toggle Theme"
                            >
                                {theme === 'dark' ? <i className="fas fa-sun text-amber-400"></i> : <i className="fas fa-moon text-slate-600"></i>}
                            </button>

                            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:shadow-inner transition-all border border-transparent hover:border-[var(--color-border)] relative">
                                <i className="fas fa-bell"></i>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--color-surface)]"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Outlet */}
                <div className="flex-grow overflow-y-auto bg-[var(--color-bg)] p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
