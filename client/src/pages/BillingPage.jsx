import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  Eye,
  Download,
  CreditCard,
  Trash2,
  Plus,
  RotateCw,
  Search,
  X,
  FileText,
  Pencil,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Truck,
  Package,
  Bookmark,
  SlidersHorizontal,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { printDocumentPDF, downloadDocumentPDF, deleteDocument } from '../services/documentService';
import InvoiceDetailModal from '../components/documents/InvoiceDetailModal';
import BillingTemplateManagerModal from '../components/documents/BillingTemplateManagerModal';
import PdfPreviewModal from '../components/ui/PdfPreviewModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BillingPage() {
  const navigate = useNavigate();
  const { documents, fetchDocuments, isLoading, updateDocument } = useDocumentStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter input states (staged until Applied)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [buyerFilter, setBuyerFilter] = useState('ALL');
  const [shipperFilter, setShipperFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active / Applied filter states
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    statusFilter: 'ALL',
    buyerFilter: 'ALL',
    shipperFilter: 'ALL',
    productFilter: 'ALL',
    startDate: '',
    endDate: '',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showGstr1Summary, setShowGstr1Summary] = useState(false);

  // Active advanced filters count (excluding search & status)
  const activeAdvancedCount = [
    appliedFilters.buyerFilter !== 'ALL',
    appliedFilters.shipperFilter !== 'ALL',
    appliedFilters.productFilter !== 'ALL',
    appliedFilters.startDate !== '',
    appliedFilters.endDate !== '',
  ].filter(Boolean).length;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setAppliedFilters((prev) => ({ ...prev, search: val }));
    setCurrentPage(1);
  };

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('Tax Invoice Preview');
  const [printingId, setPrintingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  const handleSavePaymentInfo = async (docId, paymentInfo) => {
    const target = invoices.find((i) => i.id === docId);
    if (!target) return;
    const currentData = target.data || {};
    const updatedData = {
      ...currentData,
      transactionId: paymentInfo.transactionId,
      paymentMode: paymentInfo.paymentMode,
      paidDate: paymentInfo.paymentDate,
      remarks: paymentInfo.remarks,
      paymentInfo,
    };
    await updateDocument(docId, {
      data: updatedData,
      status: 'COMPLETED',
      statusNote: `Payment recorded via ${paymentInfo.paymentMode} (Txn Ref: ${paymentInfo.transactionId || 'N/A'})`,
    });
    setSuccessMessage(`Payment recorded successfully for Invoice #${target.documentNumber || currentData.invoiceNumber || ''}! Status updated to Paid / Completed.`);
    fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  };

  const handleUpdateStatus = async (docId, status, note) => {
    await updateDocument(docId, {
      status,
      statusNote: note || `Status updated to ${status}`,
    });
    setSuccessMessage(`Invoice status updated to ${status}!`);
    fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  };

  // Filter invoices for TAX_INVOICE (Sales only)
  const invoices = documents.filter((d) => d.documentType === 'TAX_INVOICE' && d.data?.invoiceKind !== 'PURCHASE');

  // Extract distinct filter option lists from existing invoices
  const distinctBuyers = Array.from(
    new Set(
      invoices
        .map((d) => (d.data?.buyerName || '').trim())
        .filter(Boolean)
    )
  ).sort();

  const distinctShippers = Array.from(
    new Set(
      invoices
        .map((d) => (d.data?.consigneeName || d.data?.shipperName || '').trim())
        .filter(Boolean)
    )
  ).sort();

  const distinctProducts = Array.from(
    new Set(
      invoices
        .flatMap((d) => (d.data?.items || []).map((it) => (it.description || '').trim()))
        .filter(Boolean)
    )
  ).sort();

  const isAnyFilterActive =
    appliedFilters.search !== '' ||
    appliedFilters.statusFilter !== 'ALL' ||
    appliedFilters.buyerFilter !== 'ALL' ||
    appliedFilters.shipperFilter !== 'ALL' ||
    appliedFilters.productFilter !== 'ALL' ||
    appliedFilters.startDate !== '' ||
    appliedFilters.endDate !== '';

  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      statusFilter,
      buyerFilter,
      shipperFilter,
      productFilter,
      startDate,
      endDate,
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetState = {
      search: '',
      statusFilter: 'ALL',
      buyerFilter: 'ALL',
      shipperFilter: 'ALL',
      productFilter: 'ALL',
      startDate: '',
      endDate: '',
    };
    setSearch('');
    setStatusFilter('ALL');
    setBuyerFilter('ALL');
    setShipperFilter('ALL');
    setProductFilter('ALL');
    setStartDate('');
    setEndDate('');
    setAppliedFilters(resetState);
    setCurrentPage(1);
  };

  const handleQuickStatusChange = (st) => {
    setStatusFilter(st);
    setAppliedFilters((prev) => ({ ...prev, statusFilter: st }));
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const filteredInvoices = invoices.filter((doc) => {
    const data = doc.data || {};
    const items = data.items || [];

    // 1. Status Filter
    const matchesStatus = appliedFilters.statusFilter === 'ALL' || doc.status === appliedFilters.statusFilter;
    if (!matchesStatus) return false;

    // 2. Buyer Filter
    const buyerName = (data.buyerName || '').trim().toLowerCase();
    const matchesBuyer = appliedFilters.buyerFilter === 'ALL' || buyerName === appliedFilters.buyerFilter.toLowerCase();
    if (!matchesBuyer) return false;

    // 3. Shipper / Consignee Filter
    const shipperName = (data.consigneeName || data.shipperName || '').trim().toLowerCase();
    const matchesShipper = appliedFilters.shipperFilter === 'ALL' || shipperName === appliedFilters.shipperFilter.toLowerCase();
    if (!matchesShipper) return false;

    // 4. Product / Line Item Filter
    const matchesProduct =
      appliedFilters.productFilter === 'ALL' ||
      items.some(
        (it) =>
          (it.description || '').toLowerCase().includes(appliedFilters.productFilter.toLowerCase()) ||
          (it.subText || '').toLowerCase().includes(appliedFilters.productFilter.toLowerCase()) ||
          (it.hsnCode || '').toLowerCase().includes(appliedFilters.productFilter.toLowerCase())
      );
    if (!matchesProduct) return false;

    // 5. Date Range Filter
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const docDate = new Date(doc.createdAt);
      if (appliedFilters.startDate) {
        const start = new Date(appliedFilters.startDate);
        start.setHours(0, 0, 0, 0);
        if (docDate < start) return false;
      }
      if (appliedFilters.endDate) {
        const end = new Date(appliedFilters.endDate);
        end.setHours(23, 59, 59, 999);
        if (docDate > end) return false;
      }
    }

    // 6. Free Search Query
    const q = appliedFilters.search.toLowerCase().trim();
    if (!q) return true;

    const matchesSearch =
      (doc.documentNumber || '').toLowerCase().includes(q) ||
      (data.invoiceNumber || '').toLowerCase().includes(q) ||
      (data.buyerName || '').toLowerCase().includes(q) ||
      (data.buyerGstin || '').toLowerCase().includes(q) ||
      (data.consigneeName || '').toLowerCase().includes(q) ||
      (data.consigneeAddress || '').toLowerCase().includes(q) ||
      (data.airwayBillNo || '').toLowerCase().includes(q) ||
      (data.poNumberAndDate || '').toLowerCase().includes(q) ||
      (data.referenceName || '').toLowerCase().includes(q) ||
      items.some(
        (it) =>
          (it.description || '').toLowerCase().includes(q) ||
          (it.subText || '').toLowerCase().includes(q) ||
          (it.hsnCode || '').toLowerCase().includes(q)
      );

    return matchesSearch;
  });

  // Calculate Financial Aggregations & GSTR-1 Metrics
  const totalCount = invoices.length;
  const draftCount = invoices.filter((i) => i.status === 'DRAFT').length;
  const pendingPaymentCount = invoices.filter((i) => i.status === 'ISSUED' || i.status === 'IN_TRANSIT').length;
  const paidCount = invoices.filter((i) => i.status === 'COMPLETED').length;

  const totalBilledAmount = invoices.reduce((sum, d) => sum + (parseFloat(d.data?.grandTotal) || 0), 0);

  // GSTR-1 Breakdown across filtered invoices
  let totalBilledTaxable = 0;
  let totalBilledCGST = 0;
  let totalBilledSGST = 0;
  let totalBilledIGST = 0;
  let b2bTaxable = 0;
  let b2bTotal = 0;
  let b2bCount = 0;
  let b2cTaxable = 0;
  let b2cTotal = 0;
  let b2cCount = 0;

  filteredInvoices.forEach((doc) => {
    const d = doc.data || {};
    const taxable = parseFloat(d.totalTaxable) || 0;
    const cgst = parseFloat(d.totalCGST) || 0;
    const sgst = parseFloat(d.totalSGST) || 0;
    const igst = parseFloat(d.totalIGST) || 0;
    const grand = parseFloat(d.grandTotal) || (taxable + cgst + sgst + igst);

    totalBilledTaxable += taxable;
    totalBilledCGST += cgst;
    totalBilledSGST += sgst;
    totalBilledIGST += igst;

    if (d.buyerGstin && d.buyerGstin.trim().length >= 10) {
      b2bCount++;
      b2bTaxable += taxable;
      b2bTotal += grand;
    } else {
      b2cCount++;
      b2cTaxable += taxable;
      b2cTotal += grand;
    }
  });

  const exportGstr1Csv = () => {
    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Buyer Name',
      'Buyer GSTIN',
      'Place of Supply',
      'Reverse Charge',
      'Taxable Value (INR)',
      'CGST (INR)',
      'SGST (INR)',
      'IGST (INR)',
      'Grand Total (INR)',
      'Status',
      'Payment Mode',
      'Txn Reference',
    ];

    const rows = filteredInvoices.map((doc) => {
      const d = doc.data || {};
      return [
        `"${doc.documentNumber || d.invoiceNumber || ''}"`,
        `"${d.invoiceDate || new Date(doc.createdAt).toLocaleDateString('en-GB')}"`,
        `"${(d.buyerName || '').replace(/"/g, '""')}"`,
        `"${d.buyerGstin || ''}"`,
        `"${d.placeOfSupply || 'Maharashtra (27)'}"`,
        `"${d.reverseCharge || 'N'}"`,
        (parseFloat(d.totalTaxable) || 0).toFixed(2),
        (parseFloat(d.totalCGST) || 0).toFixed(2),
        (parseFloat(d.totalSGST) || 0).toFixed(2),
        (parseFloat(d.totalIGST) || 0).toFixed(2),
        (parseFloat(d.grandTotal) || 0).toFixed(2),
        `"${doc.status}"`,
        `"${d.paymentMode || ''}"`,
        `"${d.transactionId || ''}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GSTR1_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination slicing
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + pageSize);

  const handlePrint = async (docId) => {
    setPrintingId(docId);
    try {
      await printDocumentPDF(docId);
    } catch (err) {
      alert('Error initiating print: ' + err.message);
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

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Sales Invoices & Billing Register
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track revenue from clients, filter by buyer/shipper/product, and 1-click print or download GST Tax Invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={exportGstr1Csv}
            className="rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Download CSV for monthly GSTR-1 filing"
          >
            <FileSpreadsheet size={14} className="mr-1.5 inline text-emerald-400" /> Export GSTR-1 CSV
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/billing/templates')}
            className="rounded text-xs"
          >
            <Bookmark size={14} className="mr-1.5 inline" /> Templates & Directory
          </Button>

          <Button
            variant="primary"
            onClick={handleCreateNew}
            className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            <Plus size={14} className="mr-1.5 inline" /> Create New Bill
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-md text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <FileText size={13} className="text-indigo-400" /> Total Billed Revenue
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono">₹{formatINR(totalBilledAmount)}</div>
          <div className="text-[10px] text-slate-500">{totalCount} total invoices</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md shadow-sm space-y-1">
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
            <Clock size={13} className="text-amber-400" /> Pending Payment
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{pendingPaymentCount}</div>
          <div className="text-[10px] text-slate-500">Invoices issued to clients</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md shadow-sm space-y-1">
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" /> Paid / Completed
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{paidCount}</div>
          <div className="text-[10px] text-slate-500">Payment received</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md shadow-sm space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <AlertCircle size={13} className="text-slate-400" /> Draft Bills
          </div>
          <div className="text-xl font-bold text-slate-300 font-mono">{draftCount}</div>
          <div className="text-[10px] text-slate-500">Unsent drafts</div>
        </div>
      </div>

      {/* GSTR-1 Sales Summary Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-md shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              GSTR-1 Outward Sales Breakdown ({filteredInvoices.length} Active)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowGstr1Summary(!showGstr1Summary)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {showGstr1Summary ? 'Hide Details ▲' : 'Show Tax Split ▼'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Total Taxable Value</span>
            <span className="text-sm font-bold text-slate-100 font-mono">₹{formatINR(totalBilledTaxable)}</span>
          </div>
          <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Total CGST + SGST</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">₹{formatINR(totalBilledCGST + totalBilledSGST)}</span>
          </div>
          <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">Total IGST</span>
            <span className="text-sm font-bold text-indigo-400 font-mono">₹{formatINR(totalBilledIGST)}</span>
          </div>
          <div className="p-2.5 bg-slate-950/70 rounded border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium block">B2B vs B2C Split</span>
            <span className="text-xs font-semibold text-slate-300 font-mono">
              B2B: {b2bCount} (₹{formatINR(b2bTotal)}) | B2C: {b2cCount}
            </span>
          </div>
        </div>

        {showGstr1Summary && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fade-in">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-indigo-300">B2B Registered Sales (With GSTIN)</div>
              <div className="flex justify-between text-slate-400">
                <span>Invoices: {b2bCount}</span>
                <span className="font-mono text-slate-200">Taxable: ₹{formatINR(b2bTaxable)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Invoice Value:</span>
                <span className="font-mono font-bold text-emerald-400">₹{formatINR(b2bTotal)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">B2C Unregistered Sales (Retail / Walk-in)</div>
              <div className="flex justify-between text-slate-400">
                <span>Invoices: {b2cCount}</span>
                <span className="font-mono text-slate-200">Taxable: ₹{formatINR(b2cTaxable)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Invoice Value:</span>
                <span className="font-mono font-bold text-emerald-400">₹{formatINR(b2cTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Long Search Bar & Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-md p-3.5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Long Search Bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Invoice #, Buyer, Shipper, Product / Item, AWB..."
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setAppliedFilters((prev) => ({ ...prev, search: '' }));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Toggle & Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border transition-colors ${
                showAdvancedFilters || activeAdvancedCount > 0
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
              {activeAdvancedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-indigo-700 rounded-full text-[10px] font-bold">
                  {activeAdvancedCount}
                </span>
              )}
              <span className="text-[10px]">{showAdvancedFilters ? '▲' : '▼'}</span>
            </button>

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 rounded text-xs font-medium transition-colors"
                title="Reset All Filters"
              >
                <RotateCw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Status Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'ALL', label: 'All Invoices' },
            { id: 'DRAFT', label: 'Drafts' },
            { id: 'ISSUED', label: 'Pending Payment' },
            { id: 'COMPLETED', label: 'Paid / Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((st) => (
            <button
              key={st.id}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              onClick={() => handleQuickStatusChange(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in">
            <div className="text-[11px] font-semibold text-slate-400">Advanced Filter Criteria:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Buyer Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Billed To (Buyer)
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={buyerFilter}
                  onChange={(e) => setBuyerFilter(e.target.value)}
                >
                  <option value="ALL">All Buyers ({distinctBuyers.length})</option>
                  {distinctBuyers.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipper / Consignee Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Shipper / Destination
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={shipperFilter}
                  onChange={(e) => setShipperFilter(e.target.value)}
                >
                  <option value="ALL">All Shippers / Destinations ({distinctShippers.length})</option>
                  {distinctShippers.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product / Line Item Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Product / Item
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                >
                  <option value="ALL">All Products / Items ({distinctProducts.length})</option>
                  {distinctProducts.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Filter by Date Range
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="From"
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                    title="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="To"
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                    title="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Apply / Reset Actions inside Drawer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetFilters}
                className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded"
              >
                <RotateCw size={12} className="mr-1 inline" /> Reset Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyFilters}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm px-4 py-1.5 rounded"
              >
                <Search size={12} className="mr-1 inline" /> Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Summary Pills */}
        {isAnyFilterActive && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium text-[11px]">Active Filters:</span>
              {appliedFilters.statusFilter !== 'ALL' && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Status: {appliedFilters.statusFilter}
                </span>
              )}
              {appliedFilters.buyerFilter !== 'ALL' && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Buyer: {appliedFilters.buyerFilter}
                </span>
              )}
              {appliedFilters.shipperFilter !== 'ALL' && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Shipper: {appliedFilters.shipperFilter}
                </span>
              )}
              {appliedFilters.productFilter !== 'ALL' && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Product: {appliedFilters.productFilter}
                </span>
              )}
              {appliedFilters.search && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Search: "{appliedFilters.search}"
                </span>
              )}
              {(appliedFilters.startDate || appliedFilters.endDate) && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Date: {appliedFilters.startDate || '...'} to {appliedFilters.endDate || '...'}
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{filteredInvoices.length}</span> of {invoices.length} invoices
            </div>
          </div>
        )}
      </div>

      {/* Latest Invoices List Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            <span>Latest Created Bills & Drafts ({filteredInvoices.length})</span>
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              onClick={() => fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })}
            >
              <RotateCw size={13} /> Refresh
            </button>
            <button
              type="button"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              onClick={handleCreateNew}
            >
              <Plus size={14} /> New Bill
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading latest bills...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText size={36} className="text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No Tax Invoices found</p>
            <p className="text-xs text-slate-500">
              {search ? 'Try adjusting your search query' : 'Click "+ Create New Bill" to fill and print your first invoice.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNew}
              className="rounded"
            >
              <Plus size={14} className="mr-1 inline" /> Create First Bill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 min-w-[150px]">Billed To (Buyer)</th>
                  <th className="py-3 px-4 min-w-[150px]">Shipper / Destination</th>
                  <th className="py-3 px-4 min-w-[170px]">Products / Items</th>
                  <th className="py-3 px-4">AWB / Ref</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedInvoices.map((doc) => {
                  const data = doc.data || {};
                  const items = data.items || [];
                  const grandTotal = data.grandTotal || 0;
                  const invoiceNum = doc.documentNumber || data.invoiceNumber || 'Draft';
                  const invoiceDate = data.invoiceDate || new Date(doc.createdAt).toLocaleDateString('en-GB');

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-100 font-mono">
                        <button
                          type="button"
                          className="hover:text-indigo-400 transition-colors text-left font-mono underline decoration-dotted underline-offset-4"
                          onClick={() => setSelectedInvoice(doc)}
                          title="Click to view details, payment proof, activity logs & edit"
                        >
                          {invoiceNum}
                        </button>
                        {data.paymentInfo?.transactionId && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-normal text-emerald-400 font-mono">
                            <CreditCard size={11} /> {data.paymentInfo.paymentMode}: {data.paymentInfo.transactionId}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {invoiceDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{data.buyerName || 'Unspecified'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{data.buyerState || ''}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">{data.consigneeName || data.shipperName || '-'}</div>
                        {data.consigneeState && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{data.consigneeState}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {items.length > 0 ? (
                          <div className="space-y-0.5 max-w-xs">
                            <div className="text-slate-200 font-medium truncate" title={items.map((i) => i.description).join(', ')}>
                              {items[0].description || 'Item'}
                              {items.length > 1 && (
                                <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-800 text-indigo-300 rounded font-semibold">
                                  +{items.length - 1} more
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Qty: {items.reduce((sum, it) => sum + (parseFloat(it.qty || it.quantity) || 0), 0)} {items[0]?.unit || 'Pcs'}
                              {items[0]?.hsnCode && ` | HSN: ${items[0].hsnCode}`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
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
                            <Printer size={13} />
                            <span>{printingId === doc.id ? 'Printing...' : 'Print Bill'}</span>
                          </button>

                          {/* Direct Document Preview (PDF) */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => {
                              setPreviewDocTitle(`Invoice #${invoiceNum}`);
                              setPreviewDocId(doc.id);
                            }}
                            title="Direct Document Preview (PDF)"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Payment / Activity Details Modal */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => setSelectedInvoice(doc)}
                            title={data.paymentInfo?.transactionId ? `Payment Recorded (${data.paymentInfo.transactionId})` : "Record Client Payment Details"}
                          >
                            <CreditCard size={15} />
                          </button>

                          {/* Edit Bill Form */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            title="Edit Bill Form"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleDelete(doc.id)}
                            title="Delete Invoice"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredInvoices.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* Comprehensive Invoice Details, Payment & Activity Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          doc={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdatePayment={handleSavePaymentInfo}
          onUpdateStatus={handleUpdateStatus}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onPreview={(id) => {
            const num = selectedInvoice.documentNumber || selectedInvoice.data?.invoiceNumber || 'Invoice';
            setPreviewDocTitle(`Invoice #${num}`);
            setPreviewDocId(id);
          }}
        />
      )}

      {/* PDF Preview Modal */}
      {previewDocId && (
        <PdfPreviewModal
          isOpen={!!previewDocId}
          documentId={previewDocId}
          title={previewDocTitle}
          onClose={() => setPreviewDocId(null)}
        />
      )}

      {/* Templates & Customer Directory Modal */}
      {templateManagerOpen && (
        <BillingTemplateManagerModal
          isOpen={templateManagerOpen}
          onClose={() => setTemplateManagerOpen(false)}
          onSelectTemplate={() => {
            setTemplateManagerOpen(false);
          }}
        />
      )}
    </div>
  );
}
