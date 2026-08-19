/**
 * Role and Service Permissions Utility
 * Centralizes access control for modules, pages, quick actions, and document types.
 */

export const SYSTEM_SERVICES = [
  {
    id: 'AIR_FREIGHT',
    label: 'Air Freight & Air Waybills',
    category: 'Operations',
    description: 'Create & issue MAWB, HAWB, Manifests, and IATA DGD',
  },
  {
    id: 'EDI_CARGO',
    label: 'eAWB / EDI Cargo Messaging',
    category: 'Operations',
    description: 'Send electronic FWB, FHL, FFR Cargo-IMP messages',
  },
  {
    id: 'SEA_FREIGHT',
    label: 'Ocean Freight & Shipping',
    category: 'Operations',
    description: 'Bills of Lading, Sea Manifests & IMO Dangerous Goods',
  },
  {
    id: 'SALES_BILLING',
    label: 'Sales Invoices & Revenue Hub',
    category: 'Billing & Accounting',
    description: 'Create tax invoices, WYSIWYG printable sheet & sales register',
  },
  {
    id: 'PURCHASE_BILLS',
    label: 'Purchase Bills & Expense Tracking',
    category: 'Billing & Accounting',
    description: 'Vendor bills for DGD charges, packaging boxes, air freight',
  },
  {
    id: 'BILLING_TEMPLATES',
    label: 'Billing Templates & Directory',
    category: 'Billing & Accounting',
    description: 'Saved invoice presets, Customer directory & Delivery sites',
  },
  {
    id: 'CONTACTS_DIRECTORY',
    label: 'Contacts & Directory',
    category: 'Management',
    description: 'Shippers, consignees, airline agents, and carriers directory',
  },
  {
    id: 'TEMPLATES_MANAGEMENT',
    label: 'Document Templates',
    category: 'Management',
    description: 'Standard reusable cargo document templates',
  },
  {
    id: 'MASTER_ADMIN',
    label: 'Master Administration & Users',
    category: 'Administration',
    description: 'Create users, manage login credentials & service allocation',
  },
];

// Mapping of document types to required service keys
export const DOCUMENT_TYPE_SERVICE_MAP = {
  // Air Freight
  MAWB: 'AIR_FREIGHT',
  HAWB: 'AIR_FREIGHT',
  MANIFEST: 'AIR_FREIGHT',
  DGD: 'AIR_FREIGHT',
  LABEL: 'AIR_FREIGHT',
  CARGO_POUCH_LABEL: 'AIR_FREIGHT',
  CSD: 'AIR_FREIGHT',

  // EDI / eAWB
  FWB: 'EDI_CARGO',
  FHL: 'EDI_CARGO',
  XFWB: 'EDI_CARGO',
  XFZB: 'EDI_CARGO',
  FFR: 'EDI_CARGO',
  HAWB_FHL: 'EDI_CARGO',

  // Ocean / Sea Freight
  BILL_OF_LADING: 'SEA_FREIGHT',
  BOL_MANIFEST: 'SEA_FREIGHT',
  IMO_DGD: 'SEA_FREIGHT',
  SOLAS_VGM: 'SEA_FREIGHT',

  // Billing & Accounting
  TAX_INVOICE: 'SALES_BILLING',
  PROFORMA_INVOICE: 'SALES_BILLING',

  // Commercial / Logistics
  BOOKING: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  WAREHOUSE_RECEIPT: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  DOCK_RECEIPT: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  CERTIFICATE_OF_ORIGIN: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  DELIVERY_ORDER: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  DELIVERY_NOTE: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  FCR: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  CMR: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  ARRIVAL_NOTICE: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  SECURITY_DECLARATION: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
  LETTER: ['SALES_BILLING', 'AIR_FREIGHT', 'SEA_FREIGHT'],
};

/**
 * Check whether a user has access to a specific service key or admin permission.
 */
export function hasServiceAccess(user, serviceKey, adminOnly = false) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (adminOnly || serviceKey === 'MASTER_ADMIN') return false;
  if (!serviceKey || serviceKey === 'ANY') return true;

  const allowed = Array.isArray(user.allowedServices) ? user.allowedServices : [];
  if (Array.isArray(serviceKey)) {
    return serviceKey.some((key) => allowed.includes(key));
  }
  return allowed.includes(serviceKey);
}

/**
 * Check whether a user is permitted to create/view a specific document type.
 */
export function isDocumentTypeAllowed(user, docType) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  const requiredService = DOCUMENT_TYPE_SERVICE_MAP[docType];
  if (!requiredService) return true; // Generic document type fallback

  return hasServiceAccess(user, requiredService);
}

/**
 * Get human-friendly greeting subtitle and summary tailored to user's department and role.
 */
export function getUserScopeSubtitle(user) {
  if (!user) return "Here's your operations overview.";
  if (user.role === 'ADMIN') {
    return "Full administrative access across all freight, billing, and system operations.";
  }
  
  const dept = user.department || '';
  if (dept.toLowerCase().includes('account') || dept.toLowerCase().includes('billing')) {
    return "Here is your sales revenue, purchase bills, and billing templates overview.";
  }
  if (dept.toLowerCase().includes('freight') || dept.toLowerCase().includes('operation')) {
    return "Here is your freight tracking, air waybills, and shipping overview.";
  }
  return "Welcome back! Here is your workspace overview.";
}
