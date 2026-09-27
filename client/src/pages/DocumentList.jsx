import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Download,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  CheckCircle2,
  X,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { downloadDocumentPDF, previewDocumentPDF } from '../services/documentService';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { hasServiceAccess, isDocumentTypeAllowed, isSubscriptionExpired } from '../utils/permissions';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ImportExportModal from '../components/migration/ImportExportModal';

const ALL_CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories', serviceKey: 'ANY' },
  { value: 'AIR_FREIGHT', label: 'Air Freight', serviceKey: 'AIR_FREIGHT' },
  { value: 'EDI', label: 'eAWB / Cargo-IMP', serviceKey: 'EDI_CARGO' },
  { value: 'SEA_FREIGHT', label: 'Sea Freight', serviceKey: 'SEA_FREIGHT' },
  { value: 'OTHER', label: 'Commercial / Other', serviceKey: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'] },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'VALIDATED', label: 'Validated' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function DocumentList() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isExpired = isSubscriptionExpired(user);
  const { documents, pagination, fetchDocuments, isLoading, deleteDocument, updateStatus } = useDocumentStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const headerCheckboxRef = useRef(null);

  // Filter category options based on user's permitted services
  const categoryOptions = ALL_CATEGORY_OPTIONS.filter((opt) =>
    hasServiceAccess(user, opt.serviceKey)
  );

  useEffect(() => {
    const params = { search, page: 1, limit: pageSize };
    if (category) params.category = category;
    if (status) params.status = status;
    fetchDocuments(params);
    setSelectedIds([]);
  }, [search, category, status, pageSize]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const handlePageChange = (page) => {
    fetchDocuments({ search, category, status, page, limit: pageSize });
    setSelectedIds([]);
  };

  const [deleteTargetDoc, setDeleteTargetDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTargetDoc) return;
    if (isExpired) {
      alert('Subscription Expired: Deleting documents is locked in read-only mode.');
      setDeleteTargetDoc(null);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDocument(deleteTargetDoc.id);
      fetchDocuments({ search, category, status, page: pagination.page, limit: pageSize });
      setDeleteTargetDoc(null);
    } catch (err) {
      alert('Failed to delete document: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter document rows to only allowed types for non-admin users
  const visibleDocuments = documents.filter((doc) => isDocumentTypeAllowed(user, doc.documentType));

  // Multi-select handlers
  const allVisibleSelected =
    visibleDocuments.length > 0 && visibleDocuments.every((d) => selectedIds.includes(d.id));
  const someVisibleSelected =
    visibleDocuments.some((d) => selectedIds.includes(d.id)) && !allVisibleSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleDocuments.map((d) => d.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (isExpired) {
      alert('Subscription Expired: Deleting documents is locked in read-only mode.');
      setBulkDeleteTarget(false);
      return;
    }
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteDocument(id)));
      setSelectedIds([]);
      setBulkDeleteTarget(false);
      fetchDocuments({ search, category, status, page: pagination.page, limit: pageSize });
    } catch (err) {
      alert('Failed to delete selected documents: ' + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!newStatus || selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) => updateStatus(id, newStatus, 'Bulk status update'))
      );
      setSelectedIds([]);
      fetchDocuments({ search, category, status, page: pagination.page, limit: pageSize });
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedDocs = documents.filter((d) => selectedIds.includes(d.id));
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      count: selectedDocs.length,
      documents: selectedDocs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CargoMS_Export_${selectedDocs.length}_Docs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Documents
          </h1>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            {pagination.total || visibleDocuments.length} total accessible documents
            {pagination.totalPages > 1 && ` (Showing page ${pagination.page} of ${pagination.totalPages})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="rounded text-xs"
            onClick={() => setShowMigrationModal(true)}
          >
            <RefreshCw size={13} className="mr-1.5 inline" /> Import / Export
          </Button>
          {isExpired ? (
            <Button
              variant="secondary"
              disabled
              className="rounded text-xs opacity-60 cursor-not-allowed text-rose-500 border-rose-500/30"
              title="Subscription Expired - Document creation is locked"
            >
              <Plus size={13} className="mr-1.5 inline" /> New Document (Locked)
            </Button>
          ) : (
            <Link to="/new">
              <Button variant="primary" className="rounded text-xs">
                <Plus size={13} className="mr-1.5 inline" /> New Document
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Read-Only Notice */}
      {isExpired && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-md text-xs text-amber-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">🔒 Read-Only Archive:</span>
            <span>Your subscription has expired. All past documents remain safe to view, download, and preview.</span>
          </div>
          <Link to="/settings" className="text-amber-400 hover:text-amber-200 underline font-semibold shrink-0">
            Renew Plan
          </Link>
        </div>
      )}

      {/* Filters & Page Size */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="relative flex items-center sm:col-span-2">
          <Search size={13} className={`absolute left-3 pointer-events-none ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            className={`w-full pl-8 pr-3 py-1.5 rounded text-xs transition-colors focus:outline-none ${
              theme === 'light'
                ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 shadow-xs'
                : 'bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
            }`}
            placeholder="Search by document number or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={`w-full px-2.5 py-1.5 rounded text-xs transition-colors focus:outline-none cursor-pointer ${
            theme === 'light'
              ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
              : 'bg-slate-900/60 border border-slate-800 text-slate-200 focus:border-indigo-500'
          }`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-slate-900'}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className={`w-full px-2.5 py-1.5 rounded text-xs transition-colors focus:outline-none cursor-pointer ${
            theme === 'light'
              ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
              : 'bg-slate-900/60 border border-slate-800 text-slate-200 focus:border-indigo-500'
          }`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className={theme === 'light' ? 'bg-white text-slate-800' : 'bg-slate-900'}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Bulk Action Bar ───────────────────────────────── */}
      {selectedIds.length > 0 && (
        <div
          className={`p-2 px-3 rounded border flex flex-wrap items-center justify-between gap-2.5 text-xs animate-fade-in ${
            theme === 'light'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'
              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold bg-indigo-600 text-white rounded px-2 py-0.5 text-[11px]">
              {selectedIds.length} Selected
            </span>
            <span className="text-slate-400 text-[11px]">
              of {visibleDocuments.length} on this page
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Change Dropdown */}
            <select
              className={`px-2 py-1 rounded text-xs border focus:outline-none cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-indigo-200 text-slate-800'
                  : 'bg-slate-900 border-indigo-500/30 text-slate-200'
              }`}
              onChange={(e) => {
                handleBulkStatusChange(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              disabled={bulkActionLoading}
            >
              <option value="" disabled>Change Status...</option>
              <option value="DRAFT">Mark as Draft</option>
              <option value="VALIDATED">Mark as Validated</option>
              <option value="ISSUED">Mark as Issued</option>
              <option value="COMPLETED">Mark as Completed</option>
              <option value="CANCELLED">Mark as Cancelled</option>
            </select>

            {/* Export Selected JSON */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkExport}
              className="rounded text-xs flex items-center gap-1"
              disabled={bulkActionLoading}
            >
              <Download size={13} /> Export ({selectedIds.length})
            </Button>

            {/* Delete Selected */}
            <Button
              variant="danger"
              size="sm"
              disabled={bulkActionLoading || isExpired}
              onClick={() => !isExpired && setBulkDeleteTarget(true)}
              className={`rounded text-xs flex items-center gap-1 ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isExpired ? 'Deletion locked in read-only mode' : 'Delete selected documents'}
            >
              <Trash2 size={13} /> Delete ({selectedIds.length})
            </Button>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-slate-200 ml-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={`border rounded-md overflow-hidden shadow-sm ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/60 border-slate-800/80 shadow-xl'
        }`}
      >
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-9 rounded animate-pulse ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800/50'}`} />
            ))}
          </div>
        ) : visibleDocuments.length === 0 ? (
          <div className={`p-10 text-center text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            No documents found matching your search or permissions
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-medium text-[11px] uppercase tracking-wider ${
                  theme === 'light' ? 'border-slate-200 bg-slate-50/80 text-slate-600' : 'border-slate-800 bg-slate-950/70 text-slate-400'
                }`}
              >
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className={`rounded cursor-pointer w-4 h-4 transition-all accent-indigo-600 focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 ${
                      theme === 'light'
                        ? 'border border-slate-300 bg-white text-indigo-600 focus:ring-offset-white'
                        : 'border border-slate-600 bg-slate-900 text-indigo-500 focus:ring-offset-slate-900'
                    }`}
                    aria-label="Select all documents on this page"
                  />
                </th>
                <th className="py-2.5 px-3">Document #</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
              {visibleDocuments.map((doc) => {
                const isSelected = selectedIds.includes(doc.id);
                return (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-indigo-50/90 border-l-2 border-l-indigo-600'
                          : 'bg-indigo-950/40 border-l-2 border-l-indigo-500'
                        : theme === 'light'
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(doc.id)}
                        className={`rounded cursor-pointer w-4 h-4 transition-all accent-indigo-600 focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 ${
                          theme === 'light'
                            ? 'border border-slate-300 bg-white text-indigo-600 focus:ring-offset-white'
                            : 'border border-slate-600 bg-slate-900 text-indigo-500 focus:ring-offset-slate-900'
                        }`}
                        aria-label={`Select document ${doc.documentNumber || doc.title}`}
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium">
                      <Link
                        to={`/documents/${doc.id}`}
                        className={theme === 'light' ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}
                      >
                        {doc.documentNumber || '—'}
                      </Link>
                    </td>
                    <td className={`py-2.5 px-3 font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                      {doc.documentType}
                    </td>
                    <td className={`py-2.5 px-3 max-w-xs truncate ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      {doc.title || '—'}
                    </td>
                    <td className={`py-2.5 px-3 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {doc.category?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge status={doc.status} size="sm" className="rounded text-[10px]" />
                    </td>
                    <td className={`py-2.5 px-3 text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          className={`p-1 rounded transition-colors ${
                            theme === 'light' ? 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                          }`}
                          title="Preview PDF"
                          onClick={() => previewDocumentPDF(doc.id)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className={`p-1 rounded transition-colors ${
                            theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Download PDF"
                          onClick={() => downloadDocumentPDF(doc.id, `${doc.documentNumber || 'document'}.pdf`)}
                        >
                          <Download size={14} />
                        </button>
                        <Link
                          to={`/documents/${doc.id}`}
                          className={`p-1 rounded transition-colors ${
                            theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="View / Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          disabled={isExpired}
                          className={`p-1 rounded transition-colors ${
                            isExpired
                              ? 'opacity-40 cursor-not-allowed text-slate-500'
                              : theme === 'light'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isExpired) setDeleteTargetDoc(doc);
                          }}
                          title={isExpired ? 'Deletion locked in read-only mode' : 'Delete Document'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Page Size */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={`px-2 py-1 rounded border outline-none cursor-pointer ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className={`text-[11px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
            Total: {pagination.total || visibleDocuments.length}
          </span>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              className={`flex items-center gap-1 px-2.5 py-1 border rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <span className={`font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className={`flex items-center gap-1 px-2.5 py-1 border rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                theme === 'light'
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Single or Bulk) */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetDoc) || bulkDeleteTarget}
        onClose={() => {
          setDeleteTargetDoc(null);
          setBulkDeleteTarget(false);
        }}
        onConfirm={bulkDeleteTarget ? handleConfirmBulkDelete : handleConfirmDelete}
        title={bulkDeleteTarget ? `Delete ${selectedIds.length} Documents` : "Delete Document"}
        message={
          bulkDeleteTarget
            ? `Are you sure you want to permanently delete all ${selectedIds.length} selected documents? This action cannot be undone.`
            : `Are you sure you want to permanently delete document "${deleteTargetDoc?.documentNumber || deleteTargetDoc?.title || 'Document'}"? This action cannot be undone.`
        }
        confirmText={bulkDeleteTarget ? `Delete ${selectedIds.length} Documents` : "Delete Document"}
        variant="danger"
        isLoading={isDeleting || bulkActionLoading}
      />

      {/* Data Migration Modal */}
      <ImportExportModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onComplete={() => fetchDocuments({ search, category, status, page: pagination.page, limit: pageSize })}
      />
    </div>
  );
}
