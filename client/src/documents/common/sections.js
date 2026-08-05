import { COUNTRIES } from './options.js';

export const SHIPPER_SECTION = {
  id: 'shipper',
  title: 'Shipper',
  fields: [
    { name: 'shipperName', label: 'Name', type: 'text', width: 'half', required: true },
    { name: 'shipperAccountNo', label: 'Account No.', type: 'text', width: 'half' },
    { name: 'shipperAddress', label: 'Address', type: 'textarea', width: 'full' },
    { name: 'shipperCity', label: 'City', type: 'text', width: 'third', required: true },
    { name: 'shipperCountry', label: 'Country', type: 'select', width: 'third', options: COUNTRIES, required: true },
    { name: 'shipperPhone', label: 'Phone', type: 'text', width: 'third' },
  ],
};

export const CONSIGNEE_SECTION = {
  id: 'consignee',
  title: 'Consignee',
  fields: [
    { name: 'consigneeName', label: 'Name', type: 'text', width: 'half', required: true },
    { name: 'consigneeAccountNo', label: 'Account No.', type: 'text', width: 'half' },
    { name: 'consigneeAddress', label: 'Address', type: 'textarea', width: 'full' },
    { name: 'consigneeCity', label: 'City', type: 'text', width: 'third', required: true },
    { name: 'consigneeCountry', label: 'Country', type: 'select', width: 'third', options: COUNTRIES, required: true },
    { name: 'consigneePhone', label: 'Phone', type: 'text', width: 'third' },
  ],
};

export const createSimpleSchema = (code, name, fields) => ({
  code,
  name,
  category: 'OTHER',
  hasPackages: false,
  sections: [{ id: 'main', title: `${name} Details`, fields }],
});
