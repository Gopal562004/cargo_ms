import PDFDocument from 'pdfkit';
import { DOCUMENT_TYPES } from '../../utils/constants.js';

/**
 * Generic PDF Generator for Commercial & Other Document Types
 */
export function generateGenericPDF(document) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const typeMeta = DOCUMENT_TYPES[document.documentType] || {};
      const data = document.data || {};

      doc.rect(40, 40, 515, 35).fill('#2d3436');
      doc.fillColor('#ffffff').fontSize(14).text(
        typeMeta.name || document.documentType,
        50, 48, { width: 495, align: 'center' }
      );
      doc.fillColor('#000000');

      let currY = 90;
      doc.fontSize(11).text(`Document Number: ${document.documentNumber || 'N/A'}`, 40, currY);
      doc.text(`Status: ${document.status}`, 350, currY);
      currY += 25;

      doc.fontSize(9);
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined && value !== '') {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
          doc.font('Helvetica-Bold').text(`${label}: `, 50, currY, { continued: true });
          doc.font('Helvetica').text(String(value));
          currY += 14;
          if (currY > 750) {
            doc.addPage();
            currY = 50;
          }
        }
      }

      doc.fontSize(7).fillColor('#888888');
      doc.text(`Generated on ${new Date().toISOString()}`, 40, 780, { width: 515, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
