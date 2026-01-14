import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Phone,
    Info,
    Globe,
    Save,
    X,
    Shield,
    MapPin,
    List
} from 'lucide-react';
import { api } from '../services/api';
import { Hotline } from '../types';

const AdminHotlinePage: React.FC = () => {
    const [hotlines, setHotlines] = useState<Hotline[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLang, setSelectedLang] = useState<string>('ALL');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentHotline, setCurrentHotline] = useState<Partial<Hotline> | null>(null);
    const [showForm, setShowForm] = useState(false);

    const token = localStorage.getItem('adminToken') || '';

    useEffect(() => {
        fetchHotlines();
    }, []);

    const fetchHotlines = async () => {
        setLoading(true);
        try {
            const data = await api.getHotlines();
            setHotlines(data);
        } catch (error) {
            console.error('Error fetching hotlines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentHotline) return;

        try {
            if (isEditing && currentHotline.id) {
                await api.updateHotline(currentHotline.id, currentHotline, token);
            } else {
                await api.createHotline(currentHotline, token);
            }
            setShowForm(false);
            fetchHotlines();
        } catch (error) {
            console.error('Error saving hotline:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this hotline?')) {
            try {
                await api.deleteHotline(id, token);
                fetchHotlines();
            } catch (error) {
                console.error('Error deleting hotline:', error);
            }
        }
    };

    const openForm = (hotline: Hotline | null = null) => {
        if (hotline) {
            setCurrentHotline(hotline);
            setIsEditing(true);
        } else {
            setCurrentHotline({
                name: '',
                number: '',
                description: '',
                icon: 'Phone',
                category: 'Emergency',
                language: 'en',
                priority: 0
            });
            setIsEditing(false);
        }
        setShowForm(true);
    };

    const filteredHotlines = hotlines.filter(h => {
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.number.includes(searchQuery);
        const matchesLang = selectedLang === 'ALL' || h.language === selectedLang;
        return matchesSearch && matchesLang;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Manager</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage critical hotline numbers and emergency services</p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-rose-200 dark:shadow-none"
                >
                    <Plus className="w-4 h-4" />
                    Add New Hotline
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search hotlines or numbers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                >
                    <option value="ALL">All Languages</option>
                    <option value="en">English</option>
                    <option value="si">Sinhala</option>
                    <option value="ta">Tamil</option>
                </select>
            </div>

            {/* Hotline Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Number</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Language</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading hotlines...</td>
                            </tr>
                        ) : filteredHotlines.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No hotlines found</td>
                            </tr>
                        ) : filteredHotlines.map((hotline) => (
                            <tr key={hotline.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">{hotline.name}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-xs">{hotline.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-lg">
                                        {hotline.number}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Globe className="w-3.5 h-3.5" />
                                        {hotline.language === 'en' ? 'English' : hotline.language === 'si' ? 'Sinhala' : 'Tamil'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                                        #{hotline.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openForm(hotline)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(hotline.id)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Form Overlay */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold dark:text-white">
                                {isEditing ? 'Edit Hotline' : 'Add New Hotline'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Service Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentHotline?.name}
                                        onChange={(e) => setCurrentHotline({ ...currentHotline!, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hotline Number</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentHotline?.number}
                                        onChange={(e) => setCurrentHotline({ ...currentHotline!, number: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                                    <select
                                        value={currentHotline?.language}
                                        onChange={(e) => setCurrentHotline({ ...currentHotline!, language: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="si">Sinhala</option>
                                        <option value="ta">Tamil</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Priority (Sort Order)</label>
                                    <input
                                        type="number"
                                        value={currentHotline?.priority}
                                        onChange={(e) => setCurrentHotline({ ...currentHotline!, priority: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={currentHotline?.description}
                                    onChange={(e) => setCurrentHotline({ ...currentHotline!, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-2 rounded-xl transition-all shadow-lg shadow-rose-200 dark:shadow-none font-bold"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEditing ? 'Update Hotline' : 'Save Hotline'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHotlinePage;
