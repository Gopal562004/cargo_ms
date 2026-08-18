export const AIRPORTS_OPTIONS = [
  'BOM', 'DEL', 'MAA', 'BLR', 'HYD', 'CCU', 'DXB', 'AUH', 'DOH', 'SIN',
  'HKG', 'PVG', 'NRT', 'ICN', 'BKK', 'KUL', 'LHR', 'CDG', 'FRA', 'AMS',
  'MUC', 'FCO', 'MAD', 'IST', 'ZRH', 'JFK', 'LAX', 'ORD', 'MIA', 'ATL',
  'SFO', 'YYZ', 'GRU', 'SYD', 'NBO', 'JNB', 'CAI', 'JED', 'RUH',
].map((code) => ({ value: code, label: code }));

export const COUNTRIES = [
  'IN', 'AE', 'US', 'GB', 'DE', 'FR', 'CN', 'JP', 'SG', 'HK', 'AU',
  'CA', 'BR', 'SA', 'QA', 'KR', 'TH', 'MY', 'IT', 'ES', 'TR', 'NL',
  'CH', 'ZA', 'KE', 'EG', 'NG', 'MX', 'AT', 'BE', 'DK', 'NZ', 'BH', 'OM', 'KW',
].map((c) => ({ value: c, label: c }));

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'SGD', 'HKD', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'SAR', 'QAR']
  .map((c) => ({ value: c, label: c }));

export const WEIGHT_UNITS = [{ value: 'KG', label: 'KG' }, { value: 'LB', label: 'LB' }];
export const PAYMENT_TERMS = [{ value: 'PREPAID', label: 'Prepaid' }, { value: 'COLLECT', label: 'Collect' }];

export const GST_RATE_OPTIONS = [
  { value: 0, label: '0% (Nil / Exempt)', cgst: 0, sgst: 0 },
  { value: 0.1, label: '0.1% (Export / Special)', cgst: 0.05, sgst: 0.05 },
  { value: 0.25, label: '0.25% (Precious Items)', cgst: 0.125, sgst: 0.125 },
  { value: 1.5, label: '1.5% (Special Supply)', cgst: 0.75, sgst: 0.75 },
  { value: 3, label: '3% (Gold / Bullion)', cgst: 1.5, sgst: 1.5 },
  { value: 5, label: '5% (2.5% + 2.5%)', cgst: 2.5, sgst: 2.5 },
  { value: 6, label: '6% (3% + 3%)', cgst: 3, sgst: 3 },
  { value: 7.5, label: '7.5% (Services)', cgst: 3.75, sgst: 3.75 },
  { value: 12, label: '12% (6% + 6%)', cgst: 6, sgst: 6 },
  { value: 18, label: '18% (9% + 9%)', cgst: 9, sgst: 9 },
  { value: 28, label: '28% (14% + 14%)', cgst: 14, sgst: 14 },
  { value: 40, label: '40% (20% + 20%)', cgst: 20, sgst: 20 },
];

