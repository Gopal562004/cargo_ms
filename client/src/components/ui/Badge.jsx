import React from 'react';

const STATUS_STYLE_MAP = {
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20 dot-bg-slate-400',
  VALIDATED: 'bg-blue-500/10 text-blue-400 border-blue-500/20 dot-bg-blue-400',
  ISSUED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 dot-bg-indigo-400',
  BOOKED: 'bg-purple-500/10 text-purple-400 border-purple-500/20 dot-bg-purple-400',
  DEPARTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20 dot-bg-amber-400',
  IN_TRANSIT: 'bg-orange-500/10 text-orange-400 border-orange-500/20 dot-bg-orange-400',
  ARRIVED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 dot-bg-cyan-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dot-bg-emerald-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dot-bg-emerald-400',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20 dot-bg-rose-400',
};

const VARIANT_STYLE_MAP = {
  default: 'bg-slate-800 text-slate-300 border-slate-700 dot-bg-slate-400',
  primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 dot-bg-indigo-400',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dot-bg-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 dot-bg-amber-400',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20 dot-bg-rose-400',
};

/**
 * Badge component for displaying status and labels styled with Tailwind CSS.
 */
export default function Badge({ status, variant, children, size = 'md', className = '' }) {
  const styleClasses = status ? (STATUS_STYLE_MAP[status] || STATUS_STYLE_MAP.DRAFT) : (VARIANT_STYLE_MAP[variant] || VARIANT_STYLE_MAP.default);

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'lg' ? 'px-3 py-1 text-xs font-semibold' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-md uppercase tracking-wider ${sizeClasses} ${styleClasses} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children || status?.replace(/_/g, ' ')}
    </span>
  );
}
