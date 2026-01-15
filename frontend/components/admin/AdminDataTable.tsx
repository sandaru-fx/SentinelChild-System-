import React, { useState } from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface AdminDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    actions?: (item: T) => React.ReactNode;
    // Pagination & Search
    totalItems?: number;
    currentPage?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    onSearch?: (query: string) => void;
    // Selection
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
}

export function AdminDataTable<T>({
    data,
    columns,
    keyField,
    onRowClick,
    isLoading,
    emptyMessage = "No records found",
    actions,
    totalItems = 0,
    currentPage = 1,
    itemsPerPage = 20,
    onPageChange,
    onSearch,
    selectedIds = [],
    onSelectionChange
}: AdminDataTableProps<T>) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedIds.length === data.length) {
            onSelectionChange?.([]);
        } else {
            onSelectionChange?.(data.map((item: any) => String(item[keyField])));
        }
    };

    const toggleSelectRow = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            onSelectionChange?.(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange?.([...selectedIds, id]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Table Search & Header Extra */}
            <div className="flex justify-between items-center px-2">
                {onSearch && (
                    <div className="relative w-64">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input
                            type="text"
                            placeholder="Search records..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-500 font-medium"
                        />
                    </div>
                )}
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Assets: {totalItems}
                </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-bg)]/50 border-b border-[var(--color-border)]">
                                {onSelectionChange && (
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={data.length > 0 && selectedIds.length === data.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500/20"
                                        />
                                    </th>
                                )}
                                {columns.map((col, idx) => (
                                    <th key={idx} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] ${col.className}`}>
                                        {col.header}
                                    </th>
                                ))}
                                {actions && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {onSelectionChange && <td className="px-6 py-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>}
                                        {columns.map((_, idx) => (
                                            <td key={idx} className="px-6 py-4">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                            </td>
                                        ))}
                                        {actions && <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 ml-auto"></div></td>}
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0) + (onSelectionChange ? 1 : 0)} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        <i className="fas fa-inbox block text-3xl mb-2 opacity-20"></i>
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => {
                                    const id = String((item as any)[keyField]);
                                    const isSelected = selectedIds.includes(id);

                                    return (
                                        <tr
                                            key={id}
                                            onClick={() => onRowClick?.(item)}
                                            className={`group transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/5' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                        >
                                            {onSelectionChange && (
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => toggleSelectRow(e as any, id)}
                                                        className="rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500/20"
                                                    />
                                                </td>
                                            )}
                                            {columns.map((col, idx) => (
                                                <td key={idx} className={`px-6 py-4 text-sm ${col.className}`}>
                                                    <span className="text-[var(--color-text-primary)] font-medium">
                                                        {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as any)}
                                                    </span>
                                                </td>
                                            ))}
                                            {actions && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {actions(item)}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-6 py-4 bg-[var(--color-bg)]/30 border-t border-[var(--color-border)] flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange?.(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-colors"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => onPageChange?.(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
