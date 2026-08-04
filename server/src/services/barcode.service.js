import bwipjs from 'bwip-js';
import QRCode from 'qrcode';

/**
 * Generate a Code 128 barcode as PNG buffer.
 * @param {string} text - Text to encode
 * @param {Object} options - Override barcode options
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function generateBarcode(text, options = {}) {
  const buffer = await bwipjs.toBuffer({
    bcid: 'code128',
    text: text,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: 'center',
    textsize: 10,
    ...options,
  });
  return buffer;
}

/**
 * Generate a barcode as base64 data URL.
 * @param {string} text - Text to encode
 * @param {Object} options - Override barcode options
 * @returns {Promise<string>} Base64 data URL
 */
export async function generateBarcodeBase64(text, options = {}) {
  const buffer = await generateBarcode(text, options);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Generate a QR code as PNG buffer.
 * @param {string} text - Text to encode
 * @param {Object} options - QR code options
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function generateQRCode(text, options = {}) {
  const buffer = await QRCode.toBuffer(text, {
    type: 'png',
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    ...options,
  });
  return buffer;
}

/**
 * Generate a QR code as base64 data URL.
 * @param {string} text - Text to encode
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Base64 data URL
 */
export async function generateQRCodeBase64(text, options = {}) {
  const dataUrl = await QRCode.toDataURL(text, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    ...options,
  });
  return dataUrl;
}

/**
 * Generate both barcode and QR code for a document number.
 * @param {string} documentNumber
 * @returns {Promise<{barcode: string, qrCode: string}>} Base64 data URLs
 */
export async function generateCodes(documentNumber) {
  const [barcode, qrCode] = await Promise.all([
    generateBarcodeBase64(documentNumber),
    generateQRCodeBase64(documentNumber),
  ]);
  return { barcode, qrCode };
}
