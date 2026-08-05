import PDFDocument from 'pdfkit';
import { drawExactFedExAwbFace, drawExactAwbReverse } from '../common/awbDrawHelpers.js';

/**
 * Air Waybill (MAWB / HAWB / eAWB) PDF Generator
 */
export function generateExactFedExIataAWBPDF(document) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const data = document.data || {};
      const pkgs = document.packages || [];

      // 8-Copy Multi-Page Set matching exact reference
      const copies = [
        { label: 'Original 1 (for Issuing Carrier)', color: '#000000', hasReverse: true },
        { label: 'Original 2 (for Consignee)', color: '#d63031', hasReverse: true },
        { label: 'Original 3 (for Shipper)', color: '#d63031', hasReverse: true },
        { label: 'Copy 4 (Delivery Receipt)', color: '#000000', hasReverse: false, deliveryBox: true },
        { label: 'Copy 5 (Extra Copy)', color: '#d63031', hasReverse: false },
        { label: 'Copy 6 (Extra Copy)', color: '#000000', hasReverse: false },
        { label: 'Copy 7 (Extra Copy)', color: '#d63031', hasReverse: false },
        { label: 'Copy 8 (for Agent)', color: '#000000', hasReverse: false },
      ];

      for (let i = 0; i < copies.length; i++) {
        if (i > 0) doc.addPage();
        const copy = copies[i];
        await drawExactFedExAwbFace(doc, document, data, pkgs, copy.label, copy.color, copy.deliveryBox);
        if (copy.hasReverse) {
          doc.addPage();
          drawExactAwbReverse(doc);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
