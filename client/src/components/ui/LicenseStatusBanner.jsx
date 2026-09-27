import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, KeyRound, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getLicenseStatus, activateLicense } from '../../services/licenseService';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Button from './Button';

export default function LicenseStatusBanner() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [licenseInfo, setLicenseInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await getLicenseStatus();
      if (res?.data || res?.license) {
        setLicenseInfo(res.data || res);
      }
    } catch {
      // In web or offline mode without license server, ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    // Re-check periodically every 15 minutes
    const interval = setInterval(fetchStatus, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const machine = (typeof window !== 'undefined' && window.electronAPI?.isElectron) ? 'Desktop Client' : 'Web Session';
      const res = await activateLicense(keyInput.trim(), machine);
      setMsg({ type: 'success', text: res.message || 'License activated successfully!' });
      setTimeout(() => {
        setShowModal(false);
        fetchStatus();
      }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to activate license key.' });
    } finally {
      setLoading(false);
    }
  };

  if (!licenseInfo) return null;

  const isExpired = licenseInfo.isExpired || licenseInfo.status === 'EXPIRED';
  const isExpiringSoon = !isExpired && licenseInfo.daysRemaining !== undefined && licenseInfo.daysRemaining <= 7;
  const isOfflineMode = licenseInfo.mode === 'offline' || !navigator.onLine;

  // If valid and more than 7 days, don't clutter the UI
  if (!isExpired && !isExpiringSoon && !showModal) {
    return null;
  }

  return (
    <>
      <div
        className={`px-4 py-2 text-xs flex items-center justify-between border-b shrink-0 transition-colors ${
          isExpired
            ? isDark
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            : isExpiringSoon
            ? isDark
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
            : isDark
            ? 'bg-slate-900 border-slate-800 text-slate-300'
            : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          {isExpired ? (
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : isExpiringSoon ? (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          )}

          <span>
            {isExpired ? (
              <strong>Software License Expired. Please activate or renew your subscription seat.</strong>
            ) : isExpiringSoon ? (
              <span>
                Desktop offline lease expires in <strong>{licenseInfo.daysRemaining} days</strong>. Connect to the internet to refresh.
              </span>
            ) : (
              <span>Licensed to: {licenseInfo.companyName || user?.companyName || 'Enterprise Seat'}</span>
            )}
          </span>

          {isOfflineMode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800/60 border border-slate-700 text-slate-400">
              <WifiOff className="w-3 h-3" /> Offline Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isExpired
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            {licenseInfo.key ? 'Update Key' : 'Activate Seat'}
          </button>
        </div>
      </div>

      {/* Activation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Activate Enterprise License</h3>
                  <p className="text-xs text-slate-400">Bind software instance or device seat</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  msg.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleActivate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  License Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. CRGO-XXXX-XXXX-XXXX"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className={`w-full px-3.5 py-2 font-mono text-sm rounded-lg border outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                  required
                />
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                Offline validation leases are granted for up to 30 days upon internet heartbeat. You can run disconnected from the cloud once activated.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading || !keyInput.trim()}
                  className="flex items-center gap-1.5"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  {loading ? 'Activating...' : 'Activate Device'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
