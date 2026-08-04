import React from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';

const BREADCRUMB_MAP = {
  '/': 'Dashboard',
  '/new': 'New Document',
  '/documents': 'Documents',
  '/contacts': 'Contacts',
  '/templates': 'Templates',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const getBreadcrumbs = () => {
    const path = location.pathname;

    if (BREADCRUMB_MAP[path]) {
      return [BREADCRUMB_MAP[path]];
    }

    const segments = path.split('/').filter(Boolean);
    return segments.map((seg, i) => {
      const fullPath = '/' + segments.slice(0, i + 1).join('/');
      return BREADCRUMB_MAP[fullPath] || seg.charAt(0).toUpperCase() + seg.slice(1);
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-slate-600">/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'font-medium text-slate-100' : 'text-slate-400'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-slate-400 text-xs select-none">🔍</span>
          <input
            type="text"
            className="pl-8 pr-12 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors w-64"
            placeholder="Search documents..."
            aria-label="Search"
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-800 border border-slate-700 rounded shadow-sm select-none">⌘K</kbd>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-slate-800 transition-all text-sm flex items-center gap-1.5"
          title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </header>
  );
}
