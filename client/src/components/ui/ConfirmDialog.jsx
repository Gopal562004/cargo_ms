import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, RotateCcw, HelpCircle, X } from 'lucide-react';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { useThemeStore } from '../../store/themeStore';

/**
 * Premium Custom Confirmation Dialog
 * Replaces native window.confirm() with a sleek modal supporting Light/Dark theme,
 * danger/warning/info variants, and keyboard shortcuts (Enter/Escape).
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
}) {
  const { theme } = useThemeStore();
  const confirmBtnRef = useRef(null);
  useBodyScrollLock(Boolean(isOpen));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: Trash2,
      iconBg: theme === 'light' ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      btnClass: 'bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: theme === 'light' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      btnClass: 'bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-sm',
    },
    info: {
      icon: HelpCircle,
      iconBg: theme === 'light' ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      btnClass: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm',
    },
  };

  const currentConfig = iconConfig[variant] || iconConfig.danger;
  const IconComponent = currentConfig.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl border overflow-hidden animate-scale-in transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/60'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${currentConfig.iconBg}`}>
              <IconComponent size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Message */}
        <div className="p-5 pt-3">
          <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
            {message}
          </p>
        </div>

        {/* Footer Buttons */}
        <div
          className={`flex items-center justify-end gap-2.5 px-5 py-3.5 border-t ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-100'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {cancelText}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${currentConfig.btnClass}`}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
