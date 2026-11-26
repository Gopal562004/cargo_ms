import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

/**
 * Clean, print-hidden Breadcrumbs navigation for document pages & editors.
 */
export default function Breadcrumbs({ items = [] }) {
  const { theme } = useThemeStore();

  return (
    <nav
      aria-label="Breadcrumb"
      className={`print:hidden flex items-center flex-wrap gap-1.5 text-[11px] font-mono ${
        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
      }`}
    >
      <Link
        to="/"
        className={`inline-flex items-center gap-1 transition-colors ${
          theme === 'light' ? 'hover:text-indigo-600' : 'hover:text-indigo-400'
        }`}
      >
        <Home size={11} />
        <span>Dashboard</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            <ChevronRight size={11} className="opacity-50 shrink-0" />
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className={`transition-colors ${
                  theme === 'light' ? 'hover:text-indigo-600' : 'hover:text-indigo-400'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-semibold ${
                  isLast
                    ? theme === 'light'
                      ? 'text-slate-900'
                      : 'text-slate-200'
                    : ''
                }`}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
