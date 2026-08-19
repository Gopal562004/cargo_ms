import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { hasServiceAccess } from '../../utils/permissions';
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
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Package,
  Receipt,
  ShoppingBag,
  Printer,
  Bookmark,
  ShieldCheck,
  KeyRound,
  Layers,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Core Operations',
    serviceKey: 'ANY',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/new', label: 'New Document', icon: Plus },
      { path: '/documents', label: 'All Documents', icon: FileText },
    ],
  },
  {
    title: 'Master Administration',
    serviceKey: 'MASTER_ADMIN',
    adminOnly: true,
    items: [
      { path: '/master/users', label: 'Users & Service Allocation', icon: ShieldCheck, serviceKey: 'MASTER_ADMIN', adminOnly: true },
    ],
  },
  {
    title: 'Billing & Accounting',
    serviceKey: 'SALES_BILLING',
    items: [
      { path: '/billing', label: 'Sales Invoices (Revenue)', icon: Receipt, serviceKey: 'SALES_BILLING' },
      { path: '/billing/purchases', label: 'Purchase Bills (Expenses/DGD)', icon: ShoppingBag, serviceKey: 'PURCHASE_BILLS' },
      { path: '/billing/new', label: 'Create New Bill', icon: Printer, serviceKey: 'SALES_BILLING' },
      { path: '/billing/templates', label: 'Saved Templates & Parties', icon: Bookmark, serviceKey: 'BILLING_TEMPLATES' },
    ],
  },
  {
    title: 'Air Freight',
    serviceKey: 'AIR_FREIGHT',
    items: [
      { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: Plane, serviceKey: 'AIR_FREIGHT' },
      { path: '/documents/new/MAWB', label: 'New MAWB', icon: FileEdit, serviceKey: 'AIR_FREIGHT' },
      { path: '/documents/new/HAWB', label: 'New HAWB', icon: ClipboardList, serviceKey: 'AIR_FREIGHT' },
    ],
  },
  {
    title: 'eAWB / EDI',
    serviceKey: 'EDI_CARGO',
    items: [
      { path: '/documents?category=EDI', label: 'EDI Documents', icon: Zap, serviceKey: 'EDI_CARGO' },
      { path: '/documents/new/FWB', label: 'New FWB Message', icon: Radio, serviceKey: 'EDI_CARGO' },
    ],
  },
  {
    title: 'Ocean Freight',
    serviceKey: 'SEA_FREIGHT',
    items: [
      { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: Anchor, serviceKey: 'SEA_FREIGHT' },
      { path: '/documents/new/BILL_OF_LADING', label: 'Bill of Lading', icon: Ship, serviceKey: 'SEA_FREIGHT' },
    ],
  },
  {
    title: 'Management',
    serviceKey: 'CONTACTS_DIRECTORY',
    items: [
      { path: '/documents?category=OTHER', label: 'Other Documents', icon: Folder },
      { path: '/contacts', label: 'Directory', icon: Users, serviceKey: 'CONTACTS_DIRECTORY' },
      { path: '/templates', label: 'Templates', icon: LayoutTemplate, serviceKey: 'TEMPLATES_MANAGEMENT' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLinkActive = (itemPath) => {
    const currentPathWithQuery = location.pathname + location.search;
    if (itemPath.includes('?')) return currentPathWithQuery === itemPath;
    if (itemPath === '/') return location.pathname === '/';
    return location.pathname === itemPath && !location.search;
  };

  // Filter sections and items based on logged-in user's assigned services
  const visibleSections = NAV_SECTIONS.map((sec) => {
    if (sec.adminOnly && user?.role !== 'ADMIN') {
      return null;
    }
    const visibleItems = sec.items.filter((item) => hasServiceAccess(user, item.serviceKey, item.adminOnly));
    return {
      ...sec,
      items: visibleItems,
    };
  }).filter((sec) => sec && sec.items.length > 0);

  return (
    <aside
      style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
      className={`
        h-screen sticky top-0 flex flex-col justify-between
        transition-all duration-200 ease-in-out z-40 select-none border-r
        ${collapsed ? 'w-18' : 'w-64'}
        ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }
      `}
    >
      {/* Upper Brand & Navigation Container */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center justify-between px-4 border-b shrink-0 ${
            theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold">
              <Package size={18} />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span
                  className={`font-semibold text-sm tracking-wider uppercase leading-tight ${
                    theme === 'light' ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  Cargo<span className="text-indigo-600">Hub</span>
                </span>
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest ${
                    theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Logistics OS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`p-1.5 rounded transition-colors ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-sidebar-scroll">
          {visibleSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              {!collapsed ? (
                <p
                  className={`px-3 text-xs font-mono font-bold uppercase tracking-wider mb-2 ${
                    theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {section.title}
                </p>
              ) : (
                <div
                  className={`h-px mx-1.5 my-3 ${
                    theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
                  }`}
                />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isLinkActive(item.path);
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors
                        ${
                          active
                            ? theme === 'light'
                              ? 'bg-indigo-50 text-indigo-600 font-semibold border-r-2 border-indigo-600'
                              : 'bg-indigo-600/10 text-indigo-400 font-semibold border-r-2 border-indigo-500'
                            : theme === 'light'
                            ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }
                      `}
                    >
                      <Icon
                        size={17}
                        className={`shrink-0 ${
                          active
                            ? theme === 'light'
                              ? 'text-indigo-600'
                              : 'text-indigo-400'
                            : theme === 'light'
                            ? 'text-slate-400 group-hover:text-slate-700'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      />

                      {!collapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : (
                        /* Collapsed Hover Tooltip */
                        <div
                          className={`absolute left-full ml-3 px-2.5 py-1.5 text-xs font-mono rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-md ${
                            theme === 'light'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-800 text-slate-100'
                          }`}
                        >
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Profile & Settings */}
      <div
        className={`p-3 border-t space-y-2 shrink-0 ${
          theme === 'light'
            ? 'border-slate-200 bg-slate-50'
            : 'border-slate-800 bg-slate-950/60'
        }`}
      >
        {/* User Status Card */}
        <div
          className={`flex items-center gap-3 p-2 rounded border ${
            theme === 'light'
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          } ${collapsed ? 'justify-center p-1.5 border-0 bg-transparent' : ''}`}
        >
          <div className="w-8 h-8 rounded bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-semibold truncate leading-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-slate-100'
                }`}
              >
                {user?.name || 'Operator'}
              </p>
              <p
                className={`text-[10px] truncate mt-0.5 ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {user?.role || 'Dispatcher'} {user?.department ? `• ${user.department}` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Settings & Theme Action Controls */}
        <div className={`flex items-center ${collapsed ? 'flex-col gap-1.5' : 'justify-between'} pt-1`}>
          {!collapsed && (
            <NavLink
              to="/settings"
              className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded transition-colors ${
                theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Settings size={15} />
              <span>Settings</span>
            </NavLink>
          )}

          <div className={`flex items-center ${collapsed ? 'flex-col gap-1.5' : 'gap-1'}`}>
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded transition-colors ${
                theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            <button
              onClick={handleLogout}
              className={`p-1.5 text-rose-500 hover:text-rose-700 rounded transition-colors ${
                theme === 'light' ? 'hover:bg-rose-50' : 'hover:bg-rose-950/40'
              }`}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}