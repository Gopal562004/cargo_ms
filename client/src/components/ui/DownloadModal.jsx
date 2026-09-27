import React, { useState } from 'react';
import {
  Download,
  X,
  Monitor,
  Apple,
  Terminal,
  CheckCircle2,
  HardDrive,
  WifiOff,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { getApiBaseUrl } from '../../services/api';
import BrandLogo from './BrandLogo';

export default function DownloadModal({ isOpen, onClose }) {
  const { theme } = useThemeStore();
  const isDark = theme !== 'light';

  const [activeTab, setActiveTab] = useState('windows');
  const [downloadingOS, setDownloadingOS] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  if (!isOpen) return null;

  const handleDownload = async (os, filename) => {
    setDownloadingOS(os);
    setDownloadError(null);

    const downloadUrl = `${getApiBaseUrl()}/download/desktop?os=${os}&file=${filename}`;

    try {
      const res = await fetch(downloadUrl);
      if (res.ok) {
        // Direct stream download
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setDownloadError(
          errorData.message ||
            `Installer binary (${filename}) is currently being packaged. Please wait a moment.`
        );
      }
    } catch (err) {
      // Fallback
      window.location.href = `/api/download/desktop?os=${os}&file=${filename}`;
    } finally {
      setTimeout(() => {
        setDownloadingOS(null);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#0b101c] border-slate-800 text-slate-100 shadow-indigo-950/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/20'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/60'}`}>
          <div className="flex items-center gap-3.5">
            <BrandLogo size="md" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg tracking-tight">Download CargoMS Desktop</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enterprise Cargo Documentation & Local Storage Engine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className={`grid grid-cols-3 gap-2 p-4 border-b text-xs font-mono ${isDark ? 'border-slate-800/60 bg-slate-900/30' : 'border-slate-100 bg-slate-50/40'}`}>
          <div className="flex items-center gap-2 text-slate-300">
            <WifiOff size={15} className="text-amber-400 shrink-0" />
            <span className="truncate">30-Day Offline Lease</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive size={15} className="text-indigo-400 shrink-0" />
            <span className="truncate">Local SQLite Database</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <FolderOpen size={15} className="text-emerald-400 shrink-0" />
            <span className="truncate">Local PDF Archiving</span>
          </div>
        </div>

        {/* Dynamic Status / Compilation Notice */}
        {downloadError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs font-mono flex items-start gap-2.5">
            <WifiOff size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">{downloadError}</span>
              <p className="text-[11px] text-amber-300/80">
                The standalone Windows installer is packaging into dist-electron/. Once complete, click download again to save the genuine installer.
              </p>
            </div>
          </div>
        )}

        {/* OS Platform Tabs */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('windows')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                activeTab === 'windows'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor size={15} />
              <span>Windows</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mac')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                activeTab === 'mac'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Apple size={15} />
              <span>macOS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('linux')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                activeTab === 'linux'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal size={15} />
              <span>Linux</span>
            </button>
          </div>

          {/* Windows Download Options */}
          {activeTab === 'windows' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard Installer */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">NSIS Setup Installer</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Standard Windows 64-bit installer with desktop shortcut and auto-update capability.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      Windows 10 / 11 (64-bit) · ~120 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('windows', 'CargoMS-Setup-1.0.0.exe')}
                    disabled={downloadingOS === 'windows'}
                    className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
                  >
                    <Download size={14} />
                    <span>{downloadingOS === 'windows' ? 'Starting Download...' : 'Download Setup (.exe)'}</span>
                  </button>
                </div>

                {/* Portable Standalone */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Portable Executable</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        NO INSTALL
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Zero installation required. Run directly from a USB drive or any local folder.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      Standalone Portable (64-bit) · ~115 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('windows', 'CargoMS-Portable-1.0.0.exe')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Portable (.exe)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* macOS Download Options */}
          {activeTab === 'mac' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Apple Silicon */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Apple Silicon DMG</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        M1 / M2 / M3 / M4
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Native ARM64 build optimized for Apple Silicon Macs for ultra-fast startup.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      macOS 11.0 Big Sur or later · ~118 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('mac', 'CargoMS-1.0.0-arm64.dmg')}
                    className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download DMG (Apple Silicon)</span>
                  </button>
                </div>

                {/* Intel Mac */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Intel x64 DMG</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        INTEL PROCESSOR
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Standard package for Intel-based MacBooks, iMacs, and Mac Minis.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      macOS 10.15 Catalina or later · ~125 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('mac', 'CargoMS-1.0.0-x64.dmg')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download DMG (Intel)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Linux Download Options */}
          {activeTab === 'linux' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* AppImage */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <span className="font-bold text-sm">Universal AppImage</span>
                    <p className="text-xs text-slate-400">
                      Compatible with Ubuntu, Fedora, Debian, Arch, and all major Linux distributions.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      x86_64 Linux · ~110 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('linux', 'CargoMS-1.0.0.AppImage')}
                    className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download AppImage</span>
                  </button>
                </div>

                {/* Debian/Ubuntu .deb */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-1">
                    <span className="font-bold text-sm">Debian / Ubuntu Package</span>
                    <p className="text-xs text-slate-400">
                      Native `.deb` package with apt package management integration.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      Debian, Ubuntu, Mint (64-bit) · ~95 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('linux', 'CargoMS-1.0.0.deb')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download .deb Package</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Activation Notice */}
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
            isDark ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            <ShieldCheck size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold block">How to Activate Your Desktop Software:</span>
              <p className="text-[11px] text-slate-400">
                After installation, sign in using your account credentials or enter the 16-character License Key (<span className="font-mono text-indigo-300">CRGO-2026-XXXX-XXXX-XXXX</span>) provided by your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
