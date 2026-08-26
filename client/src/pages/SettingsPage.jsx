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
  User,
  KeyRound,
  CreditCard,
  Mail,
  Phone,
  Briefcase,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Sliders,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useFinancialYearStore } from '../store/financialYearStore';
import { useAuthStore } from '../store/authStore';
import { SYSTEM_SERVICES } from '../services/userService';
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
  } = useFinancialYearStore();

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingFY, setEditingFY] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showLicenseKey, setShowLicenseKey] = useState(false);

  // Edit/Add FY Form State
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

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleCopyKey = () => {
    if (!user?.licenseKey) return;
    navigator.clipboard.writeText(user.licenseKey);
    setCopiedKey(true);
    showNotification('License Key copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 3000);
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
      showNotification('Please enter a valid Financial Year code (e.g. 2026-27).', true);
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
      showNotification('You cannot delete the only remaining Financial Year.', true);
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${fyCode}?`)) {
      try {
        deleteFinancialYear(fyCode);
        showNotification(`Financial Year ${fyCode} removed.`);
      } catch (err) {
        showNotification(err.message, true);
      }
    }
  };

  const handleSelectActive = (fyCode) => {
    setActiveFY(fyCode);
    showNotification(`Active Financial Year switched to FY ${fyCode}! Invoices and serial numbering now use FY ${fyCode}.`);
  };

  // Remaining days calculation for user
  const expiryInfo = React.useMemo(() => {
    if (!user || !user.subscriptionExpiresAt) return null;
    const expiresAt = new Date(user.subscriptionExpiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      dateStr: expiresAt.toLocaleDateString('en-IN', { dateStyle: 'medium' }),
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: daysRemaining <= 0,
    };
  }, [user]);

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
              Settings & Account Profile
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account credentials, subscription plan, allocated services, and financial year cycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => navigate('/billing')}
            className="rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <FileText size={14} className="mr-1.5 inline" /> Invoices Register
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/billing/templates')}
            className="rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <Bookmark size={14} className="mr-1.5 inline" /> Templates & Directory
          </Button>
          {user?.role === 'ADMIN' && (
            <Button
              variant="primary"
              onClick={() => navigate('/users')}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
            >
              <Users size={14} className="mr-1.5 inline" /> User Management
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded text-xs text-rose-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* ─── SECTION 1: USER IDENTITY & SUBSCRIPTION OVERVIEW ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Card: User Profile Information */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded space-y-4 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <User size={16} className="text-indigo-400" />
              <span>Operator Profile</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {user?.role || 'OPERATOR'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-lg text-indigo-400 font-mono">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-slate-100 text-sm">{user?.name || 'Operator'}</div>
                <div className="text-[11px] font-mono text-indigo-400">@{user?.username || user?.email}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Building size={13} /> Company</span>
                <span className="font-medium text-slate-200">{user?.company || 'DGR GLOBAL LOGISTICS'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Briefcase size={13} /> Department</span>
                <span className="font-medium text-slate-200">{user?.department || 'Operations'}</span>
              </div>

              {user?.email && (
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5"><Mail size={13} /> Email</span>
                  <span className="font-mono text-slate-200 truncate max-w-[160px]">{user.email}</span>
                </div>
              )}

              {user?.phone && (
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5"><Phone size={13} /> Phone</span>
                  <span className="font-mono text-slate-200">{user.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Status:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                <CheckCircle2 size={11} /> ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Subscription, License & Active Modules */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded space-y-4 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <CreditCard size={16} className="text-emerald-400" />
                <span>Subscription Plan & License Status</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {user?.subscriptionPlan || 'STARTER PLAN'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800/90 rounded space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Active License Key</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-xs text-indigo-300 select-all truncate">
                    {showLicenseKey
                      ? (user?.licenseKey || 'CRGO-2026-ACTIVE')
                      : 'CRGO-••••-••••-••••'}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowLicenseKey(!showLicenseKey)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title={showLicenseKey ? 'Hide License Key' : 'Reveal License Key'}
                    >
                      {showLicenseKey ? <EyeOff size={13} className="text-indigo-400" /> : <Eye size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Copy Full Key"
                    >
                      {copiedKey ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/90 rounded space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Plan Expiry Date</span>
                <div className="font-bold text-slate-100 font-mono text-xs">
                  {expiryInfo?.dateStr || '26 Aug 2027'}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/90 rounded space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Remaining Days</span>
                <div
                  className={`font-bold font-mono text-xs ${
                    expiryInfo?.isExpired
                      ? 'text-rose-400'
                      : (expiryInfo?.daysRemaining ?? 365) <= 15
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {expiryInfo?.isExpired ? 'Expired' : `${expiryInfo?.daysRemaining ?? 365} Days Remaining`}
                </div>
              </div>
            </div>

            {/* Active Service Modules Badges */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Enabled Modular Permissions:</span>
                <span className="text-[10px] text-slate-400">{(user?.allowedServices || []).length || 'All'} modules accessible</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYSTEM_SERVICES.slice(0, 6).map((srv) => {
                  const isEnabled = !user?.allowedServices?.length || user.allowedServices.includes(srv.id) || user.role === 'ADMIN';
                  return (
                    <div
                      key={srv.id}
                      className={`p-2 rounded border text-xs flex items-center justify-between ${
                        isEnabled
                          ? 'bg-indigo-600/10 border-indigo-500/30 text-slate-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-50'
                      }`}
                    >
                      <span className="text-[11px] font-medium truncate">{srv.label}</span>
                      <span className={`text-[9px] font-mono font-bold ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isEnabled ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>To upgrade plan or add operator seats, contact your dispatch administrator.</span>
            <span className="font-mono text-slate-300">v2.5.0-DESKTOP</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: CONCISE FINANCIAL YEARS & NUMBERING SERIES ───────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
              Financial Year & Invoicing Series
            </h2>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
              Active Context: FY {activeFY}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenAdd}
            className="rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1 px-2.5 cursor-pointer"
          >
            <Plus size={12} className="mr-1 inline" /> Add FY
          </Button>
        </div>

        {/* Ultra-Concise Financial Year Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[10px] font-mono text-slate-400 border-b border-slate-800/80 uppercase">
                <th className="py-2 px-2.5">FY Cycle</th>
                <th className="py-2 px-2.5">Accounting Period</th>
                <th className="py-2 px-2.5">Series & Start Seq</th>
                <th className="py-2 px-2.5">Sample Format</th>
                <th className="py-2 px-2.5 text-right">Switch / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
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
                    <tr
                      key={fy.code}
                      className={`transition-colors ${
                        isActive
                          ? 'bg-indigo-600/10 text-slate-100 font-medium'
                          : 'hover:bg-slate-800/30 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-2.5 font-mono font-bold flex items-center gap-1.5">
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-700" />
                        )}
                        <span>FY {fy.code}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-2.5 font-mono text-[11px] text-slate-400">
                        01/04/{startYr} – 31/03/20{endYrShort}
                      </td>

                      <td className="py-2 px-2.5 font-mono text-slate-200">
                        {prefix} (Seq #{startSeq.toString().padStart(padding, '0')})
                      </td>

                      <td className="py-2 px-2.5 font-mono text-indigo-400 font-bold text-xs">
                        {sample}
                      </td>

                      <td className="py-2 px-2.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Selected
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectActive(fy.code)}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                              Switch to {fy.code}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(fy)}
                            className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Series"
                          >
                            <Pencil size={12} />
                          </button>

                          {!isActive && financialYears.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDelete(fy.code)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete FY"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SECTION 3: SYSTEM SHORTCUTS STRIP (CONCISE) ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => navigate('/billing/templates')}
          className="p-3 bg-slate-900/80 border border-slate-800 rounded hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-indigo-600/20 text-indigo-400 shrink-0">
              <Bookmark size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                Billing Presets & Profiles
              </h3>
              <p className="text-[10px] text-slate-400">Issuer details, bank & SAC codes</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </div>

        <div
          onClick={() => navigate('/billing/templates?tab=PARTIES')}
          className="p-3 bg-slate-900/80 border border-slate-800 rounded hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-emerald-600/20 text-emerald-400 shrink-0">
              <Building size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                Client & Vendor Directory
              </h3>
              <p className="text-[10px] text-slate-400">Buyer GSTINs & delivery sites</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </div>

        <div
          onClick={() => navigate('/users')}
          className="p-3 bg-slate-900/80 border border-slate-800 rounded hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-600/20 text-amber-400 shrink-0">
              <Users size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                Master Users & Licenses
              </h3>
              <p className="text-[10px] text-slate-400">Operator logins & audit trail</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded max-w-lg w-full p-5 shadow-2xl space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {isAddingNew ? 'Add New Financial Year' : `Edit Financial Year: FY ${formData.code}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure serial prefix, starting sequence number, and GST financial cycle rules.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSave} className="space-y-4 text-xs">
          {/* Live Preview Bar */}
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/30 rounded space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Sparkles size={13} className="text-indigo-400" />
              <span>Live Series Preview for FY {fyCode}:</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-200">
              <span>Next: <strong className="text-emerald-400">{sample1}</strong></span>
              <span>Following: <strong className="text-slate-400">{sample2}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* FY Code */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Financial Year Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                placeholder="2026-27"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                disabled={!isAddingNew}
                required
              />
            </div>

            {/* Prefix */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Invoice Prefix *
              </label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData((p) => ({ ...p, prefix: e.target.value }))}
                placeholder="DGR/"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Starting Sequence Number */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Starting Sequence Number
              </label>
              <input
                type="number"
                min={1}
                value={formData.startSequence}
                onChange={(e) => setFormData((p) => ({ ...p, startSequence: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Zero-Padding Digits */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Zero-Padding Digits
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
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
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Optional Suffix (Leave empty if none)
              </label>
              <input
                type="text"
                value={formData.suffix}
                onChange={(e) => setFormData((p) => ({ ...p, suffix: e.target.value }))}
                placeholder="e.g. GST or EXP"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4">
              <Save size={13} className="mr-1 inline" /> Save Financial Year Series
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
