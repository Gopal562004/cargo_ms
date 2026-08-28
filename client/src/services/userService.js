import api from './api';

export const SYSTEM_SERVICES = [
  {
    id: 'AIR_FREIGHT',
    label: 'Air Freight & Air Waybills',
    category: 'Operations',
    description: 'Create & issue MAWB, HAWB, Manifests, and DGD',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  {
    id: 'EDI_CARGO',
    label: 'eAWB / EDI Cargo Messaging',
    category: 'Operations',
    description: 'Send electronic FWB, FHL, FFR Cargo-IMP messages',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'SEA_FREIGHT',
    label: 'Ocean Freight & Shipping',
    category: 'Operations',
    description: 'Bills of Lading, Sea Manifests & IMO Dangerous Goods',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'SALES_BILLING',
    label: 'Sales Invoices & Revenue Hub',
    category: 'Billing & Accounting',
    description: 'Create tax invoices, WYSIWYG printable sheet & sales register',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    id: 'PURCHASE_BILLS',
    label: 'Purchase Bills & Expense Tracking',
    category: 'Billing & Accounting',
    description: 'Vendor bills for DGD charges, packaging boxes, air freight',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'BILLING_TEMPLATES',
    label: 'Invoice Templates & Item Presets',
    category: 'Billing & Accounting',
    description: 'Saved invoice templates, cargo item presets & numbering series',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'CONTACTS_DIRECTORY',
    label: 'Customer & Party Directory',
    category: 'Billing & Accounting',
    description: 'Customer companies, buyer/consignee GSTIN, addresses & contacts',
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  },
  {
    id: 'TEMPLATES_MANAGEMENT',
    label: 'Document Templates',
    category: 'Management',
    description: 'Standard reusable cargo document templates',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'MASTER_ADMIN',
    label: 'Master Administration & Users',
    category: 'Administration',
    description: 'Create users, manage login credentials & service allocation',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
];

export const SUBSCRIPTION_PLANS = [
  { id: 'FREE_TRIAL', label: 'Free Trial (7 Days)', defaultDuration: '7_DAYS', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  { id: 'STARTER', label: 'Starter Plan (Monthly/Annual)', defaultDuration: '1_YEAR', color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' },
  { id: 'PROFESSIONAL', label: 'Professional Plan (All Modules)', defaultDuration: '1_YEAR', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { id: 'ENTERPRISE', label: 'Enterprise Contract (Multi-User)', defaultDuration: '1_YEAR', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { id: 'CUSTOM', label: 'Custom Period', defaultDuration: 'CUSTOM', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
];

export const DURATION_PRESETS = [
  { id: '7_DAYS', label: '7 Days Trial' },
  { id: '1_MONTH', label: '1 Month' },
  { id: '3_MONTHS', label: '3 Months' },
  { id: '6_MONTHS', label: '6 Months' },
  { id: '1_YEAR', label: '1 Full Year' },
  { id: 'CUSTOM', label: 'Custom Expiry Date...' },
];

export function fetchUsers() {
  return api.get('/users');
}

export function createUser(userData) {
  return api.post('/users', userData);
}

export function updateUser(id, userData) {
  return api.put(`/users/${id}`, userData);
}

export function updateUserPassword(id, newPassword) {
  return api.put(`/users/${id}/password`, { newPassword });
}

export function extendUserSubscription(id, data) {
  return api.post(`/users/${id}/extend`, data);
}

export function regenerateUserLicenseKey(id) {
  return api.post(`/users/${id}/regenerate-license`);
}

export function fetchUserActivityLogs(id) {
  return api.get(`/users/${id}/activity`);
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}
