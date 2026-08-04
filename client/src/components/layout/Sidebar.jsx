import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/new', label: 'New Document', icon: '➕' },
      { path: '/documents', label: 'All Documents', icon: '📄' },
    ],
  },
  {
    title: 'Air Freight',
    items: [
      { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: '✈️' },
      { path: '/documents/new/MAWB', label: 'New AWB', icon: '📝' },
      { path: '/documents/new/HAWB', label: 'New HAWB', icon: '📋' },
    ],
  },
  {
    title: 'eAWB / Cargo-IMP',
    items: [
      { path: '/documents?category=EDI', label: 'EDI Documents', icon: '⚡' },
      { path: '/documents/new/FWB', label: 'New FWB', icon: '📡' },
    ],
  },
  {
    title: 'Sea Freight',
    items: [
      { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: '⚓' },
      { path: '/documents/new/BILL_OF_LADING', label: 'New B/L', icon: '🚢' },
    ],
  },
  {
    title: 'Other',
    items: [
      { path: '/documents?category=OTHER', label: 'Other Documents', icon: '📁' },
      { path: '/contacts', label: 'Contacts', icon: '👤' },
      { path: '/templates', label: 'Templates', icon: '📋' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLinkActive = (itemPath) => {
    const currentPathWithQuery = location.pathname + location.search;
    if (itemPath.includes('?')) {
      return currentPathWithQuery === itemPath;
    }
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemPath && !location.search;
  };

  return (
    <aside className={`h-screen sticky top-0 flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 z-40 select-none ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
            ✈
          </div>
          {!collapsed && <span className="font-bold text-base text-slate-100 whitespace-nowrap">AWB Editor</span>}
        </div>
        <button
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isLinkActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    } ${collapsed ? 'justify-center px-0' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2">
        <div className={`flex items-center gap-3 p-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30 flex items-center justify-center text-xs shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Operator'}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="grid grid-cols-2 gap-1 pt-1">
            <NavLink to="/settings" className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors">
              <span>⚙️</span>
              <span>Settings</span>
            </NavLink>
            <button className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors" onClick={handleLogout}>
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
