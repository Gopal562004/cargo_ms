import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Calendar, SlidersHorizontal, Download, ChevronDown, Check, Settings } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useFinancialYearStore } from '../../store/financialYearStore';
import DownloadModal from '../ui/DownloadModal';

const BREADCRUMB_MAP = {
  '/': 'Dashboard',
  '/new': 'New Document',
  '/documents': 'Documents',
  '/billing': 'Sales Invoices',
  '/billing/purchases': 'Purchase Bills',
  '/billing/ledgers': 'Accounting Ledgers',
  '/billing/templates': 'Billing Templates',
  '/contacts': 'Contacts & Directory',
  '/templates': 'Document Templates',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { activeFY, financialYears, setActiveFY } = useFinancialYearStore();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isFyDropdownOpen, setIsFyDropdownOpen] = useState(false);
  const fyDropdownRef = useRef(null);
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fyDropdownRef.current && !fyDropdownRef.current.contains(event.target)) {
        setIsFyDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
      className={`h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30 transition-colors ${theme === 'light'
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
        {/* Global Financial Year Switcher (Theme-adaptive, crisp rounded corners, themed list content) */}
        <div className="relative" ref={fyDropdownRef}>
          <button
            type="button"
            onClick={() => setIsFyDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-colors cursor-pointer focus:outline-none select-none ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-200'
            }`}
            title="Switch Active Financial Year across whole application"
            aria-haspopup="listbox"
            aria-expanded={isFyDropdownOpen}
          >
            <Calendar
              size={13}
              className={theme === 'light' ? 'text-indigo-600 shrink-0' : 'text-indigo-400 shrink-0'}
            />
            <span
              className={`font-semibold text-[11px] ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              FY:
            </span>
            <span
              className={`font-bold font-mono text-xs ${
                theme === 'light' ? 'text-indigo-700' : 'text-indigo-400'
              }`}
            >
              {activeFY === 'ALL' ? 'All Financial Years' : `FY ${activeFY}`}
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-150 ${isFyDropdownOpen ? 'rotate-180' : ''} ${
                theme === 'light' ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
          </button>

          {/* Theme-based Dropdown List Content */}
          {isFyDropdownOpen && (
            <div
              className={`absolute left-0 mt-1 w-48 py-1 rounded border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-700 shadow-slate-200/50'
                  : 'bg-slate-900 border-slate-800 text-slate-200 shadow-black/60'
              }`}
              role="listbox"
            >
              <div
                className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  theme === 'light'
                    ? 'text-slate-400 border-b border-slate-100'
                    : 'text-slate-500 border-b border-slate-800/80'
                }`}
              >
                Financial Years
              </div>

              {financialYears.map((fy) => {
                const isSelected = activeFY === fy.code;
                return (
                  <button
                    key={fy.code}
                    type="button"
                    onClick={() => {
                      setActiveFY(fy.code);
                      setIsFyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'bg-indigo-950/60 text-indigo-400 font-bold'
                        : theme === 'light'
                          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="font-mono">FY {fy.code}</span>
                    {isSelected && (
                      <Check
                        size={13}
                        className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}
                      />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setActiveFY('ALL');
                  setIsFyDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  activeFY === 'ALL'
                    ? theme === 'light'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'bg-indigo-950/60 text-indigo-400 font-bold'
                    : theme === 'light'
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                role="option"
                aria-selected={activeFY === 'ALL'}
              >
                <span>All Financial Years</span>
                {activeFY === 'ALL' && (
                  <Check
                    size={13}
                    className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}
                  />
                )}
              </button>

              <div
                className={`my-1 border-t ${
                  theme === 'light' ? 'border-slate-100' : 'border-slate-800/80'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  setIsFyDropdownOpen(false);
                  navigate('/settings');
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                    : 'text-indigo-400 hover:bg-slate-800/80 hover:text-indigo-300'
                }`}
              >
                <Settings size={12} />
                <span>Manage / Add FY...</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative flex items-center">
          <Search
            size={14}
            className={`absolute left-3 pointer-events-none ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'
              }`}
          />
          <input
            type="text"
            className={`pl-8 pr-12 py-1.5 rounded text-xs transition-colors w-56 focus:outline-none ${theme === 'light'
                ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                : 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
              }`}
            placeholder="Search documents..."
            aria-label="Search"
          />
          <kbd
            className={`absolute right-2 px-1.5 py-0.5 text-[10px] rounded shadow-sm select-none border ${theme === 'light'
                ? 'text-slate-500 bg-white border-slate-200'
                : 'text-slate-400 bg-slate-900 border-slate-700'
              }`}
          >
            ⌘K
          </kbd>
        </div>

        {/* Desktop App Download (only on Web) */}
        {!isElectron && (
          <button
            type="button"
            onClick={() => setShowDownloadModal(true)}
            className={`px-2.5 py-1.5 rounded border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'light'
                ? 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                : 'text-indigo-300 bg-indigo-950/50 border-indigo-800 hover:bg-indigo-900/60'
            }`}
            title="Download CargoMS Desktop Software for Windows & Mac"
          >
            <Download size={13} className="text-indigo-500" />
            <span className="hidden sm:inline">Desktop App</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded border transition-colors text-xs flex items-center gap-1.5 ${theme === 'light'
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

      {/* Cross-Platform Desktop Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </header>
  );
}
