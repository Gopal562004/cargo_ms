import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { WifiOff, ArrowRight } from 'lucide-react';

/**
 * Minimal Loading Screen with Theme-Matched Square Brand Logo and Offline Recovery
 */
export default function LoadingLogo({
  message = 'Loading Workspace...',
  fullScreen = true,
  size = 'lg',
}) {
  const { theme } = useThemeStore();
  const [showOfflineOption, setShowOfflineOption] = useState(false);

  useEffect(() => {
    // If loading screen is visible for > 2.5s, offer offline continuation
    const timer = setTimeout(() => {
      setShowOfflineOption(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleContinueOffline = () => {
    useAuthStore.setState({ isLoading: false });
  };

  const handleGoToLogin = () => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        window.location.hash = '#/login';
      } else {
        window.location.href = '/login';
      }
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in select-none max-w-xs text-center px-4">
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

      {/* Offline Recovery Action if network is lost or slow */}
      {showOfflineOption && (
        <div className="mt-2 space-y-2.5 animate-fade-in-up w-full">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono">
            <WifiOff size={13} />
            <span>Connecting to offline workspace...</span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleContinueOffline}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Continue Offline</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={handleGoToLogin}
              className="px-3 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
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

