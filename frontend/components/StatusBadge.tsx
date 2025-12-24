
import React from 'react';
import { ReportStatus } from '../types';

export const StatusBadge = ({ status, size = 'sm' }: { status: ReportStatus; size?: 'sm' | 'lg' }) => {
  const configs = {
    [ReportStatus.PENDING]: { bg: 'bg-yellow-400', text: 'text-white', icon: 'fa-hourglass' },
    [ReportStatus.VERIFIED]: { bg: 'bg-green-500', text: 'text-white', icon: 'fa-check' },
    [ReportStatus.INVESTIGATING]: { bg: 'bg-blue-600', text: 'text-white', icon: 'fa-magnifying-glass' },
    [ReportStatus.FORWARDED]: { bg: 'bg-indigo-600', text: 'text-white', icon: 'fa-share-nodes' },
    [ReportStatus.CLOSED]: { bg: 'bg-slate-400', text: 'text-white', icon: 'fa-circle-check' },
  };

  const config = configs[status];
  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-2 py-0.5 text-[10px]';

  return (
    <span className={`${config.bg} ${config.text} ${sizeClasses} rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm`}>
      <i className={`fas ${config.icon}`}></i> {status}
    </span>
  );
};
