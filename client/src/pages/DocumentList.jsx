import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { downloadDocumentPDF, previewDocumentPDF } from '../services/documentService';
import { hasServiceAccess, isDocumentTypeAllowed } from '../utils/permissions';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

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
  const { documents, pagination, fetchDocuments, isLoading, deleteDocument } = useDocumentStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState('');

  // Filter category options based on user's permitted services
  const categoryOptions = ALL_CATEGORY_OPTIONS.filter((opt) =>
    hasServiceAccess(user, opt.serviceKey)
  );

  useEffect(() => {
    const params = { search, page: 1 };
    if (category) params.category = category;
    if (status) params.status = status;
    fetchDocuments(params);
  }, [search, category, status]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const handlePageChange = (page) => {
    fetchDocuments({ search, category, status, page });
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this document?')) {
      await deleteDocument(id);
    }
  };

  // Filter document rows to only allowed types for non-admin users
  const visibleDocuments = documents.filter((doc) => isDocumentTypeAllowed(user, doc.documentType));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Documents</h1>
          <p className="text-xs text-slate-400 mt-1">{visibleDocuments.length} accessible documents</p>
        </div>
        <Link to="/new">
          <Button variant="primary" className="rounded text-xs">
            <Plus size={14} className="mr-1.5 inline" /> New Document
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-8 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search by document number or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
          ))}
        </select>
        <select 
          className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-slate-800/50 rounded animate-pulse" />)}
          </div>
        ) : visibleDocuments.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No documents found matching your access permissions
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-medium">
                <th className="py-3.5 px-4">Document #</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {visibleDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium">
                    <Link to={`/documents/${doc.id}`} className="text-indigo-400 hover:text-indigo-300">
                      {doc.documentNumber || '—'}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{doc.documentType}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{doc.title || '—'}</td>
                  <td className="py-3 px-4 text-slate-400">{doc.category?.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4"><Badge status={doc.status} size="sm" /></td>
                  <td className="py-3 px-4 text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                        title="Preview PDF"
                        onClick={() => previewDocumentPDF(doc.id)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Download PDF"
                        onClick={() => downloadDocumentPDF(doc.id, `${doc.documentNumber || 'document'}.pdf`)}
                      >
                        <Download size={15} />
                      </button>
                      <Link
                        to={`/documents/${doc.id}`}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="View / Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                        onClick={(e) => handleDelete(doc.id, e)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-800 rounded text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-800 rounded text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
