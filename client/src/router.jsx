import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { hasServiceAccess } from './utils/permissions';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import ProductTourPage from './pages/ProductTourPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewDocument from './pages/NewDocument';
import DocumentList from './pages/DocumentList';
import DocumentEditorPage from './pages/DocumentEditorPage';
import BillingPage from './pages/BillingPage';
import PurchaseBillsPage from './pages/PurchaseBillsPage';
import BillingTemplatesPage from './pages/BillingTemplatesPage';
import MasterUsersPage from './pages/MasterUsersPage';
import NotFound from './pages/NotFound';

/**
 * Protected route wrapper — redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        <div className="btn__spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return children;
}

/**
 * Role & Service protected route wrapper — redirects to / if user does not have permission.
 */
function ServiceRoute({ children, serviceKey, adminOnly = false }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!hasServiceAccess(user, serviceKey, adminOnly)) {
    return <Navigate to="/" replace />;
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
  // Public Marketing Landing Page & Product Tour
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/product-tour',
    element: <ProductTourPage />,
  },
  {
    path: '/how-it-works',
    element: <ProductTourPage />,
  },

  // Public Auth routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },

  // Protected routes — inside app layout
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'new', element: <NewDocument /> },
      { path: 'documents', element: <DocumentList /> },
      {
        path: 'master',
        element: <Navigate to="/master/users" replace />,
      },
      {
        path: 'master/users',
        element: (
          <ServiceRoute serviceKey="MASTER_ADMIN" adminOnly={true}>
            <MasterUsersPage />
          </ServiceRoute>
        ),
      },
      {
        path: 'billing',
        element: (
          <ServiceRoute serviceKey="SALES_BILLING">
            <BillingPage />
          </ServiceRoute>
        ),
      },
      {
        path: 'billing/purchases',
        element: (
          <ServiceRoute serviceKey="PURCHASE_BILLS">
            <PurchaseBillsPage />
          </ServiceRoute>
        ),
      },
      {
        path: 'billing/sheet',
        element: (
          <ServiceRoute serviceKey="SALES_BILLING">
            <Navigate to="/documents/new/TAX_INVOICE?mode=visual" replace />
          </ServiceRoute>
        ),
      },
      {
        path: 'billing/visual',
        element: (
          <ServiceRoute serviceKey="SALES_BILLING">
            <Navigate to="/documents/new/TAX_INVOICE?mode=visual" replace />
          </ServiceRoute>
        ),
      },
      {
        path: 'billing/new',
        element: (
          <ServiceRoute serviceKey="SALES_BILLING">
            <Navigate to="/documents/new/TAX_INVOICE" replace />
          </ServiceRoute>
        ),
      },
      {
        path: 'billing/templates',
        element: (
          <ServiceRoute serviceKey="BILLING_TEMPLATES">
            <BillingTemplatesPage />
          </ServiceRoute>
        ),
      },
      { path: 'documents/new/:type', element: <DocumentEditorPage /> },
      { path: 'documents/:id', element: <DocumentEditorPage /> },
      { path: 'documents/:id/edit', element: <DocumentEditorPage /> },
      {
        path: 'contacts',
        element: (
          <ServiceRoute serviceKey="CONTACTS_DIRECTORY">
            <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>
              <h1>Contacts & Directory</h1>
              <p>Directory and contact management is active for your account.</p>
            </div>
          </ServiceRoute>
        ),
      },
      {
        path: 'templates',
        element: (
          <ServiceRoute serviceKey="TEMPLATES_MANAGEMENT">
            <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>
              <h1>Templates</h1>
              <p>Template management is active for your account.</p>
            </div>
          </ServiceRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>
            <h1>Settings</h1>
            <p>Settings coming soon...</p>
          </div>
        ),
      },
    ],
  },

  // 404
  { path: '*', element: <NotFound /> },
]);
