import PDFDocument from 'pdfkit';

/**
 * Convert number into Indian Currency Words format
 * e.g., 38704.50 -> "Rupees Thirty Eight Thousand Seven Hundred Four and Fifty Paise Only"
 */
export function numberToIndianWords(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Rupees Zero Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    let str = '';

    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      }
    }
    return str;
  }

  const rounded = Math.round(Number(num) * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let result = 'Rupees ' + (integerPart === 0 ? 'Zero ' : inWords(integerPart));
  if (decimalPart > 0) {
    result += 'and ' + inWords(decimalPart) + 'Paise ';
  }
  result += 'Only';
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Format currency number with commas (Indian / standard)
 */
function formatAmount(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Draw Company Logo (Custom Uploaded Image or High-Precision Vector DGR Emblem)
 */
function drawHeaderLogo(doc, x, y, customLogoBase64) {
  if (customLogoBase64 && typeof customLogoBase64 === 'string') {
    try {
      const match = customLogoBase64.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      const base64Data = match ? match[2] : customLogoBase64;
      const imgBuffer = Buffer.from(base64Data, 'base64');
      doc.image(imgBuffer, x, y, { fit: [55, 55], align: 'center', valign: 'center' });
      return;
    } catch (err) {
      console.error('Error drawing custom logo image:', err);
    }
  }

  // Tilted stylized DGR Oval Badge matching INV DGR- 0466-26-27.pdf
  doc.save();
  doc.ellipse(x + 28, y + 25, 26, 18).lineWidth(1.2).strokeColor('#2c3e50').stroke();
  doc.ellipse(x + 28, y + 25, 23, 15).lineWidth(0.6).strokeColor('#4b6584').stroke();
  doc.font('Helvetica-BoldOblique').fontSize(15).fillColor('#1a252f');
  doc.text('DGR', x + 6, y + 17, { width: 44, align: 'center' });
  doc.restore();
}

/**
 * Exact Tax Invoice / Billing PDF Generator
 * Matches INV DGR- 0466-26-27.pdf & BILLING.xlsx pixel-for-pixel
 */
export function generateTaxInvoicePDF(document) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const d = document.data || {};
      const items = Array.isArray(d.items) && d.items.length > 0 ? d.items : [
        {
          sn: 1,
          description: d.description || 'Logistics & Cargo Services',
          hsnCode: d.hsnCode || '996713',
          qty: d.qty || 1,
          unit: d.unit || 'Pcs',
          price: d.rate || d.price || 0,
          cgstRate: d.cgstRate || 2.5,
          sgstRate: d.sgstRate || 2.5,
          igstRate: d.igstRate || 0,
        }
      ];

      // Check if Inter-State invoice
      const isInterState = d.taxType === 'INTER_STATE' || items.some((it) => (parseFloat(it.igstRate) || 0) > 0);

      // Outer boundary box on A4 (595.28 x 841.89)
      const left = 22;
      const top = 22;
      const right = 573;
      const bottom = 820;
      const width = right - left; // 551

      // Draw Main Outer Frame
      doc.rect(left, top, width, bottom - top).lineWidth(1).strokeColor('#000000').stroke();

      // Top Right Copy indicator
      doc.font('Helvetica-Oblique').fontSize(9).fillColor('#000000');
      doc.text(d.copyType || 'Original Copy', right - 100, top - 13, { width: 95, align: 'right' });

      // ==========================================
      // 1. HEADER
      // ==========================================
      drawHeaderLogo(doc, left + 8, top + 6, d.companyLogo);

      const headerCenter = left + 65;
      const headerWidth = width - 75;

      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#000000');
      doc.text(d.docTitle || 'TAX INVOICE', headerCenter, top + 5, { width: headerWidth, align: 'center' });

      doc.font('Helvetica-Bold').fontSize(14.5);
      doc.text(d.companyName || 'DGR PACKAGING COMPANY', headerCenter, top + 19, { width: headerWidth, align: 'center' });

      doc.font('Helvetica').fontSize(8);
      const companyAddr = `${d.companyAddress || 'SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)'}\n${d.companyCityPin || 'MUMBAI - 400 099'}`;
      doc.text(companyAddr, headerCenter, top + 36, { width: headerWidth, align: 'center', lineGap: 1 });

      const midY = top + 57;
      doc.font('Helvetica-Bold').fontSize(8.5);
      doc.text(`PAN : ${d.companyPan || 'CBKPK7600K'}`, headerCenter, midY, { width: headerWidth, align: 'center' });

      doc.fontSize(9);
      doc.text(`GSTIN : ${d.companyGstin || '27CBKPK7600K1ZE'}`, headerCenter, midY + 11, { width: headerWidth, align: 'center' });

      doc.font('Helvetica').fontSize(8);
      const contactLine = `Tel. : ${d.companyTel || '022 - 26828108'}   email : ${d.companyEmail || 'dgrpackaging@gmail.com'}`;
      doc.text(contactLine, headerCenter, midY + 23, { width: headerWidth, align: 'center' });

      let currY = top + 93;
      doc.moveTo(left, currY).lineTo(right, currY).lineWidth(0.8).strokeColor('#000000').stroke();

      // ==========================================
      // 2. INVOICE DISPATCH METADATA (2-Columns)
      // ==========================================
      const midX = left + width * 0.5; // 22 + 275.5 = 297.5
      const metaHeight = 77;
      const metaBottom = currY + metaHeight;

      // Vertical divider between left and right meta columns
      doc.moveTo(midX, currY).lineTo(midX, metaBottom).lineWidth(0.8).stroke();

      // Left Column Metadata
      const leftColX = left + 6;
      const leftValX = left + 105;
      let leftY = currY + 4;
      const metaLineH = 10.5;

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
      doc.text('Invoice No.', leftColX, leftY);
      doc.font('Helvetica-Bold').text(`: ${d.invoiceNumber || 'DGR/0466/26-27'}`, leftValX, leftY);
      leftY += metaLineH;

      doc.font('Helvetica').fontSize(7.5);
      doc.text('Dated', leftColX, leftY);
      doc.text(`: ${d.invoiceDate || '27-06-2026'}`, leftValX, leftY);
      leftY += metaLineH;

      doc.text('Place of Supply', leftColX, leftY);
      doc.text(`: ${d.placeOfSupply || 'Maharashtra (27)'}`, leftValX, leftY);
      leftY += metaLineH;

      doc.text('Reverse Charge', leftColX, leftY);
      doc.text(`: ${d.reverseCharge || 'N'}`, leftValX, leftY);
      leftY += metaLineH;

      doc.text('Transport', leftColX, leftY);
      doc.text(`: ${d.transport || ''}`, leftValX, leftY);
      leftY += metaLineH;

      doc.text('E-Way Bill No.', leftColX, leftY);
      doc.text(`: ${d.ewayBillNo || ''}`, leftValX, leftY);
      leftY += metaLineH;

      doc.text('AIRWAY BILL NO', leftColX, leftY);
      doc.text(`: ${d.airwayBillNo || ''}`, leftValX, leftY);

      // Right Column Metadata
      const rightColX = midX + 6;
      const rightValX = midX + 115;
      let rightY = currY + 4;

      doc.text('P.O. NO. & DATE', rightColX, rightY);
      doc.text(`: ${d.poNumberAndDate || ''}`, rightValX, rightY);
      rightY += metaLineH;

      doc.text('NO OF PACKAGES', rightColX, rightY);
      doc.text(`: ${d.noOfPackages || ''}`, rightValX, rightY);
      rightY += metaLineH;

      doc.text('GROSS WEIGHT', rightColX, rightY);
      doc.text(`: ${d.grossWeight || ''}`, rightValX, rightY);
      rightY += metaLineH;

      doc.text('TRANSPORT NAME', rightColX, rightY);
      doc.text(`: ${d.transportName || ''}`, rightValX, rightY);
      rightY += metaLineH;

      doc.text('PAID / TO-PAID', rightColX, rightY);
      doc.text(`: ${d.paidToPaid || ''}`, rightValX, rightY);
      rightY += metaLineH;

      doc.text('REFERENCE NAME:', rightColX, rightY);
      doc.text(`: ${d.referenceName || ''}`, rightValX, rightY);
      rightY += metaLineH;

      doc.text('CONTACT NUMBER', rightColX, rightY);
      doc.text(`: ${d.contactNumber || ''}`, rightValX, rightY);

      currY = metaBottom;
      doc.moveTo(left, currY).lineTo(right, currY).lineWidth(0.8).stroke();

      // ==========================================
      // 3. BILLED TO & SHIPPED TO SECTION
      // ==========================================
      const buyerAddr = d.buyerAddress || 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305';
      const shipAddr = d.consigneeAddress || buyerAddr;

      doc.font('Helvetica').fontSize(8);
      const bAddrH = doc.heightOfString(buyerAddr, { width: midX - leftColX - 6, lineGap: 1.2 });
      const sAddrH = doc.heightOfString(shipAddr, { width: right - rightColX - 6, lineGap: 1.2 });
      const maxAddrContentH = Math.max(bAddrH, sAddrH);
      const addrHeight = Math.max(98, maxAddrContentH + 42);
      const addrBottom = currY + addrHeight;

      // Vertical divider
      doc.moveTo(midX, currY).lineTo(midX, addrBottom).lineWidth(0.8).stroke();

      // Billed To (Left)
      let bY = currY + 5;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
      doc.text('Billed to :', leftColX, bY);
      bY += 13;

      doc.font('Helvetica-Bold').fontSize(8.5);
      doc.text(d.buyerName || 'DGR GLOBAL LOGISTICS', leftColX, bY, { width: midX - leftColX - 6 });
      bY += 11;

      doc.font('Helvetica').fontSize(8);
      doc.text(buyerAddr, leftColX, bY, { width: midX - leftColX - 6, lineGap: 1.2 });

      const buyerBtmY = addrBottom - 24;
      doc.font('Helvetica').fontSize(8.5);
      doc.text('State', leftColX, buyerBtmY);
      doc.text(`: ${d.buyerState || 'Maharashtra (27)'}`, leftValX - 15, buyerBtmY);

      doc.text('GSTIN / UIN', leftColX, buyerBtmY + 11);
      doc.font('Helvetica-Bold');
      doc.text(`: ${d.buyerGstin || '27NSAPK0224B1Z7'}`, leftValX - 15, buyerBtmY + 11);

      // Shipped To (Right)
      let sY = currY + 5;
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Shipped to :', rightColX, sY);
      sY += 13;

      doc.font('Helvetica-Bold').fontSize(8.5);
      doc.text(d.consigneeName || d.buyerName || 'DGR GLOBAL LOGISTICS', rightColX, sY, { width: right - rightColX - 6 });
      sY += 11;

      doc.font('Helvetica').fontSize(8);
      doc.text(shipAddr, rightColX, sY, { width: right - rightColX - 6, lineGap: 1.2 });

      const shipBtmY = addrBottom - 24;
      doc.font('Helvetica').fontSize(8.5);
      doc.text('State', rightColX, shipBtmY);
      doc.text(`: ${d.consigneeState || d.buyerState || 'Maharashtra (27)'}`, rightValX - 15, shipBtmY);

      doc.text('GSTIN / UIN', rightColX, shipBtmY + 11);
      doc.font('Helvetica-Bold');
      doc.text(`: ${d.consigneeGstin || d.buyerGstin || '27NSAPK0224B1Z7'}`, rightValX - 15, shipBtmY + 11);

      currY = addrBottom;
      doc.moveTo(left, currY).lineTo(right, currY).lineWidth(0.8).stroke();

      // ==========================================
      // 4. ITEMS TABLE (Auto-adjusting height & row heights)
      // ==========================================
      const colX = isInterState
        ? {
            sn: left,                 // 22
            desc: left + 20,          // 42  (width: 220)
            hsn: left + 242,          // 264 (width: 55)
            qty: left + 297,          // 319 (width: 60)
            price: left + 357,        // 379 (width: 50)
            igstRate: left + 407,     // 429 (width: 40)
            igstAmt: left + 447,      // 469 (width: 50)
            amount: left + 497,       // 519 (width: 54 -> 573)
          }
        : {
            sn: left,                 // 22
            desc: left + 20,          // 42  (width: 170)
            hsn: left + 212,          // 234 (width: 50)
            qty: left + 262,          // 284 (width: 58)
            price: left + 320,        // 342 (width: 44)
            cgstRate: left + 364,     // 386 (width: 32)
            cgstAmt: left + 396,      // 418 (width: 38)
            sgstRate: left + 434,     // 456 (width: 32)
            sgstAmt: left + 466,      // 488 (width: 38)
            amount: left + 504,       // 526 (width: 47 -> 573)
          };

      const tableHeadH = 22;
      const tableHeadBottom = currY + tableHeadH;

      // Table Header row
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#000000');
      doc.text('S.N.', colX.sn, currY + 7, { width: 20, align: 'center' });

      if (isInterState) {
        doc.text('Description of Goods & Service', colX.desc + 4, currY + 7, { width: 215 });
        doc.text('HSN/SAC\nCode', colX.hsn, currY + 3, { width: 55, align: 'center' });
        doc.text('Qty. Unit', colX.qty, currY + 7, { width: 60, align: 'center' });
        doc.text('Price', colX.price, currY + 7, { width: 48, align: 'right' });
        doc.text('IGST\nRate', colX.igstRate, currY + 3, { width: 40, align: 'center' });
        doc.text('IGST\nAmount', colX.igstAmt, currY + 3, { width: 48, align: 'right' });
        doc.text('Amount(Rs.)', colX.amount, currY + 7, { width: 52, align: 'right' });
      } else {
        doc.text('Description of Goods & Service', colX.desc + 4, currY + 7, { width: 165 });
        doc.text('HSN/SAC\nCode', colX.hsn, currY + 3, { width: 50, align: 'center' });
        doc.text('Qty. Unit', colX.qty, currY + 7, { width: 58, align: 'center' });
        doc.text('Price', colX.price, currY + 7, { width: 42, align: 'right' });
        doc.text('CGST\nRate', colX.cgstRate, currY + 3, { width: 32, align: 'center' });
        doc.text('CGST\nAmount', colX.cgstAmt, currY + 3, { width: 36, align: 'right' });
        doc.text('SGST\nRate', colX.sgstRate, currY + 3, { width: 32, align: 'center' });
        doc.text('SGST\nAmount', colX.sgstAmt, currY + 3, { width: 36, align: 'right' });
        doc.text('Amount(Rs.)', colX.amount, currY + 7, { width: 45, align: 'right' });
      }

      // Horizontal line below Header
      doc.moveTo(left, tableHeadBottom).lineTo(right, tableHeadBottom).lineWidth(0.8).stroke();

      // Measure dynamic item heights & totals
      let totalQty = 0;
      let totalTaxable = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;
      let grandTotal = 0;
      const unitsSet = new Set();
      const taxSlabs = {};

      const computedItems = items.map((item, index) => {
        const sn = item.sn || (index + 1);
        const qty = parseFloat(item.qty) || 0;
        const unit = item.unit || 'Pcs';
        unitsSet.add(unit.toLowerCase());
        const price = parseFloat(item.price) || 0;
        const taxable = qty * price;
        const cgstR = parseFloat(item.cgstRate) || 0;
        const sgstR = parseFloat(item.sgstRate) || 0;
        const igstR = parseFloat(item.igstRate) || 0;

        const cgstA = item.cgstAmount !== undefined ? parseFloat(item.cgstAmount) : (taxable * cgstR) / 100;
        const sgstA = item.sgstAmount !== undefined ? parseFloat(item.sgstAmount) : (taxable * sgstR) / 100;
        const igstA = item.igstAmount !== undefined ? parseFloat(item.igstAmount) : (taxable * igstR) / 100;
        const lineTotal = item.amount !== undefined ? parseFloat(item.amount) : (taxable + cgstA + sgstA + igstA);

        totalQty += qty;
        totalTaxable += taxable;
        totalCGST += cgstA;
        totalSGST += sgstA;
        totalIGST += igstA;
        grandTotal += lineTotal;

        const totalRate = cgstR + sgstR + igstR;
        const slabKey = `${totalRate}%`;
        if (!taxSlabs[slabKey]) {
          taxSlabs[slabKey] = { rate: totalRate, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        }
        taxSlabs[slabKey].taxable += taxable;
        taxSlabs[slabKey].cgst += cgstA;
        taxSlabs[slabKey].sgst += sgstA;
        taxSlabs[slabKey].igst += igstA;
        taxSlabs[slabKey].total += (cgstA + sgstA + igstA);

        // Calculate dynamic height based on text length
        const descWidth = isInterState ? 215 : 165;
        doc.font('Helvetica').fontSize(7.5);
        const descH = doc.heightOfString(item.description || '', { width: descWidth, lineGap: 0.5 });
        let subH = 0;
        if (item.subText) {
          doc.font('Helvetica-Oblique').fontSize(6.5);
          subH = doc.heightOfString(item.subText, { width: descWidth, lineGap: 0.5 }) + 2;
        }
        const rowH = Math.max(16, descH + subH + 4);

        return {
          sn,
          description: item.description || '',
          subText: item.subText || '',
          hsnCode: item.hsnCode || '',
          qty,
          unit,
          price,
          cgstR,
          cgstA,
          sgstR,
          sgstA,
          igstR,
          igstA,
          lineTotal,
          rowH,
        };
      });

      // Calculate total required items height
      const totalItemsContentH = computedItems.reduce((acc, it) => acc + it.rowH, 0);

      // Bottom fixed sections dynamic heights:
      const slabsCount = Object.keys(taxSlabs).length || 1;
      const taxTableH = Math.max(26, 12 + (slabsCount * 11) + 2);
      const grandTotalH = 17;
      const wordsH = 16;
      const bankH = 25;
      const termsSignH = 78;

      const totalBottomBoxesH = grandTotalH + taxTableH + wordsH + bankH + termsSignH; // ~162pt
      const targetTableBottom = bottom - totalBottomBoxesH;

      // Table bottom adjusts dynamically to span the exact height
      const tableBottom = Math.max(tableHeadBottom + totalItemsContentH + 12, targetTableBottom);

      // Render Item Rows
      let rowY = tableHeadBottom + 4;
      computedItems.forEach((item) => {
        const descWidth = isInterState ? 215 : 165;
        doc.font('Helvetica').fontSize(7.5).fillColor('#000000');
        doc.text(String(item.sn) + '.', colX.sn, rowY, { width: 20, align: 'center' });
        doc.text(item.description, colX.desc + 4, rowY, { width: descWidth, lineGap: 0.5 });

        let subTextOffset = doc.heightOfString(item.description, { width: descWidth, lineGap: 0.5 });
        if (item.subText) {
          doc.font('Helvetica-Oblique').fontSize(6.5).text(item.subText, colX.desc + 4, rowY + subTextOffset + 1, { width: descWidth, lineGap: 0.5 });
        }

        doc.font('Helvetica').fontSize(7.5);
        if (isInterState) {
          doc.text(item.hsnCode, colX.hsn, rowY, { width: 55, align: 'center' });
          doc.text(`${item.qty.toFixed(2)} ${item.unit}`, colX.qty, rowY, { width: 60, align: 'center' });
          doc.text(formatAmount(item.price), colX.price, rowY, { width: 48, align: 'right' });
          doc.text(item.igstR > 0 ? `${item.igstR.toFixed(2)} %` : '-', colX.igstRate, rowY, { width: 40, align: 'center' });
          doc.text(item.igstA > 0 ? formatAmount(item.igstA) : '-', colX.igstAmt, rowY, { width: 48, align: 'right' });
          doc.text(formatAmount(item.lineTotal), colX.amount, rowY, { width: 52, align: 'right' });
        } else {
          doc.text(item.hsnCode, colX.hsn, rowY, { width: 50, align: 'center' });
          doc.text(`${item.qty.toFixed(2)} ${item.unit}`, colX.qty, rowY, { width: 58, align: 'center' });
          doc.text(formatAmount(item.price), colX.price, rowY, { width: 42, align: 'right' });
          doc.text(item.cgstR > 0 ? `${item.cgstR.toFixed(2)} %` : '-', colX.cgstRate, rowY, { width: 32, align: 'center' });
          doc.text(item.cgstA > 0 ? formatAmount(item.cgstA) : '-', colX.cgstAmt, rowY, { width: 36, align: 'right' });
          doc.text(item.sgstR > 0 ? `${item.sgstR.toFixed(2)} %` : '-', colX.sgstRate, rowY, { width: 32, align: 'center' });
          doc.text(item.sgstA > 0 ? formatAmount(item.sgstA) : '-', colX.sgstAmt, rowY, { width: 36, align: 'right' });
          doc.text(formatAmount(item.lineTotal), colX.amount, rowY, { width: 45, align: 'right' });
        }

        rowY += item.rowH;
      });

      // Draw Full-height Column Vertical Dividers for items table
      const dividers = isInterState
        ? [colX.desc, colX.hsn, colX.qty, colX.price, colX.igstRate, colX.igstAmt, colX.amount]
        : [colX.desc, colX.hsn, colX.qty, colX.price, colX.cgstRate, colX.cgstAmt, colX.sgstRate, colX.sgstAmt, colX.amount];

      dividers.forEach((x) => {
        doc.moveTo(x, currY).lineTo(x, tableBottom).lineWidth(0.6).strokeColor('#000000').stroke();
      });

      // ==========================================
      // 5. GRAND TOTAL ROW
      // ==========================================
      doc.moveTo(left, tableBottom).lineTo(right, tableBottom).lineWidth(0.8).stroke();
      const grandTotalBottom = tableBottom + grandTotalH;

      const unitLabel = unitsSet.size === 1 ? (items[0]?.unit || 'Pcs') : 'Qty';
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000');
      doc.text('Grand Total', colX.desc + 40, tableBottom + 4.5, { width: 120, align: 'right' });
      doc.text(`${totalQty.toFixed(2)} ${unitLabel}`, colX.qty, tableBottom + 4.5, { width: isInterState ? 60 : 58, align: 'center' });
      doc.text('Rs.', colX.amount - 20, tableBottom + 4.5, { width: 18, align: 'right' });
      doc.text(formatAmount(grandTotal), colX.amount, tableBottom + 4.5, { width: isInterState ? 52 : 45, align: 'right' });

      doc.moveTo(left, grandTotalBottom).lineTo(right, grandTotalBottom).lineWidth(0.8).stroke();
      currY = grandTotalBottom;

      // ==========================================
      // 6. TAX SUMMARY BREAKDOWN TABLE
      // ==========================================
      const taxHeadH = 11.5;
      const taxRowH = 11;
      const taxBottom = currY + taxTableH;

      const taxCol = isInterState
        ? {
            rate: left + 6,
            taxable: left + 50,
            igst: left + 135,
            total: left + 205,
          }
        : {
            rate: left + 6,
            taxable: left + 50,
            cgst: left + 115,
            sgst: left + 175,
            total: left + 235,
          };

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
      doc.text('Tax Rate', taxCol.rate, currY + 2, { width: 40 });
      doc.text('Taxable Amt.', taxCol.taxable, currY + 2, { width: 60, align: 'right' });

      if (isInterState) {
        doc.text('IGST Amt.', taxCol.igst, currY + 2, { width: 65, align: 'right' });
        doc.text('Total Tax', taxCol.total, currY + 2, { width: 65, align: 'right' });
      } else {
        doc.text('CGST Amt.', taxCol.cgst, currY + 2, { width: 55, align: 'right' });
        doc.text('SGST Amt.', taxCol.sgst, currY + 2, { width: 55, align: 'right' });
        doc.text('Total Tax', taxCol.total, currY + 2, { width: 55, align: 'right' });
      }

      let tY = currY + taxHeadH + 1;
      Object.values(taxSlabs).forEach((slab) => {
        doc.font('Helvetica').fontSize(7.5);
        doc.text(`${slab.rate}%`, taxCol.rate, tY, { width: 40 });
        doc.text(formatAmount(slab.taxable), taxCol.taxable, tY, { width: 60, align: 'right' });

        if (isInterState) {
          doc.text(formatAmount(slab.igst), taxCol.igst, tY, { width: 65, align: 'right' });
          doc.text(formatAmount(slab.total), taxCol.total, tY, { width: 65, align: 'right' });
        } else {
          doc.text(formatAmount(slab.cgst), taxCol.cgst, tY, { width: 55, align: 'right' });
          doc.text(formatAmount(slab.sgst), taxCol.sgst, tY, { width: 55, align: 'right' });
          doc.text(formatAmount(slab.total), taxCol.total, tY, { width: 55, align: 'right' });
        }
        tY += taxRowH;
      });

      currY = taxBottom;
      doc.moveTo(left, currY).lineTo(right, currY).lineWidth(0.8).stroke();

      // ==========================================
      // 7. AMOUNT IN WORDS
      // ==========================================
      const words = d.amountInWords || numberToIndianWords(grandTotal);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
      doc.text('Rupees ', left + 6, currY + 3.5, { continued: true });
      doc.text(words.replace(/^Rupees\s*/i, ''));

      currY += wordsH;
      doc.moveTo(left, currY).lineTo(right, currY).lineWidth(0.8).stroke();

      // ==========================================
      // 8. BANK DETAILS
      // ==========================================
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
      doc.text('Bank Details', left, currY + 2, { width, align: 'center' });

      const bankParts = [
        `Bank name : ${d.bankName || 'HDFC BANK LTD'}`,
        `A/c No: ${d.accountNumber || '06687630000070'}`,
        `RTGS / NEFT no: ${d.ifscCode || 'HDFC0003126'}`,
      ];
      if (d.swiftCode) bankParts.push(`Swift code : ${d.swiftCode}`);
      if (d.branchName) bankParts.push(`Branch : ${d.branchName}`);

      doc.font('Helvetica').fontSize(7.5);
      doc.text(bankParts.join('   '), left + 4, currY + 13, { width: width - 8, align: 'center' });

      currY += bankH;
      doc.moveTo(left, currY).lineTo(right, currY).lineWidth(0.8).stroke();

      // ==========================================
      // 9. FOOTER: TERMS & CONDITIONS + SIGNATURE
      // ==========================================
      const footerMidX = left + width * 0.48; // 22 + 264 = 286
      doc.moveTo(footerMidX, currY).lineTo(footerMidX, bottom).lineWidth(0.8).stroke();

      // Left: Terms & Conditions
      const termsX = left + 6;
      let termY = currY + 3;
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
      doc.text('Terms & Conditions', termsX, termY);
      termY += 9;

      const termsList = [
        '1. Goods once sold will not be taken back.',
        '2. Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.',
        '3. Discrepancy if any,in billed item must be Communicated within 7 Days.',
        "4. Subject to 'Maharashtra' Jurisdiction only.",
      ];

      termsList.forEach((term) => {
        doc.font('Helvetica').fontSize(6.5);
        doc.text(term, termsX, termY, { width: footerMidX - termsX - 6, lineGap: 0.5 });
        const textH = doc.heightOfString(term, { width: footerMidX - termsX - 6 });
        termY += textH + 1.5;
      });

      // Right: Signatory block
      const sigX = footerMidX + 8;
      let sigY = currY + 3;

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
      doc.text("Receiver's Signature :", sigX, sigY);

      // Separation line between Receiver's Signature and Company Signatory
      const sigDividerY = currY + 22;
      doc.moveTo(footerMidX, sigDividerY).lineTo(right, sigDividerY).lineWidth(0.8).stroke();

      const signBoxBottom = bottom - 5;
      doc.font('Helvetica-Bold').fontSize(8.5);
      doc.text(`For ${d.companyName || 'DGR PACKAGING COMPANY'}`, sigX, signBoxBottom - 34, { width: right - sigX - 6, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000');
      doc.text('Authorised Signatory', sigX, signBoxBottom - 5, { width: right - sigX - 6, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
