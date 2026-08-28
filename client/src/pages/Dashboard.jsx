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
  Sparkles,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { downloadDocumentPDF, previewDocumentPDF } from '../services/documentService';
import { hasServiceAccess, isDocumentTypeAllowed, getUserScopeSubtitle, isSubscriptionExpired } from '../utils/permissions';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PdfPreviewModal from '../components/ui/PdfPreviewModal';

const ALL_QUICK_ACTIONS = [
  {
    type: 'TAX_INVOICE',
    label: 'Tax Invoice',
    desc: 'GST Tax Invoice matching DGR layout',
    to: '/documents/new/TAX_INVOICE',
    icon: Receipt,
    iconLight: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    iconDark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    serviceKey: 'SALES_BILLING',
  },
  {
    type: 'PURCHASE_BILL',
    label: 'Purchase Bill',
    desc: 'Record vendor expenses & inward charges',
    to: '/billing/purchases',
    icon: ShoppingBag,
    iconLight: 'bg-purple-50 text-purple-600 border-purple-200',
    iconDark: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    serviceKey: 'PURCHASE_BILLS',
  },
  {
    type: 'BILLING_TEMPLATES',
    label: 'Invoice Templates',
    desc: 'Manage presets, directory & items',
    to: '/billing/templates',
    icon: Bookmark,
    iconLight: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    iconDark: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    serviceKey: 'BILLING_TEMPLATES',
  },
  {
    type: 'PROFORMA_INVOICE',
    label: 'Proforma Invoice',
    desc: 'Commercial estimation & quotes',
    to: '/documents/new/PROFORMA_INVOICE',
    icon: FileText,
    iconLight: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    iconDark: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    serviceKey: ['AIR_FREIGHT', 'SEA_FREIGHT'],
  },
  {
    type: 'MAWB',
    label: 'Air Waybill (MAWB)',
    desc: 'Master Air Waybill generator',
    to: '/documents/new/MAWB',
    icon: Plane,
    iconLight: 'bg-blue-50 text-blue-600 border-blue-200',
    iconDark: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    serviceKey: 'AIR_FREIGHT',
  },
  {
    type: 'HAWB',
    label: 'House AWB',
    desc: 'House Air Waybill for freight',
    to: '/documents/new/HAWB',
    icon: ClipboardList,
    iconLight: 'bg-sky-50 text-sky-600 border-sky-200',
    iconDark: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    serviceKey: 'AIR_FREIGHT',
  },
  {
    type: 'FWB',
    label: 'FWB (eAWB)',
    desc: 'IATA EDI Cargo transmission',
    to: '/documents/new/FWB',
    icon: Zap,
    iconLight: 'bg-amber-50 text-amber-600 border-amber-200',
    iconDark: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    serviceKey: 'EDI_CARGO',
  },
  {
    type: 'BILL_OF_LADING',
    label: 'Bill of Lading',
    desc: 'Ocean carrier maritime shipping',
    to: '/documents/new/BILL_OF_LADING',
    icon: Ship,
    iconLight: 'bg-teal-50 text-teal-600 border-teal-200',
    iconDark: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    serviceKey: 'SEA_FREIGHT',
  },
  {
    type: 'BOOKING',
    label: 'Booking Confirmation',
    desc: 'Space booking & cargo reservation',
    to: '/documents/new/BOOKING',
    icon: Calendar,
    iconLight: 'bg-orange-50 text-orange-600 border-orange-200',
    iconDark: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    serviceKey: ['AIR_FREIGHT', 'SEA_FREIGHT'],
  },
  {
    type: 'USERS_ADMIN',
    label: 'User Allocation',
    desc: 'Manage seats & permissions',
    to: '/master/users',
    icon: ShieldCheck,
    iconLight: 'bg-rose-50 text-rose-600 border-rose-200',
    iconDark: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    serviceKey: 'MASTER_ADMIN',
    adminOnly: true,
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isExpired = isSubscriptionExpired(user);
  const { documents, pagination, fetchDocuments, isLoading } = useDocumentStore();
  const [stats, setStats] = useState({ total: 0, draft: 0, inTransit: 0, delivered: 0 });
  const [previewDocId, setPreviewDocId] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');

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
            <h1 className={`text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Dashboard
            </h1>
            {user?.department && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                theme === 'light' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {user.department}
              </span>
            )}
            {user?.role && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {user.role}
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Welcome back{user?.name ? `, ${user.name}` : ''}! {getUserScopeSubtitle(user)}
          </p>
        </div>
        {isExpired ? (
          <Button
            variant="secondary"
            disabled
            className="rounded-lg text-xs font-semibold opacity-60 cursor-not-allowed text-rose-500 border-rose-500/30"
            title="Subscription Expired - Document creation is locked"
          >
            <Plus size={14} className="mr-1.5 inline" /> New Document (Locked)
          </Button>
        ) : (
          <Link to="/new">
            <Button variant="primary" className="rounded-lg text-xs font-semibold shadow-sm">
              <Plus size={14} className="mr-1.5 inline" /> New Document
            </Button>
          </Link>
        )}
      </div>

      {/* Dynamic Stats Cards tailored to User Scope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Documents / Invoices */}
        <div className={`border rounded-md p-5 flex items-center gap-4 transition-all ${
          theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs hover:shadow-sm' : 'bg-slate-900/60 border-slate-800/80 shadow-sm'
        }`}>
          <div className={`w-11 h-11 rounded-md flex items-center justify-center border shrink-0 ${
            theme === 'light' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
          }`}>
            {isBillingUser ? <Receipt size={20} /> : <BarChart3 size={20} />}
          </div>
          <div>
            <p className={`text-2xl font-bold font-mono ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              {stats.total}
            </p>
            <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {isBillingUser ? 'Total Invoices & Bills' : 'Accessible Documents'}
            </p>
          </div>
        </div>

        {/* Card 2: Drafts / Pending */}
        <div className={`border rounded-md p-5 flex items-center gap-4 transition-all ${
          theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs hover:shadow-sm' : 'bg-slate-900/60 border-slate-800/80 shadow-sm'
        }`}>
          <div className={`w-11 h-11 rounded-md flex items-center justify-center border shrink-0 ${
            theme === 'light' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
          }`}>
            <FileText size={20} />
          </div>
          <div>
            <p className={`text-2xl font-bold font-mono ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              {stats.draft}
            </p>
            <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Drafts / In Progress
            </p>
          </div>
        </div>

        {/* Card 3: In Transit or Active Modules */}
        <div className={`border rounded-md p-5 flex items-center gap-4 transition-all ${
          theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs hover:shadow-sm' : 'bg-slate-900/60 border-slate-800/80 shadow-sm'
        }`}>
          <div className={`w-11 h-11 rounded-md flex items-center justify-center border shrink-0 ${
            theme === 'light' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            {isBillingUser ? <ShoppingBag size={20} /> : <Truck size={20} />}
          </div>
          <div>
            <p className={`text-2xl font-bold font-mono ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              {isBillingUser ? (user?.allowedServices?.length || 0) : stats.inTransit}
            </p>
            <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {isBillingUser ? 'Assigned Services' : 'In Transit / Booked'}
            </p>
          </div>
        </div>

        {/* Card 4: Delivered / Completed */}
        <div className={`border rounded-md p-5 flex items-center gap-4 transition-all ${
          theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs hover:shadow-sm' : 'bg-slate-900/60 border-slate-800/80 shadow-sm'
        }`}>
          <div className={`w-11 h-11 rounded-md flex items-center justify-center border shrink-0 ${
            theme === 'light' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          }`}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className={`text-2xl font-bold font-mono ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              {stats.delivered}
            </p>
            <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {isBillingUser ? 'Completed & Issued' : 'Delivered / Completed'}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-semibold flex items-center gap-2 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
            <Sparkles size={16} className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
            <span>Quick Actions</span>
            <span className={`text-[11px] font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
              ({visibleQuickActions.length} permitted for your access level)
            </span>
          </h2>
        </div>

        {visibleQuickActions.length === 0 ? (
          <div className={`p-4 border rounded-md text-xs ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
          }`}>
            No quick actions assigned to your account. Please contact your system administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {visibleQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.type}
                  to={action.to}
                  className={`flex items-center gap-3.5 p-3.5 rounded-md border transition-all text-left group cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 shadow-xs hover:shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/60 shadow-sm'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                      theme === 'light' ? action.iconLight : action.iconDark
                    }`}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xs font-bold tracking-tight transition-colors truncate ${
                        theme === 'light'
                          ? 'text-slate-900 group-hover:text-indigo-600'
                          : 'text-slate-100 group-hover:text-indigo-400'
                      }`}
                    >
                      {action.label}
                    </h3>
                    <p
                      className={`text-[11px] mt-0.5 truncate leading-relaxed ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {action.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className={`shrink-0 transition-transform group-hover:translate-x-1 ${
                      theme === 'light'
                        ? 'text-slate-400 group-hover:text-indigo-600'
                        : 'text-slate-500 group-hover:text-indigo-400'
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Documents Filtered to User Scope */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-semibold flex items-center gap-2 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
            <FileText size={16} className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
            Recent Documents
          </h2>
          <Link to="/documents" className={`text-xs font-medium flex items-center gap-1 ${
            theme === 'light' ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'
          }`}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-12 rounded-md animate-pulse ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-900/60'}`} />
            ))}
          </div>
        ) : accessibleDocuments.length === 0 ? (
          <div className={`border rounded-md p-12 text-center space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900/40 border-slate-800/80'
          }`}>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              No documents found matching your access scope.
            </p>
            <Link to="/new">
              <Button variant="primary" className="rounded-md text-xs font-semibold">
                <Plus size={14} className="mr-1 inline" /> Create Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className={`border rounded-md overflow-hidden ${
            theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900/60 border-slate-800/80 shadow-sm'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${
                  theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-900/80 text-slate-400'
                } font-semibold text-[11px]`}>
                  <th className="py-3.5 px-4">Document #</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                {accessibleDocuments.slice(0, 10).map((doc) => {
                  const isPurchaseBill = doc.data?.invoiceKind === 'PURCHASE' || doc.title?.startsWith('Purchase Bill');
                  const docTitle = doc.documentNumber || doc.title || 'Document Preview';

                  return (
                    <tr key={doc.id} className={`transition-colors ${
                      theme === 'light' ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                    }`}>
                      <td className="py-3 px-4 font-mono font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewDocTitle(docTitle);
                            setPreviewDocId(doc.id);
                          }}
                          className={`font-mono text-left underline decoration-dotted underline-offset-4 cursor-pointer transition-colors ${
                            theme === 'light' ? 'text-indigo-600 hover:text-indigo-800 font-semibold' : 'text-indigo-400 hover:text-indigo-300'
                          }`}
                          title="Click to quickly preview this document"
                        >
                          {doc.documentNumber || '—'}
                        </button>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isPurchaseBill ? 'PURCHASE_BILL' : doc.documentType}
                      </td>
                      <td className={`py-3 px-4 max-w-xs truncate font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                        {doc.title || '—'}
                      </td>
                      <td className="py-3 px-4"><Badge status={doc.status} size="sm" /></td>
                      <td className={`py-3 px-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              theme === 'light' ? 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                            }`}
                            title="Preview PDF Modal"
                            onClick={() => {
                              setPreviewDocTitle(docTitle);
                              setPreviewDocId(doc.id);
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Download PDF"
                            onClick={() => downloadDocumentPDF(doc.id, `${doc.documentNumber || 'document'}.pdf`)}
                          >
                            <Download size={15} />
                          </button>
                          <Link
                            to={isPurchaseBill ? '/billing/purchases' : `/documents/${doc.id}`}
                            className={`p-1.5 rounded transition-colors ${
                              theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title={isPurchaseBill ? "Go to Purchase Bills" : "Edit Document"}
                          >
                            <Pencil size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Document Preview Modal */}
      <PdfPreviewModal
        isOpen={Boolean(previewDocId)}
        onClose={() => setPreviewDocId(null)}
        documentId={previewDocId}
        title={previewDocTitle}
      />
    </div>
  );
}
