/**
 * Constants for the freight document management system.
 * Airport codes, airline prefixes, special handling codes, and document type metadata.
 */

// ─── Top IATA Airport Codes ─────────────────────────

export const AIRPORTS = {
  // Asia
  BOM: { name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'IN' },
  DEL: { name: 'Indira Gandhi Intl', city: 'Delhi', country: 'IN' },
  MAA: { name: 'Chennai Intl', city: 'Chennai', country: 'IN' },
  BLR: { name: 'Kempegowda Intl', city: 'Bengaluru', country: 'IN' },
  HYD: { name: 'Rajiv Gandhi Intl', city: 'Hyderabad', country: 'IN' },
  CCU: { name: 'Netaji Subhas Chandra Bose Intl', city: 'Kolkata', country: 'IN' },
  DXB: { name: 'Dubai Intl', city: 'Dubai', country: 'AE' },
  AUH: { name: 'Abu Dhabi Intl', city: 'Abu Dhabi', country: 'AE' },
  SHJ: { name: 'Sharjah Intl', city: 'Sharjah', country: 'AE' },
  DOH: { name: 'Hamad Intl', city: 'Doha', country: 'QA' },
  SIN: { name: 'Changi', city: 'Singapore', country: 'SG' },
  HKG: { name: 'Hong Kong Intl', city: 'Hong Kong', country: 'HK' },
  PVG: { name: 'Pudong Intl', city: 'Shanghai', country: 'CN' },
  PEK: { name: 'Capital Intl', city: 'Beijing', country: 'CN' },
  CAN: { name: 'Baiyun Intl', city: 'Guangzhou', country: 'CN' },
  NRT: { name: 'Narita Intl', city: 'Tokyo', country: 'JP' },
  HND: { name: 'Haneda', city: 'Tokyo', country: 'JP' },
  ICN: { name: 'Incheon Intl', city: 'Seoul', country: 'KR' },
  KUL: { name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'MY' },
  BKK: { name: 'Suvarnabhumi', city: 'Bangkok', country: 'TH' },
  // Middle East
  JED: { name: 'King Abdulaziz Intl', city: 'Jeddah', country: 'SA' },
  RUH: { name: 'King Khalid Intl', city: 'Riyadh', country: 'SA' },
  BAH: { name: 'Bahrain Intl', city: 'Bahrain', country: 'BH' },
  MCT: { name: 'Muscat Intl', city: 'Muscat', country: 'OM' },
  KWI: { name: 'Kuwait Intl', city: 'Kuwait', country: 'KW' },
  // Europe
  LHR: { name: 'Heathrow', city: 'London', country: 'GB' },
  LGW: { name: 'Gatwick', city: 'London', country: 'GB' },
  STN: { name: 'Stansted', city: 'London', country: 'GB' },
  CDG: { name: 'Charles de Gaulle', city: 'Paris', country: 'FR' },
  FRA: { name: 'Frankfurt', city: 'Frankfurt', country: 'DE' },
  AMS: { name: 'Schiphol', city: 'Amsterdam', country: 'NL' },
  MUC: { name: 'Munich', city: 'Munich', country: 'DE' },
  FCO: { name: 'Fiumicino', city: 'Rome', country: 'IT' },
  MAD: { name: 'Barajas', city: 'Madrid', country: 'ES' },
  BCN: { name: 'El Prat', city: 'Barcelona', country: 'ES' },
  IST: { name: 'Istanbul', city: 'Istanbul', country: 'TR' },
  ZRH: { name: 'Zurich', city: 'Zurich', country: 'CH' },
  VIE: { name: 'Vienna Intl', city: 'Vienna', country: 'AT' },
  BRU: { name: 'Brussels', city: 'Brussels', country: 'BE' },
  CPH: { name: 'Copenhagen', city: 'Copenhagen', country: 'DK' },
  // Americas
  JFK: { name: 'John F. Kennedy Intl', city: 'New York', country: 'US' },
  LAX: { name: 'Los Angeles Intl', city: 'Los Angeles', country: 'US' },
  ORD: { name: "O'Hare Intl", city: 'Chicago', country: 'US' },
  MIA: { name: 'Miami Intl', city: 'Miami', country: 'US' },
  ATL: { name: 'Hartsfield-Jackson', city: 'Atlanta', country: 'US' },
  DFW: { name: 'Dallas/Fort Worth', city: 'Dallas', country: 'US' },
  SFO: { name: 'San Francisco Intl', city: 'San Francisco', country: 'US' },
  EWR: { name: 'Newark Liberty Intl', city: 'Newark', country: 'US' },
  YYZ: { name: 'Toronto Pearson', city: 'Toronto', country: 'CA' },
  GRU: { name: 'Guarulhos', city: 'São Paulo', country: 'BR' },
  MEX: { name: 'Benito Juárez Intl', city: 'Mexico City', country: 'MX' },
  // Africa
  JNB: { name: 'O.R. Tambo Intl', city: 'Johannesburg', country: 'ZA' },
  NBO: { name: 'Jomo Kenyatta Intl', city: 'Nairobi', country: 'KE' },
  CAI: { name: 'Cairo Intl', city: 'Cairo', country: 'EG' },
  ADD: { name: 'Bole Intl', city: 'Addis Ababa', country: 'ET' },
  LOS: { name: 'Murtala Muhammed Intl', city: 'Lagos', country: 'NG' },
  // Oceania
  SYD: { name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'AU' },
  MEL: { name: 'Melbourne', city: 'Melbourne', country: 'AU' },
  AKL: { name: 'Auckland', city: 'Auckland', country: 'NZ' },
};

// ─── Airline Prefixes (3-digit code → airline) ──────

export const AIRLINE_PREFIXES = {
  '098': { name: 'Air India', code: 'AI' },
  '176': { name: 'Emirates', code: 'EK' },
  '014': { name: 'Air Canada', code: 'AC' },
  '016': { name: 'United Airlines', code: 'UA' },
  '006': { name: 'Delta Air Lines', code: 'DL' },
  '001': { name: 'American Airlines', code: 'AA' },
  '125': { name: 'British Airways', code: 'BA' },
  '057': { name: 'Air France', code: 'AF' },
  '020': { name: 'Lufthansa', code: 'LH' },
  '074': { name: 'KLM', code: 'KL' },
  '618': { name: 'Singapore Airlines', code: 'SQ' },
  '160': { name: 'Cathay Pacific', code: 'CX' },
  '235': { name: 'Turkish Airlines', code: 'TK' },
  '157': { name: 'Qatar Airways', code: 'QR' },
  '607': { name: 'Etihad Airways', code: 'EY' },
  '655': { name: 'FedEx Express', code: 'FX' },
  '580': { name: 'DHL Aviation', code: 'LD' },
  '172': { name: 'UPS Airlines', code: '5X' },
  '217': { name: 'Thai Airways', code: 'TG' },
  '131': { name: 'Japan Airlines', code: 'JL' },
  '180': { name: 'Korean Air', code: 'KE' },
  '999': { name: 'Cargolux', code: 'CV' },
  '205': { name: 'Saudia', code: 'SV' },
  '023': { name: 'Qantas', code: 'QF' },
  '015': { name: 'Aeroflot', code: 'SU' },
};

// ─── Special Handling Codes (SHC) ───────────────────

export const SPECIAL_HANDLING_CODES = {
  // Dangerous Goods
  DGR: 'Dangerous Goods (general)',
  RCM: 'Radioactive: Category I - White',
  RRW: 'Radioactive: Category II - Yellow',
  RRY: 'Radioactive: Category III - Yellow',
  ICE: 'Dry Ice (CO2)',
  MAG: 'Magnetized Material',
  ELI: 'Lithium Ion Batteries',
  ELM: 'Lithium Metal Batteries',
  RBI: 'Lithium Ion Batteries in/with Equipment',
  RBM: 'Lithium Metal Batteries in/with Equipment',

  // Live Animals
  AVI: 'Live Animals',
  LHO: 'Hatching Eggs',

  // Perishables
  PER: 'Perishable Cargo',
  PEP: 'Fruits & Vegetables',
  PEM: 'Meat',
  PEF: 'Fish/Seafood',
  PES: 'Perishable (Special)',
  PIL: 'Pharmaceuticals',

  // Valuable
  VAL: 'Valuable Cargo',
  VUN: 'Vulnerable Cargo',

  // Temperature
  COL: 'Cool Goods (2–8°C)',
  FRO: 'Frozen Goods',
  CRT: 'Controlled Room Temperature',

  // Special
  HEA: 'Heavy Cargo',
  BIG: 'Oversized Cargo',
  GOH: 'Garments on Hangers',
  HUM: 'Human Remains',
  DIP: 'Diplomatic Cargo',
  ATT: 'Attendant Accompanying Shipment',
  ATA: 'Live Animal with Attendant',
  EAT: 'Foodstuff',
  OBX: 'Obnoxious Cargo',
  WET: 'Wet Cargo',
  NSC: 'Not Secured',
  SPX: 'Screened as per SPX',
  SHR: 'Screened with Equipment',
};

// ─── Rate Classes ───────────────────────────────────

export const RATE_CLASSES = {
  M: 'Minimum',
  N: 'Normal (under 45 kg)',
  Q: 'Quantity (over 45 kg)',
  C: 'Specific Commodity',
  R: 'Class Rate (reduction)',
  S: 'Class Rate (surcharge)',
  U: 'Unit Load Device',
  B: 'Basic Charge',
  K: 'Rate per kg',
  E: 'Express',
};

// ─── Payment Terms ──────────────────────────────────

export const PAYMENT_TERMS = ['PREPAID', 'COLLECT'];

// ─── Weight Units ───────────────────────────────────

export const WEIGHT_UNITS = ['KG', 'LB'];

// ─── Dimension Units ────────────────────────────────

export const DIMENSION_UNITS = ['CM', 'IN'];

// ─── Currencies ─────────────────────────────────────

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AED', 'INR', 'SGD', 'HKD', 'JPY', 'CNY', 'AUD',
  'CAD', 'CHF', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'THB', 'MYR', 'KRW',
  'ZAR', 'BRL', 'MXN', 'TRY', 'SEK', 'NOK', 'DKK', 'NZD', 'EGP', 'KES',
];

// ─── Document Type Metadata ─────────────────────────

export const DOCUMENT_TYPES = {
  // Air Freight
  MAWB: { name: 'Air Waybill', description: 'Master or direct air waybill', category: 'AIR_FREIGHT', icon: 'plane' },
  HAWB: { name: 'House Air Waybill', description: 'House air waybill', category: 'AIR_FREIGHT', icon: 'file-text' },
  MANIFEST: { name: 'Manifest', description: 'Cargo manifest', category: 'AIR_FREIGHT', icon: 'list' },
  DGD: { name: 'Dangerous Goods Declaration', description: 'IATA dangerous goods declaration', category: 'AIR_FREIGHT', icon: 'alert-triangle' },
  LABEL: { name: 'Label', description: "IATA's barcoded cargo label", category: 'AIR_FREIGHT', icon: 'tag' },
  CARGO_POUCH_LABEL: { name: 'Cargo Pouch Label', description: 'Cargo pouch label', category: 'AIR_FREIGHT', icon: 'tag' },
  CSD: { name: 'Consignment Security Declaration', description: 'Consignment security declaration', category: 'AIR_FREIGHT', icon: 'shield' },

  // eAWB / Cargo-IMP
  FWB: { name: 'FWB - Air Waybill (eAWB)', description: 'Master or direct electronic air waybill', category: 'EDI', icon: 'zap' },
  FHL: { name: 'FHL - House Air Waybill', description: 'Electronic house air waybill consignment details', category: 'EDI', icon: 'zap' },
  XFWB: { name: 'XFWB - Master Air Waybill (eAWB)', description: 'Master or direct electronic air waybill (XML)', category: 'EDI', icon: 'code' },
  XFZB: { name: 'XFZB - House Air Waybill', description: 'House electronic air waybill (XML)', category: 'EDI', icon: 'code' },
  FFR: { name: 'FFR - Booking', description: 'AWB space allocation request', category: 'EDI', icon: 'calendar' },
  HAWB_FHL: { name: 'House AWB + FHL Hybrid', description: 'FHL with paper house AWB additional fields', category: 'EDI', icon: 'layers' },

  // Sea Freight
  BILL_OF_LADING: { name: 'Bill of Lading', description: 'B/L, house B/L, sea waybill and ocean B/L', category: 'SEA_FREIGHT', icon: 'anchor' },
  BOL_MANIFEST: { name: 'B/L Manifest', description: 'Bill of Lading manifest', category: 'SEA_FREIGHT', icon: 'list' },
  IMO_DGD: { name: 'IMO Dangerous Goods Declaration', description: 'IMO dangerous goods declaration for sea freight', category: 'SEA_FREIGHT', icon: 'alert-triangle' },
  SOLAS_VGM: { name: 'SOLAS VGM', description: 'Verified Gross Mass declaration', category: 'SEA_FREIGHT', icon: 'scale' },

  // Other
  BOOKING: { name: 'Booking', description: 'Booking request and booking confirmation', category: 'OTHER', icon: 'calendar' },
  PROFORMA_INVOICE: { name: 'Proforma Invoice', description: 'Proforma invoice, invoice and note of credit and debit', category: 'OTHER', icon: 'file-text' },
  WAREHOUSE_RECEIPT: { name: 'Warehouse Receipt', description: 'Warehouse receipt', category: 'OTHER', icon: 'package' },
  DOCK_RECEIPT: { name: 'Dock Receipt', description: 'Dock receipt', category: 'OTHER', icon: 'package' },
  CERTIFICATE_OF_ORIGIN: { name: 'Certificate of Origin', description: 'Certificate of origin, form A and US certificate of origin', category: 'OTHER', icon: 'award' },
  DELIVERY_ORDER: { name: 'Delivery Order', description: 'Delivery order', category: 'OTHER', icon: 'truck' },
  DELIVERY_NOTE: { name: 'Delivery/Collection Note', description: 'Delivery and collection note', category: 'OTHER', icon: 'clipboard' },
  FCR: { name: 'FCR', description: 'Forwarders Certificate of Receipt', category: 'OTHER', icon: 'check-circle' },
  CMR: { name: 'CMR Consignment Note', description: 'Road freight consignment note', category: 'OTHER', icon: 'truck' },
  ARRIVAL_NOTICE: { name: 'Arrival Notice', description: 'Arrival notice for sea shipments', category: 'OTHER', icon: 'bell' },
  SECURITY_DECLARATION: { name: 'Security Declaration', description: 'Security declaration', category: 'OTHER', icon: 'shield' },
  LETTER: { name: 'Letters', description: 'Miscellaneous letters', category: 'OTHER', icon: 'mail' },
};

// ─── Document Categories ────────────────────────────

export const DOCUMENT_CATEGORIES = {
  AIR_FREIGHT: { name: 'Air Freight', icon: 'plane', order: 1 },
  EDI: { name: 'eAWB / Cargo-IMP', icon: 'zap', order: 2 },
  SEA_FREIGHT: { name: 'Sea Freight', icon: 'anchor', order: 3 },
  OTHER: { name: 'Other', icon: 'folder', order: 4 },
};

// ─── AWB Status Transitions ─────────────────────────

export const STATUS_TRANSITIONS = {
  DRAFT: ['VALIDATED', 'CANCELLED'],
  VALIDATED: ['ISSUED', 'DRAFT', 'CANCELLED'],
  ISSUED: ['BOOKED', 'CANCELLED'],
  BOOKED: ['DEPARTED', 'CANCELLED'],
  DEPARTED: ['IN_TRANSIT', 'ARRIVED'],
  IN_TRANSIT: ['ARRIVED'],
  ARRIVED: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
};

// ─── IMO Hazard Classes ─────────────────────────────

export const IMO_HAZARD_CLASSES = {
  '1': 'Explosives',
  '1.1': 'Mass Explosion Hazard',
  '1.2': 'Projection Hazard',
  '1.3': 'Fire/Minor Blast/Projection Hazard',
  '1.4': 'Minor Explosion Hazard',
  '1.5': 'Very Insensitive Explosives',
  '1.6': 'Extremely Insensitive Explosives',
  '2.1': 'Flammable Gases',
  '2.2': 'Non-Flammable, Non-Toxic Gases',
  '2.3': 'Toxic Gases',
  '3': 'Flammable Liquids',
  '4.1': 'Flammable Solids',
  '4.2': 'Spontaneously Combustible',
  '4.3': 'Dangerous When Wet',
  '5.1': 'Oxidizing Substances',
  '5.2': 'Organic Peroxides',
  '6.1': 'Toxic Substances',
  '6.2': 'Infectious Substances',
  '7': 'Radioactive Material',
  '8': 'Corrosive Substances',
  '9': 'Miscellaneous Dangerous Goods',
};

// ─── Common Incoterms ───────────────────────────────

export const INCOTERMS = [
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
  'FAS', 'FOB', 'CFR', 'CIF',
];
