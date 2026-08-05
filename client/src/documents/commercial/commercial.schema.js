import { COUNTRIES, CURRENCIES } from '../common/options.js';
import { SHIPPER_SECTION, CONSIGNEE_SECTION, createSimpleSchema } from '../common/sections.js';

export const bookingSchema = {
  code: 'BOOKING', name: 'Booking', category: 'OTHER', hasPackages: false,
  sections: [
    {
      id: 'bookingInfo', title: 'Booking Details',
      fields: [
        { name: 'bookingNumber', label: 'Booking Number', type: 'text', width: 'half' },
        { name: 'bookingType', label: 'Type', type: 'select', width: 'half', options: [{ value: 'REQUEST', label: 'Booking Request' }, { value: 'CONFIRMATION', label: 'Booking Confirmation' }] },
        { name: 'carrierName', label: 'Carrier', type: 'text', width: 'half' },
        { name: 'vesselOrFlight', label: 'Vessel / Flight', type: 'text', width: 'half' },
        { name: 'origin', label: 'Origin', type: 'text', width: 'half', required: true },
        { name: 'destination', label: 'Destination', type: 'text', width: 'half', required: true },
        { name: 'departureDate', label: 'Departure Date', type: 'date', width: 'half' },
        { name: 'arrivalDate', label: 'Arrival Date', type: 'date', width: 'half' },
        { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
        { name: 'grossWeight', label: 'Weight (KG)', type: 'number', width: 'third' },
        { name: 'volume', label: 'Volume (CBM)', type: 'number', width: 'third' },
        { name: 'commodityDescription', label: 'Commodity', type: 'textarea', width: 'full' },
        { name: 'specialInstructions', label: 'Special Instructions', type: 'textarea', width: 'full' },
      ],
    },
    SHIPPER_SECTION,
    CONSIGNEE_SECTION,
  ],
};

export const invoiceSchema = {
  code: 'PROFORMA_INVOICE', name: 'Proforma Invoice', category: 'OTHER', hasPackages: true,
  sections: [
    {
      id: 'invoiceInfo', title: 'Invoice Details',
      fields: [
        { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', width: 'half' },
        { name: 'invoiceType', label: 'Type', type: 'select', width: 'half', options: [{ value: 'PROFORMA', label: 'Proforma Invoice' }, { value: 'COMMERCIAL', label: 'Commercial Invoice' }, { value: 'CREDIT_NOTE', label: 'Credit Note' }, { value: 'DEBIT_NOTE', label: 'Debit Note' }] },
        { name: 'invoiceDate', label: 'Date', type: 'date', width: 'half' },
        { name: 'dueDate', label: 'Due Date', type: 'date', width: 'half' },
        { name: 'currency', label: 'Currency', type: 'select', width: 'third', options: CURRENCIES },
        { name: 'paymentTerms', label: 'Payment Terms', type: 'text', width: 'third' },
        { name: 'incoterm', label: 'Incoterm', type: 'select', width: 'third', options: ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'] },
      ],
    },
    SHIPPER_SECTION,
    CONSIGNEE_SECTION,
    {
      id: 'totals', title: 'Totals',
      fields: [
        { name: 'subtotal', label: 'Subtotal', type: 'number', width: 'third' },
        { name: 'taxRate', label: 'Tax Rate (%)', type: 'number', width: 'third' },
        { name: 'taxAmount', label: 'Tax Amount', type: 'number', width: 'third' },
        { name: 'discount', label: 'Discount', type: 'number', width: 'third' },
        { name: 'totalAmount', label: 'Total Amount', type: 'number', width: 'third' },
        { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
      ],
    },
  ],
};

export const warehouseReceiptSchema = createSimpleSchema('WAREHOUSE_RECEIPT', 'Warehouse Receipt', [
  { name: 'receiptNumber', label: 'Receipt Number', type: 'text', width: 'half' },
  { name: 'warehouseName', label: 'Warehouse', type: 'text', width: 'half' },
  { name: 'receivedDate', label: 'Received Date', type: 'date', width: 'half' },
  { name: 'depositorName', label: 'Depositor', type: 'text', width: 'half', required: true },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
  { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
  { name: 'grossWeight', label: 'Weight (KG)', type: 'number', width: 'third' },
  { name: 'storageConditions', label: 'Storage Conditions', type: 'text', width: 'third' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
]);

export const dockReceiptSchema = createSimpleSchema('DOCK_RECEIPT', 'Dock Receipt', [
  { name: 'receiptNumber', label: 'Receipt Number', type: 'text', width: 'half' },
  { name: 'carrierName', label: 'Carrier', type: 'text', width: 'half' },
  { name: 'vesselName', label: 'Vessel', type: 'text', width: 'half' },
  { name: 'portOfLoading', label: 'Port of Loading', type: 'text', width: 'half' },
  { name: 'shipperName', label: 'Shipper', type: 'text', width: 'half', required: true },
  { name: 'consigneeName', label: 'Consignee', type: 'text', width: 'half' },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
  { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
  { name: 'grossWeight', label: 'Weight (KG)', type: 'number', width: 'third' },
  { name: 'measurement', label: 'Measurement (CBM)', type: 'number', width: 'third' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
]);

export const cooSchema = createSimpleSchema('CERTIFICATE_OF_ORIGIN', 'Certificate of Origin', [
  { name: 'certificateNumber', label: 'Certificate Number', type: 'text', width: 'half' },
  { name: 'certificateType', label: 'Type', type: 'select', width: 'half', options: [{ value: 'STANDARD', label: 'Standard' }, { value: 'FORM_A', label: 'Form A (GSP)' }, { value: 'US', label: 'US Certificate' }] },
  { name: 'exporterName', label: 'Exporter', type: 'text', width: 'half', required: true },
  { name: 'importerName', label: 'Importer/Consignee', type: 'text', width: 'half', required: true },
  { name: 'countryOfOrigin', label: 'Country of Origin', type: 'select', width: 'half', options: COUNTRIES, required: true },
  { name: 'countryOfDestination', label: 'Country of Destination', type: 'select', width: 'half', options: COUNTRIES },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
  { name: 'hsCode', label: 'HS Code', type: 'text', width: 'third' },
  { name: 'grossWeight', label: 'Weight (KG)', type: 'number', width: 'third' },
  { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', width: 'third' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
]);

export const deliveryOrderSchema = createSimpleSchema('DELIVERY_ORDER', 'Delivery Order', [
  { name: 'orderNumber', label: 'D/O Number', type: 'text', width: 'half' },
  { name: 'issueDate', label: 'Issue Date', type: 'date', width: 'half' },
  { name: 'shipperName', label: 'Shipper/Exporter', type: 'text', width: 'half' },
  { name: 'consigneeName', label: 'Consignee', type: 'text', width: 'half', required: true },
  { name: 'bolNumber', label: 'B/L Number', type: 'text', width: 'half' },
  { name: 'vesselName', label: 'Vessel', type: 'text', width: 'half' },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
  { name: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', width: 'full' },
  { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
  { name: 'grossWeight', label: 'Weight', type: 'number', width: 'third' },
  { name: 'containerNumber', label: 'Container', type: 'text', width: 'third' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
]);

export const deliveryNoteSchema = createSimpleSchema('DELIVERY_NOTE', 'Delivery/Collection Note', [
  { name: 'noteNumber', label: 'Note Number', type: 'text', width: 'half' },
  { name: 'noteType', label: 'Type', type: 'select', width: 'half', options: [{ value: 'DELIVERY', label: 'Delivery Note' }, { value: 'COLLECTION', label: 'Collection Note' }] },
  { name: 'issueDate', label: 'Date', type: 'date', width: 'half' },
  { name: 'senderName', label: 'Sender', type: 'text', width: 'half', required: true },
  { name: 'recipientName', label: 'Recipient', type: 'text', width: 'half', required: true },
  { name: 'deliveryAddress', label: 'Delivery/Collection Address', type: 'textarea', width: 'full' },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
  { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
  { name: 'grossWeight', label: 'Weight', type: 'number', width: 'third' },
  { name: 'vehicleNumber', label: 'Vehicle Number', type: 'text', width: 'third' },
  { name: 'receivedBy', label: 'Received By', type: 'text', width: 'half' },
  { name: 'receivedDate', label: 'Received Date', type: 'date', width: 'half' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
]);

export const fcrSchema = createSimpleSchema('FCR', 'FCR - Forwarders Certificate of Receipt', [
  { name: 'fcrNumber', label: 'FCR Number', type: 'text', width: 'half' },
  { name: 'issueDate', label: 'Date', type: 'date', width: 'half' },
  { name: 'shipperName', label: 'Shipper', type: 'text', width: 'half', required: true },
  { name: 'consigneeName', label: 'Consignee', type: 'text', width: 'half', required: true },
  { name: 'origin', label: 'Place of Receipt', type: 'text', width: 'half', required: true },
  { name: 'destination', label: 'Place of Delivery', type: 'text', width: 'half', required: true },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
  { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
  { name: 'grossWeight', label: 'Weight', type: 'number', width: 'third' },
  { name: 'measurement', label: 'Measurement', type: 'number', width: 'third' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
]);

export const cmrSchema = createSimpleSchema('CMR', 'CMR Consignment Note', [
  { name: 'cmrNumber', label: 'CMR Number', type: 'text', width: 'half' },
  { name: 'issueDate', label: 'Date', type: 'date', width: 'half' },
  { name: 'senderName', label: 'Sender', type: 'text', width: 'half', required: true },
  { name: 'senderAddress', label: 'Sender Address', type: 'textarea', width: 'half' },
  { name: 'consigneeName', label: 'Consignee', type: 'text', width: 'half', required: true },
  { name: 'consigneeAddress', label: 'Consignee Address', type: 'textarea', width: 'half' },
  { name: 'carrierName', label: 'Carrier', type: 'text', width: 'half' },
  { name: 'placeOfTakingOver', label: 'Place of Taking Over', type: 'text', width: 'half', required: true },
  { name: 'placeOfDelivery', label: 'Place of Delivery', type: 'text', width: 'half', required: true },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
  { name: 'grossWeight', label: 'Gross Weight (KG)', type: 'number', width: 'third' },
  { name: 'volume', label: 'Volume (CBM)', type: 'number', width: 'third' },
  { name: 'vehicleRegistration', label: 'Vehicle Registration', type: 'text', width: 'third' },
  { name: 'specialInstructions', label: 'Special Instructions', type: 'textarea', width: 'full' },
]);

export const arrivalNoticeSchema = createSimpleSchema('ARRIVAL_NOTICE', 'Arrival Notice', [
  { name: 'noticeNumber', label: 'Notice Number', type: 'text', width: 'half' },
  { name: 'issueDate', label: 'Date', type: 'date', width: 'half' },
  { name: 'bolNumber', label: 'B/L Number', type: 'text', width: 'half', required: true },
  { name: 'vesselName', label: 'Vessel', type: 'text', width: 'half' },
  { name: 'consigneeName', label: 'Consignee', type: 'text', width: 'half', required: true },
  { name: 'notifyParty', label: 'Notify Party', type: 'text', width: 'half' },
  { name: 'portOfDischarge', label: 'Port of Discharge', type: 'text', width: 'half' },
  { name: 'eta', label: 'ETA', type: 'date', width: 'half' },
  { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full' },
  { name: 'freightCharges', label: 'Freight Charges', type: 'number', width: 'third' },
  { name: 'demurrageDate', label: 'Free Time Expires', type: 'date', width: 'third' },
  { name: 'containerNumber', label: 'Container', type: 'text', width: 'third' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
]);

export const securityDeclarationSchema = createSimpleSchema('SECURITY_DECLARATION', 'Security Declaration', [
  { name: 'declarationNumber', label: 'Declaration Number', type: 'text', width: 'half' },
  { name: 'issueDate', label: 'Date', type: 'date', width: 'half' },
  { name: 'companyName', label: 'Company Name', type: 'text', width: 'half', required: true },
  { name: 'companyAddress', label: 'Address', type: 'textarea', width: 'half' },
  { name: 'securityStatus', label: 'Security Status', type: 'text', width: 'half' },
  { name: 'declarationType', label: 'Declaration Type', type: 'text', width: 'half' },
  { name: 'description', label: 'Declaration Details', type: 'textarea', width: 'full', required: true },
  { name: 'authorizedPerson', label: 'Authorized Person', type: 'text', width: 'half' },
  { name: 'signature', label: 'Signature / Stamp', type: 'text', width: 'half' },
]);

export const letterSchema = createSimpleSchema('LETTER', 'Letter', [
  { name: 'letterType', label: 'Letter Type', type: 'text', width: 'half' },
  { name: 'date', label: 'Date', type: 'date', width: 'half' },
  { name: 'recipientName', label: 'To', type: 'text', width: 'half', required: true },
  { name: 'recipientAddress', label: 'Address', type: 'textarea', width: 'half' },
  { name: 'subject', label: 'Subject', type: 'text', width: 'full' },
  { name: 'body', label: 'Body', type: 'textarea', width: 'full', required: true },
  { name: 'senderName', label: 'From', type: 'text', width: 'half' },
  { name: 'senderTitle', label: 'Title', type: 'text', width: 'half' },
]);
