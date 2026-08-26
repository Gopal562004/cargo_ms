import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  Percent,
  Sliders,
  DollarSign,
  FileText,
  Filter,
  Calculator,
} from 'lucide-react';
import Button from '../ui/Button';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { filterDocumentsByFY } from '../../store/financialYearStore';

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Available Export Column Definitions
export const EXPORT_COLUMNS = [
  // 1. Core & Identification
  { id: 'invoiceNumber', label: 'Invoice #', group: 'core', defaultSelected: true },
  { id: 'invoiceDate', label: 'Invoice Date', group: 'core', defaultSelected: true },
  { id: 'financialYear', label: 'Financial Year', group: 'core', defaultSelected: true },
  { id: 'status', label: 'Status', group: 'core', defaultSelected: true },
  { id: 'supplyType', label: 'Supply Type (B2B/B2C)', group: 'core', defaultSelected: true },
  { id: 'reverseCharge', label: 'Reverse Charge (RCM)', group: 'core', defaultSelected: false },

  // 2. Buyer & Party Details
  { id: 'buyerName', label: 'Buyer Name', group: 'party', defaultSelected: true },
  { id: 'buyerGstin', label: 'Buyer GSTIN', group: 'party', defaultSelected: true },
  { id: 'buyerState', label: 'Buyer State & Code', group: 'party', defaultSelected: true },
  { id: 'placeOfSupply', label: 'Place of Supply', group: 'party', defaultSelected: true },
  { id: 'buyerAddress', label: 'Buyer Address', group: 'party', defaultSelected: false },
  { id: 'contactPerson', label: 'Contact Person / Phone', group: 'party', defaultSelected: false },

  // 3. Shipping / Consignee
  { id: 'consigneeName', label: 'Shipper / Consignee Name', group: 'shipping', defaultSelected: true },
  { id: 'consigneeState', label: 'Shipper State', group: 'shipping', defaultSelected: false },
  { id: 'airwayBillNo', label: 'AWB / LR / PO Number', group: 'shipping', defaultSelected: true },

  // 4. Products & Line Items
  { id: 'itemDescriptions', label: 'Product / Service Description', group: 'items', defaultSelected: true },
  { id: 'hsnCodes', label: 'HSN / SAC Codes', group: 'items', defaultSelected: true },
  { id: 'quantities', label: 'Total Quantity & Units', group: 'items', defaultSelected: true },
  { id: 'itemRates', label: 'Unit Rates / Prices', group: 'items', defaultSelected: false },

  // 5. Taxes & Financial Values
  { id: 'taxableAmount', label: 'Taxable Value (₹)', group: 'tax', defaultSelected: true },
  { id: 'cgstAmount', label: 'CGST (₹)', group: 'tax', defaultSelected: true },
  { id: 'sgstAmount', label: 'SGST (₹)', group: 'tax', defaultSelected: true },
  { id: 'igstAmount', label: 'IGST (₹)', group: 'tax', defaultSelected: true },
  { id: 'totalGst', label: 'Total GST (₹)', group: 'tax', defaultSelected: true },
  { id: 'grandTotal', label: 'Grand Total (₹)', group: 'tax', defaultSelected: true },
  { id: 'amountInWords', label: 'Amount in Words', group: 'tax', defaultSelected: false },

  // 6. Payment Settlement
  { id: 'paymentStatus', label: 'Payment Status', group: 'payment', defaultSelected: true },
  { id: 'paymentMode', label: 'Payment Mode', group: 'payment', defaultSelected: true },
  { id: 'transactionId', label: 'Transaction UTR / Ref ID', group: 'payment', defaultSelected: true },
  { id: 'paidDate', label: 'Payment Received Date', group: 'payment', defaultSelected: true },
  { id: 'amountPaid', label: 'Amount Paid (₹)', group: 'payment', defaultSelected: false },
  { id: 'paymentRemarks', label: 'Payment Remarks', group: 'payment', defaultSelected: false },
];

export const COLUMN_GROUPS = [
  { id: 'core', label: 'Invoice & Core Info', icon: FileText },
  { id: 'party', label: 'Buyer / Client Details', icon: Building },
  { id: 'shipping', label: 'Shipping & AWB Details', icon: Layers },
  { id: 'items', label: 'Item & HSN Details', icon: Sliders },
  { id: 'tax', label: 'Taxes & Financial Totals', icon: Percent },
  { id: 'payment', label: 'Payment & Settlement Details', icon: CreditCard },
];

export default function BillingExportModal({
  isOpen,
  onClose,
  allInvoices = [],
  activeFY = '2026-27',
  financialYears = [],
}) {
  useBodyScrollLock(isOpen);

  // 1. FY & Scope Filter States
  const [selectedFY, setSelectedFY] = useState(activeFY || '2026-27');
  const [dateRangePreset, setDateRangePreset] = useState('ALL'); // 'ALL', 'FY_FULL', 'THIS_MONTH', 'LAST_MONTH', 'Q1', 'Q2', 'Q3', 'Q4', 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'COMPLETED', 'ISSUED', 'DRAFT', 'EXCLUDE_CANCELLED'
  const [buyerFilter, setBuyerFilter] = useState('ALL');
  const [exportMode, setExportMode] = useState('SUMMARY'); // 'SUMMARY' | 'BREAKDOWN' | 'GSTR1'
  const [includeFinancialSummaryInCsv, setIncludeFinancialSummaryInCsv] = useState(true);

  // 2. Column Selection State
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const initial = {};
    EXPORT_COLUMNS.forEach((col) => {
      initial[col.id] = col.defaultSelected;
    });
    return initial;
  });

  // Distinct Buyer list from all invoices
  const distinctBuyers = useMemo(() => {
    return Array.from(
      new Set(
        allInvoices
          .map((d) => (d.data?.buyerName || '').trim())
          .filter(Boolean)
      )
    ).sort();
  }, [allInvoices]);

  // Filter invoices based on user selections
  const matchingInvoices = useMemo(() => {
    // 1. FY Filter
    let list = selectedFY === 'ALL' ? allInvoices : filterDocumentsByFY(allInvoices, selectedFY);

    // 2. Status Filter
    if (statusFilter === 'COMPLETED') {
      list = list.filter((d) => d.status === 'COMPLETED' || d.status === 'DELIVERED');
    } else if (statusFilter === 'ISSUED') {
      list = list.filter((d) => d.status === 'ISSUED');
    } else if (statusFilter === 'DRAFT') {
      list = list.filter((d) => d.status === 'DRAFT');
    } else if (statusFilter === 'EXCLUDE_CANCELLED') {
      list = list.filter((d) => d.status !== 'CANCELLED');
    }

    // 3. Buyer Filter
    if (buyerFilter !== 'ALL') {
      list = list.filter((d) => (d.data?.buyerName || '').trim() === buyerFilter);
    }

    // 4. Date Range Filter
    if (dateRangePreset !== 'ALL') {
      list = list.filter((doc) => {
        const d = doc.data || {};
        const dateStr = d.invoiceDate || doc.createdAt;
        if (!dateStr) return true;

        let docDate;
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) docDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          docDate = new Date(dateStr);
        }

        if (!docDate || isNaN(docDate.getTime())) return true;

        const now = new Date();

        if (dateRangePreset === 'THIS_MONTH') {
          return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
        } else if (dateRangePreset === 'LAST_MONTH') {
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return docDate.getMonth() === prevMonth && docDate.getFullYear() === prevYear;
        } else if (dateRangePreset === 'Q1') {
          return docDate.getMonth() >= 3 && docDate.getMonth() <= 5;
        } else if (dateRangePreset === 'Q2') {
          return docDate.getMonth() >= 6 && docDate.getMonth() <= 8;
        } else if (dateRangePreset === 'Q3') {
          return docDate.getMonth() >= 9 && docDate.getMonth() <= 11;
        } else if (dateRangePreset === 'Q4') {
          return docDate.getMonth() >= 0 && docDate.getMonth() <= 2;
        } else if (dateRangePreset === 'CUSTOM') {
          if (customStartDate && docDate < new Date(customStartDate)) return false;
          if (customEndDate && docDate > new Date(customEndDate + 'T23:59:59')) return false;
          return true;
        }
        return true;
      });
    }

    return list;
  }, [allInvoices, selectedFY, dateRangePreset, customStartDate, customEndDate, statusFilter, buyerFilter]);

  // Real-time financial calculations of matching invoices
  const totals = useMemo(() => {
    let count = matchingInvoices.length;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let grandTotal = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let b2bCount = 0;
    let b2cCount = 0;
    let lineItemsCount = 0;

    matchingInvoices.forEach((doc) => {
      const d = doc.data || {};
      const items = d.items || [];
      lineItemsCount += items.length || 1;

      const taxable = parseFloat(d.totalTaxable || 0);
      const cgst = parseFloat(d.totalCGST || 0);
      const sgst = parseFloat(d.totalSGST || 0);
      const igst = parseFloat(d.totalIGST || 0);
      const grand = parseFloat(d.grandTotal || d.totalAmount || (taxable + cgst + sgst + igst) || 0);

      totalTaxable += taxable;
      totalCGST += cgst;
      totalSGST += sgst;
      totalIGST += igst;
      grandTotal += grand;

      const isPaid = doc.status === 'COMPLETED' || doc.status === 'DELIVERED' || Boolean(d.transactionId);
      if (isPaid) {
        totalPaid += grand;
      } else {
        totalPending += grand;
      }

      if (d.buyerGstin && d.buyerGstin.trim().length >= 10) {
        b2bCount++;
      } else {
        b2cCount++;
      }
    });

    return {
      count,
      lineItemsCount,
      totalTaxable,
      totalCGST,
      totalSGST,
      totalIGST,
      totalGst: totalCGST + totalSGST + totalIGST,
      grandTotal,
      totalPaid,
      totalPending,
      b2bCount,
      b2cCount,
    };
  }, [matchingInvoices]);

  if (!isOpen) return null;

  // Toggle single column
  const toggleColumn = (id) => {
    setSelectedColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Select all columns
  const selectAllColumns = () => {
    const updated = {};
    EXPORT_COLUMNS.forEach((col) => (updated[col.id] = true));
    setSelectedColumns(updated);
  };

  // Deselect all
  const deselectAllColumns = () => {
    const updated = {};
    EXPORT_COLUMNS.forEach((col) => (updated[col.id] = false));
    setSelectedColumns(updated);
  };

  // Reset to recommended
  const resetRecommendedColumns = () => {
    const updated = {};
    EXPORT_COLUMNS.forEach((col) => (updated[col.id] = col.defaultSelected));
    setSelectedColumns(updated);
  };

  // CSV Generator & Downloader
  const handleExportDownload = () => {
    if (matchingInvoices.length === 0) {
      alert('No invoices match the selected export criteria.');
      return;
    }

    let csvContent = '';
    const activeCols = EXPORT_COLUMNS.filter((c) => selectedColumns[c.id]);

    if (exportMode === 'GSTR1') {
      // Standard Govt GSTR-1 B2B/B2C Template Format
      const gstrHeaders = [
        'GSTIN/UIN of Recipient',
        'Receiver Name',
        'Invoice Number',
        'Invoice Date',
        'Invoice Value',
        'Place of Supply',
        'Reverse Charge',
        'Applicable % of Tax Rate',
        'Invoice Type',
        'E-Commerce GSTIN',
        'Rate',
        'Taxable Value',
        'Cess Amount',
      ];

      const gstrRows = [];
      matchingInvoices.forEach((doc) => {
        const d = doc.data || {};
        const items = d.items || [];
        const invNum = doc.documentNumber || d.invoiceNumber || '';
        const invDate = d.invoiceDate || new Date(doc.createdAt).toLocaleDateString('en-GB');
        const pos = d.placeOfSupply || d.buyerState || '27-Maharashtra';
        const rcm = d.reverseCharge || 'N';
        const isB2B = Boolean(d.buyerGstin && d.buyerGstin.trim().length >= 10);
        const invType = isB2B ? 'Regular' : 'B2C';

        if (items.length > 0) {
          items.forEach((item) => {
            const qty = parseFloat(item.qty || item.quantity || 1) || 1;
            const price = parseFloat(item.price || item.rate || item.unitPrice || 0) || 0;
            const taxable = parseFloat(item.taxableAmount || item.amount || (qty * price)) || (qty * price);
            const gstRate = parseFloat(item.gstRate || ((parseFloat(item.cgstRate || 0) + parseFloat(item.sgstRate || 0) + parseFloat(item.igstRate || 0)) || 18)) || 18;
            const lineTotal = taxable * (1 + gstRate / 100);

            gstrRows.push([
              `"${d.buyerGstin || ''}"`,
              `"${(d.buyerName || '').replace(/"/g, '""')}"`,
              `"${invNum}"`,
              `"${invDate}"`,
              lineTotal.toFixed(2),
              `"${pos}"`,
              `"${rcm}"`,
              '""',
              `"${invType}"`,
              '""',
              gstRate,
              taxable.toFixed(2),
              '0.00',
            ]);
          });
        } else {
          gstrRows.push([
            `"${d.buyerGstin || ''}"`,
            `"${(d.buyerName || '').replace(/"/g, '""')}"`,
            `"${invNum}"`,
            `"${invDate}"`,
            (parseFloat(d.grandTotal) || 0).toFixed(2),
            `"${pos}"`,
            `"${rcm}"`,
            '""',
            `"${invType}"`,
            '""',
            '18',
            (parseFloat(d.totalTaxable) || 0).toFixed(2),
            '0.00',
          ]);
        }
      });

      csvContent = [gstrHeaders.join(','), ...gstrRows.map((r) => r.join(','))].join('\n');
    } else if (exportMode === 'BREAKDOWN') {
      // 1 Row per Line Item
      const headers = [
        ...activeCols.map((c) => `"${c.label}"`),
        '"Line Item Name"',
        '"Item HSN/SAC"',
        '"Item Qty"',
        '"Item Unit"',
        '"Item Unit Price (INR)"',
        '"Item Taxable (INR)"',
        '"Item GST Rate %"',
        '"Item GST Amount (INR)"',
        '"Item Total Amount (INR)"',
      ];

      const rows = [];
      matchingInvoices.forEach((doc) => {
        const d = doc.data || {};
        const items = d.items || [];
        const invNum = doc.documentNumber || d.invoiceNumber || '';
        const invDate = d.invoiceDate || new Date(doc.createdAt).toLocaleDateString('en-GB');

        const baseObj = {
          invoiceNumber: `"${invNum}"`,
          invoiceDate: `"${invDate}"`,
          financialYear: `"${selectedFY === 'ALL' ? (d.financialYear || 'All FY') : selectedFY}"`,
          status: `"${doc.status}"`,
          supplyType: `"${d.buyerGstin && d.buyerGstin.trim().length >= 10 ? 'B2B (Registered)' : 'B2C (Unregistered)'}"`,
          reverseCharge: `"${d.reverseCharge || 'N'}"`,
          buyerName: `"${(d.buyerName || '').replace(/"/g, '""')}"`,
          buyerGstin: `"${d.buyerGstin || ''}"`,
          buyerState: `"${d.buyerState || ''}"`,
          placeOfSupply: `"${d.placeOfSupply || d.buyerState || 'Maharashtra (27)'}"`,
          buyerAddress: `"${(d.buyerAddress || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          contactPerson: `"${d.referenceName || d.contactPerson || ''}"`,
          consigneeName: `"${(d.consigneeName || d.shipperName || '').replace(/"/g, '""')}"`,
          consigneeState: `"${d.consigneeState || ''}"`,
          airwayBillNo: `"${d.airwayBillNo || d.awbNo || d.poNumberAndDate || ''}"`,
          itemDescriptions: `"${items.map((i) => i.description).join(' | ').replace(/"/g, '""')}"`,
          hsnCodes: `"${items.map((i) => i.hsnCode || i.hsn).filter(Boolean).join(' | ')}"`,
          quantities: `"${items.map((i) => `${i.qty || i.quantity || 1} ${i.unit || 'Pcs'}`).join(' | ')}"`,
          itemRates: `"${items.map((i) => (parseFloat(i.price || i.rate) || 0).toFixed(2)).join(' | ')}"`,
          taxableAmount: (parseFloat(d.totalTaxable) || 0).toFixed(2),
          cgstAmount: (parseFloat(d.totalCGST) || 0).toFixed(2),
          sgstAmount: (parseFloat(d.totalSGST) || 0).toFixed(2),
          igstAmount: (parseFloat(d.totalIGST) || 0).toFixed(2),
          totalGst: (parseFloat(d.totalCGST || 0) + parseFloat(d.totalSGST || 0) + parseFloat(d.totalIGST || 0)).toFixed(2),
          grandTotal: (parseFloat(d.grandTotal || d.totalAmount) || 0).toFixed(2),
          amountInWords: `"${(d.amountInWords || '').replace(/"/g, '""')}"`,
          paymentStatus: `"${doc.status === 'COMPLETED' || d.transactionId ? 'PAID' : 'PENDING'}"`,
          paymentMode: `"${d.paymentMode || d.paymentInfo?.paymentMode || ''}"`,
          transactionId: `"${d.transactionId || d.paymentInfo?.transactionId || ''}"`,
          paidDate: `"${d.paidDate || d.paymentInfo?.paymentDate || ''}"`,
          amountPaid: (parseFloat(d.amountPaid || d.paymentInfo?.amountPaid || d.grandTotal) || 0).toFixed(2),
          paymentRemarks: `"${(d.remarks || d.paymentInfo?.remarks || '').replace(/"/g, '""')}"`,
        };

        const baseValues = activeCols.map((c) => baseObj[c.id] || '""');

        if (items.length > 0) {
          items.forEach((it) => {
            const qty = parseFloat(it.qty || it.quantity || 1) || 1;
            const price = parseFloat(it.price || it.rate || it.unitPrice || 0) || 0;
            const taxable = parseFloat(it.taxableAmount || it.amount || (qty * price)) || (qty * price);
            const cgstR = parseFloat(it.cgstRate) || 0;
            const sgstR = parseFloat(it.sgstRate) || 0;
            const igstR = parseFloat(it.igstRate) || 0;
            const gstRate = parseFloat(it.gstRate || (cgstR + sgstR + igstR) || 18);
            const taxAmt = (taxable * gstRate) / 100;
            const lineTotal = taxable + taxAmt;

            rows.push([
              ...baseValues,
              `"${(it.description || '').replace(/"/g, '""')}"`,
              `"${it.hsnCode || it.hsn || ''}"`,
              qty,
              `"${it.unit || 'Pcs'}"`,
              price.toFixed(2),
              taxable.toFixed(2),
              gstRate,
              taxAmt.toFixed(2),
              lineTotal.toFixed(2),
            ]);
          });
        } else {
          rows.push([...baseValues, '""', '""', '1', '"Pcs"', '0.00', '0.00', '18', '0.00', '0.00']);
        }
      });

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      // Summary Mode: 1 Row per Invoice
      const headers = activeCols.map((c) => `"${c.label}"`);

      const rows = matchingInvoices.map((doc) => {
        const d = doc.data || {};
        const items = d.items || [];
        const invNum = doc.documentNumber || d.invoiceNumber || '';
        const invDate = d.invoiceDate || new Date(doc.createdAt).toLocaleDateString('en-GB');

        const colMap = {
          invoiceNumber: `"${invNum}"`,
          invoiceDate: `"${invDate}"`,
          financialYear: `"${selectedFY === 'ALL' ? (d.financialYear || 'All FY') : selectedFY}"`,
          status: `"${doc.status}"`,
          supplyType: `"${d.buyerGstin && d.buyerGstin.trim().length >= 10 ? 'B2B (Registered)' : 'B2C (Unregistered)'}"`,
          reverseCharge: `"${d.reverseCharge || 'N'}"`,
          buyerName: `"${(d.buyerName || '').replace(/"/g, '""')}"`,
          buyerGstin: `"${d.buyerGstin || ''}"`,
          buyerState: `"${d.buyerState || ''}"`,
          placeOfSupply: `"${d.placeOfSupply || d.buyerState || 'Maharashtra (27)'}"`,
          buyerAddress: `"${(d.buyerAddress || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          contactPerson: `"${d.referenceName || d.contactPerson || ''}"`,
          consigneeName: `"${(d.consigneeName || d.shipperName || '').replace(/"/g, '""')}"`,
          consigneeState: `"${d.consigneeState || ''}"`,
          airwayBillNo: `"${d.airwayBillNo || d.awbNo || d.poNumberAndDate || ''}"`,
          itemDescriptions: `"${items.map((i) => i.description).join(' | ').replace(/"/g, '""')}"`,
          hsnCodes: `"${items.map((i) => i.hsnCode || i.hsn).filter(Boolean).join(' | ')}"`,
          quantities: `"${items.map((i) => `${i.qty || i.quantity || 1} ${i.unit || 'Pcs'}`).join(' | ')}"`,
          itemRates: `"${items.map((i) => (parseFloat(i.price || i.rate) || 0).toFixed(2)).join(' | ')}"`,
          taxableAmount: (parseFloat(d.totalTaxable) || 0).toFixed(2),
          cgstAmount: (parseFloat(d.totalCGST) || 0).toFixed(2),
          sgstAmount: (parseFloat(d.totalSGST) || 0).toFixed(2),
          igstAmount: (parseFloat(d.totalIGST) || 0).toFixed(2),
          totalGst: (parseFloat(d.totalCGST || 0) + parseFloat(d.totalSGST || 0) + parseFloat(d.totalIGST || 0)).toFixed(2),
          grandTotal: (parseFloat(d.grandTotal || d.totalAmount) || 0).toFixed(2),
          amountInWords: `"${(d.amountInWords || '').replace(/"/g, '""')}"`,
          paymentStatus: `"${doc.status === 'COMPLETED' || d.transactionId ? 'PAID' : 'PENDING'}"`,
          paymentMode: `"${d.paymentMode || d.paymentInfo?.paymentMode || ''}"`,
          transactionId: `"${d.transactionId || d.paymentInfo?.transactionId || ''}"`,
          paidDate: `"${d.paidDate || d.paymentInfo?.paymentDate || ''}"`,
          amountPaid: (parseFloat(d.amountPaid || d.paymentInfo?.amountPaid || d.grandTotal) || 0).toFixed(2),
          paymentRemarks: `"${(d.remarks || d.paymentInfo?.remarks || '').replace(/"/g, '""')}"`,
        };

        return activeCols.map((col) => colMap[col.id] || '""').join(',');
      });

      csvContent = [headers.join(','), ...rows].join('\n');
    }

    // Append Financial Summary Block to Excel/CSV if user enabled it
    if (includeFinancialSummaryInCsv) {
      const summaryLines = [
        '',
        '"================================================================================="',
        '"FINANCIAL SUMMARY & GRAND TOTALS (EXPORT OVERVIEW)"',
        `"Financial Year Scope","${selectedFY === 'ALL' ? 'All Financial Years (Lifetime)' : `FY ${selectedFY}`}"`,
        `"Date Duration Filter","${dateRangePreset === 'CUSTOM' ? `${customStartDate || '...'} to ${customEndDate || '...'}` : dateRangePreset}"`,
        `"Status Scope","${statusFilter}"`,
        `"Customer / Buyer Scope","${buyerFilter}"`,
        `"Total Matching Invoices Count",${totals.count}`,
        ...(exportMode === 'BREAKDOWN' ? [`"Total Individual Line Items Count",${totals.lineItemsCount}`] : []),
        `"Total Taxable Value (INR)",${totals.totalTaxable.toFixed(2)}`,
        `"Total CGST Amount (INR)",${totals.totalCGST.toFixed(2)}`,
        `"Total SGST Amount (INR)",${totals.totalSGST.toFixed(2)}`,
        `"Total IGST Amount (INR)",${totals.totalIGST.toFixed(2)}`,
        `"Total Combined GST (INR)",${totals.totalGst.toFixed(2)}`,
        `"Grand Total Invoice Value (INR)",${totals.grandTotal.toFixed(2)}`,
        `"Total Amount Settled / Paid (INR)",${totals.totalPaid.toFixed(2)}`,
        `"Total Amount Pending (INR)",${totals.totalPending.toFixed(2)}`,
        `"B2B Registered Invoices Count",${totals.b2bCount}`,
        `"B2C Unregistered Invoices Count",${totals.b2cCount}`,
        `"Generated Date & Time","${new Date().toLocaleString('en-IN')}"`,
        '"================================================================================="',
      ];
      csvContent += '\n' + summaryLines.join('\n');
    }

    // Trigger Browser Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fyPart = selectedFY === 'ALL' ? 'All_FY' : `FY_${selectedFY}`;
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `Sales_Billing_${fyPart}_${exportMode}_${dateStamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const selectedColCount = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-md max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Export Sales & Billing Register</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                  {selectedFY === 'ALL' ? 'All Financial Years' : `FY ${selectedFY}`}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize data scope, duration, columns, and export format with complete totals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* 1. SCOPE & DURATION FILTERS */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Filter size={14} className="text-indigo-400" />
                <span>1. Select Financial Year & Duration Scope</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Financial Year Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Financial Year (FY)
                </label>
                <select
                  value={selectedFY}
                  onChange={(e) => setSelectedFY(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Financial Years (Complete Sales History)</option>
                  {financialYears.map((fy) => (
                    <option key={fy.code} value={fy.code}>
                      {fy.label} ({fy.startDate} to {fy.endDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Duration Presets */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Duration / Date Range
                </label>
                <select
                  value={dateRangePreset}
                  onChange={(e) => setDateRangePreset(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Full Period (All Records in FY)</option>
                  <option value="THIS_MONTH">Current Month</option>
                  <option value="LAST_MONTH">Previous Month</option>
                  <option value="Q1">Quarter 1 (Apr - Jun)</option>
                  <option value="Q2">Quarter 2 (Jul - Sep)</option>
                  <option value="Q3">Quarter 3 (Oct - Dec)</option>
                  <option value="Q4">Quarter 4 (Jan - Mar)</option>
                  <option value="CUSTOM">Custom Date Range...</option>
                </select>
              </div>

              {/* Status Scope */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Invoice Status Scope
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses (Draft, Issued, Paid, Cancelled)</option>
                  <option value="EXCLUDE_CANCELLED">Active Only (Exclude Cancelled)</option>
                  <option value="COMPLETED">Paid / Settled Only</option>
                  <option value="ISSUED">Pending Payment Only</option>
                  <option value="DRAFT">Drafts Only</option>
                </select>
              </div>

              {/* Buyer Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Buyer / Customer Scope
                </label>
                <select
                  value={buyerFilter}
                  onChange={(e) => setBuyerFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Clients ({distinctBuyers.length})</option>
                  {distinctBuyers.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Range Pickers if CUSTOM selected */}
            {dateRangePreset === 'CUSTOM' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 animate-fade-in">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Start Date (From)</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">End Date (To)</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. EXPORT FORMAT & GRANULARITY */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded space-y-3.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Layers size={14} className="text-indigo-400" />
              <span>2. Export Format & Granularity Level</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Invoice Summary */}
              <div
                onClick={() => setExportMode('SUMMARY')}
                className={`p-3.5 rounded border cursor-pointer transition-all space-y-1 ${
                  exportMode === 'SUMMARY'
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-950/40 text-slate-100'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="text-slate-100">Invoice Summary (.csv)</span>
                  <input
                    type="radio"
                    checked={exportMode === 'SUMMARY'}
                    onChange={() => setExportMode('SUMMARY')}
                    className="text-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  1 row per invoice with total quantities, taxable value, GST and payment status.
                </p>
              </div>

              {/* Option 2: Line Item Breakdown */}
              <div
                onClick={() => setExportMode('BREAKDOWN')}
                className={`p-3.5 rounded border cursor-pointer transition-all space-y-1 ${
                  exportMode === 'BREAKDOWN'
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-950/40 text-slate-100'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="text-slate-100">Line Item Breakdown (.csv)</span>
                  <input
                    type="radio"
                    checked={exportMode === 'BREAKDOWN'}
                    onChange={() => setExportMode('BREAKDOWN')}
                    className="text-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  1 row per product/charge item with unit rates, HSN codes, and item taxes.
                </p>
              </div>

              {/* Option 3: Govt GSTR-1 Format */}
              <div
                onClick={() => setExportMode('GSTR1')}
                className={`p-3.5 rounded border cursor-pointer transition-all space-y-1 ${
                  exportMode === 'GSTR1'
                    ? 'bg-emerald-600/15 border-emerald-500 shadow-md shadow-emerald-950/40 text-slate-100'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="text-slate-100">GSTR-1 Tax Return (.csv)</span>
                  <input
                    type="radio"
                    checked={exportMode === 'GSTR1'}
                    onChange={() => setExportMode('GSTR1')}
                    className="text-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  GST portal-ready format for monthly/quarterly B2B outward sales filing.
                </p>
              </div>
            </div>

            {/* Include Summary Footer Option */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 hover:text-slate-100 select-none">
                <input
                  type="checkbox"
                  checked={includeFinancialSummaryInCsv}
                  onChange={(e) => setIncludeFinancialSummaryInCsv(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">
                    Include Grand Totals & Financial Summary Section at the bottom of the CSV / Excel file
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Appends invoice counts, total taxable amount, CGST, SGST, IGST, grand total, and payment settlement breakdown to the export file.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. COLUMN CUSTOMIZATION (Hidden in GSTR-1 mode since GSTR-1 has strict schema) */}
          {exportMode !== 'GSTR1' && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-indigo-400" />
                  <span>3. Customize Export Columns ({selectedColCount} selected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllColumns}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={resetRecommendedColumns}
                    className="text-[11px] text-slate-400 hover:text-slate-200 font-medium"
                  >
                    Recommended
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={deselectAllColumns}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Column Groups Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {COLUMN_GROUPS.map((grp) => {
                  const grpCols = EXPORT_COLUMNS.filter((c) => c.group === grp.id);
                  const Icon = grp.icon;

                  return (
                    <div key={grp.id} className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-2">
                      <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                        <Icon size={13} className="text-indigo-400" />
                        <span>{grp.label}</span>
                      </div>
                      <div className="space-y-1.5 pt-1 border-t border-slate-800">
                        {grpCols.map((col) => {
                          const isChecked = Boolean(selectedColumns[col.id]);
                          return (
                            <label
                              key={col.id}
                              className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100 transition-colors select-none text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleColumn(col.id)}
                                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                              />
                              <span>{col.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. REAL-TIME CALCULATION & EXPORT TOTALS SUMMARY */}
          <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded space-y-3 shadow-lg shadow-indigo-950/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <Calculator size={14} className="text-emerald-400" />
                <span>Export Calculation & Financial Summary (Live Preview)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Matching Invoices: <strong className="text-slate-100 font-bold">{totals.count}</strong> (
                {exportMode === 'BREAKDOWN' ? `${totals.lineItemsCount} line items` : `${totals.count} records`})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-0.5">
                <div className="text-[10px] text-slate-400 font-medium">Total Taxable Value</div>
                <div className="font-mono font-bold text-slate-100 text-xs">
                  ₹{formatINR(totals.totalTaxable)}
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-0.5">
                <div className="text-[10px] text-slate-400 font-medium">Total CGST + SGST</div>
                <div className="font-mono font-bold text-emerald-400 text-xs">
                  ₹{formatINR(totals.totalCGST + totals.totalSGST)}
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-0.5">
                <div className="text-[10px] text-slate-400 font-medium">Total IGST</div>
                <div className="font-mono font-bold text-indigo-400 text-xs">
                  ₹{formatINR(totals.totalIGST)}
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-0.5">
                <div className="text-[10px] text-slate-400 font-medium">Grand Total Value</div>
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{formatINR(totals.grandTotal)}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div>
                <span>Settlement Split: </span>
                <strong className="text-emerald-400 font-mono">₹{formatINR(totals.totalPaid)} Paid</strong> •{' '}
                <strong className="text-amber-400 font-mono">₹{formatINR(totals.totalPending)} Pending</strong>
              </div>
              <div>
                <span>GST Breakdown: </span>
                <span className="text-slate-300 font-mono">B2B: {totals.b2bCount} | B2C: {totals.b2cCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            {totals.count} invoice{totals.count === 1 ? '' : 's'} ready for export
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="rounded text-xs px-3.5 py-1.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportDownload}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs px-4 py-2 font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Download size={14} /> Download {exportMode === 'GSTR1' ? 'GSTR-1 CSV' : 'Export File (.csv)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
