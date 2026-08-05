import PDFDocument from 'pdfkit';

/**
 * Shippers Declaration for Dangerous Goods (DGD) PDF Generator
 */
export function generateExactIataDGDPDF(document) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const data = document.data || {};
      const x = 30;
      const y = 25;
      const w = 535;

      doc.strokeColor('#000000').lineWidth(0.5);

      // --- TITLE HEADER ---
      doc.fontSize(11).font('Helvetica-Bold').text("SHIPPER'S DECLARATION FOR DANGEROUS GOODS", x, y);

      // Outer Box
      doc.rect(x, y + 16, w, 755).stroke();
      let currY = y + 16;

      // --- ROW 1: Shipper / Air Waybill No ---
      doc.moveTo(310, currY).lineTo(310, currY + 90).stroke();
      doc.moveTo(x, currY + 90).lineTo(x + w, currY + 90).stroke();

      doc.fontSize(6).font('Helvetica-Bold').text('Shipper', x + 4, currY + 4);
      const shpText = data.shipperName
        ? `${data.shipperName}\n${data.shipperAddress || ''}`
        : 'AADISH IMPEX PVT LTD.\nGNP SOLITAIRE INDUSTRIAL ESTATE,UNIT NO : 12\nFIRST FLOOR MIDC,DOMBIVLI - 421203,\nMAHARASHTRA INDIA';
      doc.font('Helvetica-Bold').fontSize(8).text(shpText, x + 4, currY + 14, { width: 295, height: 72 });

      // Right Box inside Row 1
      doc.fontSize(7).font('Helvetica').text('Air Waybill No :', 314, currY + 4);
      doc.fontSize(9).font('Helvetica-Bold').text(data.awbNumber || document.documentNumber || '176-6507 5415', 380, currY + 4);

      doc.fontSize(7).font('Helvetica').text('Page', 314, currY + 26);
      doc.fontSize(9).font('Helvetica-Bold').text('1', 355, currY + 26);
      doc.fontSize(7).font('Helvetica').text('OF', 385, currY + 26);
      doc.fontSize(9).font('Helvetica-Bold').text('1', 425, currY + 26);
      doc.fontSize(7).font('Helvetica').text('Pages', 450, currY + 26);

      doc.fontSize(7).font('Helvetica').text('Shipper\'s Reference Number :', 314, currY + 46);
      doc.fontSize(7).font('Helvetica').text('( option )', 350, currY + 58);

      // --- ROW 2: Consignee / Carrier Title ---
      currY += 90;
      doc.moveTo(310, currY).lineTo(310, currY + 90).stroke();
      doc.moveTo(x, currY + 90).lineTo(x + w, currY + 90).stroke();

      doc.fontSize(6).font('Helvetica-Bold').text('Consignee', x + 4, currY + 4);
      const cngText = data.consigneeName
        ? `${data.consigneeName}\n${data.consigneeAddress || ''}`
        : 'PROXA PAARL\nNO 1 ZANDWYK PARK OLD PAARL ROAD, SOUTH AFRICA.';
      doc.font('Helvetica-Bold').fontSize(8).text(cngText, x + 4, currY + 14, { width: 295, height: 62 });

      doc.fontSize(16).font('Helvetica-Bold').text(data.carrierName || 'EMIRATES', 314, currY + 32, { align: 'center', width: 220 });
      doc.fontSize(5.5).font('Helvetica').text('Two completed and signed copies of this Declaration must be handed to the operator', x + 4, currY + 80);

      // --- ROW 3: TRANSPORT DETAILS / WARNING ---
      currY += 90;
      doc.moveTo(180, currY).lineTo(180, currY + 80).stroke();
      doc.moveTo(310, currY).lineTo(310, currY + 80).stroke();
      doc.moveTo(x, currY + 80).lineTo(x + w, currY + 80).stroke();

      doc.fontSize(7).font('Helvetica-Bold').text('TRANSPORT DETAILS', x + 4, currY + 4);
      doc.fontSize(5).font('Helvetica').text('This shipment is with the limitations prescribed for (delete\nnon-applicable)', x + 4, currY + 16);

      const isPax = data.aircraftType === 'PAX';
      doc.rect(x + 4, currY + 32, 70, 42).stroke();
      doc.fontSize(6.5).font('Helvetica-Bold').text('PASSENGER\nAND CARGO\nAIRCRAFT', x + 6, currY + 34, { strike: !isPax });

      doc.rect(x + 76, currY + 32, 70, 42).stroke();
      doc.fontSize(6.5).font('Helvetica-Bold').text('CARGO\nAIRCRAFT\nONLY', x + 78, currY + 34, { strike: isPax });

      doc.fontSize(7).font('Helvetica-Bold').text('Airport of Departure', 184, currY + 24, { align: 'center', width: 120 });
      doc.font('Helvetica-Bold').fontSize(9).text(data.originAirport || 'MUMBAI', 184, currY + 42, { align: 'center', width: 120 });

      doc.fontSize(7).font('Helvetica-Bold').text('Airport of Destination :', x + 4, currY + 82);
      doc.font('Helvetica-Bold').fontSize(9).text(data.destinationAirport || 'CAPE TOWN', x + 120, currY + 82);

      // WARNING Box
      doc.fontSize(7.5).font('Helvetica-Bold').text('WARNING', 314, currY + 4);
      doc.fontSize(6.5).font('Helvetica').lineGap(0.8).text(
        'Failure to comply in all respects with the applicable Dangerous Goods Regulations may be in breach of applicable law, subject to legal penalties',
        314, currY + 16, { width: 215, align: 'justify' }
      );

      doc.moveTo(310, currY + 54).lineTo(x + w, currY + 54).stroke();
      doc.fontSize(5.5).font('Helvetica').text('Shipment type: (delete non-applicable)', 314, currY + 56, { align: 'center', width: 225 });

      doc.moveTo(310, currY + 66).lineTo(x + w, currY + 66).stroke();
      doc.moveTo(422, currY + 66).lineTo(422, currY + 80).stroke();

      doc.fontSize(7.5).font('Helvetica-Bold').text('NON-RADIOACTIVE', 314, currY + 69, { align: 'center', width: 108 });
      doc.fontSize(7.5).font('Helvetica-Bold').text('RADIOACTIVE', 424, currY + 69, { align: 'center', width: 110, strike: true });

      // --- ROW 4: NATURE AND QUANTITY OF DANGEROUS GOODS TABLE ---
      currY += 80;
      doc.moveTo(x, currY + 16).lineTo(x + w, currY + 16).stroke();
      doc.fontSize(7.5).font('Helvetica-Bold').text('NATURE AND QUANTITY OF DANGEROUS GOODS', x, currY + 4, { align: 'center', width: w });

      currY += 16;
      doc.moveTo(x, currY + 14).lineTo(x + w, currY + 14).stroke();
      doc.fontSize(6.5).font('Helvetica-Bold').text('Dangerous Goods Identification', x + 4, currY + 3, { align: 'center', width: 240 });

      currY += 14;
      doc.moveTo(x, currY + 30).lineTo(x + w, currY + 30).stroke();

      const dCols = [30, 70, 240, 280, 310, 420, 460, 565];
      for (let i = 1; i < dCols.length - 1; i++) {
        doc.moveTo(dCols[i], currY).lineTo(dCols[i], currY + 275).stroke();
      }

      doc.fontSize(5.5).font('Helvetica-Bold');
      doc.text('UN\nor\nID No.', 32, currY + 3, { align: 'center', width: 36 });
      doc.text('Proper Shipping Name', 74, currY + 10, { align: 'center', width: 162 });
      doc.text('Class or Division\n(Subsidiary\nHazard)', 242, currY + 3, { align: 'center', width: 36 });
      doc.text('Packing\nGroup', 282, currY + 6, { align: 'center', width: 26 });
      doc.text('Quantity and\nType of Packing', 312, currY + 6, { align: 'center', width: 106 });
      doc.text('Packing\nInst.', 422, currY + 6, { align: 'center', width: 36 });
      doc.text('Authorization', 462, currY + 10, { align: 'center', width: 100 });

      currY += 30;
      doc.font('Helvetica-Bold').fontSize(8);
      doc.text(data.unNumber || 'UN\n1549', 32, currY + 8, { align: 'center', width: 36 });

      const shippingName = data.properShippingName || 'Antimony compound, inorganic,\nsolid, n.o.s. (potassium\nhexahydroxoantimonate(V))';
      doc.text(shippingName, 74, currY + 8, { width: 162, height: 230 });

      doc.text(data.hazardClass || '6.1', 242, currY + 8, { align: 'center', width: 36 });
      doc.text(data.packingGroup || 'III', 282, currY + 8, { align: 'center', width: 26 });

      const qtyText = data.quantity || '01 Fibreboard Box\nx 0.1 kg';
      doc.text(qtyText, 312, currY + 8, { align: 'center', width: 106 });

      doc.text(data.packingInstructions || '670', 422, currY + 8, { align: 'center', width: 36 });
      doc.text(data.authorization || '', 462, currY + 8, { width: 100 });

      // --- ROW 5: Additional Handling Information ---
      currY += 245;
      doc.moveTo(x, currY).lineTo(x + w, currY).stroke();
      doc.moveTo(x, currY + 30).lineTo(x + w, currY + 30).stroke();

      doc.fontSize(6.5).font('Helvetica-Bold').text('Additional Handling Information', x + 4, currY + 3);
      const addInfo = data.additionalInfo || 'KIND ATTN : MR. RISHIKESH GAWDE- 24-HOURS EMERGENCY CONTACT TELEPHONE NUMBER: +91-9702163546';
      doc.font('Helvetica-Bold').fontSize(7.5).text(addInfo, x + 4, currY + 14, { width: 525, height: 14 });

      // --- ROW 6: Signatory Section ---
      currY += 30;
      doc.moveTo(310, currY).lineTo(310, y + 771).stroke();

      doc.fontSize(5.2).font('Helvetica').lineGap(0.8).text(
        'I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packaged, marked and labelled/placarded, and are in all respects in proper condition for transport according to applicable international and national governmental regulations. I declare that all of the applicable air transport requirments have been met.',
        x + 4, currY + 5, { width: 270, height: 60, align: 'justify' }
      );

      doc.fontSize(6.5).font('Helvetica-Bold').text('Name/Title of Signatory', 315, currY + 5);
      doc.font('Helvetica-Bold').fontSize(7.5).text(data.signatoryName || 'MR. SUGEN (DGR EXECUTIVE)', 340, currY + 16, { width: 220 });

      doc.fontSize(6.5).font('Helvetica-Bold').text('Place and Date', 315, currY + 32);
      doc.font('Helvetica-Bold').fontSize(7.5).text(data.signatoryPlaceDate || 'MUMBAI /31.07.2026', 340, currY + 44, { width: 220 });

      doc.fontSize(6.5).font('Helvetica-Bold').text('Signature\n(See warning above)', 315, currY + 58);

      doc.fontSize(5.5).font('Helvetica').text('AWBEDITOR.COM', x + 3, y + 760);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
