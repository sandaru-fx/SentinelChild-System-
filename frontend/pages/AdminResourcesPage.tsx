import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    FileText,
    Video,
    BookOpen,
    Globe,
    MoreVertical,
    ChevronRight,
    Save,
    X,
    Languages,
    HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Resource, ResourceType } from '../types';

const AdminResourcesPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [selectedLang, setSelectedLang] = useState<string>('ALL');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentResource, setCurrentResource] = useState<Partial<Resource> | null>(null);
    const [showForm, setShowForm] = useState(false);

    const token = localStorage.getItem('adminToken') || '';

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const data = await api.getResources();
            setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentResource) return;

        try {
            if (isEditing && currentResource.id) {
                await api.updateResource(currentResource.id, currentResource, token);
            } else {
                await api.createResource(currentResource, token);
            }
            setShowForm(false);
            fetchResources();
        } catch (error) {
            console.error('Error saving resource:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await api.deleteResource(id, token);
                fetchResources();
            } catch (error) {
                console.error('Error deleting resource:', error);
            }
        }
    };

    const openForm = (resource: Resource | null = null) => {
        if (resource) {
            setCurrentResource(resource);
            setIsEditing(true);
        } else {
            setCurrentResource({
                title: '',
                description: '',
                type: ResourceType.ARTICLE,
                language: 'en',
                category: 'General',
                content: '',
                icon: 'FileText'
            });
            setIsEditing(false);
        }
        setShowForm(true);
    };

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'ALL' || r.type === filterType;
        const matchesLang = selectedLang === 'ALL' || r.language === selectedLang;
        return matchesSearch && matchesType && matchesLang;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <Video className="w-5 h-5" />;
            case 'GUIDE': return <BookOpen className="w-5 h-5" />;
            case 'FAQ': return <HelpCircle className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Educational Hub CMS</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage resources, articles, and safety guides</p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Plus className="w-4 h-4" />
                    Add New Resource
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="ALL">All Types</option>
                    <option value="ARTICLE">Articles</option>
                    <option value="FAQ">FAQs</option>
                    <option value="VIDEO">Videos</option>
                    <option value="GUIDE">Guides</option>
                </select>
                <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="ALL">All Languages</option>
                    <option value="en">English</option>
                    <option value="si">Sinhala</option>
                    <option value="ta">Tamil</option>
                </select>
            </div>

            {/* Resource Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Language</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading resources...</td>
                            </tr>
                        ) : filteredResources.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No resources found</td>
                            </tr>
                        ) : filteredResources.map((resource) => (
                            <tr key={resource.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            {getIcon(resource.type)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white capitalize">{resource.title}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-xs">{resource.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${resource.type === 'VIDEO' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        resource.type === 'GUIDE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            resource.type === 'FAQ' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                        }`}>
                                        {resource.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Globe className="w-3.5 h-3.5" />
                                        {resource.language === 'en' ? 'English' : resource.language === 'si' ? 'Sinhala' : 'Tamil'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {resource.category}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(resource.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openForm(resource)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(resource.id)}
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
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold dark:text-white">
                                {isEditing ? 'Edit Resource' : 'Add New Resource'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentResource?.title}
                                        onChange={(e) => setCurrentResource({ ...currentResource!, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                                    <select
                                        value={currentResource?.type}
                                        onChange={(e) => setCurrentResource({ ...currentResource!, type: e.target.value as ResourceType })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="ARTICLE">Article</option>
                                        <option value="FAQ">FAQ</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="GUIDE">Guide</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                                    <select
                                        value={currentResource?.language}
                                        onChange={(e) => setCurrentResource({ ...currentResource!, language: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="en">English</option>
                                        <option value="si">Sinhala</option>
                                        <option value="ta">Tamil</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                                    <input
                                        type="text"
                                        value={currentResource?.category}
                                        onChange={(e) => setCurrentResource({ ...currentResource!, category: e.target.value })}
                                        placeholder="e.g. Safety, Cyberbullying"
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={currentResource?.description}
                                    onChange={(e) => setCurrentResource({ ...currentResource!, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URL / Link (Optional)</label>
                                    <input
                                        type="text"
                                        value={currentResource?.link || ''}
                                        onChange={(e) => setCurrentResource({ ...currentResource!, link: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Icon / Image Path</label>
                                    <input
                                        type="text"
                                        value={currentResource?.icon}
                                        placeholder="e.g. /frontend/assets/resources/child_safety.png"
                                        onChange={(e) => setCurrentResource({ ...currentResource!, icon: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Read Time / Duration</label>
                                <input
                                    type="text"
                                    value={currentResource?.readTime || ''}
                                    placeholder="e.g. 5 min read, 10 min video"
                                    onChange={(e) => setCurrentResource({ ...currentResource!, readTime: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Content (Markdown)</label>
                                <textarea
                                    required
                                    rows={8}
                                    value={currentResource?.content}
                                    onChange={(e) => setCurrentResource({ ...currentResource!, content: e.target.value })}
                                    placeholder="Enter the full article content or FAQ answer here..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
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
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none font-bold"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEditing ? 'Update Resource' : 'Save Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminResourcesPage;
