import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, KeyRound, Calendar, ShieldAlert, ArrowLeft, Settings, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { hasServiceAccess } from '../../utils/permissions';
import Button from './Button';

/**
 * Global Subscription Expired Lockout Screen / Component
 * Displayed whenever an expired user attempts to access creation, editing, or restricted routes.
 */
export default function SubscriptionExpiredLockout({
  actionName = 'create or edit documents',
  onBack,
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  const expiryDateStr = user?.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-lg border transition-all animate-fade-in select-none shadow-lg text-center space-y-5"
      style={{
        backgroundColor: theme === 'light' ? '#ffffff' : '#0d1322',
        borderColor: theme === 'light' ? '#fecdd3' : '#e11d4833',
      }}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
        <ShieldAlert size={28} />
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className={`text-lg font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
          Subscription Plan Expired
        </h2>
        <p className={`text-xs leading-relaxed max-w-md mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
          Your account is currently locked from attempting to <strong className="text-rose-500">{actionName}</strong>. 
          Please contact your administrator to renew or extend your license.
        </p>
      </div>

      {/* User & License Info Box */}
      <div className={`p-3.5 rounded-md border text-xs text-left grid grid-cols-2 gap-3 ${
        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
      }`}>
        <div>
          <span className="text-[10px] block font-mono text-slate-400 uppercase">Operator / User</span>
          <span className={`font-bold truncate block ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
            {user?.name || 'Operator'}
          </span>
          <span className="text-[10px] text-slate-400 truncate block">
            {user?.company || 'CargoHub OS'}
          </span>
        </div>

        <div>
          <span className="text-[10px] block font-mono text-slate-400 uppercase">Active License Key</span>
          <span className="font-mono text-xs font-bold text-indigo-400 truncate block">
            {user?.licenseKey || 'CRGO-••••-••••'}
          </span>
          <span className="text-[10px] text-rose-500 font-semibold truncate block">
            Expired: {expiryDateStr}
          </span>
        </div>
      </div>

      {/* Safe Data Guarantee Message */}
      <p className={`text-[11px] font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
        🔒 All your existing documents, invoice registers, and past records remain 100% safe and accessible in read-only mode.
      </p>

      {/* Actions */}
      <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (onBack) return onBack();
            if (hasServiceAccess(user, 'SALES_BILLING')) {
              navigate('/billing');
            } else {
              navigate('/documents');
            }
          }}
          className="rounded text-xs"
        >
          <FileText size={13} className="mr-1.5 inline" /> View Past Invoices
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/settings')}
          className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
        >
          <Settings size={13} className="mr-1.5 inline" /> Account & Plan Details
        </Button>
      </div>
    </div>
  );
}
