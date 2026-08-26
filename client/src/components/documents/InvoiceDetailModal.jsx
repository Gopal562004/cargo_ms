import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  FileText,
  CreditCard,
  History,
  Pencil,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Upload,
  Building,
  Truck,
  Package,
  Copy,
  Check,
  Save,
  Calendar,
  DollarSign,
  Tag,
  Paperclip,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Button from '../ui/Button';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoiceDetailModal({
  doc,
  onClose,
  onUpdatePayment,
  onUpdateStatus,
  onPrint,
  onPreview,
}) {
  useBodyScrollLock(Boolean(doc));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'payment' | 'activity'
  const [copied, setCopied] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState(doc?.status || 'ISSUED');
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const data = doc?.data || {};
  const currentPayment = data.paymentInfo || {};
  const hasExistingPayment = Boolean(
    currentPayment.transactionId ||
    data.transactionId ||
    currentPayment.amountPaid ||
    data.paidDate ||
    doc?.status === 'COMPLETED'
  );

  // Always locked by default as requested
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    paymentMode: currentPayment.paymentMode || data.paymentMode || 'NEFT_RTGS',
    transactionId: currentPayment.transactionId || data.transactionId || '',
    paymentDate: currentPayment.paymentDate || data.paidDate || new Date().toISOString().split('T')[0],
    amountPaid: currentPayment.amountPaid !== undefined && currentPayment.amountPaid !== ''
      ? currentPayment.amountPaid
      : (data.amountPaid || data.grandTotal || ''),
    remarks: currentPayment.remarks || data.remarks || '',
    screenshot: currentPayment.screenshot || null,
  });

  useEffect(() => {
    if (doc) {
      const d = doc.data || {};
      const p = d.paymentInfo || {};
      setPaymentForm({
        paymentMode: p.paymentMode || d.paymentMode || 'NEFT_RTGS',
        transactionId: p.transactionId || d.transactionId || '',
        paymentDate: p.paymentDate || d.paidDate || new Date().toISOString().split('T')[0],
        amountPaid: p.amountPaid !== undefined && p.amountPaid !== ''
          ? p.amountPaid
          : (d.amountPaid || d.grandTotal || ''),
        remarks: p.remarks || d.remarks || '',
        screenshot: p.screenshot || null,
      });
      setNewStatus(doc.status || 'ISSUED');
      setIsEditingPayment(false);
      setIsEditingStatus(false);
    }
  }, [doc]);

  if (!doc) return null;

  const items = data.items || [];
  const grandTotal = parseFloat(data.grandTotal || data.totalAmount || 0) || 0;
  const invNumber = doc.documentNumber || data.invoiceNumber || 'INV-000';
  const invDate = data.invoiceDate || new Date(doc.createdAt).toLocaleDateString('en-GB');
  const isPaid = doc.status === 'COMPLETED' || doc.status === 'DELIVERED';
  const statusHistory = doc.statusHistory || [];

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(invNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTxnId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPaymentForm((prev) => ({
        ...prev,
        screenshot: ev.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.transactionId.trim()) {
      alert('Please enter transaction UTR / reference ID');
      return;
    }
    setSavingPayment(true);
    try {
      await onUpdatePayment(doc.id, paymentForm);
      setIsEditingPayment(false);
      setActiveTab('payment');
    } catch (err) {
      alert('Error updating payment: ' + err.message);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      await onUpdateStatus(doc.id, newStatus, statusNote);
      setStatusNote('');
      setIsEditingStatus(false);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const paymentModeMap = {
    NEFT_RTGS: 'Bank Transfer (NEFT / RTGS / IMPS)',
    UPI: 'UPI / GPay / PhonePe',
    CHEQUE: 'Cheque',
    CASH: 'Cash',
    CREDIT_CARD: 'Credit / Debit Card',
  };

  const paymentModeLabel = paymentModeMap[paymentForm.paymentMode] || paymentForm.paymentMode;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-md max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                  Invoice #{invNumber}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyInvoiceNumber}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title="Copy Invoice Number"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase ${
                    isPaid
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : doc.status === 'DRAFT'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {doc.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Billed To: <span className="text-slate-200 font-medium">{data.buyerName || data.clientName || 'Unspecified'}</span> • Date: <span className="text-slate-200">{invDate}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPreview && onPreview(doc.id)}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white rounded"
              title="Preview PDF Document"
            >
              <Eye size={14} className="mr-1 inline" /> Preview
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPrint && onPrint(doc.id)}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white rounded"
              title="Print Tax Invoice"
            >
              <Printer size={14} className="mr-1 inline" /> Print
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/documents/${doc.id}/edit`)}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
              title="Open Full Form Editor"
            >
              <Pencil size={14} className="mr-1 inline" /> Edit Bill
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 shrink-0 pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText size={14} /> Overview & Bill Items
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'payment'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard size={14} />
            Payment Proof & Details
            {hasExistingPayment && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History size={14} /> Activity & Audit Logs ({statusHistory.length})
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Parties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Billed To (Buyer) */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Building size={14} className="text-indigo-400" /> Billed To (Buyer / Client)
                  </div>
                  <div className="text-sm font-bold text-slate-100">{data.buyerName || data.clientName || 'Unspecified'}</div>
                  {(data.buyerAddress || data.clientAddress) && (
                    <div className="text-slate-300 whitespace-pre-line leading-relaxed text-[11px]">
                      {data.buyerAddress || data.clientAddress}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px] pt-1 border-t border-slate-800/80 font-mono">
                    <span>GSTIN: <span className="text-slate-200 font-bold">{data.buyerGstin || data.clientGstin || 'N/A'}</span></span>
                    <span>State: <span className="text-slate-200">{data.buyerState || data.state || 'N/A'} {data.buyerStateCode ? `(${data.buyerStateCode})` : ''}</span></span>
                    {(data.referenceName || data.contactPerson) && (
                      <span>Contact: <span className="text-slate-200">{data.referenceName || data.contactPerson}</span></span>
                    )}
                  </div>
                </div>

                {/* Shipped To / Consignee */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Truck size={14} className="text-indigo-400" /> Shipped To (Consignee / Destination)
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {data.consigneeName || data.shipperName || 'Same as Buyer'}
                  </div>
                  {(data.consigneeAddress || data.shipperAddress) && (
                    <div className="text-slate-300 whitespace-pre-line leading-relaxed text-[11px]">
                      {data.consigneeAddress || data.shipperAddress}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px] pt-1 border-t border-slate-800/80 font-mono">
                    <span>AWB / Ref: <span className="text-slate-200 font-bold">{data.airwayBillNo || data.awbNo || data.lrNo || data.referenceNo || '-'}</span></span>
                    <span>State: <span className="text-slate-200">{data.consigneeState || data.buyerState || 'N/A'}</span></span>
                    {data.consigneeGstin && (
                      <span>GSTIN: <span className="text-slate-200">{data.consigneeGstin}</span></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items & Charges Table */}
              <div className="border border-slate-800 rounded overflow-hidden">
                <div className="bg-slate-950/90 px-3.5 py-2.5 font-semibold text-slate-300 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package size={14} className="text-indigo-400" /> Bill Line Items & Charges ({items.length})
                  </span>
                  <span className="font-mono text-slate-400 font-normal">Currency: INR (₹)</span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-950/50 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3.5 w-10">#</th>
                      <th className="py-2.5 px-3.5">Description</th>
                      <th className="py-2.5 px-3.5 font-mono">HSN / SAC</th>
                      <th className="py-2.5 px-3.5 text-center">Qty</th>
                      <th className="py-2.5 px-3.5 text-right font-mono">Rate (₹)</th>
                      <th className="py-2.5 px-3.5 text-right font-mono">Taxable (₹)</th>
                      <th className="py-2.5 px-3.5 text-center font-mono">GST %</th>
                      <th className="py-2.5 px-3.5 text-right font-mono">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500">
                          No line items found in this invoice.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => {
                        const description = item.description || item.name || item.itemDescription || 'Service / Product';
                        const subText = item.subText || item.details || item.notes || '';
                        const hsnCode = item.hsnCode || item.hsn || item.sacCode || item.sac || '-';
                        const qty = parseFloat(item.qty !== undefined && item.qty !== null && item.qty !== '' ? item.qty : (item.quantity !== undefined ? item.quantity : 1)) || 1;
                        const unit = item.unit ? ` ${item.unit}` : '';
                        
                        // Robust price/rate resolution
                        const rate = parseFloat(
                          item.price !== undefined && item.price !== null && item.price !== ''
                            ? item.price
                            : (item.rate !== undefined && item.rate !== null && item.rate !== ''
                              ? item.rate
                              : (item.unitPrice !== undefined ? item.unitPrice : 0))
                        ) || 0;

                        // Robust taxable amount resolution
                        const taxable = parseFloat(
                          item.taxableAmount !== undefined && item.taxableAmount !== null && item.taxableAmount !== ''
                            ? item.taxableAmount
                            : (item.amount !== undefined && item.amount !== null && item.amount !== ''
                              ? item.amount
                              : (qty * rate))
                        ) || (qty * rate);

                        // Robust GST rate resolution
                        const cgstR = parseFloat(item.cgstRate) || 0;
                        const sgstR = parseFloat(item.sgstRate) || 0;
                        const igstR = parseFloat(item.igstRate) || 0;
                        const gstRate = parseFloat(
                          item.gstRate !== undefined && item.gstRate !== null && item.gstRate !== ''
                            ? item.gstRate
                            : (item.gst !== undefined
                              ? item.gst
                              : ((cgstR + sgstR + igstR) || 18))
                        ) || 0;

                        // Line Total
                        const cgstA = (item.cgstAmount !== undefined && item.cgstAmount !== null) ? parseFloat(item.cgstAmount) : ((taxable * cgstR) / 100);
                        const sgstA = (item.sgstAmount !== undefined && item.sgstAmount !== null) ? parseFloat(item.sgstAmount) : ((taxable * sgstR) / 100);
                        const igstA = (item.igstAmount !== undefined && item.igstAmount !== null) ? parseFloat(item.igstAmount) : ((taxable * igstR) / 100);
                        const taxAmt = (cgstA + sgstA + igstA) || ((taxable * gstRate) / 100);

                        const lineTotal = parseFloat(
                          item.lineTotal !== undefined && item.lineTotal !== null && item.lineTotal !== ''
                            ? item.lineTotal
                            : (item.total !== undefined && item.total !== null
                              ? item.total
                              : (item.totalAmount !== undefined ? item.totalAmount : (taxable + taxAmt)))
                        ) || (taxable + taxAmt);

                        return (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3.5 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3.5 font-medium text-slate-200">
                              <div>{description}</div>
                              {subText && <div className="text-[10px] text-slate-400 whitespace-pre-line">{subText}</div>}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-300 font-mono">{hsnCode}</td>
                            <td className="py-2.5 px-3.5 text-center font-mono text-slate-300">
                              {qty}{unit}
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono text-slate-300">
                              ₹{formatINR(rate)}
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono text-slate-300">
                              ₹{formatINR(taxable)}
                            </td>
                            <td className="py-2.5 px-3.5 text-center font-mono text-slate-300">
                              {gstRate}%
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-100">
                              ₹{formatINR(lineTotal)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Subtotals & Taxes Footer in Table */}
                <div className="bg-slate-950/70 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-4 font-mono">
                    {data.totalTaxable !== undefined && (
                      <span>Taxable Value: <strong className="text-slate-200">₹{formatINR(data.totalTaxable)}</strong></span>
                    )}
                    {(data.totalCGST > 0 || data.totalSGST > 0) && (
                      <>
                        <span>CGST: <strong className="text-slate-200">₹{formatINR(data.totalCGST)}</strong></span>
                        <span>SGST: <strong className="text-slate-200">₹{formatINR(data.totalSGST)}</strong></span>
                      </>
                    )}
                    {data.totalIGST > 0 && (
                      <span>IGST: <strong className="text-slate-200">₹{formatINR(data.totalIGST)}</strong></span>
                    )}
                  </div>
                  {data.amountInWords && (
                    <div className="italic text-slate-400 max-w-md text-right">
                      {data.amountInWords}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Totals Summary Card */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Payment Status:</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        isPaid ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 size={12} className="inline" /> : <Clock size={12} className="inline" />}
                      <span>{isPaid ? 'PAID / SETTLED' : 'PENDING PAYMENT'}</span>
                    </span>
                    {paymentForm.transactionId && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        (Ref: {paymentForm.transactionId})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('payment')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium ml-1"
                    >
                      View Payment Details →
                    </button>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Invoice Grand Total:</div>
                  <div className="text-xl font-bold text-slate-100 font-mono">
                    ₹{formatINR(grandTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT PROOF & DETAILS */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              {/* ---------------------------------------------------- */}
              {/* LOCKED VIEW MODE (Default for all users)             */}
              {/* ---------------------------------------------------- */}
              {!isEditingPayment ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded space-y-4">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                          isPaid
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        }`}>
                          {isPaid ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            <span>{isPaid ? 'Payment Settled & Verified' : 'Payment Pending / Recorded'}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              <Lock size={10} className="text-slate-400" /> Locked Mode
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Invoice Grand Total: <span className="font-mono font-bold text-slate-200">₹{formatINR(grandTotal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* UNLOCK / EDIT BUTTON */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditingPayment(true)}
                        className="bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-indigo-300 rounded text-xs px-3.5 py-1.5 transition-all"
                      >
                        <Pencil size={13} className="mr-1.5 inline" /> Edit Payment Details
                      </Button>
                    </div>

                    {/* Payment Info Display Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                        <div className="text-[10px] text-slate-400 font-medium">Payment Mode</div>
                        <div className="font-semibold text-slate-100">{paymentModeLabel || 'Not specified'}</div>
                      </div>

                      <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                        <div className="text-[10px] text-slate-400 font-medium">Transaction UTR / Ref #</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-400 text-xs truncate">
                            {paymentForm.transactionId || (isPaid ? 'DIRECT SETTLEMENT' : 'Pending UTR')}
                          </span>
                          {paymentForm.transactionId && (
                            <button
                              type="button"
                              onClick={() => handleCopyTxnId(paymentForm.transactionId)}
                              className="text-slate-400 hover:text-white p-0.5 transition-colors"
                              title="Copy UTR ID"
                            >
                              {copiedTxn ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                        <div className="text-[10px] text-slate-400 font-medium">Payment Received Date</div>
                        <div className="font-mono font-semibold text-slate-200">
                          {paymentForm.paymentDate || invDate || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                        <div className="text-[10px] text-slate-400 font-medium">Amount Received</div>
                        <div className="font-mono font-bold text-slate-100">
                          ₹{formatINR(paymentForm.amountPaid || grandTotal)}
                        </div>
                      </div>
                    </div>

                    {/* Remarks Section */}
                    {paymentForm.remarks ? (
                      <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                        <div className="text-[10px] text-slate-400 font-medium">Remarks / Client Payment Notes:</div>
                        <div className="text-slate-200 text-xs leading-relaxed">{paymentForm.remarks}</div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-900/40 border border-slate-800/50 rounded text-slate-500 text-xs italic">
                        No additional payment remarks provided.
                      </div>
                    )}

                    {/* Screenshot Receipt Display */}
                    {paymentForm.screenshot ? (
                      <div className="p-3.5 bg-slate-900/90 border border-slate-800/80 rounded space-y-2">
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                          <Paperclip size={13} className="text-indigo-400" /> Attached Payment Proof / Receipt Screenshot:
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                          <img
                            src={paymentForm.screenshot}
                            alt="Payment Receipt"
                            className="max-h-48 object-contain rounded border border-slate-700 bg-slate-950 p-1 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(paymentForm.screenshot, '_blank')}
                            title="Click to view full image in a new tab"
                          />
                          <div className="text-slate-400 text-xs space-y-1.5">
                            <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> Receipt Screenshot Attached & Verified
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Click the image thumbnail to inspect and zoom receipt in full resolution.
                            </p>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => window.open(paymentForm.screenshot, '_blank')}
                              className="text-xs px-2.5 py-1"
                            >
                              <ExternalLink size={12} className="mr-1 inline" /> Open Full Image
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900/50 border border-slate-800/60 rounded text-slate-500 text-xs flex items-center gap-2">
                        <Paperclip size={13} className="text-slate-600" />
                        <span>No payment receipt screenshot uploaded. Click "Edit Payment Details" to attach one.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ---------------------------------------------------- */
                /* UNLOCKED / EDIT PAYMENT FORM                         */
                /* ---------------------------------------------------- */
                <form onSubmit={handleSavePayment} className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-slate-950/80 border border-indigo-500/40 rounded space-y-3.5 shadow-lg shadow-indigo-950/20">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                        <Unlock size={16} className="text-indigo-400" />
                        <span>Edit Client Payment Details</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Invoice Total: <span className="text-slate-100 font-bold font-mono">₹{formatINR(grandTotal)}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Payment Mode <span className="text-rose-400">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          value={paymentForm.paymentMode}
                          onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                        >
                          <option value="NEFT_RTGS">Bank Transfer (NEFT/RTGS/IMPS)</option>
                          <option value="UPI">UPI / GPay / PhonePe</option>
                          <option value="CHEQUE">Cheque</option>
                          <option value="CASH">Cash</option>
                          <option value="CREDIT_CARD">Credit / Debit Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Transaction UTR / Ref ID <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentForm.transactionId}
                          onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                          placeholder="e.g. UTR12345678"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Payment Received Date <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Amount Paid (₹)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={paymentForm.amountPaid}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                          placeholder={grandTotal.toString()}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Remarks / Notes
                        </label>
                        <input
                          type="text"
                          value={paymentForm.remarks}
                          onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                          placeholder="e.g. Received full payment via HDFC Bank"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Proof / Screenshot Attachment */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Payment Proof / Screenshot (Optional)
                      </label>
                      <div className="p-3 bg-slate-900 border border-dashed border-slate-800 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
                        {paymentForm.screenshot ? (
                          <div className="flex items-center gap-3 w-full justify-between">
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={paymentForm.screenshot}
                                alt="Receipt"
                                className="w-12 h-12 object-cover rounded border border-slate-700 cursor-pointer"
                                onClick={() => window.open(paymentForm.screenshot, '_blank')}
                              />
                              <div>
                                <div className="text-emerald-400 font-semibold text-xs">Payment Proof Attached</div>
                                <div className="text-[10px] text-slate-400">Click thumbnail to expand</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPaymentForm({ ...paymentForm, screenshot: null })}
                              className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2 py-1 bg-rose-500/10 rounded border border-rose-500/20"
                            >
                              Remove Proof
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-2 w-full justify-center py-2">
                            <Upload size={16} /> Attach Screenshot / Receipt (Max 5MB)
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
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setIsEditingPayment(false)}
                      className="rounded text-xs px-3.5 py-1.5"
                    >
                      <Lock size={12} className="mr-1 inline" /> Cancel (Keep Locked)
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      loading={savingPayment}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs px-4 py-2"
                    >
                      <Save size={14} className="mr-1.5 inline" /> Save Payment & Set Status to Paid
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVITY & AUDIT LOGS */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {/* ---------------------------------------------------- */}
              {/* LOCKED STATUS CARD (Default)                         */}
              {/* ---------------------------------------------------- */}
              {!isEditingStatus ? (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded space-y-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          doc.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : doc.status === 'DRAFT'
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            : doc.status === 'CANCELLED'
                            ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                            : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
                        }`}
                      >
                        {doc.status === 'COMPLETED' ? (
                          <CheckCircle2 size={18} />
                        ) : doc.status === 'DRAFT' ? (
                          <Clock size={18} />
                        ) : (
                          <History size={18} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                          <span>Status: {doc.status}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            <Lock size={10} className="text-slate-400" /> Locked Mode
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {statusHistory.length} status audit log{statusHistory.length === 1 ? '' : 's'} recorded for this bill
                        </div>
                      </div>
                    </div>

                    {/* UNLOCK / EDIT STATUS BUTTON */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditingStatus(true)}
                      className="bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-indigo-300 rounded text-xs px-3.5 py-1.5 transition-all"
                    >
                      <Pencil size={13} className="mr-1.5 inline" /> Update Status & Log Activity
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                      <div className="text-[10px] text-slate-400 font-medium">Current Status</div>
                      <div className="font-bold text-slate-100 text-xs uppercase">
                        {doc.status}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                      <div className="text-[10px] text-slate-400 font-medium">Last Updated</div>
                      <div className="font-mono text-slate-200 text-xs">
                        {doc.updatedAt
                          ? new Date(doc.updatedAt).toLocaleString('en-GB')
                          : new Date(doc.createdAt).toLocaleString('en-GB')}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded space-y-1">
                      <div className="text-[10px] text-slate-400 font-medium">Created On</div>
                      <div className="font-mono text-slate-200 text-xs">
                        {new Date(doc.createdAt).toLocaleString('en-GB')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ---------------------------------------------------- */
                /* UNLOCKED / EDIT STATUS FORM                          */
                /* ---------------------------------------------------- */
                <form
                  onSubmit={handleSaveStatus}
                  className="p-4 bg-slate-950/80 border border-indigo-500/40 rounded space-y-3.5 shadow-lg shadow-indigo-950/20 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                      <Unlock size={16} className="text-indigo-400" />
                      <span>Change Invoice Status & Log Activity</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Invoice #{invNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        New Status <span className="text-rose-400">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="DRAFT">DRAFT (Unsent)</option>
                        <option value="ISSUED">ISSUED (Pending Payment)</option>
                        <option value="COMPLETED">COMPLETED (Paid / Settled)</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Activity Log Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="e.g. Sent PDF to client accounts team / Payment confirmed"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setIsEditingStatus(false)}
                      className="rounded text-xs px-3.5 py-1.5"
                    >
                      <Lock size={12} className="mr-1 inline" /> Cancel (Keep Locked)
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      loading={savingStatus}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs px-4 py-2 font-semibold"
                    >
                      <Save size={13} className="mr-1.5 inline" /> Save & Log Status Change
                    </Button>
                  </div>
                </form>
              )}

              {/* Comprehensive Activity Timeline of History */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <History size={14} className="text-indigo-400" />
                    Complete Activity & Audit Trail ({statusHistory.length || 1})
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ordered by most recent
                  </span>
                </div>

                {statusHistory.length === 0 ? (
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 uppercase px-2 py-0.5 rounded bg-slate-800 text-[10px]">
                        {doc.status || 'DRAFT'}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {new Date(doc.createdAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">Invoice record initialized.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-800">
                    {statusHistory.map((item, index) => {
                      const isComplete = item.status === 'COMPLETED';
                      const isDraft = item.status === 'DRAFT';
                      const isCancel = item.status === 'CANCELLED';

                      return (
                        <div key={item.id || index} className="relative pl-7 py-0.5">
                          <div
                            className={`absolute left-1.5 top-3 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                              isComplete
                                ? 'bg-emerald-500'
                                : isDraft
                                ? 'bg-amber-500'
                                : isCancel
                                ? 'bg-rose-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded space-y-1.5 hover:border-slate-700 transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isComplete
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isDraft
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : isCancel
                                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                    : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                }`}
                              >
                                {isComplete ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                {item.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(item.changedAt).toLocaleString('en-GB', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-slate-300 text-xs leading-relaxed">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
