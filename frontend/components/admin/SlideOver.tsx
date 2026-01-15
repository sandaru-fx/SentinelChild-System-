import React, { useEffect } from 'react';

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: string;
}

export const SlideOver: React.FC<SlideOverProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = 'max-w-md'
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    return (
        <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                ></div>

                <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                    <div className={`w-screen ${width} transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="h-full flex flex-col bg-[var(--color-surface)] shadow-2xl border-l border-[var(--color-border)]">
                            {/* Header */}
                            <div className="px-6 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/30">
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)] uppercase">
                                        {title}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-[var(--color-bg)] hover:text-red-500 transition-all"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                                {children}
                            </div>

                            {/* Footer */}
                            {footer && (
                                <div className="px-6 py-6 border-t border-[var(--color-border)] bg-[var(--color-bg)]/30">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
