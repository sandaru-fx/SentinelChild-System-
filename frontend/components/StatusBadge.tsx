
import React from 'react';
import { ReportStatus } from '../types';

export const StatusBadge = ({ status, size = 'sm' }: { status: ReportStatus; size?: 'sm' | 'lg' }) => {
  const configs = {
    [ReportStatus.PENDING]: { bg: 'bg-amber-100/50', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500', icon: 'fa-hourglass-half' },
    [ReportStatus.VERIFIED]: { bg: 'bg-emerald-100/50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500', icon: 'fa-check' },
    [ReportStatus.INVESTIGATING]: { bg: 'bg-blue-100/50', border: 'border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500', icon: 'fa-magnifying-glass' },
    [ReportStatus.FORWARDED]: { bg: 'bg-indigo-100/50', border: 'border-indigo-200', text: 'text-indigo-600', dot: 'bg-indigo-500', icon: 'fa-share-nodes' },
    [ReportStatus.CLOSED]: { bg: 'bg-slate-100/50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-500', icon: 'fa-circle-check' },
  };

  const config = configs[status];
  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-xs' : 'px-2 py-1 text-[9px]';

  return (
    <span className={`${config.bg} ${config.text} ${config.border} border ${sizeClasses} rounded-lg font-black uppercase tracking-widest inline-flex items-center gap-2 backdrop-blur-sm transition-all shadow-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shrink-0`}></span>
      <i className={`fas ${config.icon} opacity-60`}></i>
      {status}
    </span>
  );
};
