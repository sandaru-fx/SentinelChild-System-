import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Admin, AuditLog, AdminRole } from '../types';
import { useTranslation } from '../context/LanguageContext';

type ProfileTab = 'OVERVIEW' | 'SETTINGS' | 'MANAGEMENT' | 'LOGS';

export default function AdminProfilePage({ user: currentUser }: { user: Admin | null }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('OVERVIEW');

  // Settings state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [saving, setSaving] = useState(false);

  // New Admin state
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: AdminRole.VIEWER });

  useEffect(() => {
    if (!currentUser) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser?.token) return;
    setLoading(true);
    try {
      const logData = await api.getAuditLogs(currentUser.token);
      setLogs(logData);

      if (currentUser.role === AdminRole.SUPER_ADMIN) {
        const adminData = await api.getAllAdmins(currentUser.token);
        setAdmins(adminData);
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    const updated = await api.updateAdmin(currentUser.id, { name, email, avatar }, currentUser.token!);
    if (updated) {
      alert("Profile updated. Changes will take effect on your next login.");
    }
    setSaving(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.token) return;
    setSaving(true);
    await api.createAdmin(newAdmin, currentUser.token);
    await fetchData();
    setIsAddingAdmin(false);
    setNewAdmin({ name: '', email: '', role: AdminRole.VIEWER });
    setSaving(false);
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!currentUser?.token || id === currentUser.id) return;
    if (window.confirm("Are you sure you want to revoke this user's access?")) {
      await api.deleteAdmin(id, currentUser.token);
      await fetchData();
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Profile & Settings</h1>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'OVERVIEW' ? 'border-blue-500 text-blue-600' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'SETTINGS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'}`}
          >
            Settings
          </button>
          {currentUser.role === AdminRole.SUPER_ADMIN && (
            <button
              onClick={() => setActiveTab('MANAGEMENT')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'MANAGEMENT' ? 'border-blue-500 text-blue-600' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'}`}
            >
              Team Management
            </button>
          )}
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'LOGS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'}`}
          >
            System Logs
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-[var(--color-text-secondary)]">Loading...</div>
      ) : (
        <>
          {/* LOGS TAB */}
          {activeTab === 'LOGS' && (
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text-primary)]">System Audit Log</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Tracked actions for security and compliance.</p>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {[
                  { action: 'LOGIN_SUCCESS', user: 'Officer Perera', time: '2 mins ago', ip: '192.168.1.10', icon: 'fa-sign-in-alt', color: 'text-emerald-500' },
                  { action: 'REPORT_STATUS_UPDATE', user: 'Admin User', time: '15 mins ago', ip: '192.168.1.5', icon: 'fa-file-alt', color: 'text-blue-500' },
                  { action: 'USER_BLOCKED', user: 'Super Admin', time: '1 hour ago', ip: '10.0.0.12', icon: 'fa-ban', color: 'text-red-500' },
                  { action: 'EXPORT_DATA', user: 'Officer Perera', time: '2 hours ago', ip: '192.168.1.10', icon: 'fa-download', color: 'text-slate-500' },
                  { action: 'LOGIN_FAILED', user: 'Unknown', time: '5 hours ago', ip: '45.22.11.90', icon: 'fa-exclamation-triangle', color: 'text-amber-500' },
                ].map((log, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-[var(--color-bg)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg bg-[var(--color-bg)] flex items-center justify-center ${log.color}`}>
                        <i className={`fas ${log.icon}`}></i>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-[var(--color-text-primary)]">{log.action.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">by {log.user} • {log.ip}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--color-text-secondary)]">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Card */}
              <div className="lg:col-span-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 border border-[var(--color-border)]">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
                      <i className="fas fa-user text-3xl"></i>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{currentUser.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">{currentUser.email}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              {/* Activity Logs */}
              <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                  <h3 className="font-semibold text-[var(--color-text-primary)]">Recent Activity</h3>
                  <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">Refresh</button>
                </div>
                <div className="divide-y divide-[var(--color-border)] max-h-96 overflow-y-auto">
                  {logs.length > 0 ? (
                    logs.map(log => (
                      <div key={log.id} className="p-4 text-sm hover:bg-[var(--color-bg)] transition-colors">
                        <div className="flex justify-between">
                          <span className="font-medium text-[var(--color-text-primary)]">{log.action}</span>
                          <span className="text-xs text-[var(--color-text-secondary)]">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] mt-1">{log.details}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[var(--color-text-secondary)]">No recent activity found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'SETTINGS' && (
            <div className="max-w-2xl mx-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-8">
              <h3 className="text-lg font-bold mb-6 text-[var(--color-text-primary)]">Edit Profile</h3>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--color-border)] flex-shrink-0 relative group cursor-pointer">
                    {avatar || currentUser.avatar ? (
                      <img src={avatar || currentUser.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
                        <i className="fas fa-camera text-xl"></i>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MANAGEMENT TAB */}
          {activeTab === 'MANAGEMENT' && currentUser.role === AdminRole.SUPER_ADMIN && (
            <div className="space-y-8">
              {/* Add New Admin */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Admin Users</h3>
                <button
                  onClick={() => setIsAddingAdmin(!isAddingAdmin)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i> Add Admin
                </button>
              </div>

              {isAddingAdmin && (
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm animate-fade-in">
                  <h4 className="font-semibold mb-4">Add New Administrator</h4>
                  <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={newAdmin.name}
                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={newAdmin.email}
                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Role</label>
                      <select
                        value={newAdmin.role}
                        onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as AdminRole })}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
                      >
                        {Object.values(AdminRole).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                      {saving ? 'Adding...' : 'Confirm Add'}
                    </button>
                  </form>
                </div>
              )}

              {/* Admins Table */}
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-6 py-3 font-medium text-[var(--color-text-secondary)]">Name</th>
                      <th className="px-6 py-3 font-medium text-[var(--color-text-secondary)]">Email</th>
                      <th className="px-6 py-3 font-medium text-[var(--color-text-secondary)]">Role</th>
                      <th className="px-6 py-3 font-medium text-[var(--color-text-secondary)] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {admins.map(admin => (
                      <tr key={admin.id} className="hover:bg-[var(--color-bg)]">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            {admin.avatar ? <img src={admin.avatar} className="w-full h-full object-cover" /> : null}
                          </div>
                          <span className="font-medium text-[var(--color-text-primary)]">{admin.name}</span>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">{admin.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.role === AdminRole.SUPER_ADMIN ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {admin.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove Admin"
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
          )}
        </>
      )}
    </div>
  );
}
