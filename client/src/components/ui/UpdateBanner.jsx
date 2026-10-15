import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, Download, RefreshCw, X, Sparkles, CheckCircle2 } from 'lucide-react';

const GITHUB_REPO = 'Gopal562004/cargo_ms';
const DEFAULT_VERSION = '1.0.6';

/**
 * Compare two semver strings (e.g. "1.0.5" > "1.0.4")
 */
function isNewerVersion(remote, local) {
  if (!remote || !local) return false;
  const rParts = remote.replace(/^v/, '').split('.').map(Number);
  const lParts = local.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
    const r = rParts[i] || 0;
    const l = lParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

export default function UpdateBanner({ onOpenDownloadModal }) {
  const [updateInfo, setUpdateInfo] = useState(null); // { version, status: 'available'|'downloading'|'downloaded', percent }
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI);

  useEffect(() => {
    // Check if dismissed in the CURRENT session only
    try {
      const sessionDismissed = sessionStorage.getItem('cargoms_update_dismissed');
      if (sessionDismissed === 'true') {
        setDismissed(true);
      }
    } catch {}

    let currentAppVersion = DEFAULT_VERSION;

    // 1. Electron Native Auto-Updater listener
    let unsubscribeUpdater = null;
    if (isElectron && window.electronAPI.onUpdaterStatus) {
      unsubscribeUpdater = window.electronAPI.onUpdaterStatus((data) => {
        if (!data) return;
        if (data.status === 'available') {
          setUpdateInfo({
            version: data.version || 'New',
            status: 'available',
            percent: 0,
          });
        } else if (data.status === 'downloading') {
          setUpdateInfo((prev) => ({
            version: prev?.version || 'New',
            status: 'downloading',
            percent: data.percent || 0,
          }));
        } else if (data.status === 'downloaded') {
          setUpdateInfo({
            version: data.version || 'New',
            status: 'downloaded',
            percent: 100,
          });
        }
      });
    }

    // 2. Query GitHub Releases API for current latest version
    const checkGitHubRelease = async () => {
      try {
        if (isElectron && window.electronAPI.getVersion) {
          try {
            const ver = await window.electronAPI.getVersion();
            if (ver) currentAppVersion = ver;
          } catch {}
        }

        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return;
        const data = await res.json();
        const latestTag = data.tag_name ? data.tag_name.replace(/^v/, '') : null;

        if (latestTag && isNewerVersion(latestTag, currentAppVersion)) {
          setUpdateInfo((prev) => {
            // Preserve downloading or downloaded status from electron-updater
            if (prev?.status === 'downloading' || prev?.status === 'downloaded') return prev;
            return {
              version: latestTag,
              status: 'available',
              percent: 0,
              releaseUrl: data.html_url,
              downloadUrl: data.assets?.find((a) => a.name.endsWith('.exe'))?.browser_download_url,
            };
          });
        }
      } catch (err) {
        // Network unavailable or rate-limited; gracefully ignore
      }
    };

    checkGitHubRelease();

    // Trigger Electron auto-updater check
    if (isElectron && window.electronAPI.checkForUpdates) {
      window.electronAPI.checkForUpdates().catch(() => {});
    }

    return () => {
      if (unsubscribeUpdater) unsubscribeUpdater();
    };
  }, [isElectron]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      // Session storage clears when app/window is closed or restarted
      sessionStorage.setItem('cargoms_update_dismissed', 'true');
    } catch {}
  };

  const handleAction = async () => {
    if (updateInfo?.status === 'downloaded' && isElectron && window.electronAPI.quitAndInstall) {
      window.electronAPI.quitAndInstall();
      return;
    }

    if (isElectron && window.electronAPI.checkForUpdates) {
      setIsChecking(true);
      try {
        await window.electronAPI.checkForUpdates();
      } finally {
        setIsChecking(false);
      }
      return;
    }

    if (onOpenDownloadModal) {
      onOpenDownloadModal();
    } else if (updateInfo?.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_blank');
    } else {
      window.open(`https://github.com/${GITHUB_REPO}/releases/latest`, '_blank');
    }
  };

  if (dismissed || !updateInfo) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 text-white border-b border-indigo-500/30 px-3.5 py-2 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left: Icon & Message */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0 text-indigo-400 animate-pulse">
            {updateInfo.status === 'downloaded' ? (
              <CheckCircle2 size={14} className="text-emerald-400" />
            ) : (
              <Sparkles size={14} />
            )}
          </div>

          <div className="truncate">
            <span className="font-semibold text-indigo-200 mr-1.5">
              {updateInfo.status === 'downloaded'
                ? 'Update Ready!'
                : updateInfo.status === 'downloading'
                ? 'Downloading Update...'
                : `New Update Available (v${updateInfo.version})`}
            </span>
            <span className="text-slate-300 hidden sm:inline">
              {updateInfo.status === 'downloaded'
                ? `Version ${updateInfo.version} has been downloaded. Restart to apply.`
                : updateInfo.status === 'downloading'
                ? `Downloading package (${updateInfo.percent}% complete)...`
                : 'A newer version of CargoMS is ready with enhanced offline mode and bug fixes.'}
            </span>
          </div>
        </div>

        {/* Right: Actions & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          {updateInfo.status === 'downloading' ? (
            <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-700/60 font-mono text-[11px] text-cyan-300">
              <RefreshCw size={11} className="animate-spin" />
              <span>{updateInfo.percent}%</span>
            </div>
          ) : (
            <button
              onClick={handleAction}
              disabled={isChecking}
              className={`px-3 py-1 rounded font-medium text-[11px] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                updateInfo.status === 'downloaded'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {updateInfo.status === 'downloaded' ? (
                <>
                  <RefreshCw size={12} /> Restart & Install
                </>
              ) : isElectron ? (
                <>
                  <ArrowUpCircle size={12} /> Update Now
                </>
              ) : (
                <>
                  <Download size={12} /> Download v{updateInfo.version}
                </>
              )}
            </button>
          )}

          {/* Dismiss button (X): Hides only for current session */}
          <button
            onClick={handleDismiss}
            title="Dismiss for this session"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
