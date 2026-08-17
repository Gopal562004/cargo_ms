import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { printDocumentPDF, downloadDocumentPDF, deleteDocument } from '../services/documentService';
import TaxInvoiceEditor from '../components/documents/TaxInvoiceEditor';
import BillingTemplateManagerModal from '../components/documents/BillingTemplateManagerModal';
import PdfPreviewModal from '../components/ui/PdfPreviewModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BillingPage() {
  const navigate = useNavigate();
  const { documents, fetchDocuments, isLoading } = useDocumentStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [printingId, setPrintingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  
  // State for opening the bill creation / editing form
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  // Filter invoices for TAX_INVOICE
  const invoices = documents.filter((d) => d.documentType === 'TAX_INVOICE');

  const filteredInvoices = invoices.filter((doc) => {
    const data = doc.data || {};
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const q = search.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      (doc.documentNumber || '').toLowerCase().includes(q) ||
      (doc.title || '').toLowerCase().includes(q) ||
      (data.buyerName || '').toLowerCase().includes(q) ||
      (data.invoiceNumber || '').toLowerCase().includes(q) ||
      (data.airwayBillNo || '').toLowerCase().includes(q) ||
      (data.referenceName || '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const totalCount = invoices.length;
  const draftCount = invoices.filter((d) => d.status === 'DRAFT').length;
  const issuedCount = invoices.filter((d) => ['ISSUED', 'COMPLETED', 'DELIVERED'].includes(d.status)).length;
  const totalBilledAmount = invoices.reduce((acc, doc) => {
    const grandTotal = doc.data?.grandTotal || 0;
    return acc + (parseFloat(grandTotal) || 0);
  }, 0);

  const handlePrint = async (docId) => {
    setPrintingId(docId);
    try {
      await printDocumentPDF(docId);
    } catch (err) {
      alert('Error printing bill: ' + err.message);
    } finally {
      setPrintingId(null);
    }
  };

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      const filename = `${doc.documentNumber || doc.data?.invoiceNumber || 'Tax_Invoice'}.pdf`;
      await downloadDocumentPDF(doc.id, filename);
    } catch (err) {
      alert('Error downloading PDF: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this Tax Invoice?')) {
      try {
        await deleteDocument(docId);
        fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
      } catch (err) {
        alert('Failed to delete invoice: ' + err.message);
      }
    }
  };

  const handleCreateNew = () => {
    navigate('/documents/new/TAX_INVOICE');
  };

  const handleEditDoc = (doc) => {
    navigate(`/documents/${doc.id}/edit`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧾</span>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Tax Invoices & Billing Register
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track revenue, manage drafts, search invoices, and 1-click print or download GST Tax Invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon="📑"
            onClick={() => navigate('/billing/templates')}
          >
            Templates & Directory
          </Button>

          <Button
            variant="primary"
            icon="➕"
            onClick={handleCreateNew}
          >
            Create New Bill
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-base">✅</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            className="text-emerald-400 hover:text-white font-bold text-sm"
            onClick={() => setSuccessMessage('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl shadow-lg space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Invoices</div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{totalCount}</div>
          <div className="text-[11px] text-slate-500">Tracked in database</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl shadow-lg space-y-1">
          <div className="text-xs text-emerald-400 font-medium">Total Billed Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">₹{formatINR(totalBilledAmount)}</div>
          <div className="text-[11px] text-slate-500">Across all invoices</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl shadow-lg space-y-1">
          <div className="text-xs text-amber-400 font-medium">Draft Bills</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{draftCount}</div>
          <div className="text-[11px] text-slate-500">Pending finalization</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl shadow-lg space-y-1">
          <div className="text-xs text-indigo-400 font-medium">Issued / Completed</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{issuedCount}</div>
          <div className="text-[11px] text-slate-500">Ready for dispatch & accounting</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by Invoice #, Buyer, AWB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {['ALL', 'DRAFT', 'ISSUED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? 'All Invoices' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Invoices List Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>📋</span> Latest Created Bills & Drafts ({filteredInvoices.length})
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              onClick={() => fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })}
            >
              <span>🔄</span> Refresh
            </button>
            {!showForm && (
              <button
                type="button"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                onClick={handleCreateNew}
              >
                <span>➕</span> New Bill
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading latest bills...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="text-3xl">🧾</span>
            <p className="text-sm font-medium text-slate-300">No Tax Invoices found</p>
            <p className="text-xs text-slate-500">
              {search ? 'Try adjusting your search query' : 'Click "+ Create New Bill" to fill and print your first invoice.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNew}
            >
              ➕ Create First Bill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 min-w-[180px]">Billed To (Buyer)</th>
                  <th className="py-3 px-4">AWB / Ref</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right min-w-[220px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredInvoices.map((doc) => {
                  const data = doc.data || {};
                  const grandTotal = data.grandTotal || 0;
                  const invoiceNum = doc.documentNumber || data.invoiceNumber || 'Draft';
                  const invoiceDate = data.invoiceDate || new Date(doc.createdAt).toLocaleDateString('en-GB');

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-100 font-mono">
                        <button
                          type="button"
                          className="hover:text-indigo-400 transition-colors text-left font-mono"
                          onClick={() => handleEditDoc(doc)}
                        >
                          {invoiceNum}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {invoiceDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{data.buyerName || 'Unspecified'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{data.buyerState || ''}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {data.airwayBillNo || data.poNumberAndDate || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        ₹{formatINR(grandTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={doc.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Direct Print */}
                          <button
                            type="button"
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition-all flex items-center gap-1"
                            onClick={() => handlePrint(doc.id)}
                            disabled={printingId === doc.id}
                            title="Print this invoice immediately"
                          >
                            <span>🖨️</span>
                            <span>{printingId === doc.id ? 'Printing...' : 'Print Bill'}</span>
                          </button>

                          {/* Preview Modal */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview PDF"
                          >
                            👁️
                          </button>

                          {/* Download PDF */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingId === doc.id}
                            title="Download PDF"
                          >
                            📥
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleEditDoc(doc)}
                            title="Edit Invoice"
                          >
                            ✏️
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleDelete(doc.id)}
                            title="Delete Invoice"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewDoc && (
        <PdfPreviewModal
          isOpen={!!previewDoc}
          documentId={previewDoc.id}
          title={previewDoc.title || previewDoc.documentNumber || 'Tax Invoice'}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Templates & Customer Directory Modal */}
      {templateManagerOpen && (
        <BillingTemplateManagerModal
          isOpen={templateManagerOpen}
          onClose={() => setTemplateManagerOpen(false)}
          onSelectTemplate={(tpl) => {
            setEditingDoc({
              data: {
                ...tpl.companyDetails,
                ...tpl.buyer,
                ...tpl.consignee,
                items: tpl.items,
                companyLogo: tpl.companyLogo,
                invoiceNumber: tpl.invoiceNumber || 'DGR/0466/26-27',
                invoiceDate: tpl.invoiceDate || '27-06-2026',
              },
            });
            setShowForm(true);
            setTemplateManagerOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
