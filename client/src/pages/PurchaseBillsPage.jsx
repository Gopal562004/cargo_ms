import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  RotateCw,
  RotateCcw,
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
  Bookmark,
  Check,
  Eye,
  Activity,
  History,
  Tag,
  ExternalLink,
  ShieldCheck,
  Percent,
  Calculator,
  ArrowRight,
  Info,
  Layers,
  FileCheck,
  Landmark,
  User,
  Phone,
  Truck,
  MapPin,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useFinancialYearStore, filterDocumentsByFY } from '../store/financialYearStore';
import { deleteDocument, parseInvoiceDocument } from '../services/documentService';
import { getSavedVendors, saveVendor } from '../services/billingProfileService';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

export const INDIAN_GST_STATES = {
  '01': 'Jammu & Kashmir (01)',
  '02': 'Himachal Pradesh (02)',
  '03': 'Punjab (03)',
  '04': 'Chandigarh (04)',
  '05': 'Uttarakhand (05)',
  '06': 'Haryana (06)',
  '07': 'Delhi (07)',
  '08': 'Rajasthan (08)',
  '09': 'Uttar Pradesh (09)',
  '10': 'Bihar (10)',
  '11': 'Sikkim (11)',
  '12': 'Arunachal Pradesh (12)',
  '13': 'Nagaland (13)',
  '14': 'Manipur (14)',
  '15': 'Mizoram (15)',
  '16': 'Tripura (16)',
  '17': 'Meghalaya (17)',
  '18': 'Assam (18)',
  '19': 'West Bengal (19)',
  '20': 'Jharkhand (20)',
  '21': 'Odisha (21)',
  '22': 'Chhattisgarh (22)',
  '23': 'Madhya Pradesh (23)',
  '24': 'Gujarat (24)',
  '26': 'Daman & Diu and Dadra & Nagar Haveli (26)',
  '27': 'Maharashtra (27)',
  '29': 'Karnataka (29)',
  '30': 'Goa (30)',
  '31': 'Lakshadweep (31)',
  '32': 'Kerala (32)',
  '33': 'Tamil Nadu (33)',
  '34': 'Puducherry (34)',
  '35': 'Andaman & Nicobar Islands (35)',
  '36': 'Telangana (36)',
  '37': 'Andhra Pradesh (37)',
  '38': 'Ladakh (38)',
  '97': 'Other Territory (97)',
};

const TODAY_DATE_STR = new Date().toISOString().split('T')[0];

export const EXPENSE_CATEGORIES = [
  { id: 'PACKAGING', label: 'UN 4G Boxes & DG Packaging Material', sac: '4819', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'DGD', label: 'IATA DGD Inspection & Certification', sac: '9983', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'AIR_FREIGHT', label: 'Airline Master Freight & Surcharges (FSC/SSC)', sac: '9965', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'SEA_FREIGHT', label: 'Ocean Freight & Sea Shipping Line Charges', sac: '9965', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'TERMINAL_HANDLING', label: 'Airport TSP / CFS Terminal & Storage (MIAL/AAI)', sac: '9967', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { id: 'CUSTOMS', label: 'CHA & Customs Brokerage Clearance', sac: '9967', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'TRANSPORT', label: 'Local Cartage, Tempo & Transporter LR', sac: '9965', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'FUMIGATION', label: 'Fumigation, Palletization & Phytosanitary', sac: '9988', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { id: 'DOCUMENTATION', label: 'AWB Pouch Postage & Courier Logistics', sac: '9983', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { id: 'OTHER', label: 'General / Office & Software Subscriptions', sac: '9983', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
];

export const TDS_SECTIONS = [
  { id: 'NONE', label: 'No TDS Applicable (0%)', rate: 0 },
  { id: '194C_IND', label: 'Sec 194C - Contractor (Individual / Prop) (1%)', rate: 1 },
  { id: '194C_CO', label: 'Sec 194C - Contractor (Company / Firm) (2%)', rate: 2 },
  { id: '194J_TECH', label: 'Sec 194J - Technical / Professional Fee (2%)', rate: 2 },
  { id: '194J_PROF', label: 'Sec 194J - Professional / Consultancy (10%)', rate: 10 },
  { id: '194Q', label: 'Sec 194Q - Purchase of Goods > 50L (0.1%)', rate: 0.1 },
];

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getBillGstBreakdown(data = {}) {
  const taxable = parseFloat(data.taxableAmount) || 0;
  const gstRate = parseFloat(data.gstRate) || 0;
  const grandTotal = parseFloat(data.grandTotal) || (taxable + (taxable * gstRate) / 100);
  const isInterState = data.taxType === 'INTER_STATE';

  // Compute total GST accurately
  let totalGst = parseFloat(data.totalGst) || 0;
  if (!totalGst && grandTotal > taxable) {
    totalGst = grandTotal - taxable;
  } else if (!totalGst && gstRate > 0) {
    totalGst = (taxable * gstRate) / 100;
  }

  let cgst = parseFloat(data.cgstAmount) || 0;
  let sgst = parseFloat(data.sgstAmount) || 0;
  let igst = parseFloat(data.igstAmount) || 0;

  if (isInterState) {
    igst = igst || totalGst;
    cgst = 0;
    sgst = 0;
  } else {
    cgst = cgst || totalGst / 2;
    sgst = sgst || totalGst / 2;
    igst = 0;
  }

  return {
    taxable,
    gstRate,
    totalGst,
    cgst,
    sgst,
    igst,
    grandTotal,
    isInterState,
  };
}

function addActivityLog(existingLogs = [], action, actor = 'Admin', details = '') {
  const newLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    action,
    actor,
    details,
  };
  return [newLog, ...(existingLogs || [])];
}

function formatActivityDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getIndianStateFromGstin(gstin) {
  if (!gstin || typeof gstin !== 'string') return null;
  const clean = gstin.trim();
  if (clean.length >= 2) {
    const code = clean.substring(0, 2);
    return INDIAN_GST_STATES[code] || null;
  }
  return null;
}

export default function PurchaseBillsPage() {
  const navigate = useNavigate();
  const { documents, fetchDocuments, createDocument, updateDocument, isLoading } = useDocumentStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [viewDetailModal, setViewDetailModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);
  const [recordPaymentModal, setRecordPaymentModal] = useState(null);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Lock background body scroll whenever any modal in this page is open
  useBodyScrollLock(Boolean(modalOpen || viewDetailModal || viewFileModal || recordPaymentModal));

  // Auto-extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState('');
  const [lastExtractedData, setLastExtractedData] = useState(null);

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
    setCurrentPage(1);
  };

  // Vendor Templates state
  const [savedVendors, setSavedVendors] = useState([]);
  const [selectedVendorTemplateId, setSelectedVendorTemplateId] = useState('');
  const [saveVendorToTemplatesChecked, setSaveVendorToTemplatesChecked] = useState(false);
  const [vendorSaveSuccessToast, setVendorSaveSuccessToast] = useState('');
  const [templateAutoFillToast, setTemplateAutoFillToast] = useState('');

  // Form State for creating/editing purchase bill
  const [formData, setFormData] = useState({
    voucherNumber: '',
    vendorName: '',
    vendorGstin: '',
    vendorPan: '',
    vendorAddress: '',
    placeOfSupply: 'Maharashtra (27)',
    taxType: 'INTRA_STATE', // INTRA_STATE (CGST+SGST) | INTER_STATE (IGST) | EXEMPT
    billNumber: '',
    billDate: TODAY_DATE_STR,
    dueDate: '',
    expenseCategory: 'PACKAGING',
    hsnSacCode: '4819',
    airwayBillNo: '',
    description: '',
    taxableAmount: '',
    gstRate: 18,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalGst: 0,
    tdsSection: 'NONE',
    tdsRate: 0,
    tdsAmount: 0,
    grandTotal: '',
    netPayable: '',
    itcEligibility: 'ELIGIBLE', // ELIGIBLE | INELIGIBLE | RCM
    billFileBase64: null,
    billFileName: '',
    vendorBankName: '',
    vendorBankAccount: '',
    vendorBankIfsc: '',
    vendorBankBranch: '',
    referenceName: '',
    contactNumber: '',
    shippedToName: '',
    shippedToAddress: '',
    status: 'ISSUED', // ISSUED (Pending) | COMPLETED (Paid) | DRAFT
    paymentMode: 'NEFT_RTGS',
    bankName: '',
    transactionId: '',
    paidDate: '',
    remarks: '',
  });

  // Calculate Indian GST & Totals
  const calculateGstBreakdown = (taxableVal, rateVal, taxTypeVal, tdsSecVal) => {
    const taxable = parseFloat(taxableVal) || 0;
    const gstRate = parseFloat(rateVal) || 0;
    const tdsSec = TDS_SECTIONS.find((s) => s.id === tdsSecVal) || TDS_SECTIONS[0];
    const tdsRate = tdsSec.rate;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (taxTypeVal === 'INTRA_STATE' && gstRate > 0) {
      const halfRate = gstRate / 2;
      cgst = (taxable * halfRate) / 100;
      sgst = (taxable * halfRate) / 100;
    } else if (taxTypeVal === 'INTER_STATE' && gstRate > 0) {
      igst = (taxable * gstRate) / 100;
    }

    const totalGst = cgst + sgst + igst;
    const grandTotal = taxable + totalGst;
    const tdsAmount = (taxable * tdsRate) / 100;
    const netPayable = Math.max(0, grandTotal - tdsAmount);

    return {
      taxableAmount: taxableVal,
      gstRate,
      cgstAmount: parseFloat(cgst.toFixed(2)),
      sgstAmount: parseFloat(sgst.toFixed(2)),
      igstAmount: parseFloat(igst.toFixed(2)),
      totalGst: parseFloat(totalGst.toFixed(2)),
      tdsSection: tdsSecVal,
      tdsRate,
      tdsAmount: parseFloat(tdsAmount.toFixed(2)),
      grandTotal: grandTotal > 0 ? grandTotal.toFixed(2) : '',
      netPayable: netPayable > 0 ? netPayable.toFixed(2) : '',
    };
  };

  const loadVendors = () => {
    const list = getSavedVendors();
    setSavedVendors(list);
  };

  useEffect(() => {
    loadVendors();
    fetchDocuments({ documentType: 'TAX_INVOICE', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  const { activeFY } = useFinancialYearStore();

  // Filter purchase bills (TAX_INVOICE documents with invoiceKind === 'PURCHASE') and active FY
  const allPurchaseBills = documents.filter((doc) => {
    if (doc.documentType !== 'TAX_INVOICE') return false;
    const data = doc.data || {};
    return data.invoiceKind === 'PURCHASE' || data.isPurchase === true || (doc.title || '').toLowerCase().includes('purchase bill');
  });
  const purchaseBills = filterDocumentsByFY(allPurchaseBills, activeFY);

  // Extract distinct vendor list for filter
  const distinctVendors = Array.from(
    new Set(
      purchaseBills
        .map((d) => (d.data?.vendorName || '').trim())
        .filter(Boolean)
    )
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
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const handleQuickStatusChange = (st) => {
    setStatusFilter(st);
    setAppliedFilters((prev) => ({ ...prev, statusFilter: st }));
    setCurrentPage(1);
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
      (data.voucherNumber || '').toLowerCase().includes(q) ||
      (data.airwayBillNo || '').toLowerCase().includes(q) ||
      (data.description || '').toLowerCase().includes(q) ||
      (data.expenseCategory || '').toLowerCase().includes(q) ||
      (data.transactionId || '').toLowerCase().includes(q) ||
      (data.vendorGstin || '').toLowerCase().includes(q) ||
      (data.vendorPan || '').toLowerCase().includes(q) ||
      (data.referenceName || '').toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalCount = purchaseBills.length;
  const pendingBills = purchaseBills.filter((d) => d.status === 'ISSUED' || d.status === 'DRAFT');
  const paidBills = purchaseBills.filter((d) => d.status === 'COMPLETED' || d.status === 'DELIVERED');

  const totalExpenseAmount = purchaseBills.reduce((acc, d) => acc + (parseFloat(d.data?.grandTotal) || 0), 0);
  const pendingAmount = pendingBills.reduce((acc, d) => acc + (parseFloat(d.data?.grandTotal) || 0), 0);
  const paidAmount = paidBills.reduce((acc, d) => acc + (parseFloat(d.data?.grandTotal) || 0), 0);

  // Paginate filtered results
  const paginatedBills = filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Form Handlers
  const handleOpenCreateModal = () => {
    setEditingBill(null);
    setExtractSuccess('');
    setLastExtractedData(null);
    setIsExtracting(false);
    setSelectedVendorTemplateId('');
    setTemplateAutoFillToast('');
    setVendorSaveSuccessToast('');
    setSaveVendorToTemplatesChecked(false);
    loadVendors();

    const currentYear = new Date().getFullYear().toString().slice(-2);
    const nextYear = (parseInt(currentYear, 10) + 1).toString();
    const defaultVoucherNo = `PB/${currentYear}-${nextYear}/${(purchaseBills.length + 1).toString().padStart(4, '0')}`;

    setFormData({
      voucherNumber: defaultVoucherNo,
      vendorName: '',
      vendorGstin: '',
      vendorPan: '',
      vendorAddress: '',
      placeOfSupply: 'Maharashtra (27)',
      taxType: 'INTRA_STATE',
      billNumber: '',
      billDate: TODAY_DATE_STR,
      dueDate: '',
      expenseCategory: 'PACKAGING',
      hsnSacCode: '4819',
      airwayBillNo: '',
      description: '',
      taxableAmount: '',
      gstRate: 18,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGst: 0,
      tdsSection: 'NONE',
      tdsRate: 0,
      tdsAmount: 0,
      grandTotal: '',
      netPayable: '',
      itcEligibility: 'ELIGIBLE',
      billFileBase64: null,
      billFileName: '',
      vendorBankName: '',
      vendorBankAccount: '',
      vendorBankIfsc: '',
      vendorBankBranch: '',
      referenceName: '',
      contactNumber: '',
      shippedToName: '',
      shippedToAddress: '',
      status: 'ISSUED',
      paymentMode: 'NEFT_RTGS',
      bankName: '',
      transactionId: '',
      paidDate: '',
      remarks: '',
    });
    setModalOpen(true);
  };

  const handleOpenDetailModal = (doc) => {
    setViewDetailModal(doc);
  };

  const handleOpenPaymentModal = (doc) => {
    const isAlreadyPaid = doc.status === 'COMPLETED' || doc.status === 'DELIVERED' || Boolean(doc.data?.transactionId);
    setIsEditingPayment(!isAlreadyPaid);
    setRecordPaymentModal(doc);
  };

  const handleOpenEditModal = (doc) => {
    setEditingBill(doc);
    setExtractSuccess('');
    setLastExtractedData(null);
    setIsExtracting(false);
    setSelectedVendorTemplateId('');
    setTemplateAutoFillToast('');
    setVendorSaveSuccessToast('');
    setSaveVendorToTemplatesChecked(false);
    loadVendors();
    const data = doc.data || {};

    const taxableVal = data.taxableAmount || '';
    const rateVal = data.gstRate !== undefined ? data.gstRate : 18;
    const taxTypeVal = data.taxType || (data.vendorGstin?.startsWith('27') ? 'INTRA_STATE' : 'INTER_STATE');
    const tdsSecVal = data.tdsSection || 'NONE';

    const calculations = calculateGstBreakdown(taxableVal, rateVal, taxTypeVal, tdsSecVal);

    setFormData({
      voucherNumber: data.voucherNumber || doc.documentNumber || '',
      vendorName: data.vendorName || '',
      vendorGstin: data.vendorGstin || '',
      vendorPan: data.vendorPan || '',
      vendorAddress: data.vendorAddress || '',
      placeOfSupply: data.placeOfSupply || 'Maharashtra (27)',
      taxType: taxTypeVal,
      billNumber: data.billNumber || doc.documentNumber || '',
      billDate: data.billDate || new Date(doc.createdAt).toISOString().split('T')[0],
      dueDate: data.dueDate || '',
      expenseCategory: data.expenseCategory || 'PACKAGING',
      hsnSacCode: data.hsnSacCode || '4819',
      airwayBillNo: data.airwayBillNo || '',
      description: data.description || '',
      taxableAmount: taxableVal,
      gstRate: rateVal,
      cgstAmount: data.cgstAmount !== undefined ? data.cgstAmount : calculations.cgstAmount,
      sgstAmount: data.sgstAmount !== undefined ? data.sgstAmount : calculations.sgstAmount,
      igstAmount: data.igstAmount !== undefined ? data.igstAmount : calculations.igstAmount,
      totalGst: data.totalGst !== undefined ? data.totalGst : calculations.totalGst,
      tdsSection: tdsSecVal,
      tdsRate: data.tdsRate !== undefined ? data.tdsRate : calculations.tdsRate,
      tdsAmount: data.tdsAmount !== undefined ? data.tdsAmount : calculations.tdsAmount,
      grandTotal: data.grandTotal || calculations.grandTotal,
      netPayable: data.netPayable || calculations.netPayable,
      itcEligibility: data.itcEligibility || 'ELIGIBLE',
      billFileBase64: data.billFileBase64 || null,
      billFileName: data.billFileName || '',
      vendorBankName: data.vendorBankName || '',
      vendorBankAccount: data.vendorBankAccount || '',
      vendorBankIfsc: data.vendorBankIfsc || '',
      vendorBankBranch: data.vendorBankBranch || '',
      referenceName: data.referenceName || '',
      contactNumber: data.contactNumber || '',
      shippedToName: data.shippedToName || '',
      shippedToAddress: data.shippedToAddress || '',
      status: doc.status || 'ISSUED',
      paymentMode: data.paymentMode || 'NEFT_RTGS',
      bankName: data.bankName || '',
      transactionId: data.transactionId || data.paymentInfo?.transactionId || '',
      paidDate: data.paidDate || data.paymentInfo?.paymentDate || '',
      remarks: data.remarks || data.paymentInfo?.remarks || '',
    });
    setModalOpen(true);
  };

  const handleResetForm = () => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const nextYear = (parseInt(currentYear, 10) + 1).toString();
    const defaultVoucherNo = `PB/${currentYear}-${nextYear}/${(purchaseBills.length + 1).toString().padStart(4, '0')}`;

    setFormData({
      voucherNumber: defaultVoucherNo,
      vendorName: '',
      vendorGstin: '',
      vendorPan: '',
      vendorAddress: '',
      placeOfSupply: 'Maharashtra (27)',
      taxType: 'INTRA_STATE',
      billNumber: '',
      billDate: TODAY_DATE_STR,
      dueDate: '',
      expenseCategory: 'PACKAGING',
      hsnSacCode: '4819',
      airwayBillNo: '',
      description: '',
      taxableAmount: '',
      gstRate: 18,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGst: 0,
      tdsSection: 'NONE',
      tdsRate: 0,
      tdsAmount: 0,
      grandTotal: '',
      netPayable: '',
      itcEligibility: 'ELIGIBLE',
      billFileBase64: null,
      billFileName: '',
      vendorBankName: '',
      vendorBankAccount: '',
      vendorBankIfsc: '',
      vendorBankBranch: '',
      referenceName: '',
      contactNumber: '',
      shippedToName: '',
      shippedToAddress: '',
      status: 'ISSUED',
      paymentMode: 'NEFT_RTGS',
      bankName: '',
      transactionId: '',
      paidDate: '',
      remarks: '',
    });
    setSelectedVendorTemplateId('');
    setExtractSuccess('');
    setLastExtractedData(null);
    setTemplateAutoFillToast('');
    setVendorSaveSuccessToast('');
    setSaveVendorToTemplatesChecked(false);
  };

  // Vendor Template selection handler
  const handleSelectVendorTemplate = (vendorId) => {
    setSelectedVendorTemplateId(vendorId);
    if (!vendorId) return;
    const v = savedVendors.find((item) => item.id === vendorId);
    if (v) {
      setFormData((prev) => {
        const updatedGstRate = v.defaultGstRate !== undefined ? v.defaultGstRate : prev.gstRate;
        const vendorState = getIndianStateFromGstin(v.gstin) || prev.placeOfSupply;
        const taxType = (v.gstin?.startsWith('27') || !v.gstin) ? 'INTRA_STATE' : 'INTER_STATE';

        const calculations = calculateGstBreakdown(prev.taxableAmount, updatedGstRate, taxType, prev.tdsSection);

        return {
          ...prev,
          vendorName: v.name || prev.vendorName,
          vendorGstin: v.gstin || prev.vendorGstin,
          vendorAddress: v.address || prev.vendorAddress,
          placeOfSupply: vendorState,
          taxType,
          expenseCategory: v.category || prev.expenseCategory,
          gstRate: updatedGstRate,
          description: v.defaultDescription || prev.description,
          vendorBankName: v.bankName || prev.vendorBankName,
          vendorBankAccount: v.accountNumber || prev.vendorBankAccount,
          vendorBankIfsc: v.ifscCode || prev.vendorBankIfsc,
          vendorBankBranch: v.branchName || prev.vendorBankBranch,
          ...calculations,
        };
      });
      setTemplateAutoFillToast(`Loaded details from saved template: ${v.name}`);
      setTimeout(() => setTemplateAutoFillToast(''), 4000);
    }
  };

  // Save current manually entered vendor as reusable template
  const handleSaveCurrentAsVendorTemplate = () => {
    if (!formData.vendorName.trim()) {
      alert('Please enter Vendor / Company Name first.');
      return;
    }
    const newVendor = saveVendor({
      name: formData.vendorName.trim(),
      gstin: formData.vendorGstin.trim(),
      pan: formData.vendorPan.trim(),
      address: formData.vendorAddress.trim(),
      category: formData.expenseCategory || 'PACKAGING',
      defaultGstRate: formData.gstRate !== undefined ? formData.gstRate : 18,
      defaultDescription: formData.description.trim(),
      bankName: formData.vendorBankName.trim(),
      accountNumber: formData.vendorBankAccount.trim(),
      ifscCode: formData.vendorBankIfsc.trim(),
      branchName: formData.vendorBankBranch.trim(),
    });
    const updatedList = getSavedVendors();
    setSavedVendors(updatedList);
    setSelectedVendorTemplateId(newVendor.id);
    setVendorSaveSuccessToast(`Vendor "${formData.vendorName}" saved to templates for 1-click reuse!`);
    setTimeout(() => setVendorSaveSuccessToast(''), 4000);
  };

  // Smart, Non-destructive Auto-Extraction with accurate invoice date & category update
  const triggerAutoExtraction = async (base64Data, fileName, forceOverwrite = false) => {
    setIsExtracting(true);
    setExtractSuccess('');
    try {
      const extracted = await parseInvoiceDocument(base64Data, fileName);
      if (extracted) {
        setLastExtractedData(extracted);

        setFormData((prev) => {
          let filledCount = 0;
          let preservedCount = 0;

          const updated = { ...prev };

          const assignField = (key, val, overwriteIfPlaceholder = false) => {
            if (val === undefined || val === null || val === '') return;
            const isPlaceholder = overwriteIfPlaceholder && (
              (key === 'billDate' && prev[key] === TODAY_DATE_STR) ||
              (key === 'expenseCategory' && prev[key] === 'DGD') ||
              (key === 'hsnSacCode' && prev[key] === '9983')
            );
            if (forceOverwrite || !prev[key] || String(prev[key]).trim() === '' || isPlaceholder || (key === 'gstRate' && prev[key] === 18 && !prev.taxableAmount)) {
              updated[key] = val;
              filledCount++;
            } else {
              preservedCount++;
            }
          };

          assignField('vendorName', extracted.vendorName);
          assignField('vendorGstin', extracted.vendorGstin);
          assignField('vendorPan', extracted.vendorPan);
          assignField('vendorAddress', extracted.vendorAddress);
          assignField('placeOfSupply', extracted.placeOfSupply);
          assignField('billNumber', extracted.billNumber);
          assignField('billDate', extracted.billDate, true);
          assignField('dueDate', extracted.dueDate);
          assignField('taxableAmount', extracted.taxableAmount);
          assignField('airwayBillNo', extracted.airwayBillNo);
          assignField('description', extracted.description);
          assignField('hsnSacCode', extracted.hsnSacCode, true);
          assignField('expenseCategory', extracted.expenseCategory, true);

          // Bank details & Reference
          assignField('vendorBankName', extracted.bankName);
          assignField('vendorBankAccount', extracted.bankAccountNumber);
          assignField('vendorBankIfsc', extracted.bankIfscCode);
          assignField('vendorBankBranch', extracted.bankBranch);
          assignField('referenceName', extracted.referenceName);
          assignField('contactNumber', extracted.contactNumber);
          assignField('shippedToName', extracted.shippedToName);
          assignField('shippedToAddress', extracted.shippedToAddress);

          // Auto detect tax type based on vendor GSTIN or extracted POS
          const currentGstin = updated.vendorGstin || extracted.vendorGstin || '';
          if (currentGstin) {
            const vendorState = getIndianStateFromGstin(currentGstin);
            if (vendorState) updated.placeOfSupply = vendorState;
            updated.taxType = currentGstin.startsWith('27') ? 'INTRA_STATE' : 'INTER_STATE';
          }

          const targetRate = extracted.gstRate !== undefined ? extracted.gstRate : updated.gstRate;
          updated.gstRate = targetRate;

          const calculations = calculateGstBreakdown(updated.taxableAmount, targetRate, updated.taxType, updated.tdsSection);
          Object.assign(updated, calculations);

          if (extracted.grandTotal && parseFloat(extracted.grandTotal) > 0) {
            updated.grandTotal = extracted.grandTotal;
          }

          if (forceOverwrite) {
            setExtractSuccess(`Scanned data applied! Overwrote all fields with invoice details.`);
          } else if (preservedCount > 0) {
            setExtractSuccess(`Auto-extracted invoice details! Populated ${filledCount} fields and preserved ${preservedCount} manual entries.`);
          } else {
            setExtractSuccess(`Document auto-extracted successfully! Populated ${filledCount} fields.`);
          }

          return updated;
        });
      }
    } catch (err) {
      console.warn('Auto-extraction error:', err);
      alert('Could not auto-extract details: ' + (err.message || 'Please fill fields manually.'));
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
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setFormData((prev) => ({
        ...prev,
        billFileBase64: base64,
        billFileName: file.name,
      }));
      setExtractSuccess('');
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
      const taxableNum = parseFloat(formData.taxableAmount) || 0;
      const gstRateNum = parseFloat(formData.gstRate) || 0;
      const calc = calculateGstBreakdown(taxableNum, gstRateNum, formData.taxType, formData.tdsSection);

      const grandTotalNum = parseFloat(formData.grandTotal) || parseFloat(calc.grandTotal) || taxableNum;
      const netPayableNum = parseFloat(formData.netPayable) || parseFloat(calc.netPayable) || grandTotalNum;

      const cgstVal = parseFloat(formData.cgstAmount) || calc.cgstAmount || 0;
      const sgstVal = parseFloat(formData.sgstAmount) || calc.sgstAmount || 0;
      const igstVal = parseFloat(formData.igstAmount) || calc.igstAmount || 0;
      const totalGstVal = parseFloat(formData.totalGst) || calc.totalGst || (cgstVal + sgstVal + igstVal);

      let logs = [];
      if (editingBill) {
        const existingLogs = editingBill.data?.activityLogs || [];
        logs = addActivityLog(
          existingLogs,
          'UPDATED',
          'Admin',
          `Bill #${formData.billNumber} modified (Taxable: ₹${formatINR(taxableNum)}, Total: ₹${formatINR(grandTotalNum)}, Net: ₹${formatINR(netPayableNum)})`
        );
      } else {
        logs = addActivityLog(
          [],
          'CREATED',
          'Admin',
          `Purchase Bill #${formData.billNumber} recorded from ${formData.vendorName} (Amount: ₹${formatINR(grandTotalNum)})`
        );
        if (formData.transactionId) {
          logs = addActivityLog(
            logs,
            'PAYMENT_RECORDED',
            'Admin',
            `Payment settled via ${formData.paymentMode} (Ref: ${formData.transactionId})`
          );
        }
      }

      const payloadData = {
        invoiceKind: 'PURCHASE',
        isPurchase: true,
        voucherNumber: formData.voucherNumber.trim() || formData.billNumber.trim(),
        vendorName: formData.vendorName.trim(),
        vendorGstin: formData.vendorGstin.trim(),
        vendorPan: formData.vendorPan.trim(),
        vendorAddress: formData.vendorAddress.trim(),
        placeOfSupply: formData.placeOfSupply,
        taxType: formData.taxType,
        billNumber: formData.billNumber.trim(),
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        expenseCategory: formData.expenseCategory,
        hsnSacCode: formData.hsnSacCode.trim(),
        airwayBillNo: formData.airwayBillNo.trim(),
        description: formData.description.trim(),
        taxableAmount: taxableNum,
        gstRate: gstRateNum,
        cgstAmount: cgstVal,
        sgstAmount: sgstVal,
        igstAmount: igstVal,
        totalGst: totalGstVal,
        tdsSection: formData.tdsSection,
        tdsRate: parseFloat(formData.tdsRate) || calc.tdsRate || 0,
        tdsAmount: parseFloat(formData.tdsAmount) || calc.tdsAmount || 0,
        grandTotal: grandTotalNum,
        netPayable: netPayableNum,
        itcEligibility: formData.itcEligibility,
        billFileBase64: formData.billFileBase64,
        billFileName: formData.billFileName,
        vendorBankName: formData.vendorBankName.trim(),
        vendorBankAccount: formData.vendorBankAccount.trim(),
        vendorBankIfsc: formData.vendorBankIfsc.trim(),
        vendorBankBranch: formData.vendorBankBranch.trim(),
        referenceName: formData.referenceName.trim(),
        contactNumber: formData.contactNumber.trim(),
        shippedToName: formData.shippedToName.trim(),
        shippedToAddress: formData.shippedToAddress.trim(),
        paymentMode: formData.paymentMode,
        bankName: formData.bankName.trim(),
        transactionId: formData.transactionId.trim(),
        paidDate: formData.paidDate,
        remarks: formData.remarks,
        activityLogs: logs,
        paymentInfo: formData.transactionId ? {
          paymentMode: formData.paymentMode,
          bankName: formData.bankName.trim(),
          transactionId: formData.transactionId.trim(),
          paymentDate: formData.paidDate || formData.billDate,
          amountPaid: netPayableNum || grandTotalNum,
          remarks: formData.remarks,
        } : null,
      };

      const docStatus = formData.status || (formData.transactionId ? 'COMPLETED' : 'ISSUED');

      // Auto-save vendor to templates directory if requested
      if (saveVendorToTemplatesChecked && formData.vendorName.trim()) {
        saveVendor({
          name: formData.vendorName.trim(),
          gstin: formData.vendorGstin.trim(),
          pan: formData.vendorPan.trim(),
          address: formData.vendorAddress.trim(),
          category: formData.expenseCategory || 'PACKAGING',
          defaultGstRate: formData.gstRate !== undefined ? formData.gstRate : 18,
          defaultDescription: formData.description.trim(),
          bankName: formData.vendorBankName.trim(),
          accountNumber: formData.vendorBankAccount.trim(),
          ifscCode: formData.vendorBankIfsc.trim(),
          branchName: formData.vendorBankBranch.trim(),
        });
        loadVendors();
      }

      if (editingBill) {
        await updateDocument(editingBill.id, {
          title: `Purchase Bill ${formData.billNumber} (${formData.vendorName})`,
          documentNumber: formData.voucherNumber || formData.billNumber,
          status: docStatus,
          statusNote: `Purchase Bill updated (${formData.expenseCategory})`,
          data: payloadData,
        });
        setSuccessMessage(`Purchase Bill #${formData.billNumber} updated successfully!`);
        if (viewDetailModal && viewDetailModal.id === editingBill.id) {
          setViewDetailModal({
            ...viewDetailModal,
            status: docStatus,
            documentNumber: formData.voucherNumber || formData.billNumber,
            data: payloadData,
          });
        }
      } else {
        await createDocument({
          documentType: 'TAX_INVOICE',
          category: 'OTHER',
          title: `Purchase Bill ${formData.billNumber} (${formData.vendorName})`,
          documentNumber: formData.voucherNumber || formData.billNumber,
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
    const existingLogs = currentData.activityLogs || [];
    const updatedLogs = addActivityLog(
      existingLogs,
      'PAYMENT_RECORDED',
      'Admin',
      `Payment settled via ${paymentInfo.paymentMode} (Txn Ref / UTR: ${paymentInfo.transactionId || 'N/A'}, Paid Date: ${paymentInfo.paymentDate || TODAY_DATE_STR})`
    );

    const updatedData = {
      ...currentData,
      transactionId: paymentInfo.transactionId,
      bankName: paymentInfo.bankName || '',
      paymentMode: paymentInfo.paymentMode,
      paidDate: paymentInfo.paymentDate,
      remarks: paymentInfo.remarks,
      activityLogs: updatedLogs,
      paymentInfo: {
        paymentMode: paymentInfo.paymentMode,
        bankName: paymentInfo.bankName || '',
        transactionId: paymentInfo.transactionId,
        paymentDate: paymentInfo.paymentDate,
        amountPaid: currentData.netPayable || currentData.grandTotal || 0,
        remarks: paymentInfo.remarks,
      },
    };
    await updateDocument(docId, {
      data: updatedData,
      status: 'COMPLETED',
      statusNote: `Vendor payment settled via ${paymentInfo.paymentMode} (Txn Ref: ${paymentInfo.transactionId || 'N/A'})`,
    });
    setSuccessMessage(`Payment recorded for Vendor Bill #${target.documentNumber}! Status updated to Paid.`);
    setRecordPaymentModal(null);
    if (viewDetailModal && viewDetailModal.id === docId) {
      setViewDetailModal({
        ...viewDetailModal,
        status: 'COMPLETED',
        data: updatedData,
      });
    }
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
              Purchase Bills & Vendor Payables (GST)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track inward vendor bills, DG boxes & packaging, DGD certification, airline freight costs, GST input tax credits (ITC), and settlement proofs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm rounded"
          >
            <Plus size={14} className="mr-1.5 inline" /> Record Purchase Bill
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
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <ShoppingBag size={13} className="text-indigo-400" /> Total Purchase Expenses
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono">₹{formatINR(totalExpenseAmount)}</div>
          <div className="text-[10px] text-slate-500">{totalCount} total bills recorded</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md space-y-1">
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
            <Clock size={13} className="text-amber-400" /> Pending to Pay Vendors
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">₹{formatINR(pendingAmount)}</div>
          <div className="text-[10px] text-slate-500">{pendingBills.length} unpaid / pending bills</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md space-y-1">
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" /> Settled / Paid to Vendors
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">₹{formatINR(paidAmount)}</div>
          <div className="text-[10px] text-slate-500">{paidBills.length} paid bills</div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-md space-y-1">
          <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1.5">
            <Building size={13} className="text-indigo-400" /> Active Vendor Network
          </div>
          <div className="text-xl font-bold text-indigo-300 font-mono">{distinctVendors.length} Vendors</div>
          <div className="text-[10px] text-slate-500">{savedVendors.length} saved reusable templates</div>
        </div>
      </div>

      {/* Long Search Bar & Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-md p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Long Search Bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Vendor, Bill #, Voucher #, GSTIN, PAN, Expense Category, AWB Ref, Coordinator..."
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
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
              >
                Apply Criteria
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Bills Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-800/50 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No purchase bills found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isAnyFilterActive
                ? 'No vendor bills matched your current filter criteria.'
                : 'Start recording inward vendor bills for packaging boxes, DGD charges, and freight costs.'}
            </p>
            {isAnyFilterActive ? (
              <Button variant="secondary" onClick={handleResetFilters} className="text-xs">
                Reset Filters
              </Button>
            ) : (
              <Button variant="primary" onClick={handleOpenCreateModal} className="text-xs">
                <Plus size={14} className="mr-1.5 inline" /> Record First Purchase Bill
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Voucher / Bill #</th>
                  <th className="py-3 px-4">Vendor / Supplier</th>
                  <th className="py-3 px-4">Category & SAC</th>
                  <th className="py-3 px-4">Bill Date</th>
                  <th className="py-3 px-4 text-right">Taxable (₹)</th>
                  <th className="py-3 px-4 text-right">GST Breakdown</th>
                  <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedBills.map((doc) => {
                  const data = doc.data || {};
                  const cat = EXPENSE_CATEGORIES.find((c) => c.id === data.expenseCategory) || EXPENSE_CATEGORIES[0];
                  const isPaid = doc.status === 'COMPLETED' || doc.status === 'DELIVERED' || Boolean(data.transactionId);
                  const isDraft = doc.status === 'DRAFT';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Voucher & Bill Number */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(doc)}
                            className="text-left font-mono font-bold text-indigo-400 hover:text-indigo-300 underline decoration-dotted underline-offset-4 hover:underline transition-colors"
                            title="Click to view complete purchase bill details & voucher"
                          >
                            {data.billNumber || doc.documentNumber || '—'}
                          </button>
                          {data.billFileBase64 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenViewFile(data.billFileBase64, data.billFileName, data.billFileType);
                              }}
                              title={`View Attached Invoice (${data.billFileName || 'Document'})`}
                              className="text-indigo-400 hover:text-indigo-200 p-0.5 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Paperclip size={13} />
                            </button>
                          )}
                        </div>
                        {data.voucherNumber && data.voucherNumber !== data.billNumber && (
                          <div className="text-[10px] text-slate-500 font-mono">Voucher: {data.voucherNumber}</div>
                        )}
                        {data.airwayBillNo && (
                          <div className="text-[10px] text-slate-400 font-mono">AWB: {data.airwayBillNo}</div>
                        )}
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 truncate max-w-[200px]" title={data.vendorName}>
                          {data.vendorName || '—'}
                        </div>
                        {data.vendorGstin && (
                          <div className="text-[10px] font-mono text-slate-400">GST: {data.vendorGstin}</div>
                        )}
                        {data.vendorBankName && (
                          <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Landmark size={10} className="text-slate-400" /> {data.vendorBankName}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${cat.color}`}>
                          {cat.label}
                        </span>
                        {data.hsnSacCode && (
                          <div className="text-[9px] font-mono text-slate-500 mt-0.5">HSN/SAC: {data.hsnSacCode}</div>
                        )}
                      </td>

                      {/* Bill Date */}
                      <td className="py-3 px-4 text-slate-400">
                        {data.billDate ? new Date(data.billDate).toLocaleDateString('en-IN') : '—'}
                        {data.dueDate && (
                          <div className="text-[10px] text-slate-500">
                            Due: {new Date(data.dueDate).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Taxable */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {(() => {
                          const brk = getBillGstBreakdown(data);
                          return `₹${formatINR(brk.taxable)}`;
                        })()}
                      </td>

                      {/* GST Split */}
                      <td className="py-3 px-4 text-right font-mono text-[11px]">
                        {(() => {
                          const brk = getBillGstBreakdown(data);
                          if (brk.isInterState) {
                            return (
                              <div className="text-indigo-300 font-semibold">
                                IGST ({brk.gstRate}%): ₹{formatINR(brk.igst)}
                              </div>
                            );
                          }
                          return (
                            <div>
                              <div className="text-slate-200 font-medium">
                                CGST+SGST ({brk.gstRate}%): ₹{formatINR(brk.totalGst)}
                              </div>
                              {brk.totalGst > 0 && (
                                <div className="text-[10px] text-slate-400">
                                  (CGST: ₹{formatINR(brk.cgst)} | SGST: ₹{formatINR(brk.sgst)})
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {data.tdsAmount > 0 && (
                          <div className="text-[10px] text-amber-400 font-mono">TDS: -₹{formatINR(data.tdsAmount)}</div>
                        )}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                        {(() => {
                          const brk = getBillGstBreakdown(data);
                          return (
                            <>
                              <div>₹{formatINR(brk.grandTotal)}</div>
                              {data.netPayable && parseFloat(data.netPayable) !== brk.grandTotal && (
                                <div className="text-[10px] text-emerald-400 font-normal">
                                  Net: ₹{formatINR(data.netPayable)}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} /> Paid
                          </span>
                        ) : isDraft ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(doc)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                            title="View Voucher Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(doc)}
                            className={`p-1.5 rounded transition-colors ${
                              isPaid
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-amber-400 hover:bg-amber-500/10'
                            }`}
                            title={isPaid ? 'View Payment Settlement' : 'Record Payment Settlement'}
                          >
                            <CreditCard size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(doc)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                            title="Edit Purchase Bill"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBill(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                            title="Delete"
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
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBills.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* =========================================================================
          MODAL: RECORD / EDIT PURCHASE BILL (Indian GST Form with Smart Auto-Fill)
          ========================================================================= */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-md max-w-4xl w-full max-h-[92vh] flex flex-col p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  <ShoppingBag size={17} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                    <span>{editingBill ? 'Edit Purchase / Vendor Bill' : 'Record New Purchase Bill (Inward Invoice)'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attach invoice PDF/scan to auto-extract details or fill fields manually.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  title="Reset / clear form fields"
                  className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-indigo-400 rounded transition-colors flex items-center gap-1.5 font-medium border border-slate-700/60 cursor-pointer"
                >
                  <RotateCcw size={13} className="text-amber-400" />
                  <span>Reset Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-100 p-1.5 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* AI Extraction State Alerts */}
            {isExtracting && (
              <div className="p-3 bg-indigo-600/15 border border-indigo-500/30 rounded text-xs text-indigo-300 flex items-center gap-2.5 animate-pulse shrink-0">
                <Loader2 size={16} className="animate-spin text-indigo-400 shrink-0" />
                <span>
                  <strong>Smart Extractor:</strong> Reading invoice data from uploaded file (Vendor, GSTIN, Bill #, Amounts)...
                </span>
              </div>
            )}

            {extractSuccess && !isExtracting && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center justify-between animate-fade-in shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400 shrink-0" />
                  <span>{extractSuccess}</span>
                </div>
                <div className="flex items-center gap-2">
                  {lastExtractedData && (
                    <button
                      type="button"
                      onClick={() => triggerAutoExtraction(formData.billFileBase64, formData.billFileName, true)}
                      className="text-[11px] underline text-indigo-300 hover:text-white"
                    >
                      Overwrite all with scanned data
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-emerald-400 hover:text-white font-bold text-xs"
                    onClick={() => setExtractSuccess('')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSaveBill} className="flex-1 overflow-y-auto space-y-4 pr-1.5 text-xs custom-modal-scroll">
              {/* Section 1: Document Attachment & Manual Extraction */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                    <Paperclip size={14} className="text-indigo-400" /> 1. Upload Vendor Bill / Invoice
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Upload document & click <strong className="text-indigo-400 font-semibold">"Extract Details"</strong> when ready
                  </span>
                </div>

                <div className="p-3 bg-slate-900 border border-dashed border-slate-800 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
                  {formData.billFileBase64 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <Paperclip size={15} className="text-indigo-400 shrink-0" />
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.billFileBase64) {
                              const win = window.open();
                              if (win) {
                                win.document.write(
                                  `<html><head><title>${formData.billFileName || 'Attached Document'}</title></head><body style="margin:0;background:#0f172a;"><iframe src="${formData.billFileBase64}" frameborder="0" style="border:0; width:100%; height:100vh;" allowfullscreen></iframe></body></html>`
                                );
                              } else {
                                setViewFileModal(formData.billFileBase64);
                              }
                            }
                          }}
                          className="text-slate-200 hover:text-indigo-300 underline underline-offset-2 text-xs font-medium truncate max-w-[240px] text-left cursor-pointer transition-colors"
                          title="Click to open / view in new tab"
                        >
                          {formData.billFileName || 'Attached Document'}
                        </button>
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold shrink-0">
                          Attached
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.billFileBase64) {
                              const win = window.open();
                              if (win) {
                                win.document.write(
                                  `<html><head><title>${formData.billFileName || 'Attached Document'}</title></head><body style="margin:0;background:#0f172a;"><iframe src="${formData.billFileBase64}" frameborder="0" style="border:0; width:100%; height:100vh;" allowfullscreen></iframe></body></html>`
                                );
                              } else {
                                setViewFileModal(formData.billFileBase64);
                              }
                            }
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                          title="Open attached document in new tab"
                        >
                          <ExternalLink size={13} className="text-indigo-400" />
                          <span>View (New Tab)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerAutoExtraction(formData.billFileBase64, formData.billFileName, false)}
                          disabled={isExtracting}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Sparkles size={13} className={isExtracting ? 'animate-spin' : ''} />
                          <span>{isExtracting ? 'Scanning Document...' : 'Extract Details'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, billFileBase64: null, billFileName: '' });
                            setExtractSuccess('');
                            setLastExtractedData(null);
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2.5 py-1.5 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors"
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

              {/* Section 2: Vendor / Supplier Information */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                    <Building size={14} className="text-indigo-400" /> 2. Vendor / Supplier Information
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Direct template autofill or manual entry
                  </span>
                </div>

                {/* Quick Autofill from Saved Vendor Templates */}
                <div className="p-2.5 bg-indigo-950/40 border border-indigo-500/25 rounded-md space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium shrink-0">
                      <Bookmark size={13} className="text-amber-400 shrink-0" />
                      <span>Auto-Fill from Saved Vendor Template:</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:max-w-md">
                      <select
                        value={selectedVendorTemplateId}
                        onChange={(e) => handleSelectVendorTemplate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-indigo-500/40 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
                      >
                        <option value="">-- Choose from Saved Vendor Templates ({savedVendors.length}) --</option>
                        {savedVendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            [{v.category || 'VENDOR'}] {v.name} {v.gstin ? `• GST: ${v.gstin}` : ''}
                          </option>
                        ))}
                      </select>
                      {selectedVendorTemplateId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVendorTemplateId('');
                            setTemplateAutoFillToast('');
                          }}
                          className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded shrink-0"
                          title="Clear template selection"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {templateAutoFillToast && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 animate-fade-in font-medium">
                      <Check size={13} className="shrink-0" /> {templateAutoFillToast}
                    </div>
                  )}

                  {vendorSaveSuccessToast && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 animate-fade-in font-medium">
                      <Check size={13} className="shrink-0" /> {vendorSaveSuccessToast}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Vendor / Company Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vendorName}
                      onChange={(e) => {
                        setFormData({ ...formData, vendorName: e.target.value });
                        if (selectedVendorTemplateId) setSelectedVendorTemplateId('');
                      }}
                      placeholder="e.g. DGR PACKAGING COMPANY / Airline Cargo / CHA"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Vendor GSTIN (15 Digits)
                    </label>
                    <input
                      type="text"
                      value={formData.vendorGstin}
                      onChange={(e) => {
                        const gstin = e.target.value.toUpperCase();
                        const state = getIndianStateFromGstin(gstin);
                        const taxType = gstin.startsWith('27') || !gstin ? 'INTRA_STATE' : 'INTER_STATE';
                        const calculations = calculateGstBreakdown(formData.taxableAmount, formData.gstRate, taxType, formData.tdsSection);

                        setFormData({
                          ...formData,
                          vendorGstin: gstin,
                          placeOfSupply: state || formData.placeOfSupply,
                          taxType,
                          ...calculations,
                        });
                      }}
                      placeholder="e.g. 27CBKPK7600K1ZE"
                      maxLength={15}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Vendor PAN
                    </label>
                    <input
                      type="text"
                      value={formData.vendorPan}
                      onChange={(e) => setFormData({ ...formData, vendorPan: e.target.value.toUpperCase() })}
                      placeholder="e.g. CBKPK7600K"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Vendor Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.vendorAddress}
                      onChange={(e) => setFormData({ ...formData, vendorAddress: e.target.value })}
                      placeholder="e.g. Shop No. 2, Near Sahar Cargo Complex, Andheri (E), Mumbai"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Place of Supply (POS)
                    </label>
                    <select
                      value={formData.placeOfSupply}
                      onChange={(e) => {
                        const pos = e.target.value;
                        const taxType = pos.includes('(27)') ? 'INTRA_STATE' : 'INTER_STATE';
                        const calculations = calculateGstBreakdown(formData.taxableAmount, formData.gstRate, taxType, formData.tdsSection);
                        setFormData({ ...formData, placeOfSupply: pos, taxType, ...calculations });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {Object.entries(INDIAN_GST_STATES).map(([code, name]) => (
                        <option key={code} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vendor Bank Account Details (Extracted for Easy RTGS/NEFT Payment) */}
                <div className="p-3 bg-slate-900/90 border border-slate-800/90 rounded space-y-2">
                  <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Landmark size={13} className="text-indigo-400" /> Vendor Bank Account Details (For RTGS / NEFT Settlements)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Bank Name</label>
                      <input
                        type="text"
                        value={formData.vendorBankName}
                        onChange={(e) => setFormData({ ...formData, vendorBankName: e.target.value })}
                        placeholder="e.g. HDFC BANK LTD"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">A/c Number</label>
                      <input
                        type="text"
                        value={formData.vendorBankAccount}
                        onChange={(e) => setFormData({ ...formData, vendorBankAccount: e.target.value })}
                        placeholder="e.g. 06687630000070"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">IFSC / RTGS Code</label>
                      <input
                        type="text"
                        value={formData.vendorBankIfsc}
                        onChange={(e) => setFormData({ ...formData, vendorBankIfsc: e.target.value.toUpperCase() })}
                        placeholder="e.g. HDFC0003126"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Branch</label>
                      <input
                        type="text"
                        value={formData.vendorBankBranch}
                        onChange={(e) => setFormData({ ...formData, vendorBankBranch: e.target.value })}
                        placeholder="e.g. MAHAD-4"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Save as Template button when filling manually */}
                {formData.vendorName.trim() && (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400 text-[10px]">
                      Save vendor profile to directory for 1-click autofill in future bills.
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveCurrentAsVendorTemplate}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Bookmark size={12} className="text-amber-400" />
                      Save as Vendor Template
                    </button>
                  </div>
                )}
              </div>

              {/* Section 3: Bill Identification & Dates */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                    <FileText size={14} className="text-indigo-400" /> 3. Invoice & Shipment Details
                  </div>
                  <span className="text-[10px] text-slate-400">Indian FY 2026-27 Format</span>
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
                      placeholder="e.g. DGR/0495/26-27"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Internal Purchase Voucher #
                    </label>
                    <input
                      type="text"
                      value={formData.voucherNumber}
                      onChange={(e) => setFormData({ ...formData, voucherNumber: e.target.value })}
                      placeholder="e.g. PB/26-27/0005"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
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
                      Expense Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.expenseCategory}
                      onChange={(e) => {
                        const catId = e.target.value;
                        const catObj = EXPENSE_CATEGORIES.find((c) => c.id === catId);
                        setFormData({
                          ...formData,
                          expenseCategory: catId,
                          hsnSacCode: catObj?.sac || formData.hsnSacCode,
                        });
                      }}
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
                      HSN / SAC Code
                    </label>
                    <input
                      type="text"
                      value={formData.hsnSacCode}
                      onChange={(e) => setFormData({ ...formData, hsnSacCode: e.target.value })}
                      placeholder="e.g. 39233090 / 4819 / 9965"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

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
                </div>

                {/* Additional Reference & Delivery Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Reference / Coordinator
                    </label>
                    <input
                      type="text"
                      value={formData.referenceName}
                      onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                      placeholder="e.g. Mayur Kadam"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="e.g. 9028345261"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Shipped-To Warehouse / Site
                    </label>
                    <input
                      type="text"
                      value={formData.shippedToName}
                      onChange={(e) => setFormData({ ...formData, shippedToName: e.target.value })}
                      placeholder="e.g. Sai Warehouse & Transport, Bhiwandi"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Service / Product Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. UN APPROVED Y 75 OPEN TOP DRUM & Transport Charges"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Section 4: Indian GST Calculation & TDS Breakdown */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                    <CreditCard size={14} className="text-indigo-400" /> 4. GST Breakdown & Financials
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Currency: INR (₹)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium border border-slate-700">
                      {formData.taxType === 'INTRA_STATE' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Taxable Amount (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.taxableAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        const calculations = calculateGstBreakdown(val, formData.gstRate, formData.taxType, formData.tdsSection);
                        setFormData({ ...formData, ...calculations });
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors font-bold"
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
                        const calculations = calculateGstBreakdown(formData.taxableAmount, rate, formData.taxType, formData.tdsSection);
                        setFormData({ ...formData, ...calculations });
                      }}
                    >
                      <option value="0">0% (Nil / Exempt)</option>
                      <option value="5">5% (Goods / GTA)</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% (Standard Services)</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Tax Structure
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.taxType}
                      onChange={(e) => {
                        const t = e.target.value;
                        const calculations = calculateGstBreakdown(formData.taxableAmount, formData.gstRate, t, formData.tdsSection);
                        setFormData({ ...formData, ...calculations });
                      }}
                    >
                      <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                      <option value="INTER_STATE">Inter-State (IGST)</option>
                      <option value="EXEMPT">Non-GST / Exempt</option>
                    </select>
                  </div>
                </div>

                {/* GST Split & Total Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-900/90 rounded border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {formData.taxType === 'INTRA_STATE' ? `CGST (${formData.gstRate / 2}%)` : 'CGST'}
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      ₹{formatINR(formData.cgstAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {formData.taxType === 'INTRA_STATE' ? `SGST (${formData.gstRate / 2}%)` : 'SGST'}
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      ₹{formatINR(formData.sgstAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {formData.taxType === 'INTER_STATE' ? `IGST (${formData.gstRate}%)` : 'IGST'}
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      ₹{formatINR(formData.igstAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-300 font-medium block">Total GST</span>
                    <span className="font-mono font-bold text-indigo-400">
                      ₹{formatINR(formData.totalGst)}
                    </span>
                  </div>
                </div>

                {/* TDS Deduction (Optional) & ITC Eligibility */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      TDS Deduction (Income Tax)
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.tdsSection}
                      onChange={(e) => {
                        const sec = e.target.value;
                        const calculations = calculateGstBreakdown(formData.taxableAmount, formData.gstRate, formData.taxType, sec);
                        setFormData({ ...formData, ...calculations });
                      }}
                    >
                      {TDS_SECTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Input Tax Credit (ITC)
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.itcEligibility}
                      onChange={(e) => setFormData({ ...formData, itcEligibility: e.target.value })}
                    >
                      <option value="ELIGIBLE">Eligible for ITC (Standard)</option>
                      <option value="INELIGIBLE">Ineligible / Blocked (Sec 17(5))</option>
                      <option value="RCM">Reverse Charge Mechanism (RCM)</option>
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

                {formData.tdsAmount > 0 && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded flex items-center justify-between text-xs text-amber-300">
                    <span>
                      TDS @ {formData.tdsRate}% (₹{formatINR(formData.tdsAmount)}) deducted from Grand Total.
                    </span>
                    <span className="font-bold font-mono">
                      Net Vendor Payable: ₹{formatINR(formData.netPayable)}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 5: Settlement & Payment Details */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                    <CheckCircle2 size={14} className="text-indigo-400" /> 5. Payment Status & Settlement Proof
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Payment Status
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ISSUED">Pending Payment (Unpaid)</option>
                      <option value="COMPLETED">Already Paid / Settled</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Payment Mode
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    >
                      <option value="NEFT_RTGS">Bank Transfer (NEFT / RTGS / IMPS)</option>
                      <option value="UPI">UPI / GPay / PhonePe / QR</option>
                      <option value="CHEQUE">Bank Cheque / DD</option>
                      <option value="NETBANKING">Corporate Netbanking</option>
                      <option value="CASH">Cash (Petty Cash)</option>
                      <option value="CREDIT_CARD">Corporate Credit Card</option>
                    </select>
                  </div>
                </div>

                {/* If status is COMPLETED or user has entered transaction info */}
                {(formData.status === 'COMPLETED' || formData.transactionId) && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded space-y-2.5 animate-fade-in">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Settlement / Bank Reference:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Bank / Source</label>
                        <input
                          type="text"
                          value={formData.bankName || formData.vendorBankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          placeholder="e.g. HDFC Bank Ltd"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">UTR / Txn Ref / Cheque #</label>
                        <input
                          type="text"
                          value={formData.transactionId}
                          onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                          placeholder="e.g. UTR12345678 / CHQ-0098"
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

                {/* Checkbox to auto-save vendor to templates */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveVendorToTemplatesChecked}
                      onChange={(e) => setSaveVendorToTemplatesChecked(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span>Save / update this vendor in saved templates directory for 1-click reuse</span>
                  </label>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 shrink-0 border-t border-slate-800">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleResetForm}
                  className="rounded text-xs px-3.5 py-2"
                >
                  <RotateCcw size={13} className="mr-1.5 inline text-amber-400" /> Reset Form
                </Button>
                <div className="flex items-center gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW BILL VOUCHER DETAIL & GST BREAKDOWN
          ========================================================================= */}
      {viewDetailModal && (() => {
        const data = viewDetailModal.data || {};
        const cat = EXPENSE_CATEGORIES.find((c) => c.id === data.expenseCategory) || EXPENSE_CATEGORIES[0];
        const isPaid = viewDetailModal.status === 'COMPLETED' || viewDetailModal.status === 'DELIVERED' || Boolean(data.transactionId);
        const logs = data.activityLogs || [];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => setViewDetailModal(null)}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-md max-w-2xl w-full max-h-[90vh] flex flex-col p-5 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>Vendor Bill #{data.billNumber || viewDetailModal.documentNumber}</span>
                      {isPaid ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Voucher Ref: {data.voucherNumber || viewDetailModal.documentNumber} • Recorded on{' '}
                      {new Date(data.billDate || viewDetailModal.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewDetailModal(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1 custom-modal-scroll">
                {/* Vendor Details Box */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={13} className="text-indigo-400" /> Vendor / Supplier Info
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vendor Name</span>
                      <span className="font-semibold text-slate-100">{data.vendorName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vendor GSTIN</span>
                      <span className="font-mono text-slate-200">{data.vendorGstin || 'Unregistered'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Vendor PAN</span>
                      <span className="font-mono text-slate-200">{data.vendorPan || '—'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-slate-500 block text-[10px]">Address & Place of Supply</span>
                      <span>{data.vendorAddress || '—'} • POS: {data.placeOfSupply || 'Maharashtra (27)'}</span>
                    </div>
                  </div>

                  {/* Vendor Bank Details */}
                  {(data.vendorBankName || data.vendorBankAccount) && (
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded mt-2 text-[11px]">
                      <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1">
                        <Landmark size={12} /> Vendor Bank Details (For RTGS / NEFT):
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[9px]">Bank</span>
                          <span>{data.vendorBankName || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">A/c Number</span>
                          <span className="font-mono">{data.vendorBankAccount || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">IFSC Code</span>
                          <span className="font-mono">{data.vendorBankIfsc || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Branch</span>
                          <span>{data.vendorBankBranch || '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expense Details Box */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={13} className="text-indigo-400" /> Expense Classification & Reference
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Category</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HSN / SAC Code</span>
                      <span className="font-mono text-slate-200">{data.hsnSacCode || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Linked Shipment / AWB</span>
                      <span className="font-mono text-slate-200">{data.airwayBillNo || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Coordinator / Ref</span>
                      <span className="text-slate-200">{data.referenceName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Contact</span>
                      <span className="font-mono text-slate-200">{data.contactNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Shipped-To Site</span>
                      <span className="text-slate-200">{data.shippedToName || '—'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-slate-500 block text-[10px]">Service Description</span>
                      <span className="text-slate-300">{data.description || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Financials & GST Summary Box */}
                {(() => {
                  const brk = getBillGstBreakdown(data);
                  return (
                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2.5">
                      <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator size={13} className="text-indigo-400" /> Tax & Amount Breakdown
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-200">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Taxable Amount</span>
                          <span className="font-mono font-bold text-slate-100">₹{formatINR(brk.taxable)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">
                            {brk.isInterState ? 'IGST' : 'CGST + SGST'} ({brk.gstRate}%)
                          </span>
                          <span className="font-mono text-slate-100 font-bold">₹{formatINR(brk.totalGst)}</span>
                          {!brk.isInterState && brk.totalGst > 0 && (
                            <span className="block text-[9px] text-slate-400 font-mono">
                              (CGST: ₹{formatINR(brk.cgst)} | SGST: ₹{formatINR(brk.sgst)})
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Grand Total</span>
                          <span className="font-mono font-bold text-indigo-400">₹{formatINR(brk.grandTotal)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ITC Eligibility</span>
                          <span className="font-semibold text-emerald-400">{data.itcEligibility || 'ELIGIBLE'}</span>
                        </div>
                      </div>
                      {data.tdsAmount > 0 && (
                        <div className="pt-1 border-t border-slate-800 text-[11px] flex items-center justify-between text-amber-300">
                          <span>TDS Deducted ({data.tdsSection}): -₹{formatINR(data.tdsAmount)}</span>
                          <span className="font-mono font-bold">Net Payable: ₹{formatINR(data.netPayable)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Settlement Information */}
                {isPaid && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded space-y-2">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Payment Settlement Proof
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Mode</span>
                        <span className="text-slate-200 font-medium">{data.paymentMode || 'NEFT/RTGS'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">UTR / Txn Ref #</span>
                        <span className="font-mono text-slate-200">{data.transactionId || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Settled Date</span>
                        <span className="text-slate-200">
                          {data.paidDate ? new Date(data.paidDate).toLocaleDateString('en-IN') : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attached File Preview link */}
                {data.billFileBase64 && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip size={15} className="text-indigo-400" />
                      <span className="text-slate-200 font-medium truncate max-w-[280px]">
                        {data.billFileName || 'Attached Invoice PDF/Scan'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewFileModal(data.billFileBase64)}
                      className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye size={12} /> View File
                    </button>
                  </div>
                )}

                {/* Activity Logs */}
                {logs.length > 0 && (
                  <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History size={13} /> Activity Audit Trail
                    </div>
                    <div className="space-y-1.5">
                      {logs.map((log) => (
                        <div key={log.id} className="text-[11px] text-slate-400 flex items-start gap-2">
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {formatActivityDate(log.timestamp)}
                          </span>
                          <span className="text-slate-300">{log.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => setViewDetailModal(null)}
                  className="rounded text-xs px-4"
                >
                  Close
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setViewDetailModal(null);
                      handleOpenPaymentModal(viewDetailModal);
                    }}
                    className="rounded text-xs"
                  >
                    <CreditCard size={13} className="mr-1.5 inline text-amber-400" />
                    {isPaid ? 'Update Payment' : 'Record Payment'}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setViewDetailModal(null);
                      handleOpenEditModal(viewDetailModal);
                    }}
                    className="rounded text-xs bg-indigo-600 hover:bg-indigo-500"
                  >
                    <Pencil size={13} className="mr-1.5 inline" /> Edit Bill
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL: VIEW ATTACHED FILE
          ========================================================================= */}
      {viewFileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setViewFileModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-md max-w-4xl w-full p-5 shadow-2xl space-y-3 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* =========================================================================
          MODAL: RECORD / UPDATE PAYMENT SETTLEMENT
          ========================================================================= */}
      {recordPaymentModal && (() => {
        const isAlreadyPaid = recordPaymentModal.status === 'COMPLETED' || recordPaymentModal.status === 'DELIVERED' || Boolean(recordPaymentModal.data?.transactionId);
        const data = recordPaymentModal.data || {};
        const currentMode = data.paymentMode || 'NEFT_RTGS';
        const currentBank = data.bankName || data.vendorBankName || '';
        const currentTxn = data.transactionId || data.paymentInfo?.transactionId || '';
        const currentPaidDate = data.paidDate || data.paymentInfo?.paymentDate || data.billDate || TODAY_DATE_STR;
        const currentRemarks = data.remarks || data.paymentInfo?.remarks || '';
        const billTotal = data.netPayable || data.grandTotal || 0;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => setRecordPaymentModal(null)}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-md max-w-md w-full p-5 shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <CreditCard size={17} className="text-indigo-400" />
                      <span>{isAlreadyPaid ? 'Vendor Payment Details' : 'Record Vendor Payment'}</span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bill #{data.billNumber || recordPaymentModal.documentNumber} • {data.vendorName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecordPaymentModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Total Payable Amount:</div>
                <div className="text-xl font-bold font-mono text-indigo-400">₹{formatINR(billTotal)}</div>
                {data.tdsAmount > 0 && (
                  <div className="text-[10px] text-amber-400">After TDS of ₹{formatINR(data.tdsAmount)}</div>
                )}
                {data.vendorBankAccount && (
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 mt-1 font-mono">
                    Vendor Bank: {data.vendorBankName} • A/c: {data.vendorBankAccount} • IFSC: {data.vendorBankIfsc}
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  handleQuickRecordPayment(recordPaymentModal.id, {
                    paymentMode: form.paymentMode.value,
                    bankName: form.bankName.value,
                    transactionId: form.transactionId.value,
                    paymentDate: form.paidDate.value,
                    remarks: form.remarks.value,
                  });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Payment Mode</label>
                  <select
                    name="paymentMode"
                    defaultValue={currentMode}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NEFT_RTGS">Bank Transfer (NEFT / RTGS / IMPS)</option>
                    <option value="UPI">UPI / GPay / PhonePe / QR</option>
                    <option value="CHEQUE">Bank Cheque / DD</option>
                    <option value="NETBANKING">Corporate Netbanking</option>
                    <option value="CASH">Cash (Petty Cash)</option>
                    <option value="CREDIT_CARD">Corporate Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Bank Name / Account</label>
                  <input
                    type="text"
                    name="bankName"
                    defaultValue={currentBank}
                    placeholder="e.g. HDFC Bank Ltd (Current A/c)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">UTR / Txn Ref / Cheque #</label>
                  <input
                    type="text"
                    name="transactionId"
                    defaultValue={currentTxn}
                    placeholder="e.g. UTR12345678"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    name="paidDate"
                    defaultValue={currentPaidDate}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Payment Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    defaultValue={currentRemarks}
                    placeholder="e.g. Paid via HDFC netbanking for DGD and box charges"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button variant="secondary" type="button" onClick={() => setRecordPaymentModal(null)} className="text-xs">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-500">
                    <CheckCircle2 size={13} className="mr-1.5 inline" /> Save Settlement Proof
                  </Button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
