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
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
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
    title: 'Commercial & Billing Logistics',
    icon: FileText,
    serviceKey: ['SALES_BILLING', 'PURCHASE_BILLS'],
    items: [
      { type: 'TAX_INVOICE', name: 'Tax Invoice / Billing', desc: 'GST Tax Invoice matching DGR template with automatic tax breakdown & print', icon: Receipt },
      { type: 'PROFORMA_INVOICE', name: 'Proforma Invoice', desc: 'Proforma invoice, invoice and credit/debit note', icon: DollarSign },
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
  const [searchTerm, setSearchTerm] = useState('');

  const query = searchTerm.trim().toLowerCase();

  // Filter categories and document items based on logged-in user permissions & search query
  const filteredCategories = DOCUMENT_CATEGORIES.map((category) => {
    const allowedItems = category.items.filter((item) => {
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
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">New Document</h1>
            {user?.department && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user.department}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Select a document type to get started. Showing documents permitted for your access level.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-72 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search documents (e.g. Tax Invoice, MAWB)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Access Scope Notice banner */}
      {user?.role !== 'ADMIN' && (
        <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
            <span>
              Role: <strong className="text-slate-200">{user?.role}</strong> • Department:{' '}
              <strong className="text-slate-200">{user?.department || 'General'}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {totalAllowedDocs} document {totalAllowedDocs === 1 ? 'type' : 'types'} available
          </span>
        </div>
      )}

      {/* Categories & Document Cards */}
      {filteredCategories.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            {query ? <Search size={22} /> : <Lock size={22} />}
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            {query ? 'No matching documents found' : 'No document types available for your account'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {query
              ? `No document matching "${searchTerm}" found in your permitted services.`
              : 'Your assigned role or department does not have document creation permissions. Please contact your system administrator.'}
          </p>
          {query && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
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
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <CategoryIcon size={16} className="text-indigo-400" />
                {category.title}
                <span className="text-[11px] font-normal text-slate-500">
                  ({category.items.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.type}
                      className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg hover:bg-slate-800/60 hover:border-indigo-500/40 transition-all text-left group shadow-sm"
                      onClick={() => navigate(`/documents/new/${item.type}`)}
                    >
                      <div className="w-9 h-9 rounded bg-slate-800/90 group-hover:bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 transition-colors border border-slate-700/50">
                        <ItemIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                            {item.name}
                          </h3>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all mt-1"
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
