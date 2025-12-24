
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Admin, AuditLog, AdminRole } from '../types';
import { useTranslation } from '../context/LanguageContext';

type ProfileTab = 'OVERVIEW' | 'SETTINGS' | 'MANAGEMENT';

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
    const logData = await api.getAuditLogs(currentUser.token);
    setLogs(logData);
    
    if (currentUser.role === AdminRole.SUPER_ADMIN) {
      const adminData = await api.getAllAdmins(currentUser.token);
      setAdmins(adminData);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    const updated = await api.updateAdmin(currentUser.id, { name, email, avatar }, currentUser.token!);
    if (updated) {
      // In a real app, we'd update the global user state here.
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

  const getRoleColor = (role: AdminRole) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN: return 'from-amber-400 to-amber-600 text-amber-600 bg-amber-50';
      case AdminRole.POLICE_OFFICER: return 'from-blue-500 to-blue-700 text-blue-600 bg-blue-50';
      default: return 'from-slate-400 to-slate-600 text-slate-600 bg-slate-50';
    }
  };

  const roleMeta = getRoleColor(currentUser.role).split(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className={`h-24 bg-gradient-to-br ${roleMeta[0]} ${roleMeta[1]}`}></div>
            <div className="px-6 pb-6 -mt-10 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-lg mx-auto flex items-center justify-center text-3xl mb-3 border-4 border-white overflow-hidden">
                {avatar || currentUser.avatar ? (
                  <img src={avatar || currentUser.avatar} className="w-full h-full object-cover" />
                ) : (
                  <i className={`fas ${currentUser.role === AdminRole.SUPER_ADMIN ? 'fa-user-tie' : 'fa-user-shield'} text-slate-800`}></i>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">{currentUser.name}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{currentUser.email}</p>
              
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                <i className="fas fa-certificate text-amber-400"></i> {currentUser.role}
              </div>
            </div>

            <div className="px-2 pb-4 space-y-1">
              {[
                { id: 'OVERVIEW', icon: 'fa-house-user', label: 'Overview' },
                { id: 'SETTINGS', icon: 'fa-sliders', label: 'Account Settings' },
                ...(currentUser.role === AdminRole.SUPER_ADMIN ? [{ id: 'MANAGEMENT', icon: 'fa-users-gear', label: 'Personnel Management' }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white text-center">
             <i className="fas fa-shield-halved text-blue-500 text-2xl mb-3"></i>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Security Level</p>
             <p className="text-sm font-bold opacity-60">Authorized Command Node</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8 animate-fade-in">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
                 <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl text-blue-600 shrink-0">
                   <i className="fas fa-fingerprint"></i>
                 </div>
                 <div className="space-y-2 text-center md:text-left">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Identity Verified</h3>
                   <p className="text-slate-500 font-medium text-sm">Your account is secured with end-to-end encryption. All actions performed on this terminal are logged for forensic audit.</p>
                 </div>
               </div>

               <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <i className="fas fa-list-ul text-blue-600"></i> Audit History
                   </h3>
                   <button onClick={fetchData} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Refresh Logs</button>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-slate-50">
                         <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                         <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                         <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {logs.map(log => (
                         <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                             <span className="text-sm font-black text-slate-900">{log.action}</span>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{log.details}</p>
                           </td>
                           <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">{log.reportId}</td>
                           <td className="px-8 py-6 text-xs text-slate-500 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
               <div className="p-10">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Personal Records</h2>
                 <form onSubmit={handleSaveProfile} className="space-y-8">
                   <div className="flex flex-col md:flex-row gap-10 items-start">
                     <div className="space-y-4 text-center">
                        <div className="w-32 h-32 bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner group relative">
                          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fas fa-camera text-2xl"></i></div>}
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-2">
                             <i className="fas fa-upload"></i>
                             <span className="text-[8px] font-black uppercase">Change</span>
                             <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                          </label>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile Identity Image</p>
                     </div>

                     <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                          <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agency Email</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Role</label>
                          <div className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black uppercase text-xs text-slate-400">
                             {currentUser.role} (Restricted)
                          </div>
                        </div>
                     </div>
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 disabled:opacity-50"
                      >
                        {saving ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                        {saving ? 'Synchronizing...' : 'Save Profile Updates'}
                      </button>
                   </div>
                 </form>
               </div>
            </div>
          )}

          {activeTab === 'MANAGEMENT' && currentUser.role === AdminRole.SUPER_ADMIN && (
            <div className="space-y-8 animate-fade-in">
               <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Force Command</h2>
                  <button 
                    onClick={() => setIsAddingAdmin(true)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-user-plus"></i> New Personnel
                  </button>
               </div>

               {isAddingAdmin && (
                 <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white animate-slide-up border border-slate-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Authorized Personnel Enrollment</h3>
                       <button onClick={() => setIsAddingAdmin(false)} className="text-white/40 hover:text-white"><i className="fas fa-times"></i></button>
                    </div>
                    <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Name</label>
                         <input 
                           type="text" 
                           required
                           value={newAdmin.name}
                           onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Officer Name"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Agency Email</label>
                         <input 
                           type="email" 
                           required
                           value={newAdmin.email}
                           onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="email@chars.gov"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Clearance Level</label>
                         <select 
                           value={newAdmin.role}
                           onChange={e => setNewAdmin({...newAdmin, role: e.target.value as AdminRole})}
                           className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                         >
                           {Object.values(AdminRole).map(r => <option key={r} value={r} className="text-slate-900">{r}</option>)}
                         </select>
                       </div>
                       <div className="md:col-span-3 pt-4 flex justify-end">
                         <button 
                           type="submit" 
                           disabled={saving}
                           className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                         >
                           {saving ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-shield-check"></i>}
                           Grant Access
                         </button>
                       </div>
                    </form>
                 </div>
               )}

               <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {admins.map(admin => (
                          <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                                    {admin.avatar ? <img src={admin.avatar} className="w-full h-full object-cover" /> : <i className="fas fa-user text-slate-400"></i>}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-900">{admin.name}</p>
                                     <p className="text-[10px] text-slate-400 font-bold">{admin.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getRoleColor(admin.role)}`}>
                                 {admin.role}
                               </span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex justify-end gap-2">
                                  <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><i className="fas fa-pen text-[10px]"></i></button>
                                  <button 
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                    disabled={admin.id === currentUser.id}
                                    className={`w-8 h-8 rounded-lg ${admin.id === currentUser.id ? 'opacity-20 cursor-not-allowed' : 'bg-red-50 text-red-400 hover:bg-red-500 hover:text-white'} transition-all`}
                                  >
                                    <i className="fas fa-trash-alt text-[10px]"></i>
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
