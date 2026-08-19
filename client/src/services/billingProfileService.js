/**
 * Billing Profiles & Templates Service
 * Stores default and user-saved customer profiles, delivery destinations, and full invoice templates.
 */

const STORAGE_KEY = 'cargohub_billing_profiles';

// Built-in starter profiles & templates (matching Excel & PDF reference files)
export const DEFAULT_BILLING_PROFILES = [
  {
    id: 'tpl_dgr_standard',
    name: 'INV DGR-0466 (PDF Standard)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'DGR PACKAGING COMPANY',
      companyAddress: 'SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)',
      companyCityPin: 'MUMBAI - 400 099',
      companyPan: 'CBKPK7600K',
      companyGstin: '27CBKPK7600K1ZE',
      companyTel: '022 - 26828108',
      companyEmail: 'dgrpackaging@gmail.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '06687630000070',
      ifscCode: 'HDFC0003126',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'MAHAD-4',
    },
    buyer: {
      buyerName: 'DGR GLOBAL LOGISTICS',
      buyerAddress: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27NSAPK0224B1Z7',
    },
    consignee: {
      consigneeName: 'DGR GLOBAL LOGISTICS',
      consigneeAddress: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27NSAPK0224B1Z7',
    },
    invoiceNumber: 'DGR/0466/26-27',
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
    id: 'tpl_takai',
    name: 'Takai Chemtech (DG Doc)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 9326392294',
      companyEmail: 'dgr.export.logistics@gmail.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    buyer: {
      buyerName: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
      buyerAddress: 'A-218 Sagar Tech Plaza, Saki Naka Junction, Andheri Kurla Road, Andheri East Mumbai Maharashtra India 400072.',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27AAMCT0922D1Z1',
    },
    consignee: {
      consigneeName: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
      consigneeAddress: 'A-218 Sagar Tech Plaza, Saki Naka Junction, Andheri Kurla Road, Andheri East Mumbai Maharashtra India 400072.',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27AAMCT0922D1Z1',
    },
    invoiceNumber: 'DGR/007/2026-27',
    invoiceDate: '17/07/2026',
    airwayBillNo: '176-6268 0251',
    poNumberAndDate: 'INV NO-TCI/26-27/002',
    noOfPackages: '02 (01 BOX DG, 01 NON DG)',
    referenceName: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
    contactNumber: '+91 9326392294',
    items: [
      { sn: 1, description: 'DG Documentation Charges', subText: 'UN NUMBER: UN 3465/6.1/III', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 1200, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Packing Charges', subText: '01 Box X3 & 01 Non haz box', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 800, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  {
    id: 'tpl_efficient',
    name: 'Efficient Freight (Drums & Transport)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 91062 35771',
      companyEmail: 'dgr.export.logistics@gmail.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    buyer: {
      buyerName: 'EFFICIENT FREIGHT FORWARDERS PVT LTD',
      buyerAddress: '2nd Floor/ C-205, Damji Shamji Corporate Square, Ghatkopar Andheri Link Road, Ghatkopar East, Mumbai-400077, Maharashtra, INDIA.',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27AAECE7206P1Z9',
    },
    consignee: {
      consigneeName: 'Sai Warehouse & Transport',
      consigneeAddress: 'Gala no 2 Manish Estate, Chowdhary Compound, Behind Preeti Petrol Pump Near Ganesh Compound, PURNA BHIWANDI',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27AAECE7206P1Z9',
    },
    invoiceNumber: 'DGR/013/2026-27',
    invoiceDate: '06/08/2026',
    transport: 'BY ROAD',
    noOfPackages: '50 DRUMS',
    transportName: 'Sai Warehouse & Transport',
    paidToPaid: 'PAID',
    referenceName: 'Mr SUNIL',
    contactNumber: '9221876157',
    items: [
      { sn: 1, description: 'UN APP MC Y 30 KG OPEN TOP PLASTIC DRUMS', subText: '', hsnCode: '39233090', qty: 50, unit: 'Drum', price: 600, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Transport Charges', subText: 'Delivery to Bhiwandi', hsnCode: '996791', qty: 1, unit: 'Trip', price: 2800, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  {
    id: 'tpl_manifest',
    name: 'Manifest Express (DGD Charges)',
    isBuiltIn: true,
    category: 'Full Invoice Template',
    companyLogo: null,
    companyDetails: {
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 9619507404',
      companyEmail: 'dgr.export.logistics@gmail.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    buyer: {
      buyerName: 'MANIFEST EXPRESS LOGISTICS LLP',
      buyerAddress: '2ND FLOOR A WING, 218, Sagar Tech Plaza, Andheri Kurla Road, Sakinaka Junction, Mumbai, Mumbai Suburban, Maharashtra, 400072',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27ABYFM3165B1Z0',
    },
    consignee: {
      consigneeName: 'MANIFEST EXPRESS LOGISTICS LLP',
      consigneeAddress: '2ND FLOOR A WING, 218, Sagar Tech Plaza, Andheri Kurla Road, Sakinaka Junction, Mumbai, Mumbai Suburban, Maharashtra, 400072',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27ABYFM3165B1Z0',
    },
    invoiceNumber: 'DGR/015/2026-27',
    invoiceDate: '07/08/2026',
    transport: 'AIR',
    airwayBillNo: '176-6507-5415',
    poNumberAndDate: 'EXP/26-27/075 DT. 30-JULY-2026',
    noOfPackages: '01 PKG',
    referenceName: 'AADISH IMPEX PRIVATE LIMITED',
    contactNumber: '+91 9619507404',
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
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 91062 35771',
      companyEmail: 'dgr.export.logistics@gmail.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    buyer: {
      buyerName: 'EFFICIENT FREIGHT FORWARDERS PVT LTD',
      buyerAddress: '2nd Floor/ C-205, Damji Shamji Corporate Square, Ghatkopar Andheri Link Road, Ghatkopar East, Mumbai-400077, Maharashtra, INDIA.',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27AAECE7206P1Z9',
    },
    consignee: {
      consigneeName: 'Unisource Chemicals Pvt Ltd',
      consigneeAddress: 'L-15, Tarapur M.I.D.C, Kalvada Naka, Kolavade, Maharashtra 401506',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27AAECE7206P1Z9',
    },
    invoiceNumber: 'DGR/010/2026-27',
    invoiceDate: '25/07/2026',
    transport: 'BY ROAD',
    noOfPackages: '02 BOXES',
    transportName: 'COURIER',
    paidToPaid: 'PAID',
    referenceName: 'Ravi',
    contactNumber: '70211 57707',
    items: [
      { sn: 1, description: 'UN APPROVED BOX X55', subText: '', hsnCode: '48191010', qty: 2, unit: 'Box', price: 630, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 2, description: 'COURIER CHARGES', subText: 'To Tarapur MIDC', hsnCode: '996713', qty: 1, unit: 'Trip', price: 500, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
];

/**
 * Load all billing profiles
 */
export function getSavedBillingProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BILLING_PROFILES));
      return DEFAULT_BILLING_PROFILES;
    }
    const profiles = JSON.parse(raw);
    if (!Array.isArray(profiles) || profiles.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BILLING_PROFILES));
      return DEFAULT_BILLING_PROFILES;
    }
    return profiles;
  } catch (err) {
    console.error('Error loading billing profiles:', err);
    return DEFAULT_BILLING_PROFILES;
  }
}

/**
 * Save a new or updated billing profile / template
 */
export function saveBillingProfile(profile) {
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newProfile;
}

/**
 * Delete any billing profile / template
 */
export function deleteBillingProfile(profileId) {
  const all = getSavedBillingProfiles();
  const filtered = all.filter((p) => p.id !== profileId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Reset templates back to default starters
 */
export function resetBillingProfilesToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BILLING_PROFILES));
  return DEFAULT_BILLING_PROFILES;
}

const BUYERS_STORAGE_KEY = 'cargo_billing_buyers_directory';
const SHIPPERS_STORAGE_KEY = 'cargo_billing_shippers_directory';

const DEFAULT_BUYERS = [
  {
    id: 'buyer_dgr_global',
    name: 'DGR GLOBAL LOGISTICS',
    address: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
    state: 'Maharashtra (27)',
    gstin: '27NSAPK0224B1Z7',
    contactPerson: 'Mr Sunil',
    phone: '+91 9326392294',
    email: 'dgr.export.logistics@gmail.com',
  },
  {
    id: 'buyer_takai',
    name: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
    address: 'A-218 Sagar Tech Plaza, Saki Naka Junction, Andheri Kurla Road, Andheri East Mumbai Maharashtra India 400072.',
    state: 'Maharashtra (27)',
    gstin: '27AAMCT0922D1Z1',
    contactPerson: 'Accounts Dept',
    phone: '+91 9820011223',
    email: 'accounts@takaichem.com',
  },
  {
    id: 'buyer_efficient',
    name: 'EFFICIENT FREIGHT FORWARDERS PVT LTD',
    address: '2nd Floor/ C-205, Damji Shamji Corporate Square, Ghatkopar Andheri Link Road, Ghatkopar East, Mumbai-400077, Maharashtra, INDIA.',
    state: 'Maharashtra (27)',
    gstin: '27AAECE7206P1Z9',
    contactPerson: 'Mr Sunil',
    phone: '9221876157',
    email: 'ops@efficientfreight.com',
  },
  {
    id: 'buyer_manifest',
    name: 'MANIFEST EXPRESS LOGISTICS LLP',
    address: '2ND FLOOR A WING, 218, Sagar Tech Plaza, Andheri Kurla Road, Sakinaka Junction, Mumbai, Mumbai Suburban, Maharashtra, 400072',
    state: 'Maharashtra (27)',
    gstin: '27ABYFM3165B1Z0',
    contactPerson: 'AADISH IMPEX',
    phone: '+91 9619507404',
    email: 'manifest@express.in',
  },
];

const DEFAULT_SHIPPERS = [
  {
    id: 'dest_dgr_global',
    name: 'DGR GLOBAL LOGISTICS',
    address: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
    state: 'Maharashtra (27)',
    gstin: '27NSAPK0224B1Z7',
    contactPerson: 'Warehouse Incharge',
    phone: '+91 9326392294',
  },
  {
    id: 'dest_sai_warehouse',
    name: 'Sai Warehouse & Transport',
    address: 'Gala no 2 Manish Estate, Chowdhary Compound, Behind Preeti Petrol Pump Near Ganesh Compound, PURNA BHIWANDI',
    state: 'Maharashtra (27)',
    gstin: '27AAECE7206P1Z9',
    contactPerson: 'Mr Sai',
    phone: '9221876157',
  },
  {
    id: 'dest_unisource',
    name: 'Unisource Chemicals Pvt Ltd',
    address: 'L-15, Tarapur M.I.D.C, Kalvada Naka, Kolavade, Maharashtra 401506',
    state: 'Maharashtra (27)',
    gstin: '27AAECE7206P1Z9',
    contactPerson: 'Ravi',
    phone: '70211 57707',
  },
  {
    id: 'dest_manifest',
    name: 'MANIFEST EXPRESS LOGISTICS LLP',
    address: '2ND FLOOR A WING, 218, Sagar Tech Plaza, Andheri Kurla Road, Sakinaka Junction, Mumbai, Mumbai Suburban, Maharashtra, 400072',
    state: 'Maharashtra (27)',
    gstin: '27ABYFM3165B1Z0',
    contactPerson: 'Operations Desk',
    phone: '+91 9619507404',
  },
];

/**
 * Load all Customer / Buyer Profiles
 */
export function getSavedBuyers() {
  try {
    const raw = localStorage.getItem(BUYERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(DEFAULT_BUYERS));
      return DEFAULT_BUYERS;
    }
    const buyers = JSON.parse(raw);
    if (!Array.isArray(buyers) || buyers.length === 0) {
      localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(DEFAULT_BUYERS));
      return DEFAULT_BUYERS;
    }
    return buyers;
  } catch (err) {
    console.error('Error loading buyers directory:', err);
    return DEFAULT_BUYERS;
  }
}

/**
 * Save / Update Customer / Buyer
 */
export function saveBuyer(buyer) {
  const all = getSavedBuyers();
  const id = buyer.id || `buyer_${Date.now()}`;
  const newBuyer = {
    ...buyer,
    id,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = all.findIndex((b) => b.id === id || b.name?.trim().toUpperCase() === buyer.name?.trim().toUpperCase());
  let updated;
  if (existingIndex >= 0) {
    updated = all.map((b, i) => (i === existingIndex ? { ...b, ...newBuyer, id: b.id } : b));
  } else {
    updated = [newBuyer, ...all];
  }

  localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(updated));
  return newBuyer;
}

/**
 * Delete Customer / Buyer
 */
export function deleteBuyer(buyerId) {
  const all = getSavedBuyers();
  const filtered = all.filter((b) => b.id !== buyerId);
  localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Load all Shipper / Delivery Destinations
 */
export function getSavedShippers() {
  try {
    const raw = localStorage.getItem(SHIPPERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SHIPPERS_STORAGE_KEY, JSON.stringify(DEFAULT_SHIPPERS));
      return DEFAULT_SHIPPERS;
    }
    const shippers = JSON.parse(raw);
    if (!Array.isArray(shippers) || shippers.length === 0) {
      localStorage.setItem(SHIPPERS_STORAGE_KEY, JSON.stringify(DEFAULT_SHIPPERS));
      return DEFAULT_SHIPPERS;
    }
    return shippers;
  } catch (err) {
    console.error('Error loading shippers directory:', err);
    return DEFAULT_SHIPPERS;
  }
}

/**
 * Save / Update Shipper / Delivery Destination
 */
export function saveShipper(shipper) {
  const all = getSavedShippers();
  const id = shipper.id || `dest_${Date.now()}`;
  const newShipper = {
    ...shipper,
    id,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = all.findIndex((s) => s.id === id || s.name?.trim().toUpperCase() === shipper.name?.trim().toUpperCase());
  let updated;
  if (existingIndex >= 0) {
    updated = all.map((s, i) => (i === existingIndex ? { ...s, ...newShipper, id: s.id } : s));
  } else {
    updated = [newShipper, ...all];
  }

  localStorage.setItem(SHIPPERS_STORAGE_KEY, JSON.stringify(updated));
  return newShipper;
}

/**
 * Delete Shipper / Delivery Destination
 */
export function deleteShipper(shipperId) {
  const all = getSavedShippers();
  const filtered = all.filter((s) => s.id !== shipperId);
  localStorage.setItem(SHIPPERS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get distinct list of all Buyer / Client Parties for search-and-select
 */
export function getDistinctParties() {
  return getSavedBuyers();
}

const VENDORS_STORAGE_KEY = 'cargo_billing_vendors_directory';

export const DEFAULT_VENDORS = [
  {
    id: 'vendor_dgr_packaging',
    name: 'DGR PACKAGING COMPANY',
    address: 'SHOP NO.2, OPP. BLUE DART, NEAR SAHAR CARGO COMPLEX, ANDHERI (E), MUMBAI - 400 099',
    state: 'Maharashtra (27)',
    gstin: '27CBKPK7600K1ZE',
    category: 'PACKAGING',
    defaultGstRate: 18,
    defaultDescription: 'UN Approved 4G Fibreboard Boxes, DG Packaging & Labeling Materials',
    contactPerson: 'Mr Rajesh',
    phone: '+91 022-26828108',
    email: 'dgrpackaging@gmail.com',
  },
  {
    id: 'vendor_dgr_global',
    name: 'DGR GLOBAL LOGISTICS',
    address: 'GROUND FLOOR ROOM -003, G M NAGAR NARANGI BYPASS ROAD, VIRAR EAST, PALGHAR - 401305',
    state: 'Maharashtra (27)',
    gstin: '27NSAPK0224B1Z7',
    category: 'DGD',
    defaultGstRate: 18,
    defaultDescription: 'DGD Documentation Charges, DG Certification, Inspection & UN Packaging',
    contactPerson: 'Sunil Gawas',
    phone: '+91 9326392294',
    email: 'dgr.export.logistics@gmail.com',
  },
  {
    id: 'vendor_efficient',
    name: 'EFFICIENT FREIGHT FORWARDERS PVT LTD',
    address: '2nd Floor, Damji Shamji Corporate Square, Ghatkopar Andheri Link Road, Mumbai - 400077',
    state: 'Maharashtra (27)',
    gstin: '27AAECE7206P1Z9',
    category: 'TRANSPORT',
    defaultGstRate: 18,
    defaultDescription: 'Airport Cartage, Local Transport & Cargo Handling Charges',
    contactPerson: 'Mr Sunil',
    phone: '9221876157',
    email: 'ops@efficientfreight.com',
  },
  {
    id: 'vendor_takai',
    name: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
    address: 'A-218 Sagar Tech Plaza, Saki Naka Junction, Andheri Kurla Road, Andheri East Mumbai 400072',
    state: 'Maharashtra (27)',
    gstin: '27AAMCT0922D1Z1',
    category: 'DGD',
    defaultGstRate: 18,
    defaultDescription: 'MSDS Verification & Dangerous Goods Testing Charges',
    contactPerson: 'Accounts Dept',
    phone: '+91 9820011223',
    email: 'accounts@takaichem.com',
  },
  {
    id: 'vendor_celebi',
    name: 'CELEBI DELHI CARGO TERMINAL MANAGEMENT',
    address: 'Cargo Terminal 2, IGI Airport, New Delhi - 110037',
    state: 'Delhi (07)',
    gstin: '07AABCC1234F1Z8',
    category: 'AIR_FREIGHT',
    defaultGstRate: 18,
    defaultDescription: 'Terminal Handling Charges (THC) & Airline Cargo Security Screening',
    contactPerson: 'Cargo Operations',
    phone: '+91 11-49637000',
    email: 'cargo@celebidelhi.com',
  },
  {
    id: 'vendor_sai_warehouse',
    name: 'SAI WAREHOUSE & LOGISTICS',
    address: 'Gala no 2 Manish Estate, Chowdhary Compound, Purna Bhiwandi, Maharashtra',
    state: 'Maharashtra (27)',
    gstin: '27AAECE7206P1Z9',
    category: 'WAREHOUSE',
    defaultGstRate: 18,
    defaultDescription: 'DG Storage, Palletization & Secure Strapping Charges',
    contactPerson: 'Mr Sai',
    phone: '9221876157',
    email: 'sai.warehouse@logistics.in',
  },
  {
    id: 'vendor_customs_clear',
    name: 'SAHAR CUSTOMS CLEARING & BROKERAGE',
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
 * Load all Vendor Profiles / Templates
 */
export function getSavedVendors() {
  try {
    const raw = localStorage.getItem(VENDORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(DEFAULT_VENDORS));
      return DEFAULT_VENDORS;
    }
    const vendors = JSON.parse(raw);
    if (!Array.isArray(vendors) || vendors.length === 0) {
      localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(DEFAULT_VENDORS));
      return DEFAULT_VENDORS;
    }
    return vendors;
  } catch (err) {
    console.error('Error loading vendors directory:', err);
    return DEFAULT_VENDORS;
  }
}

/**
 * Save / Update Vendor Template
 */
export function saveVendor(vendor) {
  const all = getSavedVendors();
  const id = vendor.id || `vendor_${Date.now()}`;
  const newVendor = {
    ...vendor,
    id,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = all.findIndex(
    (v) => v.id === id || (v.name && vendor.name && v.name.trim().toUpperCase() === vendor.name.trim().toUpperCase())
  );
  let updated;
  if (existingIndex >= 0) {
    updated = all.map((v, i) => (i === existingIndex ? { ...v, ...newVendor, id: v.id } : v));
  } else {
    updated = [newVendor, ...all];
  }

  localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(updated));
  return newVendor;
}

/**
 * Delete Vendor Template
 */
export function deleteVendor(vendorId) {
  const all = getSavedVendors();
  const filtered = all.filter((v) => v.id !== vendorId);
  localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Reset vendors to defaults
 */
export function resetVendorsToDefault() {
  localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(DEFAULT_VENDORS));
  return DEFAULT_VENDORS;
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
  try {
    const raw = localStorage.getItem(ITEM_PRESETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ITEM_PRESETS_STORAGE_KEY, JSON.stringify(DEFAULT_ITEM_PRESETS));
      return DEFAULT_ITEM_PRESETS;
    }
    const items = JSON.parse(raw);
    if (!Array.isArray(items) || items.length === 0) {
      localStorage.setItem(ITEM_PRESETS_STORAGE_KEY, JSON.stringify(DEFAULT_ITEM_PRESETS));
      return DEFAULT_ITEM_PRESETS;
    }
    return items;
  } catch (err) {
    console.error('Error loading item presets directory:', err);
    return DEFAULT_ITEM_PRESETS;
  }
}

/**
 * Save / Update Item Preset
 */
export function saveItemPreset(preset) {
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

  localStorage.setItem(ITEM_PRESETS_STORAGE_KEY, JSON.stringify(updated));
  return newPreset;
}

/**
 * Delete Item Preset
 */
export function deleteItemPreset(presetId) {
  const all = getSavedItemPresets();
  const filtered = all.filter((p) => p.id !== presetId);
  localStorage.setItem(ITEM_PRESETS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Reset item presets to default built-in list
 */
export function resetItemPresetsToDefault() {
  localStorage.setItem(ITEM_PRESETS_STORAGE_KEY, JSON.stringify(DEFAULT_ITEM_PRESETS));
  return DEFAULT_ITEM_PRESETS;
}

