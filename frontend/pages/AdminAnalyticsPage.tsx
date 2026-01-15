import React, { useMemo, useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import SafetyMap from '../components/SafetyMap';
import { exportToCSV } from '../utils/export';
import { CustomChartTooltip } from '../components/admin/CustomChartTooltip';
import { ActiveSectorPie } from '../components/admin/ActiveSectorPie';
import { api } from '../services/api';
import { Admin } from '../types';

export default function AdminAnalyticsPage({ user }: { user: Admin | null }) {
    const [summary, setSummary] = useState<any>(null);
    const [geoData, setGeoData] = useState<any[]>([]);
    const [aiInsight, setAiInsight] = useState<string>("Analyzing current stream...");
    const [isLoading, setIsLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (user?.token) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [s, g, i] = await Promise.all([
                        api.getAnalyticsSummary(user.token),
                        api.getGeospatialData(user.token),
                        api.getAIInsights(user.token)
                    ]);
                    setSummary(s);
                    setGeoData(g);
                    setAiInsight(i.insight);
                } catch (error) {
                    console.error("Analytics fetch error:", error);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchData();
        }
    }, [user]);

    // Format data for charts
    const trendData = useMemo(() => {
        if (!summary?.daily) return [];
        return summary.daily.map((d: any) => ({
            name: d._id.split('-').slice(1).join('/'), // DD/MM
            reports: d.count,
            verified: Math.floor(d.count * 0.7) // Mocking verified for now
        }));
    }, [summary]);

    const statusData = useMemo(() => {
        if (!summary?.byStatus) return [];
        const colors: Record<string, string> = {
            'PENDING': '#f59e0b',
            'INVESTIGATING': '#3b82f6',
            'RESOLVED': '#10b981',
            'DISMISSED': '#64748b'
        };
        return summary.byStatus.map((s: any) => ({
            name: s._id,
            value: s.count,
            color: colors[s._id] || '#94a3b8'
        }));
    }, [summary]);

    const regionData = useMemo(() => [
        { name: 'Western', cases: 42, active: 12 },
        { name: 'Central', cases: 28, active: 8 },
        { name: 'Southern', cases: 35, active: 15 },
        { name: 'North West', cases: 18, active: 4 },
        { name: 'Northern', cases: 12, active: 5 },
    ], []);

    const radarData = useMemo(() => [
        { subject: 'Response', A: 120, fullMark: 150 },
        { subject: 'Verify', A: 98, fullMark: 150 },
        { subject: 'Resolve', A: 86, fullMark: 150 },
        { subject: 'Feedback', A: 99, fullMark: 150 },
        { subject: 'Uptime', A: 145, fullMark: 150 },
        { subject: 'Security', A: 130, fullMark: 150 },
    ], []);

    const handleExport = () => {
        if (!trendData.length) return;
        const exportData = trendData.map(d => ({
            Date: d.name,
            Total_Reports: d.reports,
            Verified_Cases: d.verified
        }));
        exportToCSV(exportData, `analytics_export_${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)] uppercase">Intelligence Analytics</h1>
                    <p className="text-[var(--color-text-secondary)] font-medium text-sm mt-1">Advanced operational metrics and forensic data visualization.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <i className="fas fa-download mr-2"></i> Export intelligence
                    </button>
                </div>
            </div>

            {/* AI Strategic Insights Banner */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fas fa-brain text-6xl text-blue-600"></i>
                </div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                        <i className="fas fa-robot animate-pulse"></i>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">AI Strategic Intelligence</h3>
                        <p className="text-sm font-bold text-[var(--color-text-primary)] leading-relaxed italic">
                            "{aiInsight}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Operational Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart Area */}
                <div className="lg:col-span-2 bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm relative overflow-hidden group min-h-[500px]">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                                {showMap ? 'Geospacial Intelligence Distribution' : 'Incident Intake Velocity'}
                            </h3>
                            <p className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
                                {showMap ? 'Real-time threat mapping' : 'Volume analysis: Daily intake vs clearance'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="text-[10px] font-black uppercase tracking-widest bg-[var(--color-bg)] border border-[var(--color-border)] px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm flex items-center gap-2"
                        >
                            <i className={`fas ${showMap ? 'fa-chart-area' : 'fa-map'}`}></i>
                            {showMap ? 'Data View' : 'Visual Mapping'}
                        </button>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
                            </div>
                        ) : showMap ? (
                            <SafetyMap locations={geoData} />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 700 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="reports"
                                        name="Intake"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorReports)"
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="verified"
                                        name="Verified"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorVerified)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Status Composition (Interactive Pie) */}
                <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm">
                    <div className="mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Case Composition</h3>
                        <p className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">Status Distribution</p>
                    </div>
                    <div className="h-[350px] w-full relative">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <i className="fas fa-spinner fa-spin text-blue-600"></i>
                            </div>
                        ) : (
                            <ActiveSectorPie data={statusData} />
                        )}
                    </div>
                </div>
            </div>

            {/* Region & Efficiency Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Horizontal Bar Chart (Region) */}
                <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Regional Vectoring</h3>
                        <p className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">Hotspot Intensity Analysis</p>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-text-primary)', fontSize: 11, fontWeight: 700 }}
                                    width={90}
                                />
                                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'var(--color-bg)', opacity: 0.4 }} />
                                <Bar dataKey="cases" name="Total Files" fill="#3b82f6" barSize={12} radius={[0, 10, 10, 0]} />
                                <Bar dataKey="active" name="Active Now" fill="#f59e0b" barSize={12} radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Efficiency (Radar) */}
                <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Operational Vector</h3>
                        <p className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">System Node Efficiency</p>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="var(--color-border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 800 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Current Ops"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="#8b5cf6"
                                    fillOpacity={0.2}
                                />
                                <Tooltip content={<CustomChartTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
