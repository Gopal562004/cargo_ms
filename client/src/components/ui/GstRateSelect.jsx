import React from 'react';

export const STANDARD_GST_RATES = [0, 0.1, 0.25, 1.5, 3, 5, 6, 7.5, 12, 18, 28, 40];

/**
 * Reusable GST Rate Dropdown with rich standard Indian GST rates and
 * 1-click support for entering any custom GST percentage.
 */
export default function GstRateSelect({
  value,
  onChange,
  className = '',
  compact = false,
  showHalfRateOnly = false, // for Visual Sheet CGST/SGST individual columns
}) {
  const currentVal = value !== undefined && value !== null && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
  const isCustom = !STANDARD_GST_RATES.includes(currentVal);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM_PROMPT') {
      const input = prompt('Enter custom GST rate percentage (%):', currentVal || '5');
      if (input !== null && input.trim() !== '') {
        const num = parseFloat(input);
        if (!isNaN(num) && num >= 0) {
          onChange(num);
        }
      }
    } else {
      onChange(parseFloat(val) || 0);
    }
  };

  if (showHalfRateOnly) {
    // Used inside Visual Sheet CGST / SGST individual rate columns (e.g. 2.5%, 9%)
    const halfRate = currentVal / 2;
    return (
      <select
        value={currentVal}
        onChange={handleSelectChange}
        className={className}
        title={`Full GST: ${currentVal}% (CGST ${halfRate}% + SGST ${halfRate}%)`}
      >
        <option value="0">0 %</option>
        <option value="0.1">0.05 %</option>
        <option value="0.25">0.125 %</option>
        <option value="1.5">0.75 %</option>
        <option value="3">1.5 %</option>
        <option value="5">2.5 %</option>
        <option value="6">3.0 %</option>
        <option value="7.5">3.75 %</option>
        <option value="12">6.0 %</option>
        <option value="18">9.0 %</option>
        <option value="28">14.0 %</option>
        <option value="40">20.0 %</option>
        {isCustom && <option value={currentVal}>{halfRate.toFixed(2)} %</option>}
        <option value="CUSTOM_PROMPT">+ Custom %</option>
      </select>
    );
  }

  return (
    <select
      value={currentVal}
      onChange={handleSelectChange}
      className={className}
    >
      <option value="0">{compact ? '0%' : '0% (Nil / Exempt)'}</option>
      <option value="0.1">{compact ? '0.1%' : '0.1% (Export / Special)'}</option>
      <option value="0.25">{compact ? '0.25%' : '0.25% (Precious Items)'}</option>
      <option value="1.5">{compact ? '1.5%' : '1.5% (Special Supply)'}</option>
      <option value="3">{compact ? '3%' : '3% (Gold / Bullion)'}</option>
      <option value="5">{compact ? '5% (2.5+2.5)' : '5% (2.5% CGST + 2.5% SGST)'}</option>
      <option value="6">{compact ? '6% (3+3)' : '6% (3% CGST + 3% SGST)'}</option>
      <option value="7.5">{compact ? '7.5%' : '7.5% (Hospitality/Services)'}</option>
      <option value="12">{compact ? '12% (6+6)' : '12% (6% CGST + 6% SGST)'}</option>
      <option value="18">{compact ? '18% (9+9)' : '18% (9% CGST + 9% SGST)'}</option>
      <option value="28">{compact ? '28% (14+14)' : '28% (14% CGST + 14% SGST)'}</option>
      <option value="40">{compact ? '40% (20+20)' : '40% (20% CGST + 20% SGST)'}</option>
      {isCustom && (
        <option value={currentVal}>
          {compact ? `${currentVal}% (Custom)` : `${currentVal}% (Custom: ${(currentVal / 2).toFixed(2)}% + ${(currentVal / 2).toFixed(2)}%)`}
        </option>
      )}
      <option value="CUSTOM_PROMPT">+ Add Custom GST %...</option>
    </select>
  );
}
