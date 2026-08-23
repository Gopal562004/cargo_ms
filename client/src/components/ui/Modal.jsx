import React, { useEffect, useRef } from 'react';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

/**
 * Glassmorphic modal with backdrop blur and animation styled using Tailwind CSS.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className = '',
}) {
  const modalRef = useRef(null);
  useBodyScrollLock(Boolean(isOpen));

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size] || sizeClasses.md} bg-slate-900 border border-slate-800 rounded-md shadow-2xl overflow-hidden animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
            {title && <h3 id="modal-title" className="text-lg font-semibold text-slate-100">{title}</h3>}
            {showClose && (
              <button 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" 
                onClick={onClose} 
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
