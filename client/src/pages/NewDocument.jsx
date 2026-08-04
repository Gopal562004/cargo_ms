import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NewDocument.css';

const DOCUMENT_CATEGORIES = [
  {
    title: 'Air Freight',
    icon: '✈️',
    items: [
      { type: 'MAWB', name: 'Air Waybill', desc: 'Master or direct air waybill', icon: '✈️' },
      { type: 'HAWB', name: 'House Air Waybill', desc: 'House air waybill', icon: '📋' },
      { type: 'MANIFEST', name: 'Manifest', desc: 'Cargo manifest', icon: '📜' },
      { type: 'DGD', name: 'Dangerous Goods Declaration', desc: 'IATA DGD form', icon: '⚠️' },
      { type: 'LABEL', name: 'Label', desc: "IATA's barcoded cargo label", icon: '🏷️' },
      { type: 'CARGO_POUCH_LABEL', name: 'Cargo Pouch Label', desc: 'Cargo pouch label', icon: '🏷️' },
      { type: 'CSD', name: 'Consignment Security Declaration', desc: 'Security declaration', icon: '🛡️' },
    ],
  },
  {
    title: 'eAWB / Cargo-IMP',
    icon: '⚡',
    items: [
      { type: 'FWB', name: 'FWB - Air Waybill (eAWB)', desc: 'Master or direct electronic air waybill', icon: '⚡' },
      { type: 'FHL', name: 'FHL - House Air Waybill', desc: 'Electronic house AWB consignment details', icon: '📡' },
      { type: 'XFWB', name: 'XFWB - Master Air Waybill (eAWB)', desc: 'Master or direct electronic air waybill (XML)', icon: '📦' },
      { type: 'XFZB', name: 'XFZB - House Air Waybill', desc: 'House electronic air waybill (XML)', icon: '📦' },
      { type: 'FFR', name: 'FFR - Booking', desc: 'AWB space allocation request', icon: '📅' },
      { type: 'HAWB_FHL', name: 'House AWB + FHL Hybrid', desc: 'FHL with paper HAWB fields — EXPERIMENTAL', icon: '🔬' },
    ],
  },
  {
    title: 'Sea Freight',
    icon: '⚓',
    items: [
      { type: 'BILL_OF_LADING', name: 'Bill of Lading', desc: 'B/L, house B/L, sea waybill and ocean B/L', icon: '🚢' },
      { type: 'BOL_MANIFEST', name: 'B/L Manifest', desc: 'Bill of Lading manifest', icon: '📜' },
      { type: 'IMO_DGD', name: 'IMO Dangerous Goods Declaration', desc: 'IMO dangerous goods declaration', icon: '⚠️' },
      { type: 'SOLAS_VGM', name: 'SOLAS VGM', desc: 'Verified Gross Mass declaration', icon: '⚖️' },
    ],
  },
  {
    title: 'Other',
    icon: '📁',
    items: [
      { type: 'BOOKING', name: 'Booking', desc: 'Booking request and confirmation', icon: '📅' },
      { type: 'PROFORMA_INVOICE', name: 'Proforma Invoice', desc: 'Proforma invoice, invoice and credit/debit note', icon: '💰' },
      { type: 'WAREHOUSE_RECEIPT', name: 'Warehouse Receipt', desc: 'Warehouse receipt', icon: '🏭' },
      { type: 'DOCK_RECEIPT', name: 'Dock Receipt', desc: 'Dock receipt', icon: '🏗️' },
      { type: 'CERTIFICATE_OF_ORIGIN', name: 'Certificate of Origin', desc: 'Certificate of origin, Form A and US', icon: '🏅' },
      { type: 'DELIVERY_ORDER', name: 'Delivery Order', desc: 'Delivery order', icon: '🚚' },
      { type: 'DELIVERY_NOTE', name: 'Delivery/Collection Note', desc: 'Delivery and collection note', icon: '📝' },
      { type: 'FCR', name: 'FCR', desc: 'Forwarders Certificate of Receipt', icon: '✅' },
      { type: 'CMR', name: 'CMR Consignment Note', desc: 'Road freight consignment note', icon: '🛣️' },
      { type: 'ARRIVAL_NOTICE', name: 'Arrival Notice', desc: 'Arrival notice for sea shipments', icon: '🔔' },
      { type: 'SECURITY_DECLARATION', name: 'Security Declaration', desc: 'Security declaration', icon: '🛡️' },
      { type: 'LETTER', name: 'Letters', desc: 'Miscellaneous letters', icon: '✉️' },
    ],
  },
];

export default function NewDocument() {
  const navigate = useNavigate();

  return (
    <div className="new-document">
      <div className="new-document__header">
        <h1 className="new-document__title">New Document</h1>
        <p className="new-document__subtitle">Select a document type to get started</p>
      </div>

      {DOCUMENT_CATEGORIES.map((category) => (
        <div key={category.title} className="doc-category">
          <h2 className="doc-category__title">
            <span className="doc-category__icon">{category.icon}</span>
            {category.title}
          </h2>
          <div className="doc-category__grid">
            {category.items.map((item) => (
              <button
                key={item.type}
                className="doc-type-card"
                onClick={() => navigate(`/documents/new/${item.type}`)}
              >
                <span className="doc-type-card__icon">{item.icon}</span>
                <div className="doc-type-card__content">
                  <h3 className="doc-type-card__name">{item.name}</h3>
                  <p className="doc-type-card__desc">{item.desc}</p>
                </div>
                <span className="doc-type-card__arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
