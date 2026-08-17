import React from 'react';
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
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  {
    title: 'Air Freight',
    icon: Plane,
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
    items: [
      { type: 'BILL_OF_LADING', name: 'Bill of Lading', desc: 'B/L, house B/L, sea waybill and ocean B/L', icon: Ship },
      { type: 'BOL_MANIFEST', name: 'B/L Manifest', desc: 'Bill of Lading manifest', icon: FileText },
      { type: 'IMO_DGD', name: 'IMO Dangerous Goods Declaration', desc: 'IMO dangerous goods declaration', icon: AlertTriangle },
      { type: 'SOLAS_VGM', name: 'SOLAS VGM', desc: 'Verified Gross Mass declaration', icon: Scale },
    ],
  },
  {
    title: 'Commercial & Logistics',
    icon: FileText,
    items: [
      { type: 'TAX_INVOICE', name: 'Tax Invoice / Billing', desc: 'GST Tax Invoice matching DGR template with automatic tax breakdown & print', icon: Receipt },
      { type: 'BOOKING', name: 'Booking', desc: 'Booking request and confirmation', icon: Calendar },
      { type: 'PROFORMA_INVOICE', name: 'Proforma Invoice', desc: 'Proforma invoice, invoice and credit/debit note', icon: DollarSign },
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

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">New Document</h1>
        <p className="text-xs text-slate-400 mt-1">Select a document type to get started</p>
      </div>

      {DOCUMENT_CATEGORIES.map((category) => {
        const CategoryIcon = category.icon;
        return (
          <div key={category.title} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <CategoryIcon size={16} className="text-indigo-400" />
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.type}
                    className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800/80 rounded hover:bg-slate-800/60 hover:border-slate-700 transition-all text-left group"
                    onClick={() => navigate(`/documents/new/${item.type}`)}
                  >
                    <div className="w-8 h-8 rounded bg-slate-800 group-hover:bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <ItemIcon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all mt-1" />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
