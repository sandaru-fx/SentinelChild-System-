import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: string;
        positive: boolean;
    };
    sparklineData?: { value: number }[];
    color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, sparklineData, color = 'blue' }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30',
        red: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
    };

    const sparklineColor = {
        blue: '#3b82f6',
        emerald: '#10b981',
        amber: '#f59e0b',
        purple: '#8b5cf6',
        red: '#ef4444'
    }[color];

    return (
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative">
            {/* Background Sparkline for Senior Look */}
            {sparklineData && (
                <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20 group-hover:opacity-40 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                        <LineChart data={sparklineData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={sparklineColor}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClasses[color]} transition-transform duration-300 group-hover:scale-110`}>
                    <i className={`fas ${icon} text-lg`}></i>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                        }`}>
                        <i className={`fas ${trend.positive ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        {trend.value}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">
                    {title}
                </h3>
                <div className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                    {value}
                </div>
            </div>
        </div>
    );
};
