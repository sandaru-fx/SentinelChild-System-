import React, { useState, useEffect } from 'react';

interface SLACountdownProps {
    createdAt: string | Date;
    targetHours?: number;
}

export function SLACountdown({ createdAt, targetHours = 24 }: SLACountdownProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [status, setStatus] = useState<'safe' | 'warning' | 'breached'>('safe');

    useEffect(() => {
        const calculate = () => {
            const created = new Date(createdAt).getTime();
            const deadline = created + (targetHours * 60 * 60 * 1000);
            const now = new Date().getTime();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft('BREACHED');
                setStatus('breached');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours < 4) {
                setStatus('warning');
            } else {
                setStatus('safe');
            }

            setTimeLeft(`${hours}h ${minutes}m`);
        };

        calculate();
        const timer = setInterval(calculate, 60000);
        return () => clearInterval(timer);
    }, [createdAt, targetHours]);

    const colors = {
        safe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
        breached: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-black'
    };

    return (
        <div className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-tighter inline-flex items-center gap-1.5 ${colors[status]}`}>
            <i className={`fas ${status === 'breached' ? 'fa-circle-exclamation' : 'fa-clock'} text-[8px]`}></i>
            {timeLeft}
        </div>
    );
}
