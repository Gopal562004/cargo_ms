import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Plus,
  FileText,
  Plane,
  FileEdit,
  ClipboardList,
  Zap,
  Radio,
  Anchor,
  Ship,
  Folder,
  Users,
  LayoutTemplate,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/new', label: 'New Document', icon: Plus },
      { path: '/documents', label: 'All Documents', icon: FileText },
    ],
  },
  {
    title: 'Air Freight',
    items: [
      { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: Plane },
      { path: '/documents/new/MAWB', label: 'New AWB', icon: FileEdit },
      { path: '/documents/new/HAWB', label: 'New HAWB', icon: ClipboardList },
    ],
  },
  {
    title: 'eAWB / Cargo-IMP',
    items: [
      { path: '/documents?category=EDI', label: 'EDI Documents', icon: Zap },
      { path: '/documents/new/FWB', label: 'New FWB', icon: Radio },
    ],
  },
  {
    title: 'Sea Freight',
    items: [
      { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: Anchor },
      { path: '/documents/new/BILL_OF_LADING', label: 'New B/L', icon: Ship },
    ],
  },
  {
    title: 'Other',
    items: [
      { path: '/documents?category=OTHER', label: 'Other Documents', icon: Folder },
      { path: '/contacts', label: 'Contacts', icon: Users },
      { path: '/templates', label: 'Templates', icon: LayoutTemplate },
    ],
  },
];

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
  </button>
);

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

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
    <aside
      className={`
        h-screen sticky top-0 flex flex-col 
        transition-all duration-300 ease-in-out z-40 select-none
        border-r
        ${collapsed ? 'w-16' : 'w-64'}
        bg-neutral-50/80 backdrop-blur-sm border-neutral-200/70 shadow-sm
        dark:bg-slate-900/80 dark:backdrop-blur-xl dark:border-slate-800/80 dark:shadow-xl
      `}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200/70 dark:border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/30 shrink-0">
            ✈
          </div>
          {!collapsed && (
            <span className="font-bold text-base text-slate-800 dark:text-slate-100 whitespace-nowrap">
              AWB Editor
            </span>
          )}
        </div>
        <button
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isLinkActive(item.path);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                    ${collapsed ? 'justify-center px-0' : ''}
                    ${
                      active
                        ? `
                          bg-indigo-50 text-indigo-700 border border-indigo-200
                          dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30
                          shadow-sm dark:shadow-indigo-500/10
                        `
                        : `
                          text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 border border-transparent
                          dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60
                        `
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-neutral-200/70 dark:border-slate-800/80 bg-neutral-50/50 dark:bg-slate-900/40 space-y-2">
        <div
          className={`
            flex items-center gap-3 p-2 rounded-lg
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center text-xs shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/30 shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">
                {user?.role || 'Operator'}
              </p>
            </div>
          )}
        </div>

        {!collapsed ? (
          <div className="grid grid-cols-2 gap-1 pt-1">
            <NavLink
              to="/settings"
              className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 rounded-md transition-colors"
            >
              <Settings size={14} />
              <span>Settings</span>
            </NavLink>
            <button
              className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50/70 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 rounded-md transition-colors"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center pt-1">
            <button
              className="p-2 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-500/10 rounded-md transition-colors"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} pt-1`}>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </aside>
  );
}