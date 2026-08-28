import React from 'react';
import { Package } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

/**
 * Minimal & Modern Square Brand Logo for CargoHub Logistics OS
 */
export default function BrandLogo({
  size = 'md', // 'sm' (28px) | 'md' (36px) | 'lg' (44px) | 'xl' (56px)
  showText = false,
  subtitle = 'Logistics OS',
  className = '',
}) {
  const { theme } = useThemeStore();

  const sizeClasses = {
    sm: { box: 'w-7 h-7 rounded', iconSize: 15, text: 'text-xs', sub: 'text-[9px]' },
    md: { box: 'w-8.5 h-8.5 rounded', iconSize: 18, text: 'text-sm', sub: 'text-[10px]' },
    lg: { box: 'w-11 h-11 rounded', iconSize: 22, text: 'text-base', sub: 'text-xs' },
    xl: { box: 'w-14 h-14 rounded-md', iconSize: 28, text: 'text-lg', sub: 'text-xs' },
  };

  const config = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Square Brand Icon */}
      <div
        className={`${config.box} flex items-center justify-center shrink-0 transition-colors ${
          theme === 'light'
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'bg-indigo-600 text-white border border-indigo-500/30'
        }`}
      >
        <Package
          size={config.iconSize}
          strokeWidth={2}
          className="text-white shrink-0"
        />
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight uppercase leading-tight truncate ${
              config.text
            } ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}
          >
            Cargo<span className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}>Hub</span>
          </span>
          {subtitle && (
            <span
              className={`font-mono uppercase tracking-widest leading-none truncate mt-0.5 ${
                config.sub
              } ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
