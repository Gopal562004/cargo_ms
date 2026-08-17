import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  RotateCw,
  Search,
  SlidersHorizontal,
  X,
  CreditCard,
  Pencil,
  Trash2,
  Paperclip,
  CheckCircle2,
  Clock,
  Building,
  Save,
  FileText,
  Calendar,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { deleteDocument, parseInvoiceDocument } from '../services/documentService';
import Button from '../components/ui/Button';

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const EXPENSE_CATEGORIES = [
  { id: 'DGD', label: 'DGD Documentation Charges', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'PACKAGING', label: 'Packaging & UN Boxes', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'AIR_FREIGHT', label: 'Airline Freight Cost', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'SEA_FREIGHT', label: 'Ocean Freight Cost', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'CUSTOMS', label: 'Customs Clearance & Brokerage', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'TRANSPORT', label: 'Transport / Cartage / Courier', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'WAREHOUSE', label: 'Warehouse & Handling', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { id: 'OTHER', label: 'Other Vendor Expense', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
];

export default function PurchaseBillsPage() {
  const navigate = useNavigate();
  const { documents, fetchDocuments, createDocument, updateDocument, isLoading } = useDocumentStore();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);
  const [recordPaymentModal, setRecordPaymentModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Auto-extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState('');

  // Filter input states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Applied filter states
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    statusFilter: 'ALL',
    vendorFilter: 'ALL',
    categoryFilter: 'ALL',
    startDate: '',
    endDate: '',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Active advanced filters count
  const activeAdvancedCount = [
    appliedFilters.vendorFilter !== 'ALL',
    appliedFilters.categoryFilter !== 'ALL',
    appliedFilters.startDate !== '',
    appliedFilters.endDate !== '',
  ].filter(Boolean).length;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setAppliedFilters((prev) => ({ ...prev, search: val }));
  };

  // Form State for creating/editing purchase bill
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorGstin: '',
    vendorAddress: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    expenseCategory: 'DGD',
    airwayBillNo: '',
    description: '',
    taxableAmount: '',
    gstRate: 18,
    grandTotal: '',
    billFileBase64: null,
    billFileName: '',
    status: 'ISSUED', // 'ISSUED' (Pending Payment) or 'COMPLETED' (Paid)
    paymentMode: 'NEFT_RTGS',
    transactionId: '',
    paidDate: '',
    remarks: '',
  });

  useEffect(() => {
    fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  // Filter documents for PURCHASE bills
  const purchaseBills = documents.filter(
    (d) => d.documentType === 'TAX_INVOICE' && d.data?.invoiceKind === 'PURCHASE'
  );

  // Distinct filter lists
  const distinctVendors = Array.from(
    new Set(purchaseBills.map((d) => (d.data?.vendorName || '').trim()).filter(Boolean))
  ).sort();

  const isAnyFilterActive =
    appliedFilters.search !== '' ||
    appliedFilters.statusFilter !== 'ALL' ||
    appliedFilters.vendorFilter !== 'ALL' ||
    appliedFilters.categoryFilter !== 'ALL' ||
    appliedFilters.startDate !== '' ||
    appliedFilters.endDate !== '';

  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      statusFilter,
      vendorFilter,
      categoryFilter,
      startDate,
      endDate,
    });
  };

  const handleResetFilters = () => {
    const resetState = {
      search: '',
      statusFilter: 'ALL',
      vendorFilter: 'ALL',
      categoryFilter: 'ALL',
      startDate: '',
      endDate: '',
    };
    setSearch('');
    setStatusFilter('ALL');
    setVendorFilter('ALL');
    setCategoryFilter('ALL');
    setStartDate('');
    setEndDate('');
    setAppliedFilters(resetState);
  };

  const handleQuickStatusChange = (st) => {
    setStatusFilter(st);
    setAppliedFilters((prev) => ({ ...prev, statusFilter: st }));
  };

  // Filtered list
  const filteredBills = purchaseBills.filter((doc) => {
    const data = doc.data || {};

    // 1. Status Filter
    const matchesStatus = appliedFilters.statusFilter === 'ALL' || doc.status === appliedFilters.statusFilter;
    if (!matchesStatus) return false;

    // 2. Vendor Filter
    const vendorName = (data.vendorName || '').trim().toLowerCase();
    const matchesVendor = appliedFilters.vendorFilter === 'ALL' || vendorName === appliedFilters.vendorFilter.toLowerCase();
    if (!matchesVendor) return false;

    // 3. Category Filter
    const matchesCat = appliedFilters.categoryFilter === 'ALL' || data.expenseCategory === appliedFilters.categoryFilter;
    if (!matchesCat) return false;

    // 4. Date Range Filter
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const docDate = new Date(data.billDate || doc.createdAt);
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

    // 5. Search
    const q = appliedFilters.search.toLowerCase().trim();
    if (!q) return true;

    return (
      (doc.documentNumber || '').toLowerCase().includes(q) ||
      (data.vendorName || '').toLowerCase().includes(q) ||
      (data.billNumber || '').toLowerCase().includes(q) ||
      (data.airwayBillNo || '').toLowerCase().includes(q) ||
      (data.description || '').toLowerCase().includes(q) ||
      (data.expenseCategory || '').toLowerCase().includes(q) ||
      (data.transactionId || '').toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalCount = purchaseBills.length;
  const pendingBills = purchaseBills.filter((d) => d.status === 'ISSUED' || d.status === 'DRAFT');
  const paidBills = purchaseBills.filter((d) => d.status === 'COMPLETED' || d.status === 'DELIVERED');

  const totalExpenseAmount = purchaseBills.reduce((acc, d) => acc + (parseFloat(d.data?.grandTotal) || 0), 0);
  const pendingAmount = pendingBills.reduce((acc, d) => acc + (parseFloat(d.data?.grandTotal) || 0), 0);
  const paidAmount = paidBills.reduce((acc, d) => acc + (parseFloat(d.data?.grandTotal) || 0), 0);

  // Form Handlers
  const handleOpenCreateModal = () => {
    setEditingBill(null);
    setExtractSuccess('');
    setIsExtracting(false);
    setFormData({
      vendorName: '',
      vendorGstin: '',
      vendorAddress: '',
      billNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      expenseCategory: 'DGD',
      airwayBillNo: '',
      description: '',
      taxableAmount: '',
      gstRate: 18,
      grandTotal: '',
      billFileBase64: null,
      billFileName: '',
      status: 'ISSUED',
      paymentMode: 'NEFT_RTGS',
      transactionId: '',
      paidDate: '',
      remarks: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (doc) => {
    setEditingBill(doc);
    setExtractSuccess('');
    setIsExtracting(false);
    const data = doc.data || {};
    setFormData({
      vendorName: data.vendorName || '',
      vendorGstin: data.vendorGstin || '',
      vendorAddress: data.vendorAddress || '',
      billNumber: data.billNumber || doc.documentNumber || '',
      billDate: data.billDate || new Date(doc.createdAt).toISOString().split('T')[0],
      dueDate: data.dueDate || '',
      expenseCategory: data.expenseCategory || 'DGD',
      airwayBillNo: data.airwayBillNo || '',
      description: data.description || '',
      taxableAmount: data.taxableAmount || '',
      gstRate: data.gstRate !== undefined ? data.gstRate : 18,
      grandTotal: data.grandTotal || '',
      billFileBase64: data.billFileBase64 || null,
      billFileName: data.billFileName || '',
      status: doc.status || 'ISSUED',
      paymentMode: data.paymentMode || 'NEFT_RTGS',
      transactionId: data.transactionId || data.paymentInfo?.transactionId || '',
      paidDate: data.paidDate || data.paymentInfo?.paymentDate || '',
      remarks: data.remarks || data.paymentInfo?.remarks || '',
    });
    setModalOpen(true);
  };

  const handleCalculateTotal = (taxable, gst) => {
    const t = parseFloat(taxable) || 0;
    const g = parseFloat(gst) || 0;
    const total = t + (t * g) / 100;
    return total > 0 ? total.toFixed(2) : '';
  };

  const triggerAutoExtraction = async (base64Data, fileName) => {
    setIsExtracting(true);
    setExtractSuccess('');
    try {
      const extracted = await parseInvoiceDocument(base64Data, fileName);
      if (extracted) {
        setFormData((prev) => ({
          ...prev,
          vendorName: extracted.vendorName || prev.vendorName,
          vendorGstin: extracted.vendorGstin || prev.vendorGstin,
          billNumber: extracted.billNumber || prev.billNumber,
          billDate: extracted.billDate || prev.billDate,
          dueDate: extracted.dueDate || prev.dueDate,
          taxableAmount: extracted.taxableAmount || prev.taxableAmount,
          gstRate: extracted.gstRate !== undefined ? extracted.gstRate : prev.gstRate,
          grandTotal: extracted.grandTotal || prev.grandTotal,
          airwayBillNo: extracted.airwayBillNo || prev.airwayBillNo,
          expenseCategory: extracted.expenseCategory || prev.expenseCategory,
          description: extracted.description || prev.description,
        }));
        setExtractSuccess('Document auto-extracted successfully! Details populated in the fields below.');
      }
    } catch (err) {
      console.warn('Auto-extraction fallback:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setFormData((prev) => ({
        ...prev,
        billFileBase64: base64,
        billFileName: file.name,
      }));
      // Automatically trigger smart OCR / text extraction on upload!
      await triggerAutoExtraction(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) {
      alert('Please enter a vendor name.');
      return;
    }
    if (!formData.billNumber.trim()) {
      alert('Please enter the vendor bill / invoice number.');
      return;
    }

    setSaving(true);
    try {
      const grandTotalNum = parseFloat(formData.grandTotal) || parseFloat(formData.taxableAmount) || 0;
      const payloadData = {
        invoiceKind: 'PURCHASE',
        vendorName: formData.vendorName.trim(),
        vendorGstin: formData.vendorGstin.trim(),
        vendorAddress: formData.vendorAddress.trim(),
        billNumber: formData.billNumber.trim(),
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        expenseCategory: formData.expenseCategory,
        airwayBillNo: formData.airwayBillNo.trim(),
        description: formData.description.trim(),
        taxableAmount: parseFloat(formData.taxableAmount) || 0,
        gstRate: parseFloat(formData.gstRate) || 0,
        grandTotal: grandTotalNum,
        billFileBase64: formData.billFileBase64,
        billFileName: formData.billFileName,
        paymentMode: formData.paymentMode,
        transactionId: formData.transactionId,
        paidDate: formData.paidDate,
        remarks: formData.remarks,
        paymentInfo: formData.transactionId ? {
          paymentMode: formData.paymentMode,
          transactionId: formData.transactionId,
          paymentDate: formData.paidDate || formData.billDate,
          amountPaid: grandTotalNum,
          remarks: formData.remarks,
        } : null,
      };

      const docStatus = formData.status || (formData.transactionId ? 'COMPLETED' : 'ISSUED');

      if (editingBill) {
        await updateDocument(editingBill.id, {
          title: `Purchase Bill ${formData.billNumber} (${formData.vendorName})`,
          documentNumber: formData.billNumber,
          status: docStatus,
          statusNote: `Purchase Bill updated (${formData.expenseCategory})`,
          data: payloadData,
        });
        setSuccessMessage(`Purchase Bill #${formData.billNumber} updated successfully!`);
      } else {
        await createDocument({
          documentType: 'TAX_INVOICE',
          category: 'OTHER',
          title: `Purchase Bill ${formData.billNumber} (${formData.vendorName})`,
          documentNumber: formData.billNumber,
          status: docStatus,
          data: payloadData,
        });
        setSuccessMessage(`Purchase Bill #${formData.billNumber} from ${formData.vendorName} recorded successfully!`);
      }

      setModalOpen(false);
      fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
    } catch (err) {
      alert('Error saving purchase bill: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickRecordPayment = async (docId, paymentInfo) => {
    const target = purchaseBills.find((i) => i.id === docId);
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
      statusNote: `Vendor payment settled via ${paymentInfo.paymentMode} (Txn Ref: ${paymentInfo.transactionId || 'N/A'})`,
    });
    setSuccessMessage(`Payment recorded for Vendor Bill #${target.documentNumber}! Status updated to Paid.`);
    setRecordPaymentModal(null);
    fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  };

  const handleDeleteBill = async (docId) => {
    if (window.confirm('Are you sure you want to delete this Purchase Bill?')) {
      try {
        await deleteDocument(docId);
        fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
      } catch (err) {
        alert('Failed to delete purchase bill: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShoppingBag size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Purchase & Vendor Bills (Payables)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track inward vendor invoices, DGD charges, packaging supplies, freight costs, and record payment proofs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm rounded"
          >
            <Plus size={14} className="mr-1.5 inline" /> Add Purchase Bill
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
            <ShoppingBag size={13} className="text-indigo-400" /> Total Purchase Expenses
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono">₹{formatINR(totalExpenseAmount)}</div>
          <div className="text-[10px] text-slate-500">{totalCount} total bills recorded</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md shadow-sm space-y-1">
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
            <Clock size={13} className="text-amber-400" /> Pending to Pay Vendors
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">₹{formatINR(pendingAmount)}</div>
          <div className="text-[10px] text-slate-500">{pendingBills.length} unpaid / pending bills</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md shadow-sm space-y-1">
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" /> Settled / Paid to Vendors
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">₹{formatINR(paidAmount)}</div>
          <div className="text-[10px] text-slate-500">{paidBills.length} paid bills</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md shadow-sm space-y-1">
          <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
            <Building size={13} className="text-indigo-400" /> Expense Categories
          </div>
          <div className="text-xl font-bold text-indigo-300 font-mono">{distinctVendors.length} Vendors</div>
          <div className="text-[10px] text-slate-500">DGD, Packaging, Freight, Customs</div>
        </div>
      </div>

      {/* Long Search Bar & Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-md p-3.5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Long Search Bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Vendor, Bill #, Expense Category, AWB, UTR..."
              value={search}
              onChange={handleSearchChange}
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
            { id: 'ALL', label: 'All Bills' },
            { id: 'ISSUED', label: 'Pending Payment' },
            { id: 'COMPLETED', label: 'Paid / Settled' },
            { id: 'DRAFT', label: 'Drafts' },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Vendor Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Vendor / Supplier
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                >
                  <option value="ALL">All Vendors ({distinctVendors.length})</option>
                  {distinctVendors.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Category Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Expense Category
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Filter by Bill Date Range
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
              {appliedFilters.vendorFilter !== 'ALL' && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Vendor: {appliedFilters.vendorFilter}
                </span>
              )}
              {appliedFilters.categoryFilter !== 'ALL' && (
                <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded text-[11px] font-mono">
                  Category: {appliedFilters.categoryFilter}
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
              Showing <span className="text-white font-bold">{filteredBills.length}</span> of {purchaseBills.length} purchase bills
            </div>
          </div>
        )}
      </div>

      {/* Purchase Bills Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShoppingBag size={16} className="text-indigo-400" />
            <span>Purchase & Expense Bills ({filteredBills.length})</span>
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
              onClick={handleOpenCreateModal}
            >
              <Plus size={14} /> Add Bill
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading purchase bills...
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag size={36} className="text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No Purchase / Expense Bills found</p>
            <p className="text-xs text-slate-500">
              {search ? 'Try adjusting your search criteria' : 'Click "+ Add Purchase Bill" to record your vendor bills for DGD, packaging, freight, etc.'}
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="rounded">
              <Plus size={14} className="mr-1 inline" /> Record First Purchase Bill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Vendor Bill #</th>
                  <th className="py-3 px-4">Bill Date</th>
                  <th className="py-3 px-4 min-w-[170px]">Vendor / Supplier</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Linked AWB</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBills.map((doc) => {
                  const data = doc.data || {};
                  const grandTotal = data.grandTotal || 0;
                  const billNum = data.billNumber || doc.documentNumber || 'Bill';
                  const billDate = data.billDate || new Date(doc.createdAt).toLocaleDateString('en-GB');
                  const catObj = EXPENSE_CATEGORIES.find((c) => c.id === data.expenseCategory) || EXPENSE_CATEGORIES[0];
                  const isPaid = doc.status === 'COMPLETED' || doc.status === 'DELIVERED';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-100 font-mono">
                        <button
                          type="button"
                          className="hover:text-indigo-400 transition-colors text-left font-mono underline decoration-dotted underline-offset-4"
                          onClick={() => handleOpenEditModal(doc)}
                        >
                          {billNum}
                        </button>
                        {data.transactionId && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-normal text-emerald-400 font-mono">
                            <CreditCard size={11} /> {data.paymentMode}: {data.transactionId}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {billDate}
                        {data.dueDate && (
                          <div className="text-[10px] text-slate-500">Due: {data.dueDate}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{data.vendorName || 'Unspecified'}</div>
                        {data.vendorGstin && (
                          <div className="text-[10px] text-slate-400 font-mono">GSTIN: {data.vendorGstin}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${catObj.color}`}>
                          {catObj.label.split(' ')[0]} {catObj.label.split(' ')[1] || ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {data.airwayBillNo || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        ₹{formatINR(grandTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isPaid ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Attached Bill Viewer */}
                          {data.billFileBase64 && (
                            <button
                              type="button"
                              className="p-1.5 text-indigo-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                              onClick={() => setViewFileModal(data.billFileBase64)}
                              title="View Attached Vendor Bill Document"
                            >
                              <Paperclip size={15} />
                            </button>
                          )}

                          {/* Record Payment */}
                          <button
                            type="button"
                            className={`p-1.5 rounded transition-colors ${
                              isPaid ? 'text-emerald-400 hover:bg-slate-800' : 'text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20'
                            }`}
                            onClick={() => setRecordPaymentModal(doc)}
                            title={isPaid ? "Update Vendor Payment Reference" : "Record Payment to Vendor"}
                          >
                            <CreditCard size={15} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleOpenEditModal(doc)}
                            title="Edit Bill Details"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleDeleteBill(doc.id)}
                            title="Delete Bill"
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
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Purchase Bill - WITH SMART OCR / AUTO-EXTRACT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-md max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                    <span>{editingBill ? 'Edit Purchase / Vendor Bill' : 'Record New Purchase Bill'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attach invoice PDF/scan to auto-extract details or fill fields manually.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Extraction State Alerts */}
            {isExtracting && (
              <div className="p-3 bg-indigo-600/15 border border-indigo-500/30 rounded text-xs text-indigo-300 flex items-center gap-2.5 animate-pulse shrink-0">
                <Loader2 size={16} className="animate-spin text-indigo-400 shrink-0" />
                <span>
                  <strong>Smart Extractor:</strong> Reading and parsing invoice data from uploaded file (Vendor, GSTIN, Bill #, Amounts)...
                </span>
              </div>
            )}

            {extractSuccess && !isExtracting && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center justify-between animate-fade-in shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400 shrink-0" />
                  <span>{extractSuccess}</span>
                </div>
                <button
                  type="button"
                  className="text-emerald-400 hover:text-white font-bold text-xs"
                  onClick={() => setExtractSuccess('')}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSaveBill} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Primary Section: Document Attachment & Auto-Fill Trigger */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                    <Paperclip size={14} className="text-indigo-400" /> 1. Upload Vendor Bill / Invoice (Auto-Fill)
                  </div>
                  <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                    <Sparkles size={12} /> Auto-extracts Vendor, GSTIN & Amounts
                  </span>
                </div>

                <div className="p-3 bg-slate-900 border border-dashed border-slate-800 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
                  {formData.billFileBase64 ? (
                    <div className="flex items-center justify-between w-full flex-wrap gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip size={15} className="text-indigo-400 shrink-0" />
                        <span className="text-slate-200 text-xs font-medium truncate max-w-[220px]">
                          {formData.billFileName || 'Attached Document'}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold">
                          Attached
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerAutoExtraction(formData.billFileBase64, formData.billFileName)}
                          disabled={isExtracting}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <Sparkles size={12} />
                          <span>{isExtracting ? 'Scanning...' : 'Re-extract Details'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, billFileBase64: null, billFileName: '' });
                            setExtractSuccess('');
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2.5 py-1 bg-rose-500/10 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-2 w-full justify-center py-2">
                      <Paperclip size={16} /> Click or Drag & Drop Vendor Invoice PDF / Scan (Max 10MB)
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Section 2: Vendor Information */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                  <Building size={14} className="text-indigo-400" /> 2. Vendor / Supplier Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Vendor / Company Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      placeholder="e.g. DGR Global Logistics / DG Box Supplier"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Vendor GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.vendorGstin}
                      onChange={(e) => setFormData({ ...formData, vendorGstin: e.target.value })}
                      placeholder="e.g. 27NSAPK0224B1Z7"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Bill Identification & Dates */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                  <FileText size={14} className="text-indigo-400" /> 3. Invoice & Shipment Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Vendor Bill / Invoice # <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.billNumber}
                      onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                      placeholder="e.g. INV-9842"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Expense Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.expenseCategory}
                      onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Bill Date <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.billDate}
                      onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Linked AWB / Shipment Ref
                    </label>
                    <input
                      type="text"
                      value={formData.airwayBillNo}
                      onChange={(e) => setFormData({ ...formData, airwayBillNo: e.target.value })}
                      placeholder="e.g. 098-12345675"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Service / Product Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. DGD certification, inspection and UN 4G packaging charges"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Financials & GST Calculations */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                    <CreditCard size={14} className="text-indigo-400" /> 4. Amount & GST Calculations
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Currency: INR (₹)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Taxable Amount (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.taxableAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        const total = handleCalculateTotal(val, formData.gstRate);
                        setFormData({ ...formData, taxableAmount: val, grandTotal: total });
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      GST Rate (%)
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.gstRate}
                      onChange={(e) => {
                        const rate = e.target.value;
                        const total = handleCalculateTotal(formData.taxableAmount, rate);
                        setFormData({ ...formData, gstRate: rate, grandTotal: total });
                      }}
                    >
                      <option value="0">0% (Nil / Exempt)</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST (Standard Services)</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Grand Total Amount (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.grandTotal}
                      onChange={(e) => setFormData({ ...formData, grandTotal: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/50 rounded text-xs font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Initial Payment Status */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Initial Payment Status
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ISSUED">Pending Payment (Unpaid)</option>
                    <option value="COMPLETED">Already Paid / Settled</option>
                  </select>
                </div>

                {/* If status is COMPLETED, show payment settlement inputs */}
                {formData.status === 'COMPLETED' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded space-y-2.5 animate-fade-in mt-2">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Settlement / Payment Reference:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Mode</label>
                        <select
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          value={formData.paymentMode}
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                        >
                          <option value="NEFT_RTGS">Bank Transfer (NEFT/RTGS/IMPS)</option>
                          <option value="UPI">UPI / GPay / PhonePe</option>
                          <option value="CHEQUE">Cheque</option>
                          <option value="CASH">Cash</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">UTR / Txn Ref #</label>
                        <input
                          type="text"
                          value={formData.transactionId}
                          onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                          placeholder="e.g. UTR12345678"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Paid Date</label>
                        <input
                          type="date"
                          value={formData.paidDate}
                          onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 shrink-0 border-t border-slate-800">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded text-xs px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={saving}
                  className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 shadow-sm"
                >
                  <Save size={14} className="mr-1.5 inline" />
                  {editingBill ? 'Update Purchase Bill' : 'Save Purchase Bill'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Attached File */}
      {viewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setViewFileModal(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-md max-w-4xl w-full p-5 shadow-2xl space-y-3 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <Paperclip size={15} className="text-indigo-400" /> Attached Vendor Bill Document
              </h3>
              <button onClick={() => setViewFileModal(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-950 p-2 rounded flex items-center justify-center min-h-[400px]">
              {viewFileModal.startsWith('data:image') ? (
                <img src={viewFileModal} alt="Attached Bill" className="max-w-full max-h-[70vh] object-contain rounded" />
              ) : (
                <iframe src={viewFileModal} className="w-full h-[70vh] rounded border border-slate-800" title="Bill Preview" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Record Payment */}
      {recordPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-md max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CreditCard size={17} className="text-indigo-400" /> Record Vendor Payment
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Vendor Bill #{recordPaymentModal.data?.billNumber || recordPaymentModal.documentNumber} ({recordPaymentModal.data?.vendorName})
                </p>
              </div>
              <button onClick={() => setRecordPaymentModal(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.target;
                const paymentInfo = {
                  paymentMode: formEl.mode.value,
                  transactionId: formEl.txn.value,
                  paymentDate: formEl.pdate.value,
                  remarks: formEl.remarks.value,
                };
                handleQuickRecordPayment(recordPaymentModal.id, paymentInfo);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Payment Mode</label>
                <select name="mode" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
                  <option value="NEFT_RTGS">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Transaction UTR / Reference No. *</label>
                <input
                  name="txn"
                  placeholder="e.g. UTR12345678"
                  defaultValue={recordPaymentModal.data?.transactionId || ''}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Payment Date *</label>
                <input
                  type="date"
                  name="pdate"
                  defaultValue={recordPaymentModal.data?.paidDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Notes / Remarks</label>
                <textarea
                  name="remarks"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  rows={2}
                  placeholder="e.g. Settled full amount from HDFC current account"
                  defaultValue={recordPaymentModal.data?.remarks || ''}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="secondary" type="button" onClick={() => setRecordPaymentModal(null)} className="rounded text-xs">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                  <Save size={13} className="mr-1 inline" /> Mark as Paid
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
