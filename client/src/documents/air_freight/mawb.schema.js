import { AIRPORTS_OPTIONS, CURRENCIES, WEIGHT_UNITS, PAYMENT_TERMS } from '../common/options.js';
import { SHIPPER_SECTION, CONSIGNEE_SECTION } from '../common/sections.js';

export const mawbSchema = {
  code: 'MAWB',
  name: 'Air Waybill',
  category: 'AIR_FREIGHT',
  hasPackages: true,
  sections: [
    {
      id: 'awbInfo',
      title: 'AWB Information',
      fields: [
        { name: 'awbPrefix', label: 'Airline Prefix', type: 'text', width: 'third', required: true },
        { name: 'awbSerial', label: 'Serial Number', type: 'text', width: 'third' },
        { name: 'issuingCarrier', label: 'Issuing Carrier', type: 'text', width: 'third' },
        { name: 'agentName', label: 'Agent Name', type: 'text', width: 'half' },
        { name: 'agentIATACode', label: 'Agent IATA Code', type: 'text', width: 'half' },
      ],
    },
    SHIPPER_SECTION,
    CONSIGNEE_SECTION,
    {
      id: 'routing',
      title: 'Routing',
      fields: [
        { name: 'originAirport', label: 'Airport of Departure', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'destinationAirport', label: 'Airport of Destination', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'firstCarrier', label: 'First Carrier', type: 'text', width: 'third' },
        { name: 'routingTo1', label: 'Routing To (1)', type: 'select', width: 'third', options: AIRPORTS_OPTIONS },
        { name: 'routingBy1', label: 'By (1)', type: 'text', width: 'third' },
        { name: 'flightNumber', label: 'Flight Number', type: 'text', width: 'half' },
        { name: 'flightDate', label: 'Flight Date', type: 'date', width: 'half' },
      ],
    },
    {
      id: 'cargo',
      title: 'Cargo Details',
      fields: [
        { name: 'totalPieces', label: 'Number of Pieces', type: 'number', width: 'third', required: true },
        { name: 'grossWeight', label: 'Gross Weight', type: 'number', width: 'third', required: true },
        { name: 'weightUnit', label: 'Weight Unit', type: 'select', width: 'third', options: WEIGHT_UNITS },
        { name: 'chargeableWeight', label: 'Chargeable Weight', type: 'number', width: 'third' },
        { name: 'volumetricWeight', label: 'Volumetric Weight', type: 'number', width: 'third' },
        { name: 'rateClass', label: 'Rate Class', type: 'text', width: 'third' },
        { name: 'commodityDescription', label: 'Nature and Quantity of Goods', type: 'textarea', width: 'full', required: true },
        { name: 'specialHandlingCodes', label: 'Special Handling Codes', type: 'text', width: 'full' },
      ],
    },
    {
      id: 'charges',
      title: 'Charges',
      fields: [
        { name: 'currency', label: 'Currency', type: 'select', width: 'third', options: CURRENCIES },
        { name: 'paymentTerms', label: 'Payment Terms', type: 'select', width: 'third', options: PAYMENT_TERMS },
        { name: 'rateCharge', label: 'Rate/Charge', type: 'number', width: 'third' },
        { name: 'weightCharge', label: 'Weight Charge', type: 'number', width: 'third' },
        { name: 'valuationCharge', label: 'Valuation Charge', type: 'number', width: 'third' },
        { name: 'taxAmount', label: 'Tax', type: 'number', width: 'third' },
        { name: 'otherCharges', label: 'Other Charges', type: 'number', width: 'third' },
        { name: 'totalCharge', label: 'Total Charge', type: 'number', width: 'third' },
        { name: 'declaredValueCarriage', label: 'Declared Value for Carriage', type: 'number', width: 'half' },
        { name: 'declaredValueCustoms', label: 'Declared Value for Customs', type: 'number', width: 'half' },
      ],
    },
    {
      id: 'other',
      title: 'Other Information',
      fields: [
        { name: 'customsInfo', label: 'Customs Information', type: 'textarea', width: 'full' },
        { name: 'remarks', label: 'Handling Information / Remarks', type: 'textarea', width: 'full' },
      ],
    },
  ],
};
