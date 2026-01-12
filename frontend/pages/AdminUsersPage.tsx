import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Admin, AdminRole } from '../types';

export default function AdminUsersPage({ user }: { user: Admin | null }) {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: AdminRole.VIEWER });

    useEffect(() => {
        if (user?.token) {
            fetchAdmins();
        }
    }, [user]);

    const fetchAdmins = async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const data = await api.getAllAdmins(user.token);
            setAdmins(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;
        await api.createAdmin(newAdmin, user.token);
        setIsAdding(false);
        setNewAdmin({ name: '', email: '', role: AdminRole.VIEWER });
        fetchAdmins();
    };

    const handleDelete = async (id: string) => {
        if (!user?.token || !window.confirm("Remove this user?")) return;
        await api.deleteAdmin(id, user.token);
        fetchAdmins();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Personnel Management</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage authorized access and roles.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-slate-900 dark:bg-slate-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                >
                    <i className="fas fa-user-plus"></i> Enlist New
                </button>
            </div>

            {isAdding && (
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg animate-fade-in relative">
                    <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-red-500"><i className="fas fa-times"></i></button>
                    <h3 className="font-bold mb-4 text-[var(--color-text-primary)]">New Personnel Entry</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                value={newAdmin.name}
                                onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                value={newAdmin.email}
                                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Auth Role</label>
                            <select
                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm"
                                value={newAdmin.role}
                                onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as AdminRole })}
                            >
                                {Object.values(AdminRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors h-[38px]">
                            Confirm Add
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-[var(--color-text-secondary)]">Identity</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-[var(--color-text-secondary)]">Contact Node</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-[var(--color-text-secondary)]">Clearance</th>
                            <th className="px-6 py-4 font-bold text-xs uppercase text-[var(--color-text-secondary)] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {admins.map(admin => (
                            <tr key={admin.id} className="hover:bg-[var(--color-bg)] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-[var(--color-text-secondary)] text-xs">
                                            {admin.avatar ? <img src={admin.avatar} className="w-full h-full object-cover" /> : <i className="fas fa-user"></i>}
                                        </div>
                                        <span className="font-semibold text-sm text-[var(--color-text-primary)]">{admin.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] font-mono">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${admin.role === AdminRole.SUPER_ADMIN ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                        }`}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {admin.id !== user?.id && (
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
