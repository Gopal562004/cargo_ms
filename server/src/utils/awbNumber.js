/**
 * AWB Number generator and validator.
 * 
 * AWB Number format: PPP-SSSSSSSC
 * - PPP: 3-digit airline prefix
 * - SSSSSSS: 7-digit serial number
 * - C: 1-digit check digit (Modulus 7)
 * 
 * Full number: PPP-SSSSSSSC (e.g., 176-12345675)
 */

/**
 * Calculate the Modulus 7 check digit for a 7-digit serial number.
 * @param {string} serial - 7-digit serial number
 * @returns {number} Check digit (0-6)
 */
export function calculateCheckDigit(serial) {
  const num = parseInt(serial, 10);
  return num % 7;
}

/**
 * Validate an AWB number format and check digit.
 * @param {string} awbNumber - Full AWB number (e.g., "176-12345675")
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAWBNumber(awbNumber) {
  // Accept formats: "176-12345675" or "17612345675"
  const cleaned = awbNumber.replace(/-/g, '');

  if (!/^\d{11}$/.test(cleaned)) {
    return { valid: false, error: 'AWB number must be 11 digits (3 prefix + 8 serial with check digit)' };
  }

  const prefix = cleaned.substring(0, 3);
  const serial = cleaned.substring(3, 10);
  const checkDigit = parseInt(cleaned.substring(10, 11), 10);

  const expectedCheckDigit = calculateCheckDigit(serial);

  if (checkDigit !== expectedCheckDigit) {
    return { valid: false, error: `Invalid check digit. Expected ${expectedCheckDigit}, got ${checkDigit}` };
  }

  return { valid: true, prefix, serial, checkDigit };
}

/**
 * Generate a random AWB number for a given airline prefix.
 * @param {string} prefix - 3-digit airline prefix (e.g., "176")
 * @returns {string} Formatted AWB number (e.g., "176-12345675")
 */
export function generateAWBNumber(prefix = '000') {
  // Generate a random 7-digit serial number
  const serial = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  const checkDigit = calculateCheckDigit(serial);

  return `${prefix}-${serial}${checkDigit}`;
}

/**
 * Format an AWB number with the standard dash separator.
 * @param {string} awbNumber - AWB number with or without dash
 * @returns {string} Formatted AWB number (e.g., "176-12345675")
 */
export function formatAWBNumber(awbNumber) {
  const cleaned = awbNumber.replace(/[^0-9]/g, '');
  if (cleaned.length !== 11) return awbNumber;
  return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
}

/**
 * Generate a House AWB number.
 * Format is more flexible — typically: agent code + sequential number.
 * @param {string} agentCode - Agent/forwarder code
 * @param {number} sequence - Sequential number
 * @returns {string} HAWB number
 */
export function generateHAWBNumber(agentCode = 'HWB', sequence = null) {
  const seq = sequence || Math.floor(Math.random() * 1000000);
  return `${agentCode}${String(seq).padStart(7, '0')}`;
}

/**
 * Generate a Bill of Lading number.
 * @param {string} carrierCode - Carrier SCAC code
 * @returns {string} B/L number
 */
export function generateBOLNumber(carrierCode = 'BOL') {
  const seq = Math.floor(Math.random() * 10000000);
  return `${carrierCode}${String(seq).padStart(8, '0')}`;
}

/**
 * Generate a generic document number with prefix.
 * @param {string} prefix - Document type prefix
 * @returns {string} Document number
 */
export function generateDocumentNumber(prefix = 'DOC') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
}
