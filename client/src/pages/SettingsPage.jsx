import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Calendar,
  SlidersHorizontal,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Save,
  RotateCcw,
  Building,
  Bookmark,
  Users,
  Shield,
  FileText,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useFinancialYearStore } from '../store/financialYearStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    activeFY,
    financialYears,
    setActiveFY,
    addFinancialYear,
    updateFinancialYear,
    deleteFinancialYear,
    resetFinancialYearsToDefault,
  } = useFinancialYearStore();

  const [successMsg, setSuccessMsg] = useState('');
  const [editingFY, setEditingFY] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Edit/Add Form State
  const [modalForm, setModalForm] = useState({
    code: '',
    label: '',
    startDate: '',
    endDate: '',
    prefix: 'DGR/',
    startSequence: 1,
    paddingDigits: 3,
    suffix: '',
    description: '',
  });

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleOpenEdit = (fy) => {
    setEditingFY(fy);
    setIsAddingNew(false);
    setModalForm({
      code: fy.code,
      label: fy.label || `FY ${fy.code}`,
      startDate: fy.startDate || '',
      endDate: fy.endDate || '',
      prefix: fy.prefix || 'DGR/',
      startSequence: fy.startSequence || 1,
      paddingDigits: fy.paddingDigits || 3,
      suffix: fy.suffix || '',
      description: fy.description || '',
    });
  };

  const handleOpenAdd = () => {
    setEditingFY(null);
    setIsAddingNew(true);

    // Predict next FY
    const currentYear = new Date().getFullYear();
    const nextStart = currentYear + 1;
    const nextEndShort = (nextStart + 1).toString().slice(-2);
    const nextCode = `${nextStart}-${nextEndShort}`;

    setModalForm({
      code: nextCode,
      label: `FY ${nextCode}`,
      startDate: `${nextStart}-04-01`,
      endDate: `${nextStart + 1}-03-31`,
      prefix: 'DGR/',
      startSequence: 1,
      paddingDigits: 3,
      suffix: '',
      description: `Indian Financial Year ${nextCode}`,
    });
  };

  const handleCloseModal = () => {
    setEditingFY(null);
    setIsAddingNew(false);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!modalForm.code?.trim()) {
      alert('Please enter a valid Financial Year code (e.g. 2026-27).');
      return;
    }

    if (isAddingNew) {
      addFinancialYear(modalForm);
      showNotification(`Financial Year ${modalForm.code} added successfully!`);
    } else if (editingFY) {
      updateFinancialYear(editingFY.code, modalForm);
      showNotification(`Financial Year ${editingFY.code} series updated!`);
    }

    handleCloseModal();
  };

  const handleDelete = (fyCode) => {
    if (financialYears.length <= 1) {
      alert('You cannot delete the only remaining Financial Year.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${fyCode}?`)) {
      try {
        deleteFinancialYear(fyCode);
        showNotification(`Financial Year ${fyCode} removed.`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSelectActive = (fyCode) => {
    setActiveFY(fyCode);
    showNotification(`Active Financial Year switched to FY ${fyCode}! All sales, purchases, and invoice numbering now reflect ${fyCode}.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Settings & Organization Profile
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-year financial cycles, GST invoice series, default presets, and system preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => navigate('/billing')}
            className="rounded text-xs"
          >
            <FileText size={14} className="mr-1.5 inline" /> Invoices Register
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
            onClick={handleOpenAdd}
            className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
          >
            <Plus size={14} className="mr-1.5 inline" /> Add Financial Year
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-md text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            className="text-emerald-400 hover:text-white font-bold text-xs"
            onClick={() => setSuccessMsg('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: FINANCIAL YEARS & NUMBERING SERIES REGISTRY */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-indigo-50 text-indigo-600">
                <Calendar size={18} />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Financial Years & Tax Invoice Series
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select the active financial year to filter all sales, purchase bills, and automatic invoice numbering across the entire software.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Active Context:
            </span>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold font-mono">
              FY {activeFY}
            </span>
          </div>
        </div>

        {/* Financial Year Cards Grid (Chronological Order & Compact) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[...financialYears]
            .sort((a, b) => (parseInt(a.code.split('-')[0], 10) || 0) - (parseInt(b.code.split('-')[0], 10) || 0))
            .map((fy) => {
              const isActive = activeFY === fy.code;
              const prefix = fy.prefix || 'DGR/';
              const padding = parseInt(fy.paddingDigits, 10) || 3;
              const startSeq = parseInt(fy.startSequence, 10) || 1;
              const suffix = fy.suffix ? `/${fy.suffix}` : '';
              const sample = `${prefix}${startSeq.toString().padStart(padding, '0')}/${fy.code}${suffix}`;
              const startYr = fy.code.split('-')[0];
              const endYrShort = fy.code.split('-')[1] || '27';

              return (
                <div
                  key={fy.code}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-indigo-50/40 border-indigo-400 shadow-xs ring-1 ring-indigo-400/30'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        FY {fy.code}
                      </span>
                      {isActive ? (
                        <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-semibold">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(fy)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                        title="Edit Series"
                      >
                        <Pencil size={13} />
                      </button>
                      {!isActive && financialYears.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDelete(fy.code)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                          title="Delete Financial Year"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Period:</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        01/04/{startYr} – 31/03/20{endYrShort}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Prefix & Start:</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {prefix} (Seq #{startSeq.toString().padStart(padding, '0')})
                      </span>
                    </div>

                    <div className="p-1.5 bg-white border border-slate-200 rounded flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500">Sample Bill:</span>
                      <span className="font-mono font-bold text-indigo-700 text-xs">{sample}</span>
                    </div>
                  </div>

                  {/* Switch Active Button */}
                  <div>
                    {isActive ? (
                      <div className="w-full py-1 bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} /> Active Selected
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectActive(fy.code)}
                        className="w-full py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <span>Switch to FY {fy.code}</span>
                        <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* SECTION 2: SYSTEM QUICK SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/billing/templates')}
          className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all flex items-start gap-3.5"
        >
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            <Bookmark size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Full Invoice Templates</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create and manage default issuer companies, addresses, line item presets, and bank accounts.
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/billing/templates?tab=PARTIES')}
          className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all flex items-start gap-3.5"
        >
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <Building size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Company & Client Directory</h3>
            <p className="text-xs text-slate-500 mt-1">
              Save buyer addresses, GSTIN numbers, dispatch destinations, and vendor contacts for 1-click autofill.
            </p>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <div
            onClick={() => navigate('/users')}
            className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Master Users & Permissions</h3>
              <p className="text-xs text-slate-500 mt-1">
                Provision operator accounts, set login credentials, and selectively allocate document modules.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EDIT / ADD FINANCIAL YEAR MODAL */}
      {(editingFY || isAddingNew) && (
        <FinancialYearEditModal
          isOpen={true}
          isAddingNew={isAddingNew}
          formData={modalForm}
          setFormData={setModalForm}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
}

/**
 * Edit / Add Financial Year Modal Dialog
 */
function FinancialYearEditModal({ isOpen, isAddingNew, formData, setFormData, onClose, onSave }) {
  useBodyScrollLock(Boolean(isOpen));

  if (!isOpen) return null;

  const prefix = formData.prefix || 'DGR/';
  const padding = parseInt(formData.paddingDigits, 10) || 3;
  const startSeq = parseInt(formData.startSequence, 10) || 1;
  const suffix = formData.suffix ? `/${formData.suffix}` : '';
  const fyCode = formData.code || '2026-27';

  const sample1 = `${prefix}${startSeq.toString().padStart(padding, '0')}/${fyCode}${suffix}`;
  const sample2 = `${prefix}${(startSeq + 1).toString().padStart(padding, '0')}/${fyCode}${suffix}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAddingNew ? 'Add New Financial Year' : `Edit Financial Year: FY ${formData.code}`}
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure serial prefix, starting sequence number, and GST financial cycle rules.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-200/50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSave} className="p-6 space-y-4">
          {/* Live Preview Bar */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
              <Sparkles size={13} className="text-indigo-600" />
              <span>Live Series Preview for FY {fyCode}:</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-800">
              <span>Next: <strong className="text-indigo-700">{sample1}</strong></span>
              <span>Following: <strong className="text-slate-600">{sample2}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* FY Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Financial Year Code *
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                placeholder="2026-27"
                className="text-xs font-mono font-bold"
                disabled={!isAddingNew}
                required
              />
            </div>

            {/* Prefix */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Prefix *
              </label>
              <Input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData((p) => ({ ...p, prefix: e.target.value }))}
                placeholder="DGR/"
                className="text-xs font-mono font-bold"
                required
              />
            </div>

            {/* Starting Sequence Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Starting / Baseline Sequence Number
              </label>
              <Input
                type="number"
                min={1}
                value={formData.startSequence}
                onChange={(e) => setFormData((p) => ({ ...p, startSequence: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                className="text-xs font-mono font-bold"
                required
              />
            </div>

            {/* Zero-Padding Digits */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Zero-Padding Digits
              </label>
              <select
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={formData.paddingDigits}
                onChange={(e) => setFormData((p) => ({ ...p, paddingDigits: parseInt(e.target.value, 10) }))}
              >
                <option value={3}>3 Digits (001, 002, 003...)</option>
                <option value={4}>4 Digits (0001, 0002, 0003...)</option>
                <option value={2}>2 Digits (01, 02, 03...)</option>
                <option value={1}>No Padding (1, 2, 3...)</option>
              </select>
            </div>

            {/* Optional Suffix */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Suffix (Leave empty if none)
              </label>
              <Input
                type="text"
                value={formData.suffix}
                onChange={(e) => setFormData((p) => ({ ...p, suffix: e.target.value }))}
                placeholder="e.g. GST or EXP"
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5">
              <Save size={14} className="mr-1.5 inline" /> Save Financial Year Series
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
