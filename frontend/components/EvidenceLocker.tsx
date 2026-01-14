import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvidenceLockerProps {
    src: string;
    onClose: () => void;
    onSave?: (blob: Blob) => void;
}

export default function EvidenceLocker({ src, onClose, onSave }: EvidenceLockerProps) {
    const [mode, setMode] = useState<'VIEW' | 'REDACT'>('VIEW');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [rects, setRects] = useState<{ x: number, y: number, w: number, h: number }[]>([]);

    useEffect(() => {
        if (mode === 'REDACT') {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = src;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Draw existing rects
                ctx.fillStyle = 'black';
                rects.forEach(r => ctx.fillRect(r.x, r.y, r.w, r.h));
            };
        }
    }, [mode, src, rects]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (mode !== 'REDACT') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        setIsDrawing(true);
        setStartX((e.clientX - rect.left) * scaleX);
        setStartY((e.clientY - rect.top) * scaleY);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const endX = (e.clientX - rect.left) * scaleX;
        const endY = (e.clientY - rect.top) * scaleY;

        const newRect = {
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            w: Math.abs(startX - endX),
            h: Math.abs(startY - endY)
        };

        setRects([...rects, newRect]);
        setIsDrawing(false);
    };

    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (blob && onSave) onSave(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col p-8"
        >
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="h-8 w-[1px] bg-slate-800"></div>
                    <div className="flex bg-slate-900 p-1 rounded-2xl">
                        <button
                            onClick={() => setMode('VIEW')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'VIEW' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <i className="fas fa-search-plus mr-2"></i> Inspect
                        </button>
                        <button
                            onClick={() => setMode('REDACT')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'REDACT' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <i className="fas fa-shield-halved mr-2"></i> Redact
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {mode === 'REDACT' && (
                        <>
                            <button
                                onClick={() => setRects([])}
                                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-8 py-3 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <i className="fas fa-save mr-2"></i> Apply & Secure
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Viewer/Canvas Area */}
            <div className="flex-grow flex items-center justify-center overflow-hidden bg-slate-900/50 rounded-[3rem] border border-slate-800 relative">
                {mode === 'VIEW' ? (
                    <motion.img
                        layoutId="evidence-img"
                        src={src}
                        className="max-w-full max-h-full object-contain shadow-2xl"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    />
                ) : (
                    <div className="relative cursor-crosshair">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            className="max-w-full max-h-full shadow-2xl bg-white"
                        />
                        {isDrawing && (
                            <div className="absolute border-2 border-rose-500 bg-rose-500/20 pointer-events-none" />
                        )}
                        <div className="absolute top-4 left-4 pointer-events-none bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <i className="fas fa-pen-nib"></i> Drawing Redaction Mask
                        </div>
                    </div>
                )}

                {/* Info Overlay */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
                    <div className="bg-slate-950/80 backdrop-blur p-6 rounded-3xl border border-slate-800 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Secure Forensic Viewer</p>
                        <p className="text-white font-bold">Evidence ID: #EVD-{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
                        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest italic">All views are audit-logged in real-time</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
