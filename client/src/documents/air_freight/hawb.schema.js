import { mawbSchema } from './mawb.schema.js';
import { SHIPPER_SECTION, CONSIGNEE_SECTION } from '../common/sections.js';

export const hawbSchema = {
  ...mawbSchema,
  code: 'HAWB',
  name: 'House Air Waybill',
  sections: [
    {
      id: 'hawbInfo',
      title: 'HAWB Information',
      fields: [
        { name: 'hawbNumber', label: 'HAWB Number', type: 'text', width: 'half' },
        { name: 'masterAwbNumber', label: 'Master AWB Number', type: 'text', width: 'half' },
        { name: 'agentName', label: 'Forwarding Agent', type: 'text', width: 'half' },
        { name: 'agentIATACode', label: 'IATA Code', type: 'text', width: 'half' },
      ],
    },
    SHIPPER_SECTION,
    CONSIGNEE_SECTION,
    ...mawbSchema.sections.slice(3), // routing, cargo, charges, other
  ],
};
