import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewDocument from './pages/NewDocument';
import DocumentList from './pages/DocumentList';
import DocumentEditorPage from './pages/DocumentEditorPage';
import BillingPage from './pages/BillingPage';
import BillingTemplatesPage from './pages/BillingTemplatesPage';
import NotFound from './pages/NotFound';

/**
 * Protected route wrapper — redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)',
      }}>
        <div className="btn__spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public route wrapper — redirects to / if already authenticated.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>,
  },

  // Protected routes — inside app layout
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'new', element: <NewDocument /> },
      { path: 'documents', element: <DocumentList /> },
      { path: 'billing', element: <BillingPage /> },
      { path: 'billing/sheet', element: <Navigate to="/documents/new/TAX_INVOICE?mode=visual" replace /> },
      { path: 'billing/visual', element: <Navigate to="/documents/new/TAX_INVOICE?mode=visual" replace /> },
      { path: 'billing/new', element: <Navigate to="/documents/new/TAX_INVOICE" replace /> },
      { path: 'billing/templates', element: <BillingTemplatesPage /> },
      { path: 'documents/new/:type', element: <DocumentEditorPage /> },
      { path: 'documents/:id', element: <DocumentEditorPage /> },
      { path: 'documents/:id/edit', element: <DocumentEditorPage /> },
      { path: 'contacts', element: <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}><h1>Contacts</h1><p>Contact management coming soon...</p></div> },
      { path: 'templates', element: <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}><h1>Templates</h1><p>Template management coming soon...</p></div> },
      { path: 'settings', element: <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}><h1>Settings</h1><p>Settings coming soon...</p></div> },
    ],
  },

  // 404
  { path: '*', element: <NotFound /> },
]);
