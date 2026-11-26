import React from 'react';
import { useThemeStore } from '../../store/themeStore';

const isElectron =
  typeof window !== 'undefined' &&
  (Boolean(window.electronAPI) ||
    Boolean(window.__ELECTRON_API_PORT__) ||
    window.location.protocol === 'file:');

/**
 * Minimal & Modern Brand Logo for CargoHub Logistics OS (uses favicon.svg)
 */
export default function BrandLogo({
  size = 'md', // 'sm' (28px) | 'md' (36px) | 'lg' (44px) | 'xl' (56px)
  showText = false,
  subtitle = 'Logistics OS',
  className = '',
}) {
  const { theme } = useThemeStore();

  const sizeClasses = {
    sm: { box: 'w-7 h-7', text: 'text-xs', sub: 'text-[9px]' },
    md: { box: 'w-8.5 h-8.5', text: 'text-sm', sub: 'text-[10px]' },
    lg: { box: 'w-11 h-11', text: 'text-base', sub: 'text-xs' },
    xl: { box: 'w-14 h-14', text: 'text-lg', sub: 'text-xs' },
  };

  const config = sizeClasses[size] || sizeClasses.md;
  const iconSrc = isElectron ? './favicon.svg' : '/favicon.svg';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon matching favicon.svg */}
      <img
        src={iconSrc}
        alt="CargoHub"
        className={`${config.box} shrink-0 select-none object-contain`}
      />

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
