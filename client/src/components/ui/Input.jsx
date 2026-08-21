import React from 'react';

/**
 * Standard, robust Input component with clear non-collapsing top label, icon support,
 * and responsive dark/light styling.
 */
export default function Input({
  label,
  error,
  icon,
  type = 'text',
  className = '',
  id,
  required,
  disabled,
  placeholder,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div
        className={`relative flex items-center bg-slate-950/60 border rounded transition-all ${
          error
            ? 'border-rose-500/80 ring-1 ring-rose-500/20'
            : 'border-slate-800 hover:border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30'
        }`}
      >
        {icon && (
          <span className="pl-3 text-slate-400 text-sm select-none pointer-events-none flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`w-full py-2.5 pr-3 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors ${
            icon ? 'pl-2.5' : 'pl-3'
          }`}
          {...props}
        />
      </div>

      {error && <span className="text-xs text-rose-400 font-mono pl-0.5">{error}</span>}
    </div>
  );
}
