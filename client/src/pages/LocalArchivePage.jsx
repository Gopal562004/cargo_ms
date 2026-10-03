import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder,
  FolderOpen,
  HardDrive,
  FileText,
  Search,
  ExternalLink,
  RefreshCw,
  FolderSync,
  Layers,
  ShieldCheck,
  AlertCircle,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import {
  getLocalDocuments,
  getStorageStats,
  getStorageConfig,
  updateStorageConfig,
  syncStorageArchive,
  deleteLocalDocument,
} from '../services/storageService';
import { useThemeStore } from '../store/themeStore';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';

function extractDocSequence(docNo = '') {
  const match = String(docNo).match(/\/(\d+)\//);
  if (match) return parseInt(match[1], 10);
  const numMatch = String(docNo).match(/(\d+)/);
  return numMatch ? parseInt(numMatch[1], 10) : 0;
}

export default function LocalArchivePage() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ totalFiles: 0, totalSizeFormatted: '0 KB', storageRoot: '' });
  const [storagePath, setStoragePath] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [deleteTargetDoc, setDeleteTargetDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting and Pagination states
  const [sortBy, setSortBy] = useState('docNo');
  const [sortOrder, setSortOrder] = useState('desc'); // Default descending DGR/020 -> DGR/001
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'docNo' || column === 'date' || column === 'size' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const sortedDocuments = useMemo(() => {
    let list = [...documents];

    // Instant client-side search across document number, title, category, type, and JSON payload
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((doc) =>
        (doc.documentNumber || '').toLowerCase().includes(q) ||
        (doc.title || '').toLowerCase().includes(q) ||
        (doc.category || '').toLowerCase().includes(q) ||
        (doc.documentType || '').toLowerCase().includes(q) ||
        JSON.stringify(doc.data || {}).toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'docNo') {
        const seqA = extractDocSequence(a.documentNumber);
        const seqB = extractDocSequence(b.documentNumber);
        if (seqA > 0 && seqB > 0 && seqA !== seqB) {
          return sortOrder === 'desc' ? seqB - seqA : seqA - seqB;
        }
        return sortOrder === 'desc'
          ? String(b.documentNumber || '').localeCompare(String(a.documentNumber || ''))
          : String(a.documentNumber || '').localeCompare(String(b.documentNumber || ''));
      }
      if (sortBy === 'date') {
        const dateA = new Date(a.savedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.savedAt || b.createdAt || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      if (sortBy === 'size') {
        const sizeA = a.fileSize || 0;
        const sizeB = b.fileSize || 0;
        return sortOrder === 'desc' ? sizeB - sizeA : sizeA - sizeB;
      }
      return 0;
    });
    return list;
  }, [documents, sortBy, sortOrder, search]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(sortedDocuments.length / pageSize));
  const paginatedDocuments = useMemo(() => {
    if (pageSize === 'ALL') return sortedDocuments;
    const start = (currentPage - 1) * pageSize;
    return sortedDocuments.slice(start, start + pageSize);
  }, [sortedDocuments, currentPage, pageSize]);

  const computedTotalSizeBytes = useMemo(() => {
    return documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
  }, [documents]);

  const formattedDiskUsage = useMemo(() => {
    if (stats.totalSizeFormatted && stats.totalSizeFormatted !== '0 B' && stats.totalSizeFormatted !== '0 KB') {
      return stats.totalSizeFormatted;
    }
    if (computedTotalSizeBytes >= 1024 * 1024) {
      return `${(computedTotalSizeBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (computedTotalSizeBytes > 0) {
      return `${Math.round(computedTotalSizeBytes / 1024)} KB`;
    }
    return '0 KB';
  }, [stats.totalSizeFormatted, computedTotalSizeBytes]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes, configRes] = await Promise.all([
        getLocalDocuments({ category, year }).catch(() => ({ documents: [] })),
        getStorageStats().catch(() => ({ totalFiles: 0, totalSizeFormatted: '0 B' })),
        getStorageConfig().catch(() => ({ storagePath: '' })),
      ]);

      setDocuments(docsRes.documents || docsRes.data?.documents || []);
      setStats(statsRes.data || statsRes || {});
      setStoragePath(configRes.storagePath || configRes.data?.storagePath || '');
    } catch (err) {
      console.error('Failed to load local archive data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isElectron) {
      loadData();
    }
  }, [category, year, isElectron]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Live client-side filtering already filters instantaneous on state change
  };

  const handleOpenFolder = async (targetPath) => {
    const pathToOpen = targetPath || storagePath;
    if (window.electronAPI?.showInFolder) {
      setFeedback({ type: 'info', message: 'Opening folder in Windows Explorer...' });
      await window.electronAPI.showInFolder(pathToOpen);
      setTimeout(() => setFeedback(null), 2500);
    } else if (window.electronAPI?.openFile) {
      setFeedback({ type: 'info', message: 'Opening folder...' });
      await window.electronAPI.openFile(pathToOpen);
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({ type: 'info', message: `Path: ${pathToOpen}` });
    }
  };

  const handleOpenFile = async (filePath) => {
    if (window.electronAPI?.openFile) {
      setFeedback({ type: 'info', message: 'Opening file with default viewer...' });
      await window.electronAPI.openFile(filePath);
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({ type: 'info', message: `Opening: ${filePath}` });
    }
  };

  const handleChangeStorageFolder = async () => {
    if (!window.electronAPI?.selectFolder) {
      setFeedback({ type: 'error', message: 'Folder picker is only available in the Desktop App.' });
      return;
    }

    try {
      const selected = await window.electronAPI.selectFolder();
      if (selected) {
        await updateStorageConfig(selected);
        setStoragePath(selected);
        setFeedback({ type: 'success', message: `Storage location updated to: ${selected}` });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update folder' });
    }
  };

  const handleSyncArchive = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await syncStorageArchive();
      setFeedback({
        type: 'success',
        message: res.message || 'All documents successfully synced and archived to local storage.',
      });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to sync documents to local archive' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmDeleteDoc = async () => {
    if (!deleteTargetDoc) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await deleteLocalDocument({
        documentNumber: deleteTargetDoc.documentNumber,
        pdfPath: deleteTargetDoc.pdfPath,
        id: deleteTargetDoc.id,
      });
      setFeedback({
        type: 'success',
        message: `Document ${deleteTargetDoc.documentNumber || ''} deleted from device storage.`,
      });
      setDeleteTargetDoc(null);
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete document from device' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Web Guard: Local Archive is Desktop-Only ───────────────
  if (!isElectron) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <HardDrive size={24} />
        </div>
        <div>
          <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Local Document Archive (Desktop Only)
          </h1>
          <p className={`text-xs mt-2 max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            On the CargoMS Web Application, all documents, templates, and issued PDFs are safely stored online in the cloud database.
            Organized folder storage directly on your computer's drive is exclusive to the <strong>CargoMS Desktop App</strong>.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link to="/documents">
            <Button variant="primary" className="rounded text-xs">
              <FileText size={13} className="mr-1.5 inline" /> View All Online Documents
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="secondary" className="rounded text-xs">
              Open Settings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Local Document Archive
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Local-First Offline Ready
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Documents and issued PDFs are automatically saved and organized into structured folders on your PC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncArchive}
            disabled={isSyncing || loading}
            className="rounded text-xs flex items-center gap-1.5"
            title="Generate and archive all documents from the database to your local hard drive"
          >
            <FolderSync className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Archiving All...' : 'Sync All to Disk'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            disabled={loading || isSyncing}
            className="rounded text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenFolder(storagePath)}
            className="rounded text-xs flex items-center gap-1.5 shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Open in Explorer
          </Button>
        </div>
      </div>

      {/* Notice/Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-md border flex items-center justify-between text-xs ${
            feedback.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] hover:underline opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Storage Location Card */}
      <div
        className={`p-4 rounded-md border transition-all ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 shadow-sm'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Local Storage Root
              </div>
              <div
                className={`font-mono text-xs mt-1 truncate select-all ${
                  isDark ? 'text-slate-200 bg-slate-950' : 'text-slate-800 bg-slate-100'
                } px-2.5 py-1 rounded border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
              >
                {storagePath || 'Resolving local path...'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="font-semibold">Pattern:</span>
                <span className="font-mono text-[10px] text-slate-400">
                  [StorageRoot]/[Company]/[Year]/[Category]/[DocType]/[DocNo].pdf
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangeStorageFolder}
              className="rounded text-xs flex items-center gap-1.5"
            >
              <FolderSync className="w-3.5 h-3.5" />
              Change Folder...
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-3.5 rounded-md border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Local Documents
            </span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {stats.totalDocuments ?? stats.totalFiles ?? documents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Stored safely on device</div>
        </div>

        <div
          className={`p-3.5 rounded-md border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Disk Usage
            </span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formattedDiskUsage}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">PDFs & JSON metadata</div>
        </div>

        <div
          className={`p-3.5 rounded-md border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Environment
            </span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={`text-xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Desktop (Embedded)
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Direct OS file system access
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className={`p-3 rounded-md border flex flex-col md:flex-row gap-2.5 items-center justify-between ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Document #, Title, or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-8.5 pr-3 py-1.5 text-xs rounded border outline-none transition-all ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`px-2.5 py-1.5 text-xs rounded border outline-none cursor-pointer ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="">All Categories</option>
            <option value="AIR_FREIGHT">Air Freight</option>
            <option value="SEA_FREIGHT">Sea Freight</option>
            <option value="EDI">EDI Messages</option>
            <option value="OTHER">Invoices & Finance</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`px-2.5 py-1.5 text-xs rounded border outline-none cursor-pointer ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Document List Table with Sorting & Pagination */}
      <div
        className={`rounded-md border overflow-hidden ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[11px] uppercase font-semibold tracking-wider select-none ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th
                  onClick={() => handleSort('docNo')}
                  className="py-2.5 px-3 cursor-pointer hover:text-indigo-400 transition-colors"
                  title="Click to sort by Document #"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Document #</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === 'docNo' ? 'text-indigo-400' : 'opacity-30'}`} />
                  </div>
                </th>
                <th className="py-2.5 px-3">Category / Type</th>
                <th
                  onClick={() => handleSort('size')}
                  className="py-2.5 px-3 cursor-pointer hover:text-indigo-400 transition-colors"
                  title="Click to sort by File Size"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Size</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === 'size' ? 'text-indigo-400' : 'opacity-30'}`} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-2.5 px-3 cursor-pointer hover:text-indigo-400 transition-colors"
                  title="Click to sort by Date"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Saved Date</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === 'date' ? 'text-indigo-400' : 'opacity-30'}`} />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 opacity-60" />
                    Scanning local directory...
                  </td>
                </tr>
              ) : sortedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <Folder className="w-8 h-8 mx-auto mb-2.5 opacity-30 text-indigo-400" />
                    <div className="font-semibold text-sm">No local documents found</div>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Generate, issue, or download any PDF in CargoMS Desktop to automatically archive it here on your PC.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedDocuments.map((doc) => (
                  <tr
                    key={doc.id || doc.pdfPath}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className={`font-semibold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {doc.documentNumber || 'Unnamed Document'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {doc.title || doc.fileName || doc.pdfPath}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1 items-center">
                        <Badge variant="primary" size="sm" className="rounded text-[10px]">
                          {doc.documentType || 'DOCUMENT'}
                        </Badge>
                        {doc.category && (
                          <Badge variant="neutral" size="sm" className="rounded text-[10px]">
                            {doc.category}
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {doc.fileSize
                        ? doc.fileSize >= 1024 * 1024
                          ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(doc.fileSize / 1024)} KB`
                        : doc.sizeFormatted || 'PDF'}
                    </td>

                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                      {doc.savedAt || doc.createdAt
                        ? new Date(doc.savedAt || doc.createdAt).toLocaleDateString()
                        : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isElectron && doc.pdfPath && (
                          <>
                            <button
                              onClick={() => handleOpenFile(doc.pdfPath)}
                              title="Open PDF in default app"
                              className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenFolder(doc.pdfPath)}
                              title="Show in Windows Explorer"
                              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {doc.id && (
                          <Link
                            to={`/documents/${doc.id}`}
                            title="View in CargoMS Editor"
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTargetDoc(doc)}
                          title="Delete from local device archive"
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedDocuments.length > 0 && (
          <div
            className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  setPageSize(val);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded border text-xs cursor-pointer outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="ALL">All</option>
              </select>

              <span className="ml-2 font-medium">
                Showing{' '}
                {pageSize === 'ALL'
                  ? `1 to ${sortedDocuments.length}`
                  : `${(currentPage - 1) * pageSize + 1} to ${Math.min(
                      currentPage * pageSize,
                      sortedDocuments.length
                    )}`}{' '}
                of {sortedDocuments.length} documents
              </span>
            </div>

            {pageSize !== 'ALL' && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      currentPage === num
                        ? 'bg-indigo-600 text-white font-bold'
                        : isDark
                        ? 'hover:bg-slate-800 text-slate-300'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetDoc)}
        title="Delete Document from Device"
        message={`Are you sure you want to delete ${deleteTargetDoc?.documentNumber || 'this document'}? Both the PDF file and offline JSON metadata will be deleted from your PC.`}
        confirmText="Delete from Device"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteDoc}
        onCancel={() => setDeleteTargetDoc(null)}
      />
    </div>
  );
}
