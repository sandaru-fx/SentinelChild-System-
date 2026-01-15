import React from 'react';

export const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] p-4 rounded-xl shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-2 border-b border-[var(--color-border)] pb-1">
                    {label}
                </p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color || entry.fill }}
                            ></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[var(--color-text-primary)] capitalize">
                                    {entry.name}: {entry.value}
                                </span>
                                {entry.payload?.trend && (
                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${entry.payload.trend > 0 ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                        {entry.payload.trend > 0 ? '+' : ''}{entry.payload.trend}% vs avg
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};
