import React, { useState } from 'react';

/**
 * Input component with floating label, error state, and icon support styled with Tailwind CSS.
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
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value !== undefined && props.value !== '';
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const isFloating = hasValue || focused;

  return (
    <div className={`flex flex-col gap-1 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <div className={`relative flex items-center bg-slate-900/60 border rounded-lg transition-all duration-200 ${
        error ? 'border-rose-500/80 focus-within:ring-2 focus-within:ring-rose-500/20' : 
        focused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
      }`}>
        {icon && (
          <span className="pl-3 text-slate-400 text-sm select-none pointer-events-none">{icon}</span>
        )}
        
        <input
          id={inputId}
          type={type}
          className={`w-full py-3 pr-3 bg-transparent text-sm text-slate-100 placeholder-transparent outline-none transition-all ${
            icon ? 'pl-2' : 'pl-3'
          } ${isFloating ? 'pt-5 pb-1' : ''}`}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          disabled={disabled}
          required={required}
          placeholder={label || ''}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={`absolute left-0 transition-all duration-200 pointer-events-none select-none ${
              icon ? (isFloating ? 'left-8 top-1.5 text-[10px]' : 'left-8 top-3 text-sm') : 
                     (isFloating ? 'left-3 top-1.5 text-[10px]' : 'left-3 top-3 text-sm')
            } ${
              error ? 'text-rose-400' : focused ? 'text-indigo-400 font-medium' : 'text-slate-400'
            }`}
          >
            {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        )}
      </div>
      {error && <span className="text-xs text-rose-400 pl-1">{error}</span>}
    </div>
  );
}
