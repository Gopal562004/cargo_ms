import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { AlertTriangle } from 'lucide-react';
import LicenseStatusBanner from '../ui/LicenseStatusBanner';

/**
 * Main application layout styled with Tailwind CSS.
 */
export default function AppLayout() {
  const { user, checkAuth } = useAuthStore();
  const { theme } = useThemeStore();

  // Periodic background heartbeat to fetch admin subscription updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      checkAuth();
    }, 15 * 60 * 1000); // every 15 minutes
    return () => clearInterval(interval);
  }, [checkAuth]);

  const expiryInfo = React.useMemo(() => {
    if (!user || user.role === 'ADMIN') return null;
    if (user.subscriptionStatus === 'CANCELLED' || user.subscriptionPlan === 'NO_ACTIVE_PLAN') {
      const expDate = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN') : 'Recently';
      return { isExpired: true, daysRemaining: 0, dateStr: expDate };
    }
    if (!user.subscriptionExpiresAt) return null;

    const expiresAt = new Date(user.subscriptionExpiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return { isExpired: true, daysRemaining: 0, dateStr: expiresAt.toLocaleDateString('en-IN') };
    }
    if (daysRemaining <= 7) {
      return { isExpiringSoon: true, daysRemaining, dateStr: expiresAt.toLocaleDateString('en-IN') };
    }
    return null;
  }, [user]);

  return (
    <div className={`flex min-h-screen transition-colors ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <LicenseStatusBanner />

        {/* Subscription Expiry Alert Banner */}
        {expiryInfo && (
          <div
            className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b shrink-0 ${
              expiryInfo.isExpired
                ? theme === 'light'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : theme === 'light'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>
                {expiryInfo.isExpired
                  ? `Your subscription expired on ${expiryInfo.dateStr}. Please contact your administrator to renew.`
                  : `Your ${user.subscriptionPlan || 'CargoHub'} subscription expires in ${expiryInfo.daysRemaining} day${
                      expiryInfo.daysRemaining === 1 ? '' : 's'
                    } (on ${expiryInfo.dateStr}).`}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold">License: {user?.licenseKey || 'Standard'}</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-[1920px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
