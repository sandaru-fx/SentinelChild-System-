import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Admin } from '../types';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout({ user, onLogout }: { user: Admin | null; onLogout: () => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    React.useEffect(() => {
        if (!user) {
            navigate('/admin-login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-chart-pie' },
        { name: 'Case Files', path: '/admin/cases', icon: 'fa-folder-open' }, // Updated Path will be handled later
        { name: 'Live Chat', path: '/admin/chat', icon: 'fa-headset' },
        { name: 'Analytics', path: '/admin/analytics', icon: 'fa-chart-line' },
        { name: 'Task Board', path: '/admin/tasks', icon: 'fa-clipboard-check' },
        { name: 'Inquiries', path: '/admin/inquiries', icon: 'fa-microphone-lines' },
        { name: 'Officers', path: '/admin/users', icon: 'fa-users-gear' }, // Updated Path
        { name: 'Settings', path: '/admin/profile', icon: 'fa-cog' },
    ];

    return (
        <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-colors duration-200 font-sans">
            {/* Left Sidebar - Standard Clean Look */}
            <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shrink-0 z-20">
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <i className="fas fa-shield-cat text-sm"></i>
                        </div>
                        <span className="font-bold text-lg tracking-tight">CHARS <span className="text-xs font-medium text-[var(--color-text-secondary)] ml-1">Admin</span></span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-grow py-6 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin/dashboard');

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                <i className={`fas ${item.icon} w-5 text-center text-xs ${isActive ? '' : 'opacity-70'}`}></i>
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* User Profile / Footer */}
                <div className="p-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <i className="fas fa-user text-slate-400 text-xs"></i>}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] truncate capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <i className="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow h-full overflow-hidden flex flex-col relative">
                {/* Header Bar */}
                <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-8 shrink-0 z-10">
                    <h2 className="text-xl font-semibold capitalize tracking-tight">
                        {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <i className="fas fa-sun text-amber-400"></i> : <i className="fas fa-moon text-slate-600"></i>}
                        </button>

                        <div className="h-6 w-[1px] bg-[var(--color-border)]"></div>

                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors relative">
                            <i className="fas fa-bell"></i>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                        </button>
                    </div>
                </header>

                {/* Content Outlet */}
                <div className="flex-grow overflow-y-auto bg-[var(--color-bg)] p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
