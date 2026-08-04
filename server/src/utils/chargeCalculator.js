/**
 * Freight charge calculator for air cargo.
 */

/** Volumetric weight divisor for air cargo (IATA standard) */
const VOLUMETRIC_DIVISOR_AIR = 6000; // 1 cbm = 166.67 kg

/** Volumetric weight divisor for sea cargo */
const VOLUMETRIC_DIVISOR_SEA = 1000; // 1 cbm = 1000 kg

/**
 * Calculate volumetric weight from dimensions.
 * @param {number} length - Length in CM
 * @param {number} width - Width in CM
 * @param {number} height - Height in CM
 * @param {'air' | 'sea'} mode - Transport mode
 * @returns {number} Volumetric weight in KG
 */
export function calculateVolumetricWeight(length, width, height, mode = 'air') {
  const divisor = mode === 'sea' ? VOLUMETRIC_DIVISOR_SEA : VOLUMETRIC_DIVISOR_AIR;
  return (length * width * height) / divisor;
}

/**
 * Calculate chargeable weight (max of gross weight vs volumetric weight).
 * @param {number} grossWeight - Actual gross weight in KG
 * @param {number} volumetricWeight - Volumetric weight in KG
 * @returns {number} Chargeable weight in KG
 */
export function calculateChargeableWeight(grossWeight, volumetricWeight) {
  return Math.max(grossWeight, volumetricWeight);
}

/**
 * Calculate total volumetric weight for a list of packages.
 * @param {Array<{length: number, width: number, height: number}>} packages
 * @param {'air' | 'sea'} mode
 * @returns {number} Total volumetric weight in KG
 */
export function calculateTotalVolumetricWeight(packages, mode = 'air') {
  return packages.reduce((total, pkg) => {
    if (pkg.length && pkg.width && pkg.height) {
      return total + calculateVolumetricWeight(pkg.length, pkg.width, pkg.height, mode);
    }
    return total;
  }, 0);
}

/**
 * Calculate freight charge based on rate and chargeable weight.
 * @param {number} chargeableWeight - Chargeable weight in KG
 * @param {number} ratePerKg - Rate per KG in the specified currency
 * @returns {number} Freight charge
 */
export function calculateFreightCharge(chargeableWeight, ratePerKg) {
  return Math.round(chargeableWeight * ratePerKg * 100) / 100;
}

/**
 * Calculate all charges for an AWB.
 * @param {Object} params
 * @param {number} params.grossWeight - Gross weight in KG
 * @param {Array} params.packages - Package details with dimensions
 * @param {number} params.ratePerKg - Rate per KG
 * @param {number} [params.valuationCharge] - Valuation charge
 * @param {number} [params.taxRate] - Tax rate (e.g., 0.18 for 18%)
 * @param {number} [params.otherCharges] - Other charges
 * @param {'air' | 'sea'} [params.mode] - Transport mode
 * @returns {Object} Calculated charges
 */
export function calculateAllCharges({
  grossWeight,
  packages = [],
  ratePerKg = 0,
  valuationCharge = 0,
  taxRate = 0,
  otherCharges = 0,
  mode = 'air',
}) {
  const totalVolumetricWeight = calculateTotalVolumetricWeight(packages, mode);
  const chargeableWeight = calculateChargeableWeight(grossWeight, totalVolumetricWeight);
  const weightCharge = calculateFreightCharge(chargeableWeight, ratePerKg);
  const subtotal = weightCharge + valuationCharge + otherCharges;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalCharge = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    volumetricWeight: Math.round(totalVolumetricWeight * 100) / 100,
    chargeableWeight: Math.round(chargeableWeight * 100) / 100,
    weightCharge,
    valuationCharge,
    otherCharges,
    taxAmount,
    totalCharge,
  };
}

/**
 * Convert weight between KG and LB.
 * @param {number} weight
 * @param {'KG_TO_LB' | 'LB_TO_KG'} direction
 * @returns {number}
 */
export function convertWeight(weight, direction = 'KG_TO_LB') {
  if (direction === 'KG_TO_LB') {
    return Math.round(weight * 2.20462 * 100) / 100;
  }
  return Math.round(weight / 2.20462 * 100) / 100;
}

/**
 * Convert dimensions between CM and IN.
 * @param {number} value
 * @param {'CM_TO_IN' | 'IN_TO_CM'} direction
 * @returns {number}
 */
export function convertDimension(value, direction = 'CM_TO_IN') {
  if (direction === 'CM_TO_IN') {
    return Math.round(value / 2.54 * 100) / 100;
  }
  return Math.round(value * 2.54 * 100) / 100;
}
