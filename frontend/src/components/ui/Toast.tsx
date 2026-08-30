import React, { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];

export const toast = {
  show: (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, message, type }];
    toastListeners.forEach(listener => listener(toasts));
    
    // Auto remove after 3s
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      toastListeners.forEach(listener => listener(toasts));
    }, 3000);
  },
  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  warning: (message: string) => toast.show(message, 'warning'),
  info: (message: string) => toast.show(message, 'info'),
};

export const ToastContainer: React.FC = () => {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setActiveToasts);
    return () => {
      toastListeners = toastListeners.filter(l => l !== setActiveToasts);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full">
      {activeToasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            t.type === 'success' ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' :
            t.type === 'error' ? 'bg-slate-900 border-red-500/30 text-red-400' :
            t.type === 'warning' ? 'bg-slate-900 border-amber-500/30 text-amber-400' :
            'bg-slate-900 border-cyan-500/30 text-cyan-400'
          }`}
        >
          <span className={`h-2 w-2 rounded-full shrink-0 ${
            t.type === 'success' ? 'bg-emerald-400 animate-pulse' :
            t.type === 'error' ? 'bg-red-400 animate-pulse' :
            t.type === 'warning' ? 'bg-amber-400 animate-pulse' :
            'bg-cyan-400 animate-pulse'
          }`} />
          <div className="flex-1 text-slate-100">{t.message}</div>
        </div>
      ))}
    </div>
  );
};
export default toast;
