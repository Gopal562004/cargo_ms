import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

/**
 * Standard, robust Input component with clear non-collapsing top label, icon support,
 * password toggle capability, and responsive dark/light styling.
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
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`text-xs font-mono font-medium flex items-center justify-between ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}
        >
          <span>
            {label}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div
        className={`relative flex items-center border rounded transition-all ${
          isLight ? 'bg-white' : 'bg-slate-950/60'
        } ${
          error
            ? 'border-rose-500/80 ring-1 ring-rose-500/20'
            : isLight
            ? 'border-slate-300 hover:border-slate-400 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30'
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
          type={effectiveType}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`w-full py-2.5 ${isPassword ? 'pr-1' : 'pr-3'} bg-transparent text-xs sm:text-sm outline-none transition-colors ${
            isLight
              ? 'text-slate-900 placeholder-slate-400'
              : 'text-slate-100 placeholder-slate-500'
          } ${
            icon ? 'pl-2.5' : 'pl-3'
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="pr-3 pl-1.5 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={15} className="text-indigo-400" /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {error && <span className="text-xs text-rose-400 font-mono pl-0.5">{error}</span>}
    </div>
  );
}
