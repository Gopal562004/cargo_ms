import React from 'react';

/**
 * Button component with variants, sizes, and loading state styled using Tailwind CSS.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.loading]
 * @param {boolean} [props.fullWidth]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-[0.98]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {icon && !loading && <span className="inline-flex items-center">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}
