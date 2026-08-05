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
