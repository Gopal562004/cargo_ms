import React, { useState } from 'react';
import { CreditCard, X, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

export default function PaymentDetailsModal({ isOpen, doc, onClose, onSave }) {
  useBodyScrollLock(Boolean(isOpen && doc));

  if (!isOpen || !doc) return null;

  const data = doc.data || {};
  const existingPayment = data.paymentInfo || data.payment || {};

  const [paymentMode, setPaymentMode] = useState(existingPayment.paymentMode || existingPayment.mode || 'NEFT_RTGS');
  const [transactionId, setTransactionId] = useState(existingPayment.transactionId || '');
  const [paymentDate, setPaymentDate] = useState(existingPayment.paymentDate || new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState(existingPayment.amountPaid || data.grandTotal || data.totalAmount || '');
  const [bankName, setBankName] = useState(existingPayment.bankName || '');
  const [remarks, setRemarks] = useState(existingPayment.remarks || existingPayment.notes || '');
  const [screenshotBase64, setScreenshotBase64] = useState(existingPayment.screenshot || null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshotBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const paymentInfo = {
        paymentMode,
        transactionId,
        paymentDate,
        amountPaid: parseFloat(amountPaid) || 0,
        bankName,
        remarks,
        screenshot: screenshotBase64,
        updatedAt: new Date().toISOString(),
      };

      if (onSave) {
        await onSave(doc.id, paymentInfo);
      }
      onClose();
    } catch (err) {
      alert('Error saving payment details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-md max-w-lg w-full p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CreditCard size={17} className="text-indigo-400" />
              <span>Record Payment Details</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Invoice #{doc.documentNumber || data.invoiceNumber || 'Draft'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Payment Mode</label>
              <select
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="NEFT_RTGS">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
              </select>
            </div>

            <Input
              label="Transaction ID / Ref No."
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. UTR123456789"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />

            <Input
              label="Amount Paid (₹)"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              required
            />
          </div>

          <Input
            label="Bank Name / UTR Details (Optional)"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. HDFC Bank Ltd"
          />

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Payment Proof / Screenshot</label>
            <div className="flex items-center gap-3 p-3 bg-slate-950/80 border border-dashed border-slate-800 rounded">
              {screenshotBase64 ? (
                <div className="relative group w-16 h-16 rounded overflow-hidden border border-slate-700">
                  <img src={screenshotBase64} alt="Payment Proof" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshotBase64(null)}
                    className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-xs transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center w-full py-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="paymentProofInput"
                  />
                  <label
                    htmlFor="paymentProofInput"
                    className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon size={14} /> Attach Screenshot / Receipt (Max 5MB)
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Notes / Remarks</label>
            <textarea
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Received via GPay from Rajesh"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="secondary" type="button" onClick={onClose} className="rounded text-xs">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              <Save size={13} className="mr-1 inline" /> Save Payment Proof
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
