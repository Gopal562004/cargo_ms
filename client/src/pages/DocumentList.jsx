import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { downloadDocumentPDF } from '../services/documentService';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import './DocumentList.css';

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
    <div className="document-list">
      <div className="document-list__header">
        <div>
          <h1 className="document-list__title">Documents</h1>
          <p className="document-list__count">{pagination.total} total documents</p>
        </div>
        <Link to="/new">
          <Button variant="primary" icon="➕">New Document</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="document-list__filters">
        <div className="filter-search">
          <span className="filter-search__icon">🔍</span>
          <input
            type="text"
            className="filter-search__input"
            placeholder="Search by document number or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="document-table">
        {isLoading ? (
          <div className="document-table__loading">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton-row" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="document-table__empty">
            <p>No documents found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Document #</th>
                <th>Type</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <Link to={`/documents/${doc.id}`} className="doc-link">
                      {doc.documentNumber || '—'}
                    </Link>
                  </td>
                  <td><span className="doc-type-label">{doc.documentType}</span></td>
                  <td className="truncate" style={{ maxWidth: '200px' }}>{doc.title || '—'}</td>
                  <td><span className="doc-category-label">{doc.category?.replace(/_/g, ' ')}</span></td>
                  <td><Badge status={doc.status} size="sm" /></td>
                  <td className="doc-date">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="doc-actions">
                      <Link to={`/documents/${doc.id}`} className="doc-actions__btn" title="View / Edit">✏️</Link>
                      <button
                        className="doc-actions__btn"
                        title="Download PDF"
                        onClick={() => downloadDocumentPDF(doc.id, `${doc.documentNumber || 'document'}.pdf`)}
                      >
                        📥
                      </button>
                      <button className="doc-actions__btn doc-actions__btn--danger" onClick={(e) => handleDelete(doc.id, e)} title="Delete">🗑️</button>
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
        <div className="document-pagination">
          <button
            className="pagination-btn"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="pagination-btn"
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
