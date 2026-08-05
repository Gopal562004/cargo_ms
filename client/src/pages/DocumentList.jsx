import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { downloadDocumentPDF, previewDocumentPDF } from '../services/documentService';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'AIR_FREIGHT', label: 'Air Freight' },
  { value: 'EDI', label: 'eAWB / Cargo-IMP' },
  { value: 'SEA_FREIGHT', label: 'Sea Freight' },
  { value: 'OTHER', label: 'Other' },
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
  const { documents, pagination, fetchDocuments, isLoading, deleteDocument } = useDocumentStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState('');

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Documents</h1>
          <p className="text-xs text-slate-400 mt-1">{pagination.total} total documents</p>
        </div>
        <Link to="/new">
          <Button variant="primary" icon="➕">New Document</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-slate-400 text-xs pointer-events-none">🔍</span>
          <input
            type="text"
            className="w-full pl-8 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search by document number or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
          ))}
        </select>
        <select 
          className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-slate-800/50 rounded-lg animate-pulse" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No documents found
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
              {documents.map((doc) => (
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
                        title="Preview PDF in New Tab"
                        onClick={() => previewDocumentPDF(doc.id)}
                      >
                        👁️
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Download PDF"
                        onClick={() => downloadDocumentPDF(doc.id, `${doc.documentNumber || 'document'}.pdf`)}
                      >
                        📥
                      </button>
                      <Link to={`/documents/${doc.id}`} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors" title="View / Edit">✏️</Link>
                      <button className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors" onClick={(e) => handleDelete(doc.id, e)} title="Delete">🗑️</button>
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
            className="px-3 py-1.5 border border-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="px-3 py-1.5 border border-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
