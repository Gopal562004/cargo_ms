import { useAuthStore } from '../store/authStore';
import api from './api';

function getUserScopedKey(baseKey) {
  try {
    const user = useAuthStore.getState().user;
    const userKey = user?.id || user?.username || 'shared';
    return `${baseKey}_${userKey}`;
  } catch {
    return `${baseKey}_default`;
  }
}

const LEDGERS_STORAGE_KEY_BASE = 'cargohub_accounting_ledgers';

export const TALLY_GROUPS = [
  { id: 'SUNDRY_DEBTORS', name: 'Sundry Debtors', category: 'ASSETS', defaultDrCr: 'Dr', description: 'Customers, Clients & Outward Billing Parties' },
  { id: 'SUNDRY_CREDITORS', name: 'Sundry Creditors', category: 'LIABILITIES', defaultDrCr: 'Cr', description: 'Suppliers, Vendors, Airlines, Transporters & CHAs' },
  { id: 'BANK_ACCOUNTS', name: 'Bank Accounts', category: 'ASSETS', defaultDrCr: 'Dr', description: 'Current Accounts, OD/CC Accounts & Savings' },
  { id: 'CASH_IN_HAND', name: 'Cash-in-Hand', category: 'ASSETS', defaultDrCr: 'Dr', description: 'Petty Cash & Counter Cash' },
  { id: 'SALES_ACCOUNTS', name: 'Sales Accounts', category: 'INCOME', defaultDrCr: 'Cr', description: 'Freight Revenue & Logistics Sales' },
  { id: 'PURCHASE_ACCOUNTS', name: 'Purchase Accounts', category: 'EXPENSE', defaultDrCr: 'Dr', description: 'Direct Logistics & Freight Purchases' },
  { id: 'DUTIES_TAXES', name: 'Duties & Taxes', category: 'LIABILITIES', defaultDrCr: 'Cr', description: 'CGST, SGST, IGST & TDS Accounts' },
  { id: 'DIRECT_EXPENSES', name: 'Direct Expenses', category: 'EXPENSE', defaultDrCr: 'Dr', description: 'Airline Freight, Ocean Freight, Cartage, Packaging & DGD' },
  { id: 'INDIRECT_EXPENSES', name: 'Indirect Expenses', category: 'EXPENSE', defaultDrCr: 'Dr', description: 'Office Rent, Salaries, Software Subscriptions & Utilities' },
  { id: 'DIRECT_INCOMES', name: 'Direct Incomes', category: 'INCOME', defaultDrCr: 'Cr', description: 'Freight Handling, Commission & Storage Income' },
  { id: 'INDIRECT_INCOMES', name: 'Indirect Incomes', category: 'INCOME', defaultDrCr: 'Cr', description: 'Interest, Discounts Received & Other Incomes' },
  { id: 'FIXED_ASSETS', name: 'Fixed Assets', category: 'ASSETS', defaultDrCr: 'Dr', description: 'Office Equipment, Forklifts, Pallets & Computer Hardware' },
  { id: 'CURRENT_ASSETS', name: 'Current Assets', category: 'ASSETS', defaultDrCr: 'Dr', description: 'Security Deposits & Loans / Advances to Staff' },
  { id: 'CURRENT_LIABILITIES', name: 'Current Liabilities', category: 'LIABILITIES', defaultDrCr: 'Cr', description: 'Outstanding Expenses & Statutory Payables' },
  { id: 'CAPITAL_ACCOUNT', name: 'Capital Account', category: 'CAPITAL', defaultDrCr: 'Cr', description: 'Proprietor / Partner Capital & Equity' },
];

export const DEFAULT_CORE_LEDGERS = [
  {
    id: 'led_cash',
    name: 'Cash-in-Hand A/c',
    alias: 'CASH',
    parentGroup: 'CASH_IN_HAND',
    openingBalance: 0,
    openingDrCr: 'Dr',
    state: 'Maharashtra (27)',
    country: 'India',
    isSystem: true,
    description: 'Primary Petty Cash Account',
  },
  {
    id: 'led_bank_main',
    name: 'Bank Current A/c',
    alias: 'BANK_CA',
    parentGroup: 'BANK_ACCOUNTS',
    openingBalance: 0,
    openingDrCr: 'Dr',
    state: 'Maharashtra (27)',
    country: 'India',
    isSystem: false,
    description: 'Operational Current Account',
  },
  {
    id: 'led_sales_gst18',
    name: 'Sales - Air & Cargo Freight (18% GST)',
    alias: 'FREIGHT_SALES',
    parentGroup: 'SALES_ACCOUNTS',
    openingBalance: 0,
    openingDrCr: 'Cr',
    hsnSac: '9965',
    isSystem: true,
    description: 'Domestic & International Outward Freight Revenue',
  },
  {
    id: 'led_exp_freight',
    name: 'Airline Freight & Surcharges Expense A/c',
    alias: 'FREIGHT_EXP',
    parentGroup: 'DIRECT_EXPENSES',
    openingBalance: 0,
    openingDrCr: 'Dr',
    hsnSac: '9965',
    isSystem: true,
    description: 'Master Air Waybill Airline Freight Costs',
  },
  {
    id: 'led_exp_packaging',
    name: 'UN 4G DG Packaging Material Expense A/c',
    alias: 'PKG_EXP',
    parentGroup: 'DIRECT_EXPENSES',
    openingBalance: 0,
    openingDrCr: 'Dr',
    hsnSac: '4819',
    isSystem: true,
    description: 'Packaging boxes, tape, strapping, pallets and labels',
  },
  {
    id: 'led_gst_output_cgst',
    name: 'Output CGST A/c',
    alias: 'O_CGST',
    parentGroup: 'DUTIES_TAXES',
    openingBalance: 0,
    openingDrCr: 'Cr',
    taxType: 'CGST',
    isSystem: true,
    description: 'Central GST collected on Outward Sales',
  },
  {
    id: 'led_gst_output_sgst',
    name: 'Output SGST A/c',
    alias: 'O_SGST',
    parentGroup: 'DUTIES_TAXES',
    openingBalance: 0,
    openingDrCr: 'Cr',
    taxType: 'SGST',
    isSystem: true,
    description: 'State GST collected on Outward Sales',
  },
  {
    id: 'led_gst_output_igst',
    name: 'Output IGST A/c',
    alias: 'O_IGST',
    parentGroup: 'DUTIES_TAXES',
    openingBalance: 0,
    openingDrCr: 'Cr',
    taxType: 'IGST',
    isSystem: true,
    description: 'Integrated GST collected on Inter-State Sales',
  },
  {
    id: 'led_gst_input_cgst',
    name: 'Input CGST A/c',
    alias: 'I_CGST',
    parentGroup: 'DUTIES_TAXES',
    openingBalance: 0,
    openingDrCr: 'Dr',
    taxType: 'CGST',
    isSystem: true,
    description: 'Central GST paid on Inward Purchases (ITC)',
  },
  {
    id: 'led_gst_input_sgst',
    name: 'Input SGST A/c',
    alias: 'I_SGST',
    parentGroup: 'DUTIES_TAXES',
    openingBalance: 0,
    openingDrCr: 'Dr',
    taxType: 'SGST',
    isSystem: true,
    description: 'State GST paid on Inward Purchases (ITC)',
  },
  {
    id: 'led_gst_input_igst',
    name: 'Input IGST A/c',
    alias: 'I_IGST',
    parentGroup: 'DUTIES_TAXES',
    openingBalance: 0,
    openingDrCr: 'Dr',
    taxType: 'IGST',
    isSystem: true,
    description: 'Integrated GST paid on Inter-State Purchases (ITC)',
  },
];

/**
 * Load User-Scoped Ledgers from Local Storage
 */
export function getSavedLedgers() {
  const key = getUserScopedKey(LEDGERS_STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_CORE_LEDGERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CORE_LEDGERS;
    return parsed.filter((l) => l.id !== 'led_party_reliance' && l.id !== 'led_vendor_airindia');
  } catch {
    return DEFAULT_CORE_LEDGERS;
  }
}

/**
 * Save / Update a Ledger in Local Storage and sync online
 */
export async function saveLedger(ledgerData) {
  const key = getUserScopedKey(LEDGERS_STORAGE_KEY_BASE);
  const current = getSavedLedgers();
  const id = ledgerData.id || 'led_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  const existingIdx = current.findIndex((l) => l.id === id);
  const cleanLedger = {
    ...ledgerData,
    id,
    openingBalance: parseFloat(ledgerData.openingBalance) || 0,
    openingDrCr: ledgerData.openingDrCr || 'Dr',
    updatedAt: new Date().toISOString(),
  };

  let updatedList;
  if (existingIdx >= 0) {
    updatedList = current.map((l, i) => (i === existingIdx ? cleanLedger : l));
  } else {
    updatedList = [cleanLedger, ...current];
  }

  localStorage.setItem(key, JSON.stringify(updatedList));

  // Sync to Neon backend contact/template registry as an accounting ledger
  try {
    await api.post('/contacts', {
      type: ledgerData.parentGroup === 'SUNDRY_DEBTORS' ? 'CONSIGNEE' : 'CARRIER',
      name: ledgerData.name,
      company: ledgerData.name,
      taxId: ledgerData.gstin || ledgerData.panNumber || '',
      address: ledgerData.address || '',
      state: ledgerData.state || '',
      phone: ledgerData.phone || '',
      email: ledgerData.email || '',
      notes: `[TALLY_LEDGER] Group: ${ledgerData.parentGroup} | Alias: ${ledgerData.alias || ''}`,
    });
  } catch {
    // offline resilient
  }

  return cleanLedger;
}

/**
 * Delete / Soft-Delete a Ledger
 */
export function deleteLedger(id) {
  const key = getUserScopedKey(LEDGERS_STORAGE_KEY_BASE);
  const current = getSavedLedgers();
  const updated = current.filter((l) => l.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

/**
 * Reset Ledgers to Factory Standard Defaults
 */
export function resetLedgersToDefault() {
  const key = getUserScopedKey(LEDGERS_STORAGE_KEY_BASE);
  localStorage.setItem(key, JSON.stringify(DEFAULT_CORE_LEDGERS));
  return DEFAULT_CORE_LEDGERS;
}

/**
 * Compute Complete Tally Prime Style Voucher Statement for a Ledger
 */
export function computeLedgerStatement(ledger, salesInvoices = [], purchaseBills = []) {
  const openingBal = parseFloat(ledger.openingBalance) || 0;
  const isOpeningDr = ledger.openingDrCr === 'Dr';

  const vouchers = [];

  // Match Sales Invoices (Debits to Debtor, Credit to Sales/GST)
  if (Array.isArray(salesInvoices)) {
    for (const inv of salesInvoices) {
      const d = inv.data || {};
      const buyerName = (d.buyerName || '').trim().toLowerCase();
      const buyerGstin = (d.buyerGstin || '').trim().toUpperCase();
      const ledgerName = (ledger.name || '').trim().toLowerCase();
      const ledgerGstin = (ledger.gstin || '').trim().toUpperCase();

      const isDebtorMatch =
        ((ledgerGstin && buyerGstin && ledgerGstin === buyerGstin) ||
          (buyerName && ledgerName && (buyerName.includes(ledgerName) || ledgerName.includes(buyerName)))) &&
        ledger.parentGroup !== 'SALES_ACCOUNTS' &&
        ledger.parentGroup !== 'DUTIES_TAXES' &&
        ledger.parentGroup !== 'DIRECT_EXPENSES' &&
        ledger.parentGroup !== 'BANK_ACCOUNTS' &&
        ledger.parentGroup !== 'CASH_IN_HAND';

      const isSalesAccountMatch = ledger.parentGroup === 'SALES_ACCOUNTS';
      const isOutputTaxMatch =
        ledger.parentGroup === 'DUTIES_TAXES' &&
        ledger.taxType &&
        ledger.name.toLowerCase().includes('output');

      const invNo = inv.documentNumber || d.invoiceNumber || 'INV-DRAFT';
      const invDate = d.invoiceDate || inv.createdAt?.split('T')[0] || '';
      const totalAmount = parseFloat(d.grandTotal || d.totalAmount || inv.totalAmount) || 0;
      const taxableAmount = parseFloat(d.taxableAmount || d.subTotal) || 0;
      const cgst = parseFloat(d.cgstAmount) || 0;
      const sgst = parseFloat(d.sgstAmount) || 0;
      const igst = parseFloat(d.igstAmount) || 0;

      if (isDebtorMatch) {
        // Debtor is DEBITED for full invoice value
        vouchers.push({
          id: inv.id,
          date: invDate,
          voucherType: 'Sales Invoice',
          voucherNo: invNo,
          particulars: 'To Sales - Freight & Logistics',
          debit: totalAmount,
          credit: 0,
          narration: `Tax invoice issued for ${d.items?.length || 1} cargo consignments (AWB: ${d.airwayBillNo || d.awbNumber || 'N/A'})`,
        });

        // If invoice is marked PAID, record Receipt Voucher (CREDIT to debtor)
        if (inv.status === 'COMPLETED' || d.status === 'PAID' || d.paymentStatus === 'PAID') {
          vouchers.push({
            id: inv.id + '_rcpt',
            date: d.paidDate || invDate,
            voucherType: 'Receipt',
            voucherNo: 'RCPT-' + invNo.replace(/[^0-9]/g, '').slice(-4),
            particulars: 'By Bank / Online Collection',
            debit: 0,
            credit: totalAmount,
            narration: `Payment received against Invoice ${invNo} via ${d.paymentMode || 'NEFT/RTGS'}`,
          });
        }
      } else if (isSalesAccountMatch) {
        // Sales Account is CREDITED for taxable value
        vouchers.push({
          id: inv.id + '_sales',
          date: invDate,
          voucherType: 'Sales',
          voucherNo: invNo,
          particulars: `By ${d.buyerName || 'Sundry Debtors'}`,
          debit: 0,
          credit: taxableAmount,
          narration: `Taxable logistics revenue booked against invoice ${invNo}`,
        });
      } else if (isOutputTaxMatch) {
        let taxVal = 0;
        if (ledger.taxType === 'CGST') taxVal = cgst;
        else if (ledger.taxType === 'SGST') taxVal = sgst;
        else if (ledger.taxType === 'IGST') taxVal = igst;

        if (taxVal > 0) {
          vouchers.push({
            id: inv.id + `_tax_${ledger.taxType}`,
            date: invDate,
            voucherType: 'Sales',
            voucherNo: invNo,
            particulars: `By ${d.buyerName || 'Sundry Debtors'}`,
            debit: 0,
            credit: taxVal,
            narration: `Output ${ledger.taxType} liability on invoice ${invNo}`,
          });
        }
      }
    }
  }

  // Match Purchase Bills (Credits to Creditor, Debit to Expense/ITC)
  // Match Purchase Bills (Credits to Creditor, Debit to Expense/ITC)
  if (Array.isArray(purchaseBills)) {
    for (const bill of purchaseBills) {
      const d = bill.data || {};
      const vendorName = (d.vendorName || '').trim().toLowerCase();
      const vendorGstin = (d.vendorGstin || '').trim().toUpperCase();
      const ledgerName = (ledger.name || '').trim().toLowerCase();
      const ledgerGstin = (ledger.gstin || '').trim().toUpperCase();
      const expenseCategory = (d.expenseCategory || '').toLowerCase();

      const isCreditorMatch =
        ((ledgerGstin && vendorGstin && ledgerGstin === vendorGstin) ||
          (vendorName && ledgerName && (vendorName.includes(ledgerName) || ledgerName.includes(vendorName)))) &&
        ledger.parentGroup !== 'SALES_ACCOUNTS' &&
        ledger.parentGroup !== 'DUTIES_TAXES' &&
        ledger.parentGroup !== 'DIRECT_EXPENSES' &&
        ledger.parentGroup !== 'BANK_ACCOUNTS' &&
        ledger.parentGroup !== 'CASH_IN_HAND';

      const isExpenseMatch =
        (ledger.parentGroup === 'DIRECT_EXPENSES' || ledger.parentGroup === 'INDIRECT_EXPENSES') &&
        (ledger.alias === 'PKG_EXP' ||
          ledgerName.includes('packaging') ||
          (expenseCategory && ledgerName.includes(expenseCategory)) ||
          (d.description && ledgerName.includes(d.description.toLowerCase())));

      const isInputTaxMatch =
        ledger.parentGroup === 'DUTIES_TAXES' &&
        ledger.taxType &&
        (ledgerName.includes('input') || ledger.openingDrCr === 'Dr');

      const billNo = d.billNumber || bill.documentNumber || 'BILL-001';
      const billDate = d.billDate || bill.createdAt?.split('T')[0] || '';
      const grandTotal = parseFloat(d.grandTotal || d.totalAmount || bill.totalAmount) || 0;
      const taxable = parseFloat(d.taxableAmount || d.subTotal) || 0;

      // Extract / compute GST accurately
      let cgst = parseFloat(d.cgstAmount) || 0;
      let sgst = parseFloat(d.sgstAmount) || 0;
      let igst = parseFloat(d.igstAmount) || 0;
      const totalGst = parseFloat(d.totalGst) || (grandTotal > taxable ? grandTotal - taxable : 0);

      if (!cgst && !sgst && !igst && totalGst > 0) {
        if (d.taxType === 'INTER_STATE' || (d.vendorGstin && !d.vendorGstin.startsWith('27'))) {
          igst = totalGst;
        } else {
          cgst = totalGst / 2;
          sgst = totalGst / 2;
        }
      }

      if (isCreditorMatch) {
        // Creditor is CREDITED for full bill value
        vouchers.push({
          id: bill.id,
          date: billDate,
          voucherType: 'Purchase Bill',
          voucherNo: billNo,
          particulars: `By ${d.expenseCategory || 'Freight / Logistics Expense'}`,
          debit: 0,
          credit: grandTotal,
          narration: `Inward expense booked: ${d.description || d.expenseCategory || 'Freight'} (AWB: ${d.airwayBillNo || 'N/A'})`,
        });

        // If bill is marked PAID, record Payment Voucher (DEBIT to creditor)
        if (d.status === 'COMPLETED' || d.status === 'PAID' || d.status === 'ISSUED') {
          vouchers.push({
            id: bill.id + '_pmt',
            date: d.paidDate || billDate,
            voucherType: 'Payment',
            voucherNo: 'PMT-' + billNo.replace(/[^0-9]/g, '').slice(-4),
            particulars: 'To Bank / Cash Payment',
            debit: grandTotal,
            credit: 0,
            narration: `Payment settled for ${d.vendorName || 'Vendor'} via ${d.paymentMode || 'NEFT/RTGS'}`,
          });
        }
      } else if (isExpenseMatch) {
        // Expense Account is DEBITED for taxable value
        vouchers.push({
          id: bill.id + '_exp',
          date: billDate,
          voucherType: 'Purchase',
          voucherNo: billNo,
          particulars: `To ${d.vendorName || 'Sundry Creditors'}`,
          debit: taxable,
          credit: 0,
          narration: `Direct expense booked against bill ${billNo}`,
        });
      } else if (isInputTaxMatch) {
        let taxVal = 0;
        if (ledger.taxType === 'CGST') taxVal = cgst;
        else if (ledger.taxType === 'SGST') taxVal = sgst;
        else if (ledger.taxType === 'IGST') taxVal = igst;

        if (taxVal > 0) {
          vouchers.push({
            id: bill.id + `_itc_${ledger.taxType}`,
            date: billDate,
            voucherType: 'Purchase',
            voucherNo: billNo,
            particulars: `To ${d.vendorName || 'Sundry Creditors'}`,
            debit: taxVal,
            credit: 0,
            narration: `Input Tax Credit (${ledger.taxType}) claimed against bill ${billNo}`,
          });
        }
      }
    }
  }

  // Sort vouchers date-wise
  vouchers.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  // Compute Running Balance
  let runningNet = isOpeningDr ? openingBal : -openingBal;
  let totalDebit = 0;
  let totalCredit = 0;

  const voucherRows = vouchers.map((v) => {
    totalDebit += v.debit;
    totalCredit += v.credit;
    runningNet += v.debit - v.credit;

    const absBalance = Math.abs(runningNet);
    const balanceDrCr = runningNet >= 0 ? 'Dr' : 'Cr';

    return {
      ...v,
      runningBalance: absBalance,
      runningDrCr: balanceDrCr,
    };
  });

  const finalNet = (isOpeningDr ? openingBal : -openingBal) + totalDebit - totalCredit;
  const closingBalance = Math.abs(finalNet);
  const closingDrCr = finalNet >= 0 ? 'Dr' : 'Cr';

  return {
    ledger,
    openingBalance: openingBal,
    openingDrCr: ledger.openingDrCr || 'Dr',
    vouchers: voucherRows,
    totalDebit,
    totalCredit,
    closingBalance,
    closingDrCr,
  };
}
