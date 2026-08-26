import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/authStore';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * Main application layout styled with Tailwind CSS.
 */
export default function AppLayout() {
  const { user } = useAuthStore();

  const expiryInfo = React.useMemo(() => {
    if (!user || !user.subscriptionExpiresAt) return null;
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Subscription Expiry Alert Banner */}
        {expiryInfo && (
          <div
            className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b shrink-0 ${
              expiryInfo.isExpired
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
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
            <span className="font-mono text-[11px] font-bold">License: {user.licenseKey || 'Standard'}</span>
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
