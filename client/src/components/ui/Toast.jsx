import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

const TYPE_STYLES = {
  success: 'bg-emerald-950/90 border-emerald-800/80 text-emerald-200 icon-bg-emerald-500/20',
  error: 'bg-rose-950/90 border-rose-800/80 text-rose-200 icon-bg-rose-500/20',
  warning: 'bg-amber-950/90 border-amber-800/80 text-amber-200 icon-bg-amber-500/20',
  info: 'bg-indigo-950/90 border-indigo-800/80 text-indigo-200 icon-bg-indigo-500/20',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message, duration: 6000 }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`pointer-events-auto flex items-start gap-3 p-4 border rounded-xl shadow-xl backdrop-blur-md animate-fade-in-up ${TYPE_STYLES[t.type] || TYPE_STYLES.info}`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 bg-white/10">
              {t.type === 'success' && '✓'}
              {t.type === 'error' && '✕'}
              {t.type === 'warning' && '⚠'}
              {t.type === 'info' && 'ℹ'}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold text-slate-100">{t.title}</p>}
              {t.message && <p className="text-xs text-slate-300 mt-0.5">{t.message}</p>}
            </div>
            <button 
              className="text-slate-400 hover:text-white text-xs p-1" 
              onClick={() => removeToast(t.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
