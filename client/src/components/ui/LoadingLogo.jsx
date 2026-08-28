import React from 'react';
import BrandLogo from './BrandLogo';
import { useThemeStore } from '../../store/themeStore';

/**
 * Minimal Loading Screen with Theme-Matched Square Brand Logo
 */
export default function LoadingLogo({
  message = 'Loading Workspace...',
  fullScreen = true,
  size = 'lg',
}) {
  const { theme } = useThemeStore();

  const content = (
    <div className="flex flex-col items-center justify-center gap-3.5 animate-fade-in select-none">
      {/* Minimal Spinner Container with Square Logo in Center */}
      <div className="relative flex items-center justify-center p-2.5">
        {/* Crisp Rotating Spinner Ring */}
        <div
          className={`w-13 h-13 rounded-full border-2 animate-spin ${
            theme === 'light'
              ? 'border-slate-200/90 border-t-indigo-600'
              : 'border-slate-800 border-t-indigo-500'
          }`}
        />

        {/* Centered Minimal Square Brand Logo with sharp edges */}
        <div className="absolute inset-0 flex items-center justify-center">
          <BrandLogo size={size === 'lg' ? 'md' : size} showText={false} />
        </div>
      </div>

      {/* Subtle Monospace Loading Text */}
      {message && (
        <div className="flex flex-col items-center gap-1">
          <p
            className={`text-xs font-mono font-medium tracking-wide ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            {message}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-150 ${
          theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#0a0e1a] text-slate-100'
        }`}
      >
        {content}
      </div>
    );
  }

  return content;
}
