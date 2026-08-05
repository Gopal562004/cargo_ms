import { AIRPORTS_OPTIONS } from '../common/options.js';
import { SHIPPER_SECTION, CONSIGNEE_SECTION } from '../common/sections.js';

export const dgdSchema = {
  code: 'DGD',
  name: 'Dangerous Goods Declaration',
  category: 'AIR_FREIGHT',
  hasPackages: true,
  sections: [
    { id: 'shipperInfo', title: 'Shipper', fields: SHIPPER_SECTION.fields },
    { id: 'consigneeInfo', title: 'Consignee', fields: CONSIGNEE_SECTION.fields },
    {
      id: 'transport',
      title: 'Transport Details',
      fields: [
        { name: 'awbNumber', label: 'AWB Number', type: 'text', width: 'half', required: true },
        { name: 'carrierName', label: 'Carrier Name (e.g. EMIRATES)', type: 'text', width: 'half' },
        { name: 'aircraftType', label: 'Cargo Aircraft Only / Passenger Aircraft', type: 'select', width: 'half', options: [{ value: 'CAO', label: 'Cargo Aircraft Only' }, { value: 'PAX', label: 'Passenger & Cargo Aircraft' }] },
        { name: 'originAirport', label: 'Airport of Departure', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'destinationAirport', label: 'Airport of Destination', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
      ],
    },
    {
      id: 'dgDetails',
      title: 'Dangerous Goods Details',
      fields: [
        { name: 'unNumber', label: 'UN Number', type: 'text', width: 'third', required: true },
        { name: 'properShippingName', label: 'Proper Shipping Name', type: 'textarea', width: 'two-thirds', required: true },
        { name: 'hazardClass', label: 'Class / Division', type: 'text', width: 'third', required: true },
        { name: 'subsidiaryRisk', label: 'Subsidiary Risk', type: 'text', width: 'third' },
        { name: 'packingGroup', label: 'Packing Group', type: 'select', width: 'third', options: ['I', 'II', 'III'] },
        { name: 'quantity', label: 'Quantity & Type of Packing', type: 'textarea', width: 'half' },
        { name: 'packingInstructions', label: 'Packing Instructions', type: 'text', width: 'half' },
        { name: 'authorization', label: 'Authorization', type: 'text', width: 'full' },
        { name: 'additionalInfo', label: 'Additional Handling Information', type: 'textarea', width: 'full' },
        { name: 'signatoryName', label: 'Name / Title of Signatory', type: 'text', width: 'half' },
        { name: 'signatoryPlaceDate', label: 'Place and Date (e.g. MUMBAI /31.07.2026)', type: 'text', width: 'half' },
      ],
    },
  ],
};
