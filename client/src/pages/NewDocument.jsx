import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  FileText,
  ClipboardList,
  AlertTriangle,
  Tag,
  ShieldCheck,
  Zap,
  Radio,
  Package,
  Calendar,
  Layers,
  Ship,
  Anchor,
  Scale,
  Receipt,
  DollarSign,
  Warehouse,
  Truck,
  Award,
  Bell,
  Mail,
  ArrowRight,
  Search,
  Lock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { isDocumentTypeAllowed, hasServiceAccess } from '../utils/permissions';
import Input from '../components/ui/Input';

const DOCUMENT_CATEGORIES = [
  {
    title: 'Air Freight',
    icon: Plane,
    serviceKey: 'AIR_FREIGHT',
    items: [
      { type: 'MAWB', name: 'Air Waybill', desc: 'Master or direct air waybill', icon: Plane },
      { type: 'HAWB', name: 'House Air Waybill', desc: 'House air waybill', icon: ClipboardList },
      { type: 'MANIFEST', name: 'Manifest', desc: 'Cargo manifest', icon: FileText },
      { type: 'DGD', name: 'Dangerous Goods Declaration', desc: 'IATA DGD form', icon: AlertTriangle },
      { type: 'LABEL', name: 'Label', desc: "IATA's barcoded cargo label", icon: Tag },
      { type: 'CARGO_POUCH_LABEL', name: 'Cargo Pouch Label', desc: 'Cargo pouch label', icon: Tag },
      { type: 'CSD', name: 'Consignment Security Declaration', desc: 'Security declaration', icon: ShieldCheck },
    ],
  },
  {
    title: 'eAWB / Cargo-IMP',
    icon: Zap,
    serviceKey: 'EDI_CARGO',
    items: [
      { type: 'FWB', name: 'FWB - Air Waybill (eAWB)', desc: 'Master or direct electronic air waybill', icon: Zap },
      { type: 'FHL', name: 'FHL - House Air Waybill', desc: 'Electronic house AWB consignment details', icon: Radio },
      { type: 'XFWB', name: 'XFWB - Master Air Waybill (eAWB)', desc: 'Master or direct electronic air waybill (XML)', icon: Package },
      { type: 'XFZB', name: 'XFZB - House Air Waybill', desc: 'House electronic air waybill (XML)', icon: Package },
      { type: 'FFR', name: 'FFR - Booking', desc: 'AWB space allocation request', icon: Calendar },
      { type: 'HAWB_FHL', name: 'House AWB + FHL Hybrid', desc: 'FHL with paper HAWB fields — EXPERIMENTAL', icon: Layers },
    ],
  },
  {
    title: 'Sea Freight',
    icon: Anchor,
    serviceKey: 'SEA_FREIGHT',
    items: [
      { type: 'BILL_OF_LADING', name: 'Bill of Lading', desc: 'B/L, house B/L, sea waybill and ocean B/L', icon: Ship },
      { type: 'BOL_MANIFEST', name: 'B/L Manifest', desc: 'Bill of Lading manifest', icon: FileText },
      { type: 'IMO_DGD', name: 'IMO Dangerous Goods Declaration', desc: 'IMO dangerous goods declaration', icon: AlertTriangle },
      { type: 'SOLAS_VGM', name: 'SOLAS VGM', desc: 'Verified Gross Mass declaration', icon: Scale },
    ],
  },
  {
    title: 'Sales & Billing',
    icon: Receipt,
    serviceKey: 'SALES_BILLING',
    items: [
      { type: 'TAX_INVOICE', name: 'Tax Invoice / Billing', desc: 'GST Tax Invoice matching DGR template with automatic tax breakdown & print', icon: Receipt },
      { type: 'PURCHASE_BILL_LINK', name: 'Purchase Bill', desc: 'Create & manage vendor purchase bills, expenses & DGD charges', icon: ShoppingBag, linkTo: '/billing/purchases', serviceKey: 'PURCHASE_BILLS' },
      { type: 'SALES_REGISTER_LINK', name: 'Sales Register', desc: 'View all issued invoices, track payments & revenue summary', icon: FileText, linkTo: '/billing', serviceKey: 'SALES_BILLING' },
    ],
  },
  {
    title: 'Commercial & Freight Logistics',
    icon: FileText,
    serviceKey: ['AIR_FREIGHT', 'SEA_FREIGHT'],
    items: [
      { type: 'PROFORMA_INVOICE', name: 'Proforma Invoice', desc: 'Proforma invoice, commercial invoice and credit/debit note', icon: DollarSign },
      { type: 'BOOKING', name: 'Booking', desc: 'Booking request and confirmation', icon: Calendar },
      { type: 'WAREHOUSE_RECEIPT', name: 'Warehouse Receipt', desc: 'Warehouse receipt', icon: Warehouse },
      { type: 'DOCK_RECEIPT', name: 'Dock Receipt', desc: 'Dock receipt and wharf inspection', icon: Layers },
      { type: 'CERTIFICATE_OF_ORIGIN', name: 'Certificate of Origin', desc: 'Certificate of origin, Form A and US', icon: Award },
      { type: 'DELIVERY_ORDER', name: 'Delivery Order', desc: 'Delivery order and clearance', icon: Truck },
      { type: 'DELIVERY_NOTE', name: 'Delivery/Collection Note', desc: 'Delivery and collection note', icon: ClipboardList },
      { type: 'FCR', name: 'FCR', desc: 'Forwarders Certificate of Receipt', icon: ShieldCheck },
      { type: 'CMR', name: 'CMR Consignment Note', desc: 'Road freight consignment note', icon: Truck },
      { type: 'ARRIVAL_NOTICE', name: 'Arrival Notice', desc: 'Arrival notice for sea shipments', icon: Bell },
      { type: 'SECURITY_DECLARATION', name: 'Security Declaration', desc: 'Security declaration', icon: ShieldCheck },
      { type: 'LETTER', name: 'Letters', desc: 'Miscellaneous commercial letters', icon: Mail },
    ],
  },
];

export default function NewDocument() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');

  const query = searchTerm.trim().toLowerCase();

  // Filter categories and document items based on logged-in user permissions & search query
  const filteredCategories = DOCUMENT_CATEGORIES.map((category) => {
    const allowedItems = category.items.filter((item) => {
      // For link-type items (non-document shortcuts), check their own serviceKey
      if (item.linkTo && item.serviceKey) {
        return hasServiceAccess(user, item.serviceKey);
      }
      const isAllowed = isDocumentTypeAllowed(user, item.type);
      if (!isAllowed) return false;

      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        category.title.toLowerCase().includes(query)
      );
    });

    return {
      ...category,
      items: allowedItems,
    };
  }).filter((category) => category.items.length > 0);

  const totalAllowedDocs = filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              New Document
            </h1>
            {user?.department && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                theme === 'light'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {user.department}
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Select a document type to get started. Showing documents permitted for your access level.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-72 relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            theme === 'light' ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input
            type="text"
            className={`w-full pl-9 pr-3 py-2 rounded text-xs transition-colors focus:outline-none ${
              theme === 'light'
                ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 shadow-xs'
                : 'bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
            }`}
            placeholder="Search documents (e.g. Tax Invoice, MAWB)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Access Scope Notice banner */}
      {user?.role !== 'ADMIN' && (
        <div className={`p-3 rounded-lg flex items-center justify-between text-xs border ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-600 shadow-xs'
            : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className={theme === 'light' ? 'text-indigo-600 shrink-0' : 'text-indigo-400 shrink-0'} />
            <span>
              Role: <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{user?.role}</strong> • Department:{' '}
              <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{user?.department || 'General'}</strong>
            </span>
          </div>
          <span className={theme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-500'}>
            {totalAllowedDocs} document {totalAllowedDocs === 1 ? 'type' : 'types'} available
          </span>
        </div>
      )}

      {/* Categories & Document Cards */}
      {filteredCategories.length === 0 ? (
        <div className={`border rounded-xl p-12 text-center space-y-3 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/40 border-slate-800/80'
        }`}>
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center border ${
            theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800 border-slate-700/50 text-slate-400'
          }`}>
            {query ? <Search size={22} /> : <Lock size={22} />}
          </div>
          <h3 className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
            {query ? 'No matching documents found' : 'No document types available for your account'}
          </h3>
          <p className={`text-xs max-w-md mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            {query
              ? `No document matching "${searchTerm}" found in your permitted services.`
              : 'Your assigned role or department does not have document creation permissions. Please contact your system administrator.'}
          </p>
          {query && (
            <button
              onClick={() => setSearchTerm('')}
              className={`text-xs font-medium underline cursor-pointer ${
                theme === 'light' ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'
              }`}
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        filteredCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.title} className="space-y-3">
              <h2 className={`text-sm font-semibold flex items-center gap-2 ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}>
                <CategoryIcon size={16} className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
                {category.title}
                <span className={`text-[11px] font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  ({category.items.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.type}
                      className={`flex items-start gap-3 p-4 border rounded-lg transition-all text-left group cursor-pointer ${
                        theme === 'light'
                          ? 'bg-white border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-300 shadow-xs hover:shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-indigo-500/40 shadow-sm'
                      }`}
                      onClick={() => item.linkTo ? navigate(item.linkTo) : navigate(`/documents/new/${item.type}`)}
                    >
                      <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                        theme === 'light'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200/70 group-hover:bg-indigo-600 group-hover:text-white'
                          : 'bg-slate-800/90 text-indigo-400 border-slate-700/50 group-hover:bg-indigo-600/20'
                      }`}>
                        <ItemIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-xs font-semibold transition-colors truncate ${
                            theme === 'light'
                              ? 'text-slate-900 group-hover:text-indigo-600'
                              : 'text-slate-200 group-hover:text-indigo-400'
                          }`}>
                            {item.name}
                          </h3>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            theme === 'light'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-slate-800 text-slate-400 border-slate-700/60'
                          }`}>
                            {item.tag || item.type.replace('_LINK', '')}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className={`group-hover:translate-x-0.5 transition-all mt-1 ${
                          theme === 'light'
                            ? 'text-slate-400 group-hover:text-indigo-600'
                            : 'text-slate-500 group-hover:text-indigo-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
