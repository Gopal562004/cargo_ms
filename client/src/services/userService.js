import api from './api';

export const SYSTEM_SERVICES = [
  {
    id: 'AIR_FREIGHT',
    label: 'Air Freight & Air Waybills',
    category: 'Operations',
    description: 'Create & issue MAWB, HAWB, Manifests, and IATA DGD',
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
    label: 'Billing Templates & Directory',
    category: 'Billing & Accounting',
    description: 'Saved invoice presets, Customer directory & Delivery sites',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'CONTACTS_DIRECTORY',
    label: 'Contacts & Directory',
    category: 'Management',
    description: 'Shippers, consignees, airline agents, and carriers directory',
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

export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}
