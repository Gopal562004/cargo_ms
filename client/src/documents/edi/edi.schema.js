import { AIRPORTS_OPTIONS } from '../common/options.js';
import { SHIPPER_SECTION, CONSIGNEE_SECTION } from '../common/sections.js';
import { mawbSchema } from '../air_freight/mawb.schema.js';
import { hawbSchema } from '../air_freight/hawb.schema.js';

export const fwbSchema = { ...mawbSchema, code: 'FWB', name: 'FWB - Air Waybill (eAWB)', category: 'EDI' };
export const fhlSchema = { ...hawbSchema, code: 'FHL', name: 'FHL - House Air Waybill', category: 'EDI' };
export const xfwbSchema = { ...mawbSchema, code: 'XFWB', name: 'XFWB - Master Air Waybill', category: 'EDI' };
export const xfzbSchema = { ...hawbSchema, code: 'XFZB', name: 'XFZB - House Air Waybill', category: 'EDI' };
export const hawbFhlSchema = { ...hawbSchema, code: 'HAWB_FHL', name: 'House AWB + FHL Hybrid', category: 'EDI' };

export const ffrSchema = {
  code: 'FFR', name: 'FFR - Booking', category: 'EDI', hasPackages: false,
  sections: [
    {
      id: 'bookingInfo', title: 'Booking Details',
      fields: [
        { name: 'awbNumber', label: 'AWB Number', type: 'text', width: 'half' },
        { name: 'originAirport', label: 'Origin', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'destinationAirport', label: 'Destination', type: 'select', width: 'half', options: AIRPORTS_OPTIONS, required: true },
        { name: 'flightNumber', label: 'Flight', type: 'text', width: 'half' },
        { name: 'flightDate', label: 'Date', type: 'date', width: 'half' },
        { name: 'totalPieces', label: 'Pieces', type: 'number', width: 'third' },
        { name: 'grossWeight', label: 'Weight (KG)', type: 'number', width: 'third' },
        { name: 'volume', label: 'Volume (CBM)', type: 'number', width: 'third' },
        { name: 'commodityDescription', label: 'Commodity', type: 'textarea', width: 'full' },
        { name: 'specialHandlingCodes', label: 'SHC', type: 'text', width: 'full' },
      ],
    },
    SHIPPER_SECTION,
    CONSIGNEE_SECTION,
  ],
};
