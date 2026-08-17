import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const BREADCRUMB_MAP = {
  '/': 'Dashboard',
  '/new': 'New Document',
  '/documents': 'Documents',
  '/billing': 'Sales Invoices',
  '/billing/purchases': 'Purchase Bills',
  '/billing/templates': 'Billing Templates',
  '/contacts': 'Contacts & Directory',
  '/templates': 'Document Templates',
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
    <header
      className={`h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30 transition-colors ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 backdrop-blur-md text-slate-800'
          : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md text-slate-200'
      }`}
    >
      <div className="flex items-center">
        <nav className="flex items-center gap-2 text-xs">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>
                  /
                </span>
              )}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? `font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`
                    : theme === 'light'
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <Search
            size={14}
            className={`absolute left-3 pointer-events-none ${
              theme === 'light' ? 'text-slate-400' : 'text-slate-500'
            }`}
          />
          <input
            type="text"
            className={`pl-8 pr-12 py-1.5 rounded text-xs transition-colors w-64 focus:outline-none ${
              theme === 'light'
                ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                : 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
            }`}
            placeholder="Search documents..."
            aria-label="Search"
          />
          <kbd
            className={`absolute right-2 px-1.5 py-0.5 text-[10px] rounded shadow-sm select-none border ${
              theme === 'light'
                ? 'text-slate-500 bg-white border-slate-200'
                : 'text-slate-400 bg-slate-900 border-slate-700'
            }`}
          >
            ⌘K
          </kbd>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded border transition-colors text-xs flex items-center gap-1.5 ${
            theme === 'light'
              ? 'text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
              : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-800'
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
        >
          {theme === 'dark' ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Moon size={15} className="text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
}
