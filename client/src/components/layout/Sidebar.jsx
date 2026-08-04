import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">✈</div>
        {!collapsed && <span className="sidebar__logo-text">AWB Editor</span>}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="sidebar__section">
            {!collapsed && <p className="sidebar__section-title">{section.title}</p>}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                end={item.path === '/'}
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar__link-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar__link-label">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user?.name || 'User'}</p>
              <p className="sidebar__user-role">{user?.role || 'Operator'}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="sidebar__actions">
            <NavLink to="/settings" className="sidebar__link">
              <span className="sidebar__link-icon">⚙️</span>
              <span className="sidebar__link-label">Settings</span>
            </NavLink>
            <button className="sidebar__link sidebar__logout" onClick={handleLogout}>
              <span className="sidebar__link-icon">🚪</span>
              <span className="sidebar__link-label">Log Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
