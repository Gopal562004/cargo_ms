import React, { useState, useRef } from 'react';
import {
  X,
  CloudDownload,
  FileUp,
  FileDown,
  Globe,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Users,
  Bookmark,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import Button from '../ui/Button';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import {
  downloadFullBackup,
  importFromBackupFile,
  cloudImportData,
} from '../../services/migrationService';
import { syncStorageArchive } from '../../services/storageService';

/**
 * ImportExportModal — Data Migration & Cloud Transfer modal.
 * Provides two tabs:
 *   1. Import Directly from Web Cloud
 *   2. File Backup & Restore (Export/Import .json)
 */
export default function ImportExportModal({ isOpen, onClose, onComplete, initialTab }) {
  useBodyScrollLock(isOpen);

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab) return initialTab;
    return isElectron ? 'cloud' : 'file';
  });

  React.useEffect(() => {
    if (isOpen) {
      if (!isElectron) {
        setActiveTab('file');
      } else if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab, isElectron]);

  // Cloud Import State
  const [cloudUrl, setCloudUrl] = useState('');
  const [cloudIdentifier, setCloudIdentifier] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudResult, setCloudResult] = useState(null);
  const [cloudError, setCloudError] = useState('');

  // File Import State
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // ─── Cloud Import Handler ─────────────────────────────────
  const handleCloudImport = async (e) => {
    e.preventDefault();
    setCloudLoading(true);
    setCloudError('');
    setCloudResult(null);

    try {
      const isLicense = cloudIdentifier.toUpperCase().startsWith('CRGO-');
      const isEmail = cloudIdentifier.includes('@');

      const result = await cloudImportData({
        cloudUrl: cloudUrl || undefined,
        email: isEmail ? cloudIdentifier : undefined,
        username: (!isEmail && !isLicense) ? cloudIdentifier : undefined,
        password: cloudPassword,
        licenseKey: isLicense ? cloudIdentifier : undefined,
      });

      // Automatically sync and archive all newly imported documents directly to local PC disk
      try {
        await syncStorageArchive();
      } catch (syncErr) {
        console.warn('Auto-sync to local disk after cloud import:', syncErr.message);
      }

      setCloudResult(result);
      if (onComplete) onComplete();
    } catch (err) {
      setCloudError(err.message || 'Cloud import failed');
    } finally {
      setCloudLoading(false);
    }
  };

  // ─── File Export Handler ───────────────────────────────────
  const handleExport = async () => {
    setExportLoading(true);
    try {
      await downloadFullBackup();
    } catch (err) {
      setImportError(err.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // ─── File Import Handler ──────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportError('');
      setImportResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      setSelectedFile(file);
      setImportError('');
      setImportResult(null);
    } else {
      setImportError('Please drop a valid .json backup file');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImportLoading(true);
    setImportError('');
    setImportResult(null);

    try {
      const result = await importFromBackupFile(selectedFile);

      // Automatically sync and archive all newly imported documents directly to local PC disk
      try {
        await syncStorageArchive();
      } catch (syncErr) {
        console.warn('Auto-sync to local disk after backup import:', syncErr.message);
      }

      setImportResult(result);
      if (onComplete) onComplete();
    } catch (err) {
      setImportError(err.message || 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ─── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/30">
              <RefreshCw size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isElectron ? 'Data Migration & Cloud Transfer' : 'Data Import & Export'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isElectron
                  ? 'Import from web, export backups, or restore from file'
                  : 'Export backups or restore data from a backup file'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Tab Switcher (Only show on desktop where cloud import exists) ── */}
        {isElectron && (
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('cloud')}
              className={`flex-1 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'cloud'
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Globe size={14} /> Import from Web Cloud
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'file'
                  ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HardDrive size={14} /> File Backup & Restore
            </button>
          </div>
        )}

        {/* ─── Tab Content ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="p-3 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
                <CloudDownload size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Import directly from your Web account.</strong>
                  <p className="text-indigo-300/80 mt-0.5">
                    Enter your CargoMS Website credentials below. All your documents, contacts, and templates
                    will be pulled into this desktop app automatically. Existing records will not be duplicated.
                  </p>
                </div>
              </div>

              {/* Cloud Import Form */}
              <form onSubmit={handleCloudImport} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Cloud API URL <span className="font-normal text-slate-500">(leave blank for default)</span>
                  </label>
                  <input
                    type="text"
                    value={cloudUrl}
                    onChange={(e) => setCloudUrl(e.target.value)}
                    placeholder="https://your-server.onrender.com  or  http://localhost:5000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Email, Username, or License Key
                  </label>
                  <input
                    type="text"
                    value={cloudIdentifier}
                    onChange={(e) => setCloudIdentifier(e.target.value)}
                    placeholder="your@email.com  or  username  or  CRGO-XXXX-XXXX"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={cloudPassword}
                    onChange={(e) => setCloudPassword(e.target.value)}
                    placeholder="Your web account password"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={cloudLoading}
                  className="text-xs mt-2"
                  disabled={!cloudIdentifier.trim() || !cloudPassword.trim()}
                >
                  <CloudDownload size={14} className="mr-1.5 inline" />
                  {cloudLoading ? 'Importing from Cloud...' : 'Import All Data from Web'}
                </Button>
              </form>

              {/* Cloud Result */}
              {cloudResult && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Cloud Import Complete!
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <StatBox icon={FileText} label="Documents" value={cloudResult.documents || 0} color="indigo" />
                    <StatBox icon={Users} label="Contacts" value={cloudResult.contacts || 0} color="sky" />
                    <StatBox icon={Bookmark} label="Templates" value={cloudResult.templates || 0} color="amber" />
                  </div>
                  {(cloudResult.skipped || 0) > 0 && (
                    <p className="text-[10px] text-slate-400 mt-2">
                      {cloudResult.skipped} duplicate items skipped.
                    </p>
                  )}
                </div>
              )}

              {cloudError && (
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                  <span>{cloudError}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'file' && (
            <div className="space-y-5">
              {/* ─── Export Section ────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="p-1 rounded bg-emerald-500/15 text-emerald-400">
                    <Download size={14} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">Export Full Backup</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Download a complete <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">.json</code> backup file
                  containing all your documents, contacts, templates, billing profiles, parties, item presets, and financial year settings.
                </p>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleExport}
                  loading={exportLoading}
                  className="text-xs"
                >
                  <FileDown size={14} className="mr-1.5 inline" />
                  {exportLoading ? 'Preparing Backup...' : 'Export Full Backup (.json)'}
                </Button>
              </div>

              <hr className="border-slate-800" />

              {/* ─── Import Section ────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="p-1 rounded bg-sky-500/15 text-sky-400">
                    <Upload size={14} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">Import from Backup File</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Upload a previously exported <code className="text-sky-400 bg-slate-950 px-1 py-0.5 rounded font-mono">CargoMS_Backup_*.json</code> file
                  to restore your data. Duplicates will be automatically skipped.
                </p>

                {/* Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    dragOver
                      ? 'border-sky-500 bg-sky-500/10'
                      : selectedFile
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2.5">
                      <FileUp size={20} className="text-emerald-400" />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-emerald-300">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB — Click to change file
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FileUp size={28} className="text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">
                        Drag & drop your backup file here, or <span className="text-sky-400 underline">click to browse</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Accepts .json backup files only</p>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleImport}
                    loading={importLoading}
                    className="text-xs mt-3"
                  >
                    <FileUp size={14} className="mr-1.5 inline" />
                    {importLoading ? 'Importing...' : 'Import Backup File'}
                  </Button>
                )}

                {/* Import Result */}
                {importResult && (
                  <div className="p-3 mt-3 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold mb-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      Import Complete!
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <StatBox icon={FileText} label="Documents" value={importResult.documents || 0} color="indigo" />
                      <StatBox icon={Users} label="Contacts" value={importResult.contacts || 0} color="sky" />
                      <StatBox icon={Bookmark} label="Templates" value={importResult.templates || 0} color="amber" />
                    </div>
                    {(importResult.skipped || 0) > 0 && (
                      <p className="text-[10px] text-slate-400 mt-2">
                        {importResult.skipped} duplicate items skipped.
                      </p>
                    )}
                    {(importResult.clientItemsRestored || 0) > 0 && (
                      <p className="text-[10px] text-emerald-400 mt-1">
                        + {importResult.clientItemsRestored} client-side items restored (billing profiles, parties, etc.)
                      </p>
                    )}
                  </div>
                )}

                {importError && (
                  <div className="p-3 mt-3 rounded-md bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2 animate-fade-in">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer ────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            <ShieldCheck size={11} className="inline mr-1" />
            Your data never leaves your device during file backup. Cloud import uses your credentials securely.
          </p>
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Small stat display box used inside result summaries.
 */
function StatBox({ icon: Icon, label, value, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  };

  return (
    <div className={`p-2 rounded border text-center ${colorMap[color] || colorMap.indigo}`}>
      <Icon size={14} className="mx-auto mb-0.5 opacity-70" />
      <div className="text-lg font-bold font-mono">{value}</div>
      <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}
