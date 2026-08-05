import { generateExactFedExIataAWBPDF } from './air_freight/mawb.pdf.js';
import { generateExactIataDGDPDF } from './air_freight/dgd.pdf.js';
import { generateBOLPDF } from './sea_freight/billOfLading.pdf.js';
import { generateGenericPDF } from './commercial/generic.pdf.js';

/**
 * Main PDF Generator Dispatcher across categorized document modules
 */
export async function generateDocumentPDF(document) {
  switch (document.documentType) {
    case 'MAWB':
    case 'FWB':
    case 'XFWB':
    case 'HAWB':
    case 'FHL':
    case 'XFZB':
    case 'HAWB_FHL':
      return generateExactFedExIataAWBPDF(document);
    case 'DGD':
    case 'IMO_DGD':
      return generateExactIataDGDPDF(document);
    case 'BILL_OF_LADING':
      return generateBOLPDF(document);
    default:
      return generateGenericPDF(document);
  }
}

export {
  generateExactFedExIataAWBPDF,
  generateExactIataDGDPDF,
  generateBOLPDF,
  generateGenericPDF,
};
