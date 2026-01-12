import React, { useState, useEffect } from 'react';
import { Admin } from '../types';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    date: string;
}

export default function AdminTaskBoardPage({ user }: { user: Admin | null }) {
    // Mock Initial Data
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Review Case #8821', description: 'Pending video evidence verification.', status: 'TODO', priority: 'HIGH', date: new Date().toISOString() },
        { id: '2', title: 'Update Safety Protocols', description: 'Draft new guidelines for 2026.', status: 'IN_PROGRESS', priority: 'MEDIUM', date: new Date().toISOString() },
        { id: '3', title: 'System Maintenance', description: 'Check server logs for errors.', status: 'DONE', priority: 'LOW', date: new Date().toISOString() },
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState<{ title: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' }>({ title: '', priority: 'MEDIUM' });
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    // Filter tasks by column
    const columns: { id: TaskStatus, title: string, color: string }[] = [
        { id: 'TODO', title: 'To Do', color: 'border-l-4 border-slate-400' },
        { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-l-4 border-blue-500' },
        { id: 'DONE', title: 'Completed', color: 'border-l-4 border-emerald-500' }
    ];

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        // Transparent drag image hack if desired, or just default
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
        e.preventDefault();
        if (draggedTaskId) {
            setTasks(prev => prev.map(t =>
                t.id === draggedTaskId ? { ...t, status: targetStatus } : t
            ));
            setDraggedTaskId(null);
        }
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        const task: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            status: 'TODO',
            priority: newTask.priority,
            date: new Date().toISOString()
        };
        setTasks([...tasks, task]);
        setNewTask({ title: '', priority: 'MEDIUM' });
        setIsAdding(false);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this task?')) {
            setTasks(prev => prev.filter(t => t.id !== id));
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Task Objectives</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage your operational workflow.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> New Task
                </button>
            </div>

            {/* Add Modal / Inline Form */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[var(--color-surface)] w-full max-w-md rounded-xl p-6 shadow-2xl border border-[var(--color-border)] animate-scale-in">
                        <h3 className="font-bold text-lg mb-4 text-[var(--color-text-primary)]">Create New Objective</h3>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Task Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="e.g. Review updated guidelines..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Priority Level</label>
                                <div className="flex gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewTask({ ...newTask, priority: p as any })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${newTask.priority === p
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-border)]'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {columns.map(col => (
                    <div
                        key={col.id}
                        className="flex flex-col bg-[var(--color-surface)]/50 rounded-xl border border-[var(--color-border)] overflow-hidden"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        {/* Column Header */}
                        <div className={`p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] ${col.color} flex justify-between items-center`}>
                            <h3 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                                {col.title}
                                <span className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full text-xs">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </h3>
                            <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                                <i className="fas fa-ellipsis-h"></i>
                            </button>
                        </div>

                        {/* Task List */}
                        <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-[var(--color-bg)]/30 min-h-[200px]">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group transition-all animate-fade-in relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' :
                                                task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30' :
                                                    'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(task.id, e)}
                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <h4 className="font-semibold text-sm text-[var(--color-text-primary)] mb-1">{task.title}</h4>
                                    {task.description && <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{task.description}</p>}
                                    <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)]">
                                        <i className="fas fa-clock"></i>
                                        <span>{new Date(task.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.status === col.id).length === 0 && (
                                <div className="h-24 border-2 border-dashed border-[var(--color-border)] rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] text-xs font-medium opacity-50">
                                    Drop items here
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
