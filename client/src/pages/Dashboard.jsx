import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  FileText,
  Truck,
  CheckCircle2,
  Plane,
  ClipboardList,
  Ship,
  Zap,
  Receipt,
  Calendar,
  Eye,
  Download,
  Pencil,
  ArrowRight,
  ShoppingBag,
  Bookmark,
  Users,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { downloadDocumentPDF, previewDocumentPDF } from '../services/documentService';
import { hasServiceAccess, isDocumentTypeAllowed, getUserScopeSubtitle } from '../utils/permissions';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const ALL_QUICK_ACTIONS = [
  {
    type: 'TAX_INVOICE',
    label: 'Tax Invoice',
    to: '/documents/new/TAX_INVOICE',
    icon: Receipt,
    color: 'border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60',
    serviceKey: 'SALES_BILLING',
  },
  {
    type: 'PURCHASE_BILL',
    label: 'Purchase Bill',
    to: '/billing/purchases',
    icon: ShoppingBag,
    color: 'border-purple-500/30 text-purple-400 hover:border-purple-500/60',
    serviceKey: 'PURCHASE_BILLS',
  },
  {
    type: 'BILLING_TEMPLATES',
    label: 'Billing Templates',
    to: '/billing/templates',
    icon: Bookmark,
    color: 'border-teal-500/30 text-teal-400 hover:border-teal-500/60',
    serviceKey: 'BILLING_TEMPLATES',
  },
  {
    type: 'PROFORMA_INVOICE',
    label: 'Proforma Invoice',
    to: '/documents/new/PROFORMA_INVOICE',
    icon: FileText,
    color: 'border-cyan-500/30 text-cyan-400 hover:border-cyan-500/60',
    serviceKey: 'SALES_BILLING',
  },
  {
    type: 'MAWB',
    label: 'Air Waybill (MAWB)',
    to: '/documents/new/MAWB',
    icon: Plane,
    color: 'border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60',
    serviceKey: 'AIR_FREIGHT',
  },
  {
    type: 'HAWB',
    label: 'House AWB',
    to: '/documents/new/HAWB',
    icon: ClipboardList,
    color: 'border-sky-500/30 text-sky-400 hover:border-sky-500/60',
    serviceKey: 'AIR_FREIGHT',
  },
  {
    type: 'FWB',
    label: 'FWB (eAWB)',
    to: '/documents/new/FWB',
    icon: Zap,
    color: 'border-amber-500/30 text-amber-400 hover:border-amber-500/60',
    serviceKey: 'EDI_CARGO',
  },
  {
    type: 'BILL_OF_LADING',
    label: 'Bill of Lading',
    to: '/documents/new/BILL_OF_LADING',
    icon: Ship,
    color: 'border-blue-500/30 text-blue-400 hover:border-blue-500/60',
    serviceKey: 'SEA_FREIGHT',
  },
  {
    type: 'BOOKING',
    label: 'Booking',
    to: '/documents/new/BOOKING',
    icon: Calendar,
    color: 'border-orange-500/30 text-orange-400 hover:border-orange-500/60',
    serviceKey: ['AIR_FREIGHT', 'SEA_FREIGHT', 'SALES_BILLING'],
  },
  {
    type: 'CONTACTS',
    label: 'Directory',
    to: '/contacts',
    icon: Users,
    color: 'border-teal-500/30 text-teal-400 hover:border-teal-500/60',
    serviceKey: 'CONTACTS_DIRECTORY',
  },
  {
    type: 'USERS_ADMIN',
    label: 'User Allocation',
    to: '/master/users',
    icon: ShieldCheck,
    color: 'border-rose-500/30 text-rose-400 hover:border-rose-500/60',
    serviceKey: 'MASTER_ADMIN',
    adminOnly: true,
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { documents, pagination, fetchDocuments, isLoading } = useDocumentStore();
  const [stats, setStats] = useState({ total: 0, draft: 0, inTransit: 0, delivered: 0 });

  useEffect(() => {
    fetchDocuments({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  // Filter accessible quick actions based on user permissions
  const visibleQuickActions = ALL_QUICK_ACTIONS.filter((action) =>
    hasServiceAccess(user, action.serviceKey, action.adminOnly)
  );

  // Filter documents that the user has permission to see
  const accessibleDocuments = documents.filter((d) => isDocumentTypeAllowed(user, d.documentType));

  // Determine if user has only billing-related services (e.g. Accounts & Billing department)
  const isBillingUser =
    user?.role !== 'ADMIN' &&
    hasServiceAccess(user, 'SALES_BILLING') &&
    !hasServiceAccess(user, 'AIR_FREIGHT') &&
    !hasServiceAccess(user, 'SEA_FREIGHT');

  useEffect(() => {
    const activeDocs = accessibleDocuments;
    setStats({
      total: activeDocs.length,
      draft: activeDocs.filter((d) => d.status === 'DRAFT').length,
      inTransit: activeDocs.filter((d) => ['DEPARTED', 'IN_TRANSIT', 'BOOKED'].includes(d.status)).length,
      delivered: activeDocs.filter((d) => ['DELIVERED', 'COMPLETED'].includes(d.status)).length,
    });
  }, [documents, user]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Personalized Role & Department Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Dashboard</h1>
            {user?.department && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user.department}
              </span>
            )}
            {user?.role && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {user.role}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ''}! {getUserScopeSubtitle(user)}
          </p>
        </div>
        <Link to="/new">
          <Button variant="primary" className="rounded text-xs">
            <Plus size={14} className="mr-1.5 inline" /> New Document
          </Button>
        </Link>
      </div>

      {/* Dynamic Stats Cards tailored to User Scope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Documents / Invoices */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            {isBillingUser ? <Receipt size={20} /> : <BarChart3 size={20} />}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">{stats.total}</p>
            <p className="text-xs text-slate-400 font-medium">
              {isBillingUser ? 'Total Invoices & Bills' : 'Accessible Documents'}
            </p>
          </div>
        </div>

        {/* Card 2: Drafts / Pending */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">{stats.draft}</p>
            <p className="text-xs text-slate-400 font-medium">Drafts / In Progress</p>
          </div>
        </div>

        {/* Card 3: In Transit or Active Modules */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            {isBillingUser ? <ShoppingBag size={20} /> : <Truck size={20} />}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">
              {isBillingUser ? (user?.allowedServices?.length || 0) : stats.inTransit}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {isBillingUser ? 'Assigned Services' : 'In Transit / Booked'}
            </p>
          </div>
        </div>

        {/* Card 4: Delivered / Completed */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">{stats.delivered}</p>
            <p className="text-xs text-slate-400 font-medium">
              {isBillingUser ? 'Completed & Issued' : 'Delivered / Completed'}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Quick Actions</span>
            <span className="text-[11px] font-normal text-slate-400">
              ({visibleQuickActions.length} permitted for your access level)
            </span>
          </h2>
        </div>

        {visibleQuickActions.length === 0 ? (
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded text-xs text-slate-400">
            No quick actions assigned to your account. Please contact your system administrator.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {visibleQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.type}
                  to={action.to}
                  className={`flex flex-col items-center justify-center p-3.5 bg-slate-900/40 border ${action.color} rounded hover:bg-slate-800/50 transition-all text-center gap-2 group shadow-sm`}
                >
                  <Icon size={22} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate w-full">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Documents Filtered to User Scope */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            Recent Documents
          </h2>
          <Link to="/documents" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-900/60 rounded animate-pulse" />
            ))}
          </div>
        ) : accessibleDocuments.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded p-12 text-center space-y-4">
            <p className="text-sm text-slate-400">No documents found matching your access scope.</p>
            <Link to="/new">
              <Button variant="primary" className="rounded text-xs">
                <Plus size={14} className="mr-1 inline" /> Create Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-medium">
                  <th className="py-3.5 px-4">Document #</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {accessibleDocuments.slice(0, 10).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <Link to={`/documents/${doc.id}`} className="text-indigo-400 hover:text-indigo-300">
                        {doc.documentNumber || '—'}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{doc.documentType}</td>
                    <td className="py-3 px-4 text-slate-200 max-w-xs truncate">{doc.title || '—'}</td>
                    <td className="py-3 px-4"><Badge status={doc.status} size="sm" /></td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                          title="Preview PDF"
                          onClick={() => previewDocumentPDF(doc.id)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Download PDF"
                          onClick={() => downloadDocumentPDF(doc.id, `${doc.documentNumber || 'document'}.pdf`)}
                        >
                          <Download size={15} />
                        </button>
                        <Link
                          to={`/documents/${doc.id}`}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Edit Document"
                        >
                          <Pencil size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
