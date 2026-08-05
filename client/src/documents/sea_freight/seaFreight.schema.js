import { COUNTRIES, CURRENCIES, PAYMENT_TERMS } from '../common/options.js';
import { SHIPPER_SECTION, CONSIGNEE_SECTION } from '../common/sections.js';
import { dgdSchema } from '../air_freight/dgd.schema.js';

export const bolSchema = {
  code: 'BILL_OF_LADING', name: 'Bill of Lading', category: 'SEA_FREIGHT', hasPackages: true,
  sections: [
    {
      id: 'bolInfo', title: 'B/L Information',
      fields: [
        { name: 'bolNumber', label: 'B/L Number', type: 'text', width: 'half' },
        { name: 'bolType', label: 'B/L Type', type: 'select', width: 'half', options: [{ value: 'ORIGINAL', label: 'Original B/L' }, { value: 'HOUSE', label: 'House B/L' }, { value: 'SEA_WAYBILL', label: 'Sea Waybill' }, { value: 'OCEAN', label: 'Ocean B/L' }] },
        { name: 'carrierName', label: 'Carrier', type: 'text', width: 'half' },
        { name: 'bookingNumber', label: 'Booking Number', type: 'text', width: 'half' },
      ],
    },
    SHIPPER_SECTION,
    CONSIGNEE_SECTION,
    {
      id: 'notifyParty', title: 'Notify Party',
      fields: [
        { name: 'notifyName', label: 'Name', type: 'text', width: 'half' },
        { name: 'notifyAddress', label: 'Address', type: 'textarea', width: 'half' },
        { name: 'notifyCity', label: 'City', type: 'text', width: 'third' },
        { name: 'notifyCountry', label: 'Country', type: 'select', width: 'third', options: COUNTRIES },
        { name: 'notifyPhone', label: 'Phone', type: 'text', width: 'third' },
      ],
    },
    {
      id: 'voyage', title: 'Vessel / Voyage',
      fields: [
        { name: 'vesselName', label: 'Vessel Name', type: 'text', width: 'half', required: true },
        { name: 'voyageNumber', label: 'Voyage Number', type: 'text', width: 'half' },
        { name: 'portOfLoading', label: 'Port of Loading', type: 'text', width: 'half', required: true },
        { name: 'portOfDischarge', label: 'Port of Discharge', type: 'text', width: 'half', required: true },
        { name: 'placeOfReceipt', label: 'Place of Receipt', type: 'text', width: 'half' },
        { name: 'placeOfDelivery', label: 'Place of Delivery', type: 'text', width: 'half' },
      ],
    },
    {
      id: 'cargo', title: 'Cargo Details',
      fields: [
        { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
        { name: 'grossWeight', label: 'Gross Weight (KG)', type: 'number', width: 'third' },
        { name: 'measurement', label: 'Measurement (CBM)', type: 'number', width: 'third' },
        { name: 'containerNumber', label: 'Container Number', type: 'text', width: 'half' },
        { name: 'sealNumber', label: 'Seal Number', type: 'text', width: 'half' },
        { name: 'goodsDescription', label: 'Description of Goods', type: 'textarea', width: 'full', required: true },
        { name: 'marksAndNumbers', label: 'Marks & Numbers', type: 'textarea', width: 'full' },
      ],
    },
    {
      id: 'freight', title: 'Freight & Charges',
      fields: [
        { name: 'freightPayable', label: 'Freight Payable', type: 'select', width: 'half', options: PAYMENT_TERMS },
        { name: 'currency', label: 'Currency', type: 'select', width: 'half', options: CURRENCIES },
        { name: 'freightAmount', label: 'Freight Amount', type: 'number', width: 'third' },
        { name: 'otherCharges', label: 'Other Charges', type: 'number', width: 'third' },
        { name: 'totalAmount', label: 'Total', type: 'number', width: 'third' },
        { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
      ],
    },
  ],
};

export const bolManifestSchema = {
  code: 'BOL_MANIFEST', name: 'B/L Manifest', category: 'SEA_FREIGHT', hasPackages: false,
  sections: [{
    id: 'vesselInfo', title: 'Vessel Information',
    fields: [
      { name: 'vesselName', label: 'Vessel', type: 'text', width: 'half', required: true },
      { name: 'voyageNumber', label: 'Voyage', type: 'text', width: 'half' },
      { name: 'portOfLoading', label: 'Port of Loading', type: 'text', width: 'half', required: true },
      { name: 'portOfDischarge', label: 'Port of Discharge', type: 'text', width: 'half', required: true },
      { name: 'totalBLs', label: 'Total B/Ls', type: 'number', width: 'third' },
      { name: 'totalContainers', label: 'Total Containers', type: 'number', width: 'third' },
      { name: 'totalWeight', label: 'Total Weight (KG)', type: 'number', width: 'third' },
      { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
    ],
  }],
};

export const imoDgdSchema = {
  code: 'IMO_DGD', name: 'IMO DG Declaration', category: 'SEA_FREIGHT', hasPackages: true,
  sections: [
    { ...dgdSchema.sections[0] },
    { ...dgdSchema.sections[1] },
    {
      id: 'vesselInfo', title: 'Vessel Details',
      fields: [
        { name: 'vesselName', label: 'Vessel Name', type: 'text', width: 'half', required: true },
        { name: 'voyageNumber', label: 'Voyage', type: 'text', width: 'half' },
        { name: 'portOfLoading', label: 'Port of Loading', type: 'text', width: 'half', required: true },
        { name: 'portOfDischarge', label: 'Port of Discharge', type: 'text', width: 'half', required: true },
      ],
    },
    { ...dgdSchema.sections[3], id: 'imoDgDetails', title: 'IMO Dangerous Goods Details' },
  ],
};

export const vgmSchema = {
  code: 'SOLAS_VGM', name: 'SOLAS VGM', category: 'SEA_FREIGHT', hasPackages: false,
  sections: [{
    id: 'vgmInfo', title: 'Verified Gross Mass',
    fields: [
      { name: 'containerNumber', label: 'Container Number', type: 'text', width: 'half', required: true },
      { name: 'sealNumber', label: 'Seal Number', type: 'text', width: 'half' },
      { name: 'bolNumber', label: 'B/L Number', type: 'text', width: 'half' },
      { name: 'bookingNumber', label: 'Booking Number', type: 'text', width: 'half' },
      { name: 'verifiedGrossMass', label: 'Verified Gross Mass (KG)', type: 'number', width: 'third', required: true },
      { name: 'weighingMethod', label: 'Weighing Method', type: 'select', width: 'third', options: [{ value: 'SM1', label: 'Method 1 - Weigh packed container' }, { value: 'SM2', label: 'Method 2 - Weigh all contents + tare' }], required: true },
      { name: 'weighingDate', label: 'Weighing Date', type: 'date', width: 'third', required: true },
      { name: 'shipperName', label: 'Shipper', type: 'text', width: 'half' },
      { name: 'authorizedPerson', label: 'Authorized Person', type: 'text', width: 'half' },
      { name: 'remarks', label: 'Remarks', type: 'textarea', width: 'full' },
    ],
  }],
};
