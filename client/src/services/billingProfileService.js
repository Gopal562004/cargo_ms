import { useAuthStore } from '../store/authStore';
import api from './api';

/**
 * Billing Profiles & Templates Service
 * Stores default and user-saved customer profiles, delivery destinations, and full invoice templates.
 * All user-created templates and directories are strictly scoped and persisted to online PostgreSQL (Neon DB).
 */

function getUserScopedKey(baseKey) {
  try {
    const user = useAuthStore.getState().user;
    const userKey = user?.id || user?.username || 'shared';
    return `${baseKey}_${userKey}`;
  } catch {
    return `${baseKey}_default`;
  }
}

const STORAGE_KEY_BASE = 'cargohub_billing_profiles';
const PARTIES_STORAGE_KEY_BASE = 'cargohub_unified_parties_directory';
const ITEM_PRESETS_STORAGE_KEY_BASE = 'cargo_billing_item_presets_directory';

// Built-in starter profiles & templates (matching Excel & PDF reference files)
export const DEFAULT_BILLING_PROFILES = [
  {
    id: 'tpl_standard_invoice',
    name: 'INV-001 (Standard Tax Invoice)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'STANDARD PACKAGING CO',
      companyAddress: 'CARGO COMPLEX, SAHAR ROAD, ANDHERI (E)',
      companyCityPin: 'MUMBAI - 400 099',
      companyPan: 'ABCDE1234F',
      companyGstin: '27ABCDE1234F1Z5',
      companyTel: '022 - 28000000',
      companyEmail: 'billing@company.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '06687630000070',
      ifscCode: 'HDFC0003126',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'MAHAD-4',
    },
    buyer: {
      buyerName: 'GLOBAL CARGO & LOGISTICS',
      buyerAddress: 'GROUND FLOOR, AIR CARGO TERMINAL COMPLEX\nSAHAR ANDHERI EAST MUMBAI - 400099',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27ABCDE1234F1Z5',
    },
    consignee: {
      consigneeName: 'GLOBAL CARGO & LOGISTICS',
      consigneeAddress: 'GROUND FLOOR, AIR CARGO TERMINAL COMPLEX\nSAHAR ANDHERI EAST MUMBAI - 400099',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27ABCDE1234F1Z5',
    },
    invoiceNumber: 'INV/001/26-27',
    invoiceDate: '27-06-2026',
    placeOfSupply: 'Maharashtra (27)',
    reverseCharge: 'N',
    transport: '',
    items: [
      { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 2, description: 'UN APPROVED BOX X6', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 160, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 3, description: 'UN APPROVED BOX X22', subText: '', hsnCode: '48191010', qty: 3, unit: 'Pcs', price: 270, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
    ],
  },
  {
    id: 'tpl_acme_chem',
    name: 'Acme Chemicals (DG Doc)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'GLOBAL CARGO & LOGISTICS',
      companyAddress: 'GROUND FLOOR, AIR CARGO TERMINAL COMPLEX, SAHAR ROAD',
      companyCityPin: 'MUMBAI - 400 099, MAHARASHTRA, INDIA.',
      companyPan: 'ABCDE1234F',
      companyGstin: '27ABCDE1234F1Z5',
      companyTel: '+91 9800000000',
      companyEmail: 'billing@company.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'AIRPORT ROAD - STATION ROAD',
    },
    buyer: {
      buyerName: 'ACME CHEMICALS INTERNATIONAL PVT LTD',
      buyerAddress: 'UNIT 218, METRO TECH PARK, SAKI NAKA, ANDHERI EAST, MUMBAI - 400072',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27AAAAA0000A1Z5',
    },
    consignee: {
      consigneeName: 'ACME CHEMICALS INTERNATIONAL PVT LTD',
      consigneeAddress: 'UNIT 218, METRO TECH PARK, SAKI NAKA, ANDHERI EAST, MUMBAI - 400072',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27AAAAA0000A1Z5',
    },
    invoiceNumber: 'INV/007/2026-27',
    invoiceDate: '17/07/2026',
    airwayBillNo: '176-6268 0251',
    poNumberAndDate: 'INV NO-ACI/26-27/002',
    noOfPackages: '02 (01 BOX DG, 01 NON DG)',
    referenceName: 'ACME CHEMICALS INTERNATIONAL PVT LTD',
    contactNumber: '+91 9800000000',
    items: [
      { sn: 1, description: 'DG Documentation Charges', subText: 'UN NUMBER: UN 3465/6.1/III', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 1200, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Packing Charges', subText: '01 Box X3 & 01 Non haz box', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 800, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  {
    id: 'tpl_apex_freight',
    name: 'Apex Freight (Drums & Transport)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'GLOBAL CARGO & LOGISTICS',
      companyAddress: 'GROUND FLOOR, AIR CARGO TERMINAL COMPLEX, SAHAR ROAD',
      companyCityPin: 'MUMBAI - 400 099, MAHARASHTRA, INDIA.',
      companyPan: 'ABCDE1234F',
      companyGstin: '27ABCDE1234F1Z5',
      companyTel: '+91 9800000000',
      companyEmail: 'billing@company.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'AIRPORT ROAD - STATION ROAD',
    },
    buyer: {
      buyerName: 'APEX FREIGHT FORWARDERS PVT LTD',
      buyerAddress: '2ND FLOOR, CORPORATE SQUARE, GHATKOPAR ANDHERI LINK ROAD, MUMBAI - 400077',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27BBBBB0000B1Z5',
    },
    consignee: {
      consigneeName: 'HORIZON WAREHOUSING & LOGISTICS',
      consigneeAddress: 'GALA NO. 2, INDUSTRIAL ESTATE, BHIWANDI, MAHARASHTRA - 421302',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27BBBBB0000B1Z5',
    },
    invoiceNumber: 'INV/013/2026-27',
    invoiceDate: '06/08/2026',
    transport: 'BY ROAD',
    noOfPackages: '50 DRUMS',
    transportName: 'HORIZON LOGISTICS',
    paidToPaid: 'PAID',
    referenceName: 'Logistics Desk',
    contactNumber: '+91 9800000000',
    items: [
      { sn: 1, description: 'UN APP MC Y 30 KG OPEN TOP PLASTIC DRUMS', subText: '', hsnCode: '39233090', qty: 50, unit: 'Drum', price: 600, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Transport Charges', subText: 'Delivery to Bhiwandi', hsnCode: '996791', qty: 1, unit: 'Trip', price: 2800, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  {
    id: 'tpl_metro_cargo',
    name: 'Metro Cargo (DGD Charges)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'GLOBAL CARGO & LOGISTICS',
      companyAddress: 'GROUND FLOOR, AIR CARGO TERMINAL COMPLEX, SAHAR ROAD',
      companyCityPin: 'MUMBAI - 400 099, MAHARASHTRA, INDIA.',
      companyPan: 'ABCDE1234F',
      companyGstin: '27ABCDE1234F1Z5',
      companyTel: '+91 9800000000',
      companyEmail: 'billing@company.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'AIRPORT ROAD - STATION ROAD',
    },
    buyer: {
      buyerName: 'METRO CARGO LOGISTICS LLP',
      buyerAddress: 'SUITE 402, AIRPORT INDUSTRIAL ESTATE, ANDHERI EAST, MUMBAI - 400072',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27CCCCC0000C1Z5',
    },
    consignee: {
      consigneeName: 'METRO CARGO LOGISTICS LLP',
      consigneeAddress: 'SUITE 402, AIRPORT INDUSTRIAL ESTATE, ANDHERI EAST, MUMBAI - 400072',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27CCCCC0000C1Z5',
    },
    invoiceNumber: 'INV/015/2026-27',
    invoiceDate: '07/08/2026',
    transport: 'AIR',
    airwayBillNo: '176-6507-5415',
    poNumberAndDate: 'EXP/26-27/075 DT. 30-JULY-2026',
    noOfPackages: '01 PKG',
    referenceName: 'EXPORT LOGISTICS DESK',
    contactNumber: '+91 9800000000',
    items: [
      { sn: 1, description: 'DGD Charges', subText: 'UN 1549/6.1/III', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 2000, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Packing Charges', subText: '01 Box X3 Rs. 850/-', hsnCode: '996713', qty: 1, unit: 'Box', price: 850, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  {
    id: 'tpl_multi_gst',
    name: 'Multiple GST Slabs (5% & 18%)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'GLOBAL CARGO & LOGISTICS',
      companyAddress: 'GROUND FLOOR, AIR CARGO TERMINAL COMPLEX, SAHAR ROAD',
      companyCityPin: 'MUMBAI - 400 099, MAHARASHTRA, INDIA.',
      companyPan: 'ABCDE1234F',
      companyGstin: '27ABCDE1234F1Z5',
      companyTel: '+91 9800000000',
      companyEmail: 'billing@company.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'AIRPORT ROAD - STATION ROAD',
    },
    buyer: {
      buyerName: 'APEX FREIGHT FORWARDERS PVT LTD',
      buyerAddress: '2ND FLOOR, CORPORATE SQUARE, GHATKOPAR ANDHERI LINK ROAD, MUMBAI - 400077',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27BBBBB0000B1Z5',
    },
    consignee: {
      consigneeName: 'PACIFIC INDUSTRIAL CHEMICALS LTD',
      consigneeAddress: 'PLOT L-15, INDUSTRIAL MIDC AREA, TARAPUR, MAHARASHTRA - 401506',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27BBBBB0000B1Z5',
    },
    invoiceNumber: 'INV/010/2026-27',
    invoiceDate: '25/07/2026',
    transport: 'BY ROAD',
    noOfPackages: '02 BOXES',
    transportName: 'COURIER',
    paidToPaid: 'PAID',
    referenceName: 'Dispatch Coordinator',
    contactNumber: '+91 9800000000',
    items: [
      { sn: 1, description: 'UN APPROVED BOX X55', subText: '', hsnCode: '48191010', qty: 2, unit: 'Box', price: 630, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 2, description: 'COURIER CHARGES', subText: 'To Tarapur MIDC', hsnCode: '996713', qty: 1, unit: 'Trip', price: 500, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
];

/**
 * Sync templates from Neon PostgreSQL DB online
 */
export async function syncOnlineTemplates() {
  const key = getUserScopedKey(STORAGE_KEY_BASE);
  try {
    const res = await api.get('/templates?documentType=TAX_INVOICE');
    const dbTemplates = res?.data?.templates || [];
    if (Array.isArray(dbTemplates) && dbTemplates.length > 0) {
      const formatted = dbTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        category: 'Full Invoice Template',
        isDefault: t.isDefault,
        ...(t.data || {}),
      }));
      localStorage.setItem(key, JSON.stringify(formatted));
      return formatted;
    }
  } catch (err) {
    console.warn('Could not sync online templates, using local cache:', err);
  }
  return getSavedBillingProfiles();
}

/**
 * Load all billing profiles
 */
export function getSavedBillingProfiles() {
  const key = getUserScopedKey(STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_BILLING_PROFILES));
      return DEFAULT_BILLING_PROFILES;
    }
    const profiles = JSON.parse(raw);
    if (!Array.isArray(profiles)) {
      return [];
    }
    return profiles;
  } catch (err) {
    console.error('Error loading billing profiles:', err);
    return [];
  }
}

/**
 * Save a new or updated billing profile / template
 */
export function saveBillingProfile(profile) {
  const key = getUserScopedKey(STORAGE_KEY_BASE);
  const all = getSavedBillingProfiles();
  const id = profile.id || `custom_${Date.now()}`;
  const newProfile = {
    ...profile,
    id,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = all.findIndex((p) => p.id === id);
  let updated;
  if (existingIndex >= 0) {
    updated = all.map((p, i) => (i === existingIndex ? newProfile : p));
  } else {
    updated = [...all, newProfile];
  }

  localStorage.setItem(key, JSON.stringify(updated));

  // Sync to Neon PostgreSQL online in the background
  try {
    api.post('/templates', {
      id: newProfile.id,
      name: newProfile.name,
      description: newProfile.description || 'Full Invoice Template',
      documentType: 'TAX_INVOICE',
      isDefault: Boolean(newProfile.isDefault),
      data: newProfile,
    }).catch((err) => console.warn('Background online template save error:', err));
  } catch (e) {
    // Ignore offline error
  }

  return newProfile;
}

/**
 * Delete any billing profile / template
 */
export function deleteBillingProfile(profileId) {
  const key = getUserScopedKey(STORAGE_KEY_BASE);
  const all = getSavedBillingProfiles();
  const filtered = all.filter((p) => p.id !== profileId);
  localStorage.setItem(key, JSON.stringify(filtered));

  // Delete from Neon PostgreSQL online in the background
  try {
    api.delete(`/templates/${profileId}`).catch((err) => console.warn('Background online template delete error:', err));
  } catch (e) {
    // Ignore offline error
  }

  return true;
}

/**
 * Reset templates back to default starters
 */
export function resetBillingProfilesToDefault() {
  const key = getUserScopedKey(STORAGE_KEY_BASE);
  localStorage.setItem(key, JSON.stringify(DEFAULT_BILLING_PROFILES));
  return DEFAULT_BILLING_PROFILES;
}

/**
 * Get the active/first template to use by default when creating a bill
 */
export function getDefaultInvoiceTemplate() {
  const profiles = getSavedBillingProfiles();
  if (Array.isArray(profiles) && profiles.length > 0) {
    return profiles[0];
  }
  return null;
}

/**
 * Transforms a billing profile into flat editor formData and line items
 */
import { useFinancialYearStore } from '../store/financialYearStore';

const NUMBERING_SETTINGS_KEY_BASE = 'cargohub_invoice_numbering_settings';

export const DEFAULT_NUMBERING_SETTINGS = {
  prefix: 'INV/',
  financialYear: '2026-27',
  autoFinancialYear: true,
  startSequence: 1,
  paddingDigits: 3,
  suffix: '',
};

/**
 * Load User-Scoped Invoice Numbering & Financial Year Settings
 */
export function getNumberingSettings() {
  const activeProfile = useFinancialYearStore.getState().getActiveFYProfile();
  if (activeProfile) {
    return {
      prefix: activeProfile.prefix,
      financialYear: activeProfile.code,
      autoFinancialYear: false,
      startSequence: activeProfile.startSequence,
      paddingDigits: activeProfile.paddingDigits,
      suffix: activeProfile.suffix || '',
    };
  }
  const key = getUserScopedKey(NUMBERING_SETTINGS_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_NUMBERING_SETTINGS;
    return { ...DEFAULT_NUMBERING_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NUMBERING_SETTINGS;
  }
}

/**
 * Save User-Scoped Invoice Numbering & Financial Year Settings
 */
export function saveNumberingSettings(settings) {
  if (settings.financialYear) {
    useFinancialYearStore.getState().updateFinancialYear(settings.financialYear, {
      prefix: settings.prefix,
      startSequence: settings.startSequence,
      paddingDigits: settings.paddingDigits,
      suffix: settings.suffix,
    });
  }
  const key = getUserScopedKey(NUMBERING_SETTINGS_KEY_BASE);
  const current = getNumberingSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem(key, JSON.stringify(merged));
  return merged;
}

/**
 * Generates the next sequential invoice number in the format: INV/001/2026-27
 */
export function getNextInvoiceNumber(existingDocuments = []) {
  const activeProfile = useFinancialYearStore.getState().getActiveFYProfile();
  const fyStr = activeProfile?.code || '2026-27';
  const prefix = activeProfile?.prefix || 'INV/';
  const padding = parseInt(activeProfile?.paddingDigits, 10) || 3;
  const baseStartSeq = parseInt(activeProfile?.startSequence, 10) || 1;

  let maxSeq = baseStartSeq - 1;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedFy = fyStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fyShort = fyStr.length === 7 ? fyStr.slice(2, 4) + '-' + fyStr.slice(5) : fyStr;
  const pattern = new RegExp(`${escapedPrefix}(\\d+).*?(${escapedFy}|${fyShort})`, 'i');

  if (Array.isArray(existingDocuments)) {
    for (const doc of existingDocuments) {
      const isPurchase =
        doc.data?.invoiceKind === 'PURCHASE' ||
        doc.data?.isPurchase === true ||
        (doc.title || '').toLowerCase().includes('purchase');
      const isCancelled = doc.status === 'CANCELLED' || doc.data?.isDeleted === true;

      // Only count active SALES invoices
      if (!isPurchase && !isCancelled && (doc.documentType === 'TAX_INVOICE' || doc.data?.invoiceNumber)) {
        const invNo = doc.documentNumber || doc.data?.invoiceNumber || '';
        const match = invNo.match(pattern);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const paddedSeq = nextSeq.toString().padStart(padding, '0');
  const suffix = activeProfile?.suffix ? `/${activeProfile.suffix}` : '';
  return `${prefix}${paddedSeq}/${fyStr}${suffix}`;
}

/**
 * Transforms a billing profile into flat editor formData and line items
 */
export function profileToEditorState(profile, overrideData = {}, existingDocuments = []) {
  const defaultInvNo = getNextInvoiceNumber(existingDocuments);

  if (!profile) {
    const taxType = (overrideData?.buyerGstin?.startsWith('27') || !overrideData?.buyerGstin) ? 'INTRA_STATE' : 'INTER_STATE';
    return {
      formData: {
        copyType: 'Original Copy',
        docTitle: 'TAX INVOICE',
        companyLogo: null,
        companyName: '',
        companyAddress: '',
        companyCityPin: '',
        companyPan: '',
        companyGstin: '',
        companyTel: '',
        companyEmail: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        swiftCode: '',
        branchName: '',
        buyerName: '',
        buyerAddress: '',
        buyerState: 'Maharashtra (27)',
        buyerGstin: '',
        consigneeName: '',
        consigneeAddress: '',
        consigneeState: 'Maharashtra (27)',
        consigneeGstin: '',
        invoiceNumber: overrideData?.invoiceNumber || defaultInvNo,
        invoiceDate: new Date().toLocaleDateString('en-GB'),
        placeOfSupply: 'Maharashtra (27)',
        taxType,
        reverseCharge: 'N',
        transport: '',
        ewayBillNo: '',
        airwayBillNo: '',
        poNumberAndDate: '',
        noOfPackages: '',
        grossWeight: '',
        transportName: '',
        paidToPaid: '',
        referenceName: '',
        contactNumber: '',
        termsAndConditions: '',
        ...overrideData,
      },
      items: Array.isArray(overrideData?.items) && overrideData.items.length > 0
        ? overrideData.items
        : [
            { sn: 1, description: '', subText: '', hsnCode: '998319', qty: 1, unit: 'Pcs', price: 0, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 }
          ]
    };
  }

  const comp = profile.companyDetails || {};
  const buyer = profile.buyer || {};
  const cons = profile.consignee || {};
  const buyerGstin = overrideData?.buyerGstin || buyer.buyerGstin || '';
  const taxType = overrideData?.taxType || ((buyerGstin.startsWith('27') || !buyerGstin) ? 'INTRA_STATE' : 'INTER_STATE');

  const baseFormData = {
    copyType: profile.copyType || 'Original Copy',
    docTitle: profile.docTitle || 'TAX INVOICE',
    companyLogo: profile.companyLogo !== undefined ? profile.companyLogo : null,
    companyName: comp.companyName || '',
    companyAddress: comp.companyAddress || '',
    companyCityPin: comp.companyCityPin || '',
    companyPan: comp.companyPan || '',
    companyGstin: comp.companyGstin || '',
    companyTel: comp.companyTel || '',
    companyEmail: comp.companyEmail || '',
    bankName: comp.bankName || '',
    accountNumber: comp.accountNumber || '',
    ifscCode: comp.ifscCode || '',
    swiftCode: comp.swiftCode || '',
    branchName: comp.branchName || '',
    buyerName: buyer.buyerName || '',
    buyerAddress: buyer.buyerAddress || '',
    buyerState: buyer.buyerState || 'Maharashtra (27)',
    buyerGstin: buyer.buyerGstin || '',
    consigneeName: cons.consigneeName || buyer.buyerName || '',
    consigneeAddress: cons.consigneeAddress || buyer.buyerAddress || '',
    consigneeState: cons.consigneeState || buyer.buyerState || 'Maharashtra (27)',
    consigneeGstin: cons.consigneeGstin || buyer.buyerGstin || '',
    invoiceNumber: overrideData?.invoiceNumber || defaultInvNo,
    invoiceDate: overrideData?.invoiceDate || new Date().toLocaleDateString('en-GB'),
    placeOfSupply: profile.placeOfSupply || buyer.buyerState || 'Maharashtra (27)',
    taxType,
    reverseCharge: profile.reverseCharge || 'N',
    transport: profile.transport || '',
    ewayBillNo: profile.ewayBillNo || '',
    airwayBillNo: profile.airwayBillNo || '',
    poNumberAndDate: profile.poNumberAndDate || '',
    noOfPackages: profile.noOfPackages || '',
    grossWeight: profile.grossWeight || '',
    transportName: profile.transportName || '',
    paidToPaid: profile.paidToPaid || '',
    referenceName: profile.referenceName || '',
    contactNumber: profile.contactNumber || '',
    termsAndConditions: profile.termsAndConditions || '',
  };

  let finalItems = [];
  if (Array.isArray(overrideData?.items) && overrideData.items.length > 0) {
    finalItems = overrideData.items;
  } else if (Array.isArray(profile.items) && profile.items.length > 0) {
    finalItems = profile.items.map((it, idx) => {
      const gstRate = parseFloat(it.gstRate) || 0;
      return {
        sn: idx + 1,
        description: it.description || '',
        subText: it.subText || '',
        hsnCode: it.hsnCode || '',
        qty: it.qty !== undefined && it.qty !== '' ? it.qty : 1,
        unit: it.unit || 'Pcs',
        price: it.price !== undefined && it.price !== '' ? it.price : 0,
        gstRate,
        cgstRate: taxType === 'INTRA_STATE' ? gstRate / 2 : 0,
        sgstRate: taxType === 'INTRA_STATE' ? gstRate / 2 : 0,
        igstRate: taxType === 'INTRA_STATE' ? 0 : gstRate,
      };
    });
  } else {
    // 1 clean blank row ready for input with empty fields
    finalItems = [
      {
        sn: 1,
        description: '',
        subText: '',
        hsnCode: '',
        qty: 1,
        unit: 'Pcs',
        price: 0,
        gstRate: 5,
        cgstRate: taxType === 'INTRA_STATE' ? 2.5 : 0,
        sgstRate: taxType === 'INTRA_STATE' ? 2.5 : 0,
        igstRate: taxType === 'INTRA_STATE' ? 0 : 5,
      },
    ];
  }

  return {
    formData: {
      ...baseFormData,
      ...overrideData,
    },
    items: finalItems,
  };
}

const PARTIES_STORAGE_KEY = 'cargo_billing_parties_directory';

export const DEFAULT_PARTIES = [
  {
    id: 'party_global_logistics',
    name: 'GLOBAL CARGO & LOGISTICS',
    roles: ['CUSTOMER', 'DESTINATION', 'VENDOR'],
    address: 'GROUND FLOOR, AIR CARGO TERMINAL COMPLEX, SAHAR ANDHERI EAST, MUMBAI - 400099',
    state: 'Maharashtra (27)',
    gstin: '27ABCDE1234F1Z5',
    category: 'DGD',
    defaultGstRate: 18,
    defaultDescription: 'DGD Documentation Charges, DG Certification, Inspection & UN Packaging',
    contactPerson: 'Operations Desk',
    phone: '+91 9800000000',
    email: 'operations@cargologistics.com',
  },
  {
    id: 'party_packaging_vendor',
    name: 'STANDARD PACKAGING CO',
    roles: ['VENDOR'],
    address: 'CARGO COMPLEX, SAHAR ROAD, ANDHERI (E), MUMBAI - 400 099',
    state: 'Maharashtra (27)',
    gstin: '27ABCDE1234F1Z5',
    category: 'PACKAGING',
    defaultGstRate: 18,
    defaultDescription: 'UN Approved 4G Fibreboard Boxes, DG Packaging & Labeling Materials',
    contactPerson: 'Packaging Coordinator',
    phone: '+91 022-28000000',
    email: 'billing@company.com',
  },
  {
    id: 'party_acme_chem',
    name: 'ACME CHEMICALS INTERNATIONAL PVT LTD',
    roles: ['CUSTOMER', 'DESTINATION', 'VENDOR'],
    address: 'Unit 218, Metro Tech Park, Saki Naka, Andheri East, Mumbai - 400072',
    state: 'Maharashtra (27)',
    gstin: '27AAAAA0000A1Z5',
    category: 'DGD',
    defaultGstRate: 18,
    defaultDescription: 'MSDS Verification & Dangerous Goods Testing Charges',
    contactPerson: 'Accounts Dept',
    phone: '+91 98000 00000',
    email: 'accounts@acmechem.example.com',
  },
  {
    id: 'party_apex_freight',
    name: 'APEX FREIGHT FORWARDERS PVT LTD',
    roles: ['CUSTOMER', 'DESTINATION', 'VENDOR'],
    address: '2nd Floor, Corporate Square, Ghatkopar East, Mumbai - 400077',
    state: 'Maharashtra (27)',
    gstin: '27BBBBB0000B1Z5',
    category: 'TRANSPORT',
    defaultGstRate: 18,
    defaultDescription: 'Airport Cartage, Local Transport & Cargo Handling Charges',
    contactPerson: 'Operations Desk',
    phone: '+91 98000 00000',
    email: 'ops@apexfreight.example.com',
  },
  {
    id: 'party_metro_cargo',
    name: 'METRO CARGO LOGISTICS LLP',
    roles: ['CUSTOMER', 'DESTINATION'],
    address: 'Suite 402, Airport Industrial Estate, Andheri East, Mumbai - 400072',
    state: 'Maharashtra (27)',
    gstin: '27CCCCC0000C1Z5',
    category: 'TRANSPORT',
    defaultGstRate: 18,
    defaultDescription: 'Express Cargo & Logistics Forwarding',
    contactPerson: 'Cargo Operations',
    phone: '+91 98000 00000',
    email: 'manifest@metrocargo.example.com',
  },
  {
    id: 'party_horizon_warehouse',
    name: 'HORIZON WAREHOUSING & LOGISTICS',
    roles: ['DESTINATION', 'VENDOR'],
    address: 'Gala No. 2, Industrial Estate, Bhiwandi, Maharashtra - 421302',
    state: 'Maharashtra (27)',
    gstin: '27DDDDD0000D1Z5',
    category: 'WAREHOUSE',
    defaultGstRate: 18,
    defaultDescription: 'DG Storage, Palletization & Secure Strapping Charges',
    contactPerson: 'Warehouse Manager',
    phone: '+91 98000 00000',
    email: 'warehouse@horizonlogistics.example.com',
  },
  {
    id: 'party_pacific_chem',
    name: 'PACIFIC INDUSTRIAL CHEMICALS LTD',
    roles: ['DESTINATION'],
    address: 'Plot L-15, Industrial MIDC Area, Tarapur, Maharashtra - 401506',
    state: 'Maharashtra (27)',
    gstin: '27EEEEE0000E1Z5',
    category: 'OTHER',
    defaultGstRate: 18,
    defaultDescription: '',
    contactPerson: 'Dispatch Lead',
    phone: '+91 98000 00000',
    email: 'contact@pacificchem.example.com',
  },
  {
    id: 'party_airport_cargo',
    name: 'AIRPORT CARGO TERMINAL SERVICES',
    roles: ['VENDOR'],
    address: 'Cargo Terminal 2, Air Cargo Complex, New Delhi - 110037',
    state: 'Delhi (07)',
    gstin: '07FFFFF0000F1Z5',
    category: 'AIR_FREIGHT',
    defaultGstRate: 18,
    defaultDescription: 'Terminal Handling Charges (THC) & Airline Cargo Security Screening',
    contactPerson: 'Terminal Operations',
    phone: '+91 11-28000000',
    email: 'cargo@airterminal.example.com',
  },
  {
    id: 'party_customs_clear',
    name: 'SAHAR CUSTOMS CLEARING & BROKERAGE',
    roles: ['VENDOR'],
    address: 'Air Cargo Complex, Sahar, Andheri (E), Mumbai - 400 099',
    state: 'Maharashtra (27)',
    gstin: '27AAACR1234F1Z5',
    category: 'CUSTOMS',
    defaultGstRate: 18,
    defaultDescription: 'Customs DG Examination, EDI Assessment & Shipping Bill Clearance',
    contactPerson: 'Customs Executive',
    phone: '+91 9820123456',
    email: 'customs.sahar@clearance.in',
  },
];

/**
 * Load all Parties (Customers, Destinations, Vendors) from unified directory
 */
export function getSavedParties() {
  const key = getUserScopedKey(PARTIES_STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_PARTIES));
      return DEFAULT_PARTIES;
    }
    const parties = JSON.parse(raw);
    if (!Array.isArray(parties)) {
      return [];
    }
    return parties;
  } catch (err) {
    console.error('Error loading parties directory:', err);
    return [];
  }
}

/**
 * Save / Update Party in the unified directory
 */
export function saveParty(party) {
  const key = getUserScopedKey(PARTIES_STORAGE_KEY_BASE);
  const all = getSavedParties();
  const id = party.id || `party_${Date.now()}`;
  const roles = Array.isArray(party.roles) && party.roles.length > 0 ? party.roles : ['CUSTOMER'];

  const newParty = {
    ...party,
    id,
    roles,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = all.findIndex(
    (p) => p.id === id || (p.name && party.name && p.name.trim().toUpperCase() === party.name.trim().toUpperCase())
  );

  let updated;
  if (existingIndex >= 0) {
    const existing = all[existingIndex];
    const combinedRoles = Array.from(new Set([...(party.roles || []), ...(existing.roles || [])]));
    updated = all.map((p, i) => (i === existingIndex ? { ...existing, ...newParty, roles: combinedRoles, id: existing.id } : p));
  } else {
    updated = [newParty, ...all];
  }

  localStorage.setItem(key, JSON.stringify(updated));
  return newParty;
}

/**
 * Delete Party from unified directory
 */
export function deleteParty(partyId) {
  const key = getUserScopedKey(PARTIES_STORAGE_KEY_BASE);
  const all = getSavedParties();
  const filtered = all.filter((p) => p.id !== partyId);
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
}

/**
 * Reset all parties to defaults
 */
export function resetPartiesToDefault() {
  const key = getUserScopedKey(PARTIES_STORAGE_KEY_BASE);
  localStorage.setItem(key, JSON.stringify(DEFAULT_PARTIES));
  return DEFAULT_PARTIES;
}

// ----------------------------------------------------------------------------
// Unified Directory Accessors
// ----------------------------------------------------------------------------

export function getSavedBuyers() {
  return getSavedParties();
}

export function saveBuyer(buyer) {
  return saveParty(buyer);
}

export function deleteBuyer(buyerId) {
  return deleteParty(buyerId);
}

export function resetBuyersToDefault() {
  return resetPartiesToDefault();
}

export function getSavedShippers() {
  return getSavedParties();
}

export function saveShipper(shipper) {
  return saveParty(shipper);
}

export function deleteShipper(shipperId) {
  return deleteParty(shipperId);
}

export function resetShippersToDefault() {
  return resetPartiesToDefault();
}

export function getDistinctParties() {
  return getSavedParties();
}

export function getSavedVendors() {
  return getSavedParties();
}

export function saveVendor(vendor) {
  return saveParty(vendor);
}

export function deleteVendor(vendorId) {
  return deleteParty(vendorId);
}

export function resetVendorsToDefault() {
  return resetPartiesToDefault();
}

const ITEM_PRESETS_STORAGE_KEY = 'cargo_billing_item_presets_directory';

export const DEFAULT_ITEM_PRESETS = [
  {
    id: 'preset_box_x3',
    label: '+ UN Box X3 (4819)',
    description: 'UN APPROVED BOX X3',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Pcs',
    price: 110,
    gstRate: 5,
    category: 'PACKAGING',
    isBuiltIn: true,
  },
  {
    id: 'preset_box_x6',
    label: '+ UN Box X6 (4819)',
    description: 'UN APPROVED BOX X6',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Pcs',
    price: 160,
    gstRate: 5,
    category: 'PACKAGING',
    isBuiltIn: true,
  },
  {
    id: 'preset_box_x22',
    label: '+ UN Box X22 (4819)',
    description: 'UN APPROVED BOX X22',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Pcs',
    price: 270,
    gstRate: 5,
    category: 'PACKAGING',
    isBuiltIn: true,
  },
  {
    id: 'preset_box_x55',
    label: '+ UN Box X55 (4819)',
    description: 'UN APPROVED BOX X55',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Box',
    price: 630,
    gstRate: 5,
    category: 'PACKAGING',
    isBuiltIn: true,
  },
  {
    id: 'preset_drum_y75',
    label: '+ UN Drum Y75 (3923)',
    description: 'UN APPROVED Y 75 OPEN TOP DRUM',
    subText: 'DG Packaging Open Top Plastic Drum',
    hsnCode: '39233090',
    unit: 'Pcs',
    price: 560,
    gstRate: 18,
    category: 'PACKAGING',
    isBuiltIn: true,
  },
  {
    id: 'preset_drum_y30',
    label: '+ UN Drum Y30 (3923)',
    description: 'UN APP MC Y 30 KG OPEN TOP PLASTIC DRUMS',
    subText: 'DG Packaging Open Top Plastic Drum',
    hsnCode: '39233090',
    unit: 'Drum',
    price: 600,
    gstRate: 18,
    category: 'PACKAGING',
    isBuiltIn: true,
  },
  {
    id: 'preset_dgd_charges',
    label: '+ IATA DGD Charges (9983)',
    description: 'Dangerous Goods Declaration (DGD) & Inspection',
    subText: 'IATA DG Documentation & Compliance',
    hsnCode: '998319',
    unit: 'Job',
    price: 1500,
    gstRate: 18,
    category: 'DOCUMENTATION',
    isBuiltIn: true,
  },
  {
    id: 'preset_packing_charges',
    label: '+ DG Packing Fee (9967)',
    description: 'DG Cargo Repacking & Palletization Charges',
    subText: '',
    hsnCode: '996713',
    unit: 'Pcs',
    price: 800,
    gstRate: 18,
    category: 'PACKAGING',
    isBuiltIn: true,
  },
  {
    id: 'preset_air_freight',
    label: '+ Air Freight (9965)',
    description: 'Airline Master Freight Charges & Surcharges (FSC/SSC)',
    subText: 'Air Waybill Freight Logistics',
    hsnCode: '996511',
    unit: 'Shipment',
    price: 5000,
    gstRate: 18,
    category: 'FREIGHT',
    isBuiltIn: true,
  },
  {
    id: 'preset_transport_lr',
    label: '+ Transport / Cartage (9965)',
    description: 'Local Transport & Cartage Charges',
    subText: 'Delivery to Sahar Cargo / Bhiwandi',
    hsnCode: '996531',
    unit: 'Trip',
    price: 2500,
    gstRate: 18,
    category: 'TRANSPORT',
    isBuiltIn: true,
  },
  {
    id: 'preset_terminal_tsp',
    label: '+ Terminal / TSP (9967)',
    description: 'Airport TSP & Terminal Handling Charges (MIAL/AAI)',
    subText: 'Air Cargo Complex Clearance',
    hsnCode: '996719',
    unit: 'Job',
    price: 2000,
    gstRate: 18,
    category: 'CLEARANCE',
    isBuiltIn: true,
  },
];

/**
 * Load all Item & Service Presets
 */
export function getSavedItemPresets() {
  const key = getUserScopedKey(ITEM_PRESETS_STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_ITEM_PRESETS));
      return DEFAULT_ITEM_PRESETS;
    }
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) {
      return [];
    }
    return items;
  } catch (err) {
    console.error('Error loading item presets directory:', err);
    return [];
  }
}

/**
 * Save / Update Item Preset
 */
export function saveItemPreset(preset) {
  const key = getUserScopedKey(ITEM_PRESETS_STORAGE_KEY_BASE);
  const all = getSavedItemPresets();
  const id = preset.id || `preset_${Date.now()}`;
  const label = preset.label || `+ ${preset.description || 'New Item'} (${preset.hsnCode || 'HSN'})`;
  const newPreset = {
    ...preset,
    id,
    label,
    price: parseFloat(preset.price) || 0,
    gstRate: parseFloat(preset.gstRate) || 18,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = all.findIndex((p) => p.id === id);
  let updated;
  if (existingIndex >= 0) {
    updated = all.map((p, i) => (i === existingIndex ? { ...p, ...newPreset, id: p.id } : p));
  } else {
    updated = [newPreset, ...all];
  }

  localStorage.setItem(key, JSON.stringify(updated));
  return newPreset;
}

/**
 * Delete Item Preset
 */
export function deleteItemPreset(presetId) {
  const key = getUserScopedKey(ITEM_PRESETS_STORAGE_KEY_BASE);
  const all = getSavedItemPresets();
  const filtered = all.filter((p) => p.id !== presetId);
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
}

/**
 * Reset item presets to default built-in list
 */
export function resetItemPresetsToDefault() {
  const key = getUserScopedKey(ITEM_PRESETS_STORAGE_KEY_BASE);
  localStorage.setItem(key, JSON.stringify(DEFAULT_ITEM_PRESETS));
  return DEFAULT_ITEM_PRESETS;
}

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

export function getIndianStateFromGstin(gstin) {
  if (!gstin || typeof gstin !== 'string' || gstin.trim().length < 2) {
    return '';
  }
  const prefix = gstin.trim().substring(0, 2);
  return INDIAN_GST_STATES[prefix] || '';
}

