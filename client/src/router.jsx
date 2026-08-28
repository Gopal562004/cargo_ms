import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { hasServiceAccess, isSubscriptionExpired } from './utils/permissions';
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
import LedgersPage from './pages/LedgersPage';
import MasterUsersPage from './pages/MasterUsersPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import LoadingLogo from './components/ui/LoadingLogo';
import SubscriptionExpiredLockout from './components/ui/SubscriptionExpiredLockout';

/**
 * Protected route wrapper — redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingLogo message="Authenticating Session..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return children;
}

/**
 * Active subscription route guard — locks out creation and issuance when expired.
 */
function ActiveSubscriptionRoute({ children, actionName = 'create new documents' }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingLogo message="Verifying Subscription..." fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isSubscriptionExpired(user)) {
    return <SubscriptionExpiredLockout actionName={actionName} />;
  }

  return children;
}

/**
 * Role & Service protected route wrapper — redirects to / if user does not have permission.
 */
function ServiceRoute({ children, serviceKey, adminOnly = false }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingLogo message="Verifying Permissions..." fullScreen />;
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
      {
        path: 'new',
        element: (
          <ActiveSubscriptionRoute actionName="create commercial cargo documents">
            <NewDocument />
          </ActiveSubscriptionRoute>
        ),
      },
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
            <ActiveSubscriptionRoute actionName="use live invoice sheet">
              <Navigate to="/documents/new/TAX_INVOICE?mode=visual" replace />
            </ActiveSubscriptionRoute>
          </ServiceRoute>
        ),
      },
      {
        path: 'billing/visual',
        element: (
          <ServiceRoute serviceKey="SALES_BILLING">
            <ActiveSubscriptionRoute actionName="use visual tax invoice sheet">
              <Navigate to="/documents/new/TAX_INVOICE?mode=visual" replace />
            </ActiveSubscriptionRoute>
          </ServiceRoute>
        ),
      },
      {
        path: 'billing/new',
        element: (
          <ServiceRoute serviceKey="SALES_BILLING">
            <ActiveSubscriptionRoute actionName="issue new tax invoices">
              <Navigate to="/documents/new/TAX_INVOICE" replace />
            </ActiveSubscriptionRoute>
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
      {
        path: 'billing/ledgers',
        element: (
          <ServiceRoute serviceKey="SALES_BILLING">
            <LedgersPage />
          </ServiceRoute>
        ),
      },
      {
        path: 'documents/new/:type',
        element: (
          <ActiveSubscriptionRoute actionName="create & issue new documents">
            <DocumentEditorPage />
          </ActiveSubscriptionRoute>
        ),
      },
      { path: 'documents/:id', element: <DocumentEditorPage /> },
      { path: 'documents/:id/edit', element: <DocumentEditorPage /> },
      {
        path: 'contacts',
        element: (
          <ServiceRoute serviceKey="CONTACTS_DIRECTORY">
            <Navigate to="/billing/templates?tab=PARTIES" replace />
          </ServiceRoute>
        ),
      },
      {
        path: 'templates',
        element: (
          <ServiceRoute serviceKey="TEMPLATES_MANAGEMENT">
            <Navigate to="/billing/templates?tab=TEMPLATES" replace />
          </ServiceRoute>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // 404
  { path: '*', element: <NotFound /> },
]);
