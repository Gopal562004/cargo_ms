import { mawbSchema } from './air_freight/mawb.schema.js';
import { hawbSchema } from './air_freight/hawb.schema.js';
import { dgdSchema } from './air_freight/dgd.schema.js';

import { fwbSchema, fhlSchema, xfwbSchema, xfzbSchema, ffrSchema, hawbFhlSchema } from './edi/edi.schema.js';
import { bolSchema, bolManifestSchema, imoDgdSchema, vgmSchema } from './sea_freight/seaFreight.schema.js';
import {
  bookingSchema, invoiceSchema, warehouseReceiptSchema, dockReceiptSchema, cooSchema,
  deliveryOrderSchema, deliveryNoteSchema, fcrSchema, cmrSchema, arrivalNoticeSchema,
  securityDeclarationSchema, letterSchema
} from './commercial/commercial.schema.js';
import { taxInvoiceSchema } from './commercial/taxInvoice.schema.js';

// Additional Air Freight schemas
import { AIRPORTS_OPTIONS } from './common/options.js';

const manifestSchema = {
  code: 'MANIFEST',
  name: 'Manifest',
  category: 'AIR_FREIGHT',
  hasPackages: false,
  sections: [
    {
      id: 'flightInfo',
      title: 'Flight Information',
      fields: [
        { name: 'flightNumber', label: 'Flight Number', type: 'text', width: 'third', required: true },
        { name: 'flightDate', label: 'Flight Date', type: 'date', width: 'third', required: true },
        { name: 'aircraftType', label: 'Aircraft Type', type: 'text', width: 'third' },
        { name: 'originAirport', label: 'Origin', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'destinationAirport', label: 'Destination', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
      ],
    },
    {
      id: 'summary',
      title: 'Cargo Summary',
      fields: [
        { name: 'totalAwbs', label: 'Total AWBs', type: 'number', width: 'third' },
        { name: 'totalPieces', label: 'Total Pieces', type: 'number', width: 'third' },
        { name: 'totalWeight', label: 'Total Weight (KG)', type: 'number', width: 'third' },
        { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
      ],
    },
  ],
};

const labelSchema = {
  code: 'LABEL',
  name: 'IATA Cargo Label',
  category: 'AIR_FREIGHT',
  hasPackages: false,
  sections: [
    {
      id: 'labelInfo',
      title: 'Label Information',
      fields: [
        { name: 'awbNumber', label: 'AWB Number', type: 'text', width: 'half', required: true },
        { name: 'originAirport', label: 'Origin', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'destinationAirport', label: 'Destination', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'totalPieces', label: 'Total Pieces', type: 'number', width: 'half', required: true },
        { name: 'weight', label: 'Weight', type: 'number', width: 'third' },
        { name: 'shipper', label: 'Shipper', type: 'text', width: 'third' },
        { name: 'consignee', label: 'Consignee', type: 'text', width: 'third' },
      ],
    },
  ],
};

const csdSchema = {
  code: 'CSD',
  name: 'Consignment Security Declaration',
  category: 'AIR_FREIGHT',
  hasPackages: false,
  sections: [
    {
      id: 'consignmentInfo',
      title: 'Consignment Information',
      fields: [
        { name: 'awbNumber', label: 'AWB Number', type: 'text', width: 'half', required: true },
        { name: 'originAirport', label: 'Origin', type: 'select', width: 'half', options: AIRPORTS_OPTIONS },
        { name: 'destinationAirport', label: 'Destination', type: 'select', width: 'half', options: AIRPORTS_OPTIONS },
        { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'half' },
      ],
    },
    {
      id: 'security',
      title: 'Security Status',
      fields: [
        { name: 'securityStatus', label: 'Security Status', type: 'select', width: 'half', options: [{ value: 'SPX', label: 'SPX - Secure for Passenger' }, { value: 'SCO', label: 'SCO - Secure for Cargo Only' }, { value: 'SHR', label: 'SHR - Screened with Equipment' }], required: true },
        { name: 'screeningMethod', label: 'Screening Method', type: 'text', width: 'half' },
        { name: 'issuedBy', label: 'Issued By', type: 'text', width: 'half' },
        { name: 'issuedDate', label: 'Date', type: 'date', width: 'half' },
        { name: 'groundsForStatus', label: 'Grounds for Security Status', type: 'textarea', width: 'full' },
      ],
    },
  ],
};

export const SCHEMA_REGISTRY = {
  // Air Freight
  MAWB: mawbSchema,
  HAWB: hawbSchema,
  MANIFEST: manifestSchema,
  DGD: dgdSchema,
  LABEL: labelSchema,
  CARGO_POUCH_LABEL: { ...labelSchema, code: 'CARGO_POUCH_LABEL', name: 'Cargo Pouch Label' },
  CSD: csdSchema,

  // EDI
  FWB: fwbSchema,
  FHL: fhlSchema,
  XFWB: xfwbSchema,
  XFZB: xfzbSchema,
  FFR: ffrSchema,
  HAWB_FHL: hawbFhlSchema,

  // Sea Freight
  BILL_OF_LADING: bolSchema,
  BOL_MANIFEST: bolManifestSchema,
  IMO_DGD: imoDgdSchema,
  SOLAS_VGM: vgmSchema,

  // Other / Commercial
  TAX_INVOICE: taxInvoiceSchema,
  BOOKING: bookingSchema,
  PROFORMA_INVOICE: invoiceSchema,
  WAREHOUSE_RECEIPT: warehouseReceiptSchema,
  DOCK_RECEIPT: dockReceiptSchema,
  CERTIFICATE_OF_ORIGIN: cooSchema,
  DELIVERY_ORDER: deliveryOrderSchema,
  DELIVERY_NOTE: deliveryNoteSchema,
  FCR: fcrSchema,
  CMR: cmrSchema,
  ARRIVAL_NOTICE: arrivalNoticeSchema,
  SECURITY_DECLARATION: securityDeclarationSchema,
  LETTER: letterSchema,
};

export function getDocumentSchema(type) {
  return SCHEMA_REGISTRY[type] || null;
}

export function getAllDocumentTypes() {
  return Object.entries(SCHEMA_REGISTRY).map(([code, schema]) => ({
    code,
    name: schema.name,
    category: schema.category,
  }));
}

export default SCHEMA_REGISTRY;
