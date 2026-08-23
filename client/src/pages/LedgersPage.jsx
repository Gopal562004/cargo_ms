import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Building,
  CreditCard,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  X,
  Printer,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Receipt,
  ShoppingBag,
  Landmark,
  Shield,
  Layers,
} from 'lucide-react';
import {
  getSavedLedgers,
  saveLedger,
  deleteLedger,
  resetLedgersToDefault,
  TALLY_GROUPS,
  computeLedgerStatement,
} from '../services/ledgerService';
import { useDocumentStore } from '../store/documentStore';
import { useFinancialYearStore, filterDocumentsByFY } from '../store/financialYearStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LedgersPage() {
  const navigate = useNavigate();
  const { documents, fetchDocuments } = useDocumentStore();
  const { activeFY } = useFinancialYearStore();

  const [ledgers, setLedgers] = useState([]);
  const [selectedGroupTab, setSelectedGroupTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);
  const [statementModalLedger, setStatementModalLedger] = useState(null);

  useEffect(() => {
    fetchDocuments({ limit: 200, sortBy: 'createdAt', sortOrder: 'desc' });
    setLedgers(getSavedLedgers());
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Filter Sales & Purchase bills for active FY
  const salesInvoices = useMemo(() => {
    const rawSales = documents.filter((d) => d.documentType === 'TAX_INVOICE' && d.data?.invoiceKind !== 'PURCHASE');
    return filterDocumentsByFY(rawSales, activeFY);
  }, [documents, activeFY]);

  const purchaseBills = useMemo(() => {
    const rawPurchases = documents.filter((d) => {
      if (d.documentType !== 'TAX_INVOICE') return false;
      const data = d.data || {};
      return data.invoiceKind === 'PURCHASE' || data.isPurchase === true || (d.title || '').toLowerCase().includes('purchase bill');
    });
    return filterDocumentsByFY(rawPurchases, activeFY);
  }, [documents, activeFY]);

  // Auto-discover parties from purchase bills & sales invoices
  const allEffectiveLedgers = useMemo(() => {
    const list = [...ledgers];
    const existingNames = new Set(list.map((l) => (l.name || '').trim().toLowerCase()));

    // Discover vendors from purchase bills
    for (const b of purchaseBills) {
      const vName = (b.data?.vendorName || '').trim();
      if (vName && !existingNames.has(vName.toLowerCase())) {
        existingNames.add(vName.toLowerCase());
        list.push({
          id: 'auto_vendor_' + vName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: vName,
          alias: (b.data?.vendorAlias || vName.split(' ')[0] || '').toUpperCase(),
          parentGroup: 'SUNDRY_CREDITORS',
          openingBalance: 0,
          openingDrCr: 'Cr',
          gstin: b.data?.vendorGstin || '',
          state: b.data?.vendorState || 'Maharashtra (27)',
          address: b.data?.vendorAddress || '',
          isSystem: false,
        });
      }
    }

    // Discover buyers from sales invoices
    for (const inv of salesInvoices) {
      const bName = (inv.data?.buyerName || '').trim();
      if (bName && !existingNames.has(bName.toLowerCase())) {
        existingNames.add(bName.toLowerCase());
        list.push({
          id: 'auto_buyer_' + bName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: bName,
          alias: (inv.data?.buyerAlias || bName.split(' ')[0] || '').toUpperCase(),
          parentGroup: 'SUNDRY_DEBTORS',
          openingBalance: 0,
          openingDrCr: 'Dr',
          gstin: inv.data?.buyerGstin || '',
          state: inv.data?.buyerState || 'Maharashtra (27)',
          address: inv.data?.buyerAddress || '',
          isSystem: false,
        });
      }
    }

    return list;
  }, [ledgers, purchaseBills, salesInvoices]);

  // Compute live statements & closing balances for all ledgers
  const computedLedgers = useMemo(() => {
    return allEffectiveLedgers.map((ledger) => {
      const stmt = computeLedgerStatement(ledger, salesInvoices, purchaseBills);
      return {
        ...ledger,
        statement: stmt,
        closingBalance: stmt.closingBalance,
        closingDrCr: stmt.closingDrCr,
        totalDebit: stmt.totalDebit,
        totalCredit: stmt.totalCredit,
      };
    });
  }, [allEffectiveLedgers, salesInvoices, purchaseBills]);

  // Filter ledgers by selected Group Tab & Search
  const filteredLedgers = useMemo(() => {
    return computedLedgers.filter((l) => {
      // Group Filter
      if (selectedGroupTab === 'SUNDRY_DEBTORS' && l.parentGroup !== 'SUNDRY_DEBTORS') return false;
      if (selectedGroupTab === 'SUNDRY_CREDITORS' && l.parentGroup !== 'SUNDRY_CREDITORS') return false;
      if (selectedGroupTab === 'BANK_ACCOUNTS' && l.parentGroup !== 'BANK_ACCOUNTS' && l.parentGroup !== 'CASH_IN_HAND') return false;
      if (selectedGroupTab === 'DUTIES_TAXES' && l.parentGroup !== 'DUTIES_TAXES') return false;
      if (selectedGroupTab === 'SALES_ACCOUNTS' && l.parentGroup !== 'SALES_ACCOUNTS' && l.parentGroup !== 'DIRECT_INCOMES') return false;
      if (selectedGroupTab === 'EXPENSES' && l.parentGroup !== 'DIRECT_EXPENSES' && l.parentGroup !== 'INDIRECT_EXPENSES' && l.parentGroup !== 'PURCHASE_ACCOUNTS') return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = (l.name || '').toLowerCase().includes(q);
        const aliasMatch = (l.alias || '').toLowerCase().includes(q);
        const gstinMatch = (l.gstin || '').toLowerCase().includes(q);
        const groupMatch = (l.parentGroup || '').toLowerCase().includes(q);
        return nameMatch || aliasMatch || gstinMatch || groupMatch;
      }

      return true;
    });
  }, [computedLedgers, selectedGroupTab, search]);

  // High-level Balance Totals
  const { totalDebits, totalCredits, netReceivables, netPayables } = useMemo(() => {
    let debits = 0;
    let credits = 0;
    let recv = 0;
    let pay = 0;

    for (const l of computedLedgers) {
      if (l.closingDrCr === 'Dr') {
        debits += l.closingBalance;
        if (l.parentGroup === 'SUNDRY_DEBTORS') recv += l.closingBalance;
      } else {
        credits += l.closingBalance;
        if (l.parentGroup === 'SUNDRY_CREDITORS') pay += l.closingBalance;
      }
    }

    return { totalDebits: debits, totalCredits: credits, netReceivables: recv, netPayables: pay };
  }, [computedLedgers]);

  const handleOpenCreate = () => {
    setEditingLedger(null);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (ledger) => {
    setEditingLedger(ledger);
    setCreateModalOpen(true);
  };

  const handleDeleteLedger = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ledger: "${name}"?`)) {
      const updated = deleteLedger(id);
      setLedgers(updated);
      showNotification(`Ledger "${name}" deleted.`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all ledgers to standard factory accounting defaults? Custom ledgers will be restored.')) {
      const defs = resetLedgersToDefault();
      setLedgers(defs);
      showNotification('Accounting Ledgers reset to standard defaults.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <BookOpen size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Accounting Ledgers & Chart of Accounts
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tally Prime compatible double-entry ledger masters, live voucher debit/credit registers, and party statements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
          >
            <Plus size={14} className="mr-1.5 inline" /> Create Ledger
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-md text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={15} className="text-emerald-400" />
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

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sundry Debtors (Receivables)</span>
            <TrendingUp size={15} className="text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">
            ₹{formatINR(netReceivables)} <span className="text-xs font-bold text-emerald-600">Dr</span>
          </p>
          <p className="text-[11px] text-slate-400">Total client outstanding balance</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Sundry Creditors (Payables)</span>
            <TrendingDown size={15} className="text-rose-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">
            ₹{formatINR(netPayables)} <span className="text-xs font-bold text-rose-600">Cr</span>
          </p>
          <p className="text-[11px] text-slate-400">Total airline & vendor dues</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Ledger Master</span>
            <Layers size={15} className="text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">
            {computedLedgers.length} <span className="text-xs font-normal text-slate-500">accounts</span>
          </p>
          <p className="text-[11px] text-slate-400">Chart of accounts & groups</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Financial Year</span>
            <Calendar size={15} className="text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-700 font-mono">
            FY {activeFY}
          </p>
          <p className="text-[11px] text-slate-400">Indian standard tax cycle</p>
        </div>
      </div>

      {/* MAIN LEDGER DATA CARD */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
        {/* TAB GROUP SELECTOR */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 overflow-x-auto">
          {[
            { id: 'ALL', label: `All Ledgers (${computedLedgers.length})` },
            { id: 'SUNDRY_DEBTORS', label: 'Sundry Debtors (Customers)' },
            { id: 'SUNDRY_CREDITORS', label: 'Sundry Creditors (Vendors/Airlines)' },
            { id: 'BANK_ACCOUNTS', label: 'Bank & Cash Accounts' },
            { id: 'DUTIES_TAXES', label: 'Duties & Taxes (GST/TDS)' },
            { id: 'SALES_ACCOUNTS', label: 'Sales & Incomes' },
            { id: 'EXPENSES', label: 'Direct & Indirect Expenses' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedGroupTab(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap ${
                selectedGroupTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH BAR & QUICK FILTERS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ledger by name, alias, GSTIN, or group..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredLedgers.length}</strong> of{' '}
            <strong className="text-slate-800">{computedLedgers.length}</strong> ledgers
          </div>
        </div>

        {/* LEDGERS TABLE */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Ledger Name & Alias</th>
                <th className="py-2.5 px-3">Under (Parent Group)</th>
                <th className="py-2.5 px-3">State / GSTIN</th>
                <th className="py-2.5 px-3 text-right">Opening Balance</th>
                <th className="py-2.5 px-3 text-right">Period Debit (Dr)</th>
                <th className="py-2.5 px-3 text-right">Period Credit (Cr)</th>
                <th className="py-2.5 px-3 text-right">Closing Balance</th>
                <th className="py-2.5 px-3 text-center">Statement</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching accounting ledgers found. Click "+ Create Ledger" to add one.
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((l) => {
                  const grp = TALLY_GROUPS.find((g) => g.id === l.parentGroup) || { name: l.parentGroup };

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{l.name}</div>
                        {l.alias && (
                          <div className="text-[10px] text-slate-400 font-mono">Alias: {l.alias}</div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {grp.name}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-slate-700">{l.state || 'N/A'}</div>
                        {l.gstin && (
                          <div className="text-[10px] text-indigo-600 font-mono font-semibold">{l.gstin}</div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono">
                        {l.openingBalance > 0 ? (
                          <span>
                            ₹{formatINR(l.openingBalance)}{' '}
                            <strong className={l.openingDrCr === 'Dr' ? 'text-emerald-700' : 'text-rose-700'}>
                              {l.openingDrCr}
                            </strong>
                          </span>
                        ) : (
                          <span className="text-slate-400">₹0.00</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                        {l.totalDebit > 0 ? `₹${formatINR(l.totalDebit)}` : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-rose-700">
                        {l.totalCredit > 0 ? `₹${formatINR(l.totalCredit)}` : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span>
                          ₹{formatINR(l.closingBalance)}{' '}
                          <span
                            className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                              l.closingDrCr === 'Dr'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {l.closingDrCr}
                          </span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setStatementModalLedger(l)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <BookOpen size={11} />
                          <span>Statement</span>
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(l)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                            title="Edit Ledger"
                          >
                            <Pencil size={13} />
                          </button>
                          {!l.isSystem && (
                            <button
                              type="button"
                              onClick={() => handleDeleteLedger(l.id, l.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                              title="Delete Ledger"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT LEDGER MODAL */}
      {createModalOpen && (
        <LedgerCreateEditModal
          isOpen={createModalOpen}
          initialData={editingLedger}
          onClose={() => setCreateModalOpen(false)}
          onSave={async (saved) => {
            await saveLedger(saved);
            setLedgers(getSavedLedgers());
            setCreateModalOpen(false);
            showNotification(`Ledger "${saved.name}" saved successfully!`);
          }}
        />
      )}

      {/* VOUCHER STATEMENT MODAL */}
      {statementModalLedger && (
        <LedgerStatementModal
          isOpen={Boolean(statementModalLedger)}
          ledger={statementModalLedger}
          salesInvoices={salesInvoices}
          purchaseBills={purchaseBills}
          activeFY={activeFY}
          onClose={() => setStatementModalLedger(null)}
        />
      )}
    </div>
  );
}

/**
 * Tally Prime Style Ledger Creation & Edit Modal
 */
function LedgerCreateEditModal({ isOpen, initialData, onClose, onSave }) {
  useBodyScrollLock(Boolean(isOpen));

  const isEditing = Boolean(initialData);

  const [form, setForm] = useState({
    name: initialData?.name || '',
    alias: initialData?.alias || '',
    parentGroup: initialData?.parentGroup || 'SUNDRY_DEBTORS',
    openingBalance: initialData?.openingBalance || 0,
    openingDrCr: initialData?.openingDrCr || 'Dr',
    address: initialData?.address || '',
    state: initialData?.state || 'Maharashtra (27)',
    country: initialData?.country || 'India',
    pincode: initialData?.pincode || '',
    panNumber: initialData?.panNumber || '',
    gstin: initialData?.gstin || '',
    registrationType: initialData?.registrationType || 'Regular',
    accountNumber: initialData?.accountNumber || '',
    ifscCode: initialData?.ifscCode || '',
    bankName: initialData?.bankName || '',
    branchName: initialData?.branchName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    description: initialData?.description || '',
    isSystem: initialData?.isSystem || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter a valid Ledger Name.');
      return;
    }
    onSave({
      ...(initialData?.id && { id: initialData.id }),
      ...form,
    });
  };

  const isBank = form.parentGroup === 'BANK_ACCOUNTS';
  const isDebtorOrCreditor = form.parentGroup === 'SUNDRY_DEBTORS' || form.parentGroup === 'SUNDRY_CREDITORS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? `Edit Ledger: ${initialData.name}` : 'Ledger Creation (Tally Prime Master)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Standard double-entry chart of accounts master profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-200/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Ledger Category Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Select Ledger Type / Accounting Purpose:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'CUSTOMER', label: '🏢 Customer / Client', group: 'SUNDRY_DEBTORS', drCr: 'Dr', desc: 'Outward sales invoices party' },
                { id: 'VENDOR', label: '🚚 Vendor / Supplier', group: 'SUNDRY_CREDITORS', drCr: 'Cr', desc: 'Inward purchase bills party' },
                { id: 'SALES', label: '📦 Sales Revenue', group: 'SALES_ACCOUNTS', drCr: 'Cr', desc: 'Air freight & cargo revenue' },
                { id: 'EXPENSE', label: '🛒 Purchase / Expense', group: 'DIRECT_EXPENSES', drCr: 'Dr', desc: 'Packaging, cartage, freight' },
                { id: 'BANK', label: '🏦 Bank / Cash', group: 'BANK_ACCOUNTS', drCr: 'Dr', desc: 'Current A/c & petty cash' },
                { id: 'TAX', label: '🏛 Duties & Taxes', group: 'DUTIES_TAXES', drCr: 'Cr', desc: 'GST & TDS tax accounts' },
              ].map((cat) => {
                const isSelected = form.parentGroup === cat.group;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, parentGroup: cat.group, openingDrCr: cat.drCr }))}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {cat.label}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Master Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ledger Name *
              </label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={
                  form.parentGroup === 'SUNDRY_DEBTORS'
                    ? 'e.g. Efficient Freight Forwarders Pvt Ltd (Client)'
                    : form.parentGroup === 'SUNDRY_CREDITORS'
                    ? 'e.g. DGR Packaging Company (Supplier)'
                    : form.parentGroup === 'SALES_ACCOUNTS'
                    ? 'e.g. International Air Cargo Sales A/c'
                    : form.parentGroup === 'DIRECT_EXPENSES'
                    ? 'e.g. UN Boxes & DG Packaging Material Expense'
                    : 'e.g. HDFC Bank Current A/c'
                }
                className="text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alias / Short Code
              </label>
              <Input
                type="text"
                value={form.alias}
                onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value.toUpperCase() }))}
                placeholder="e.g. EFF_MUM or DGR_PKG"
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Under (Parent Account Group) *
              </label>
              <select
                value={form.parentGroup}
                onChange={(e) => setForm((p) => ({ ...p, parentGroup: e.target.value }))}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {TALLY_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opening Balance */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opening Balance Amount (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.openingBalance}
                onChange={(e) => setForm((p) => ({ ...p, openingBalance: e.target.value }))}
                placeholder="0.00"
                className="text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Balance Type
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="radio"
                    name="drCr"
                    checked={form.openingDrCr === 'Dr'}
                    onChange={() => setForm((p) => ({ ...p, openingDrCr: 'Dr' }))}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Dr (Debit)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="radio"
                    name="drCr"
                    checked={form.openingDrCr === 'Cr'}
                    onChange={() => setForm((p) => ({ ...p, openingDrCr: 'Cr' }))}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>Cr (Credit)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Mailing & GST Details (For Debtors / Creditors) */}
          {(isDebtorOrCreditor || isBank) && (
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50/40">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Mailing & Statutory Tax Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Gala No., Street, Complex"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    State & Code
                  </label>
                  <Input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    placeholder="e.g. Maharashtra (27)"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    GSTIN / UIN
                  </label>
                  <Input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => setForm((p) => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                    placeholder="27AABCR1234F1Z1"
                    className="text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    PAN / IT No.
                  </label>
                  <Input
                    type="text"
                    value={form.panNumber}
                    onChange={(e) => setForm((p) => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
                    placeholder="AABCR1234F"
                    className="text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    GST Registration Type
                  </label>
                  <select
                    value={form.registrationType}
                    onChange={(e) => setForm((p) => ({ ...p, registrationType: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Composition">Composition</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Unregistered">Unregistered</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Details */}
          {isBank && (
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-slate-50/40">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bank Account Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bank Account Number
                  </label>
                  <Input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                    placeholder="50200012345678"
                    className="text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    IFSC Code
                  </label>
                  <Input
                    type="text"
                    value={form.ifscCode}
                    onChange={(e) => setForm((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                    placeholder="HDFC0000123"
                    className="text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bank Name
                  </label>
                  <Input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                    placeholder="HDFC Bank Ltd"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Branch Name
                  </label>
                  <Input
                    type="text"
                    value={form.branchName}
                    onChange={(e) => setForm((p) => ({ ...p, branchName: e.target.value }))}
                    placeholder="Andheri East, Mumbai"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 shadow-sm"
            >
              {isEditing ? 'Update Ledger Master' : 'Create Ledger Master'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Tally Prime Style Ledger Voucher Book / Statement Modal
 */
function LedgerStatementModal({ isOpen, ledger, salesInvoices, purchaseBills, activeFY, onClose }) {
  useBodyScrollLock(Boolean(isOpen));

  const stmt = useMemo(() => {
    return computeLedgerStatement(ledger, salesInvoices, purchaseBills);
  }, [ledger, salesInvoices, purchaseBills]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Voucher Type', 'Voucher No', 'Particulars', 'Debit (Dr)', 'Credit (Cr)', 'Running Balance'];
    const rows = [
      ['', 'Opening Balance', '', '', stmt.openingDrCr === 'Dr' ? stmt.openingBalance : 0, stmt.openingDrCr === 'Cr' ? stmt.openingBalance : 0, `${stmt.openingBalance} ${stmt.openingDrCr}`],
      ...stmt.vouchers.map((v) => [
        v.date,
        v.voucherType,
        v.voucherNo,
        `"${v.particulars.replace(/"/g, '""')}"`,
        v.debit,
        v.credit,
        `${v.runningBalance} ${v.runningDrCr}`,
      ]),
      ['', 'Closing Balance', '', '', stmt.totalDebit, stmt.totalCredit, `${stmt.closingBalance} ${stmt.closingDrCr}`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ledger_Statement_${(ledger.name || 'Account').replace(/\s+/g, '_')}_FY${activeFY}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{ledger.name}</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold">
                FY {activeFY}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Parent Group: <strong>{ledger.parentGroup}</strong> {ledger.gstin ? `| GSTIN: ${ledger.gstin}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded transition-colors flex items-center gap-1"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded transition-colors flex items-center gap-1"
            >
              <Printer size={13} /> Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-200/60"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Statement Body */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Opening Balance:</span>
              <span className="font-bold text-slate-800 font-mono">
                ₹{formatINR(stmt.openingBalance)} ({stmt.openingDrCr})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Total Debits:</span>
              <span className="font-bold text-emerald-700 font-mono">
                ₹{formatINR(stmt.totalDebit)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Total Credits:</span>
              <span className="font-bold text-rose-700 font-mono">
                ₹{formatINR(stmt.totalCredit)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Closing Balance:</span>
              <span className="font-black text-indigo-700 font-mono text-sm">
                ₹{formatINR(stmt.closingBalance)} ({stmt.closingDrCr})
              </span>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Voucher Type</th>
                  <th className="py-2 px-3">Voucher No</th>
                  <th className="py-2 px-3">Particulars / Narration</th>
                  <th className="py-2 px-3 text-right">Debit (Dr)</th>
                  <th className="py-2 px-3 text-right">Credit (Cr)</th>
                  <th className="py-2 px-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {/* Opening Balance Row */}
                <tr className="bg-slate-50/50 font-semibold">
                  <td className="py-2 px-3 text-slate-500">01/04/{activeFY?.split('-')[0]}</td>
                  <td className="py-2 px-3 text-slate-600">Opening Balance</td>
                  <td className="py-2 px-3 text-slate-400">-</td>
                  <td className="py-2 px-3 text-slate-600">As on start of Financial Year</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-700">
                    {stmt.openingDrCr === 'Dr' ? `₹${formatINR(stmt.openingBalance)}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-rose-700">
                    {stmt.openingDrCr === 'Cr' ? `₹${formatINR(stmt.openingBalance)}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                    ₹{formatINR(stmt.openingBalance)} {stmt.openingDrCr}
                  </td>
                </tr>

                {/* Transactions */}
                {stmt.vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No voucher transactions recorded for this ledger in FY {activeFY}.
                    </td>
                  </tr>
                ) : (
                  stmt.vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-mono text-slate-600">{v.date}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{v.voucherType}</td>
                      <td className="py-2 px-3 font-mono text-indigo-600 font-semibold">{v.voucherNo}</td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-900">{v.particulars}</div>
                        {v.narration && (
                          <div className="text-[10px] text-slate-400 italic">{v.narration}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">
                        {v.debit > 0 ? `₹${formatINR(v.debit)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-rose-700">
                        {v.credit > 0 ? `₹${formatINR(v.credit)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                        ₹{formatINR(v.runningBalance)} {v.runningDrCr}
                      </td>
                    </tr>
                  ))
                )}

                {/* Closing Total Row */}
                <tr className="bg-slate-100/70 font-bold border-t-2 border-slate-300">
                  <td colSpan={4} className="py-2.5 px-3 text-slate-900 uppercase text-[11px]">
                    Closing Balance as on Date
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                    ₹{formatINR(stmt.totalDebit)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-800">
                    ₹{formatINR(stmt.totalCredit)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-indigo-900 text-sm">
                    ₹{formatINR(stmt.closingBalance)} {stmt.closingDrCr}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
