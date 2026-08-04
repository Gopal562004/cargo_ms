/**
 * Document Type Schema Registry
 *
 * Each schema defines the form structure for a document type.
 * The DocumentEditorPage renders forms dynamically from these schemas.
 */

// ─── SCHEMA DEFINITIONS ──────────────────────────────

const AIRPORTS_OPTIONS = [
  'BOM', 'DEL', 'MAA', 'BLR', 'HYD', 'CCU', 'DXB', 'AUH', 'DOH', 'SIN',
  'HKG', 'PVG', 'NRT', 'ICN', 'BKK', 'KUL', 'LHR', 'CDG', 'FRA', 'AMS',
  'MUC', 'FCO', 'MAD', 'IST', 'ZRH', 'JFK', 'LAX', 'ORD', 'MIA', 'ATL',
  'SFO', 'YYZ', 'GRU', 'SYD', 'NBO', 'JNB', 'CAI', 'JED', 'RUH',
].map((code) => ({ value: code, label: code }));

const COUNTRIES = [
  'IN', 'AE', 'US', 'GB', 'DE', 'FR', 'CN', 'JP', 'SG', 'HK', 'AU',
  'CA', 'BR', 'SA', 'QA', 'KR', 'TH', 'MY', 'IT', 'ES', 'TR', 'NL',
  'CH', 'ZA', 'KE', 'EG', 'NG', 'MX', 'AT', 'BE', 'DK', 'NZ', 'BH', 'OM', 'KW',
].map((c) => ({ value: c, label: c }));

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'SGD', 'HKD', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'SAR', 'QAR']
  .map((c) => ({ value: c, label: c }));

const WEIGHT_UNITS = [{ value: 'KG', label: 'KG' }, { value: 'LB', label: 'LB' }];
const PAYMENT_TERMS = [{ value: 'PREPAID', label: 'Prepaid' }, { value: 'COLLECT', label: 'Collect' }];

// ─── Shared Sections ─────────────────────────────────

const SHIPPER_SECTION = {
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

const CONSIGNEE_SECTION = {
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

// ─── AIR FREIGHT SCHEMAS ─────────────────────────────

const mawbSchema = {
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

const hawbSchema = {
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

const dgdSchema = {
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

// ─── EDI SCHEMAS ─────────────────────────────────────

const fwbSchema = { ...mawbSchema, code: 'FWB', name: 'FWB - Air Waybill (eAWB)', category: 'EDI' };
const fhlSchema = { ...hawbSchema, code: 'FHL', name: 'FHL - House Air Waybill', category: 'EDI' };
const xfwbSchema = { ...mawbSchema, code: 'XFWB', name: 'XFWB - Master Air Waybill', category: 'EDI' };
const xfzbSchema = { ...hawbSchema, code: 'XFZB', name: 'XFZB - House Air Waybill', category: 'EDI' };
const ffrSchema = {
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
const hawbFhlSchema = { ...hawbSchema, code: 'HAWB_FHL', name: 'House AWB + FHL Hybrid', category: 'EDI' };

// ─── SEA FREIGHT SCHEMAS ─────────────────────────────

const bolSchema = {
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

const bolManifestSchema = {
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

const imoDgdSchema = {
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

const vgmSchema = {
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

// ─── OTHER DOCUMENT SCHEMAS ──────────────────────────

const createSimpleSchema = (code, name, fields) => ({
  code, name, category: 'OTHER', hasPackages: false,
  sections: [{ id: 'main', title: `${name} Details`, fields }],
});

const bookingSchema = {
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

const invoiceSchema = {
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

const warehouseReceiptSchema = createSimpleSchema('WAREHOUSE_RECEIPT', 'Warehouse Receipt', [
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

const dockReceiptSchema = createSimpleSchema('DOCK_RECEIPT', 'Dock Receipt', [
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

const cooSchema = createSimpleSchema('CERTIFICATE_OF_ORIGIN', 'Certificate of Origin', [
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

const deliveryOrderSchema = createSimpleSchema('DELIVERY_ORDER', 'Delivery Order', [
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

const deliveryNoteSchema = createSimpleSchema('DELIVERY_NOTE', 'Delivery/Collection Note', [
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

const fcrSchema = createSimpleSchema('FCR', 'FCR - Forwarders Certificate of Receipt', [
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

const cmrSchema = createSimpleSchema('CMR', 'CMR Consignment Note', [
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

const arrivalNoticeSchema = createSimpleSchema('ARRIVAL_NOTICE', 'Arrival Notice', [
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

const securityDeclarationSchema = createSimpleSchema('SECURITY_DECLARATION', 'Security Declaration', [
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

const letterSchema = createSimpleSchema('LETTER', 'Letter', [
  { name: 'letterType', label: 'Letter Type', type: 'text', width: 'half' },
  { name: 'date', label: 'Date', type: 'date', width: 'half' },
  { name: 'recipientName', label: 'To', type: 'text', width: 'half', required: true },
  { name: 'recipientAddress', label: 'Address', type: 'textarea', width: 'half' },
  { name: 'subject', label: 'Subject', type: 'text', width: 'full' },
  { name: 'body', label: 'Body', type: 'textarea', width: 'full', required: true },
  { name: 'senderName', label: 'From', type: 'text', width: 'half' },
  { name: 'senderTitle', label: 'Title', type: 'text', width: 'half' },
]);

// ─── REGISTRY ────────────────────────────────────────

const SCHEMA_REGISTRY = {
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

  // Other
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

/**
 * Get the schema for a document type.
 */
export function getDocumentSchema(type) {
  return SCHEMA_REGISTRY[type] || null;
}

/**
 * Get all registered document types.
 */
export function getAllDocumentTypes() {
  return Object.entries(SCHEMA_REGISTRY).map(([code, schema]) => ({
    code,
    name: schema.name,
    category: schema.category,
  }));
}

export default SCHEMA_REGISTRY;
