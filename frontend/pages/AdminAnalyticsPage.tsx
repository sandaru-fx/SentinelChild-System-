
import React, { useMemo, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell, Sector, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import SafetyMap from '../components/SafetyMap';
import { exportToCSV } from '../utils/export';

export default function AdminAnalyticsPage() {
    // --- Mock Data ---

    const trendData = useMemo(() => [
        { name: 'Mon', reports: 4, verified: 2 },
        { name: 'Tue', reports: 7, verified: 5 },
        { name: 'Wed', reports: 15, verified: 10 },
        { name: 'Thu', reports: 10, verified: 8 },
        { name: 'Fri', reports: 22, verified: 18 },
        { name: 'Sat', reports: 12, verified: 9 },
        { name: 'Sun', reports: 8, verified: 6 },
    ], []);

    const statusData = useMemo(() => [
        { name: 'Pending', value: 12, color: '#f59e0b' },
        { name: 'Investigating', value: 25, color: '#3b82f6' },
        { name: 'Resolved', value: 45, color: '#10b981' },
        { name: 'Dismissed', value: 8, color: '#64748b' },
    ], []);

    const regionData = useMemo(() => [
        { name: 'Western', cases: 42, active: 12 },
        { name: 'Central', cases: 28, active: 8 },
        { name: 'Southern', cases: 35, active: 15 },
        { name: 'North West', cases: 18, active: 4 },
        { name: 'Northern', cases: 12, active: 5 },
    ], []);

    const radarData = useMemo(() => [
        { subject: 'Response Time', A: 120, fullMark: 150 },
        { subject: 'Verification', A: 98, fullMark: 150 },
        { subject: 'Resolution', A: 86, fullMark: 150 },
        { subject: 'User Feedback', A: 99, fullMark: 150 },
        { subject: 'System Uptime', A: 85, fullMark: 150 },
        { subject: 'Security', A: 65, fullMark: 150 },
    ], []);

    const [showMap, setShowMap] = useState(false);

    const handleExport = () => {
        const exportData = trendData.map(d => ({
            Date: d.name,
            Total_Reports: d.reports,
            Verified_Cases: d.verified
        }));
        exportToCSV(exportData, `analytics_export_${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Intelligence Analytics</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Advanced operational metrics and forensic data visualization.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <i className="fas fa-download mr-2"></i> Export Report
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm group hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">Total Intake</p>
                            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">1,284</h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                            <i className="fas fa-folder-open"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm group hover:border-amber-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">Active Threats</p>
                            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">42</h3>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm group hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">Clearance Rate</p>
                            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">94.8%</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-500">
                            <i className="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm group hover:border-purple-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">Avg Response</p>
                            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">4h 15m</h3>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                            <i className="fas fa-bolt"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart (Large) - Toggle with Map */}
                <div className="lg:col-span-2 bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-[var(--color-text-primary)]">
                                {showMap ? 'Geospacial Intelligence' : 'Reporting Volume Trends'}
                            </h3>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                {showMap ? 'Heatmap of reported incidents' : 'Daily intake vs verified legitimate cases'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-[var(--color-text-secondary)] hover:text-blue-600 transition-colors"
                        >
                            <i className={`fas ${showMap ? 'fa-chart-area' : 'fa-map'} mr-2`}></i>
                            {showMap ? 'View Charts' : 'View Map'}
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        {showMap ? (
                            <SafetyMap />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                                    <Area type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVerified)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Status Distribution (Pie) */}
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <div className="mb-4">
                        <h3 className="font-bold text-[var(--color-text-primary)]">Case Status</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">Current active file distribution</p>
                    </div>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                            <span className="block text-2xl font-bold text-[var(--color-text-primary)]">90</span>
                            <span className="text-xs text-[var(--color-text-secondary)]">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics Row (Region & Radar) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ... (Kept existing code for Region & Radar, just wrapping in container if needed) ... */}
                {/* Region Bar Chart */}
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-[var(--color-text-primary)]">Regional Breakdown</h3>
                            <p className="text-xs text-[var(--color-text-secondary)]">Case volume by administrative district</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={80} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="cases" fill="#3b82f6" barSize={20} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="active" fill="#f59e0b" barSize={20} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Radar */}
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <div className="mb-6">
                        <h3 className="font-bold text-[var(--color-text-primary)]">System Efficiency</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">Operational performance KPIs vs Targets</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Current Performance"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="#8b5cf6"
                                    fillOpacity={0.3}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
