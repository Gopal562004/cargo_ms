import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  X,
  Monitor,
  Apple,
  Terminal,
  HardDrive,
  WifiOff,
  ShieldCheck,
  FolderOpen,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { getApiBaseUrl } from '../../services/api';
import BrandLogo from './BrandLogo';

const GITHUB_REPO = 'Gopal562004/cargo_ms';
const RELEASE_TAG = 'v1.0.0';
const GITHUB_RELEASE_BASE = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_TAG}`;
const GITHUB_RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases`;

export default function DownloadModal({ isOpen, onClose }) {
  const { theme } = useThemeStore();
  const isDark = theme !== 'light';

  const [activeTab, setActiveTab] = useState('windows');
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [downloadNotice, setDownloadNotice] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  /**
   * Resolve and trigger binary download:
   * 1. If running locally with local backend, stream from local Express server
   * 2. If running on cloud web portal (Vercel/Render), download directly from GitHub Release
   */
  const handleDownload = (os, filename) => {
    setDownloadingFile(filename);
    setDownloadNotice(null);

    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const downloadTargetUrl = isLocalhost
      ? `${getApiBaseUrl()}/download/desktop?os=${os}&file=${filename}`
      : `${GITHUB_RELEASE_BASE}/${filename}`;

    try {
      // Trigger native browser download directly without bloating memory
      const a = document.createElement('a');
      a.href = downloadTargetUrl;
      a.setAttribute('download', filename);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadNotice({
        status: 'started',
        file: filename,
        url: downloadTargetUrl,
      });
    } catch {
      window.open(downloadTargetUrl, '_blank');
    } finally {
      setTimeout(() => {
        setDownloadingFile(null);
      }, 1500);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-lg border shadow-2xl overflow-hidden transition-all my-auto ${
          isDark
            ? 'bg-[#0b101c] border-slate-800 text-slate-100 shadow-black/60'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/20'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header — Crisp & Less Rounded */}
        <div
          className={`shrink-0 px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <BrandLogo size="md" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Download CargoMS Desktop</h3>
                <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {RELEASE_TAG}
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
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div
          className={`shrink-0 grid grid-cols-3 gap-2 px-5 py-3 border-b text-xs font-mono ${
            isDark ? 'border-slate-800/60 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-300">
            <WifiOff size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">30-Day Offline Lease</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive size={14} className="text-indigo-400 shrink-0" />
            <span className="truncate">Local SQLite Engine</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <FolderOpen size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">Direct PDF Archiving</span>
          </div>
        </div>

        {/* Download Started Notice */}
        {downloadNotice && (
          <div className="mx-5 mt-4 p-3 rounded-md border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 text-xs font-mono space-y-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />
              <span className="font-bold">Download requested for {downloadNotice.file}</span>
            </div>
            <p className="text-[11px] text-indigo-300/80">
              If the download didn't start automatically,{' '}
              <a
                href={downloadNotice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-indigo-300 hover:text-white font-bold"
              >
                click here to download directly from GitHub
              </a>
              .
            </p>
          </div>
        )}

        {/* OS Platform Tabs & Content — Crisp Rectangular Structure */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* OS Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 border border-slate-800/80 rounded-md text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('windows')}
              className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-2 font-medium transition-all cursor-pointer ${
                activeTab === 'windows'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor size={14} />
              <span>Windows</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mac')}
              className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-2 font-medium transition-all cursor-pointer ${
                activeTab === 'mac'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Apple size={14} />
              <span>macOS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('linux')}
              className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-2 font-medium transition-all cursor-pointer ${
                activeTab === 'linux'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal size={14} />
              <span>Linux</span>
            </button>
          </div>

          {/* Windows Download Options */}
          {activeTab === 'windows' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* NSIS Standard Installer */}
                <div
                  className={`p-4 rounded-md border flex flex-col justify-between space-y-3 ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/40'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">NSIS Setup Installer</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Standard Windows 64-bit installer with desktop shortcut and auto-update capability.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500">
                      Windows 10 / 11 (64-bit) · ~240 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('windows', 'CargoMS-Setup-1.0.0.exe')}
                    disabled={downloadingFile === 'CargoMS-Setup-1.0.0.exe'}
                    className="w-full py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow cursor-pointer disabled:opacity-50"
                  >
                    <Download size={13} />
                    <span>
                      {downloadingFile === 'CargoMS-Setup-1.0.0.exe'
                        ? 'Opening Download...'
                        : 'Download Setup (.exe)'}
                    </span>
                  </button>
                </div>

                {/* Portable Standalone */}
                <div
                  className={`p-4 rounded-md border flex flex-col justify-between space-y-3 ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Portable Executable</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        NO INSTALL
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Zero installation required. Run directly from a USB drive or any local folder.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500">
                      Standalone Portable (64-bit) · ~240 MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('windows', 'CargoMS-Portable-1.0.0.exe')}
                    disabled={downloadingFile === 'CargoMS-Portable-1.0.0.exe'}
                    className="w-full py-2 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download size={13} />
                    <span>
                      {downloadingFile === 'CargoMS-Portable-1.0.0.exe'
                        ? 'Opening Download...'
                        : 'Download Portable (.exe)'}
                    </span>
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
                <div
                  className={`p-4 rounded-md border flex flex-col justify-between space-y-3 ${
                    isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Apple Silicon DMG</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                        M1-M4
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Native ARM64 build optimized for Apple Silicon Macs for ultra-fast startup.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500">
                      macOS 11.0 Big Sur or later
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('mac', 'CargoMS-1.0.0-arm64.dmg')}
                    className="w-full py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download DMG (Apple Silicon)</span>
                  </button>
                </div>

                {/* Intel Mac */}
                <div
                  className={`p-4 rounded-md border flex flex-col justify-between space-y-3 ${
                    isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Intel x64 DMG</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        INTEL
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Standard package for Intel-based MacBooks, iMacs, and Mac Minis.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500">
                      macOS 10.15 Catalina or later
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('mac', 'CargoMS-1.0.0-x64.dmg')}
                    className="w-full py-2 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={13} />
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
                <div
                  className={`p-4 rounded-md border flex flex-col justify-between space-y-3 ${
                    isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="font-bold text-sm">Universal AppImage</span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Compatible with Ubuntu, Fedora, Debian, Arch, and all major distributions.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500">
                      x86_64 Linux standalone
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('linux', 'CargoMS-1.0.0.AppImage')}
                    className="w-full py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download AppImage</span>
                  </button>
                </div>

                {/* Debian/Ubuntu .deb */}
                <div
                  className={`p-4 rounded-md border flex flex-col justify-between space-y-3 ${
                    isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="font-bold text-sm">Debian / Ubuntu Package</span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Native `.deb` package with apt package management integration.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500">
                      Debian, Ubuntu, Mint (64-bit)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload('linux', 'CargoMS-1.0.0.deb')}
                    className="w-full py-2 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download .deb Package</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Activation Notice — Crisp & Less Rounded */}
          <div
            className={`p-3.5 rounded-md border text-xs flex items-start gap-3 ${
              isDark
                ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            <ShieldCheck size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold block">How to Activate Your Desktop Software:</span>
              <p className="text-[11px] text-slate-400">
                After installation, sign in using your account credentials or enter your 16-character
                License Key (<span className="font-mono text-indigo-300">CRGO-2026-XXXX-XXXX-XXXX</span>).
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer — Crisp borders & Direct GitHub Release Link */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark
              ? 'border-slate-800 bg-slate-950/70 text-slate-400'
              : 'border-slate-100 bg-slate-50 text-slate-600'
          }`}
        >
          <div className="text-[11px] font-mono">
            CargoMS Desktop {RELEASE_TAG} · Windows x64 Build
          </div>
          <a
            href={GITHUB_RELEASES_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-mono font-medium transition-colors cursor-pointer"
          >
            <span>All GitHub Releases</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
