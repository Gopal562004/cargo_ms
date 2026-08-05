import PDFDocument from 'pdfkit';

/**
 * Ocean Bill of Lading PDF Generator
 */
export function generateBOLPDF(document) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const data = document.data || {};

      doc.rect(40, 40, 515, 35).fill('#0d3b66');
      doc.fillColor('#ffffff').fontSize(16).text('BILL OF LADING', 50, 48, { width: 495, align: 'center' });
      doc.fillColor('#000000');

      let currY = 90;
      doc.fontSize(11).text(`B/L Number: ${document.documentNumber || 'N/A'}`, 40, currY);
      currY += 30;

      doc.rect(40, currY, 250, 20).fill('#f0f0f5');
      doc.fillColor('#0d3b66').fontSize(10).text('SHIPPER / EXPORTER', 50, currY + 5);
      doc.fillColor('#000000').fontSize(9);
      currY += 25;
      doc.text(data.shipperName || '', 50, currY);
      doc.text(data.shipperAddress || '', 50, currY + 12);
      doc.text(`${data.shipperCity || ''}, ${data.shipperCountry || ''}`, 50, currY + 24);

      const rightX = 310;
      doc.rect(rightX, currY - 25, 245, 20).fill('#f0f0f5');
      doc.fillColor('#0d3b66').fontSize(10).text('CONSIGNEE', rightX + 10, currY - 20);
      doc.fillColor('#000000').fontSize(9);
      doc.text(data.consigneeName || '', rightX + 10, currY);
      doc.text(data.consigneeAddress || '', rightX + 10, currY + 12);
      doc.text(`${data.consigneeCountry || ''}`, rightX + 10, currY + 24);

      currY += 55;

      doc.rect(40, currY, 515, 20).fill('#f0f0f5');
      doc.fillColor('#0d3b66').fontSize(10).text('VOYAGE DETAILS', 50, currY + 5);
      doc.fillColor('#000000').fontSize(9);
      currY += 25;
      doc.text(`Vessel: ${data.vesselName || ''}`, 50, currY);
      doc.text(`Voyage No: ${data.voyageNumber || ''}`, 250, currY);
      currY += 14;
      doc.text(`Port of Loading: ${data.portOfLoading || ''}`, 50, currY);
      doc.text(`Port of Discharge: ${data.portOfDischarge || ''}`, 250, currY);

      currY += 30;
      doc.fontSize(7).fillColor('#888888');
      doc.text(`Generated on ${new Date().toISOString()}`, 40, 780, { width: 515, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
