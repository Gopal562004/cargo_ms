import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

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

  const getBreadcrumbs = () => {
    const path = location.pathname;

    // Direct match
    if (BREADCRUMB_MAP[path]) {
      return [BREADCRUMB_MAP[path]];
    }

    // Build breadcrumb from path segments
    const segments = path.split('/').filter(Boolean);
    return segments.map((seg, i) => {
      const fullPath = '/' + segments.slice(0, i + 1).join('/');
      return BREADCRUMB_MAP[fullPath] || seg.charAt(0).toUpperCase() + seg.slice(1);
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="header">
      <div className="header__left">
        <nav className="header__breadcrumbs">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="header__breadcrumb-sep">/</span>}
              <span className={`header__breadcrumb ${i === breadcrumbs.length - 1 ? 'header__breadcrumb--active' : ''}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="header__right">
        <div className="header__search">
          <span className="header__search-icon">🔍</span>
          <input
            type="text"
            className="header__search-input"
            placeholder="Search documents..."
            aria-label="Search"
          />
          <kbd className="header__search-kbd">⌘K</kbd>
        </div>
      </div>
    </header>
  );
}
