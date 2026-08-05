import PDFDocument from 'pdfkit';

/**
 * Draw Face of Air Waybill (Exact match to reference IATA AWB/HAWB)
 */
export async function drawExactFedExAwbFace(doc, document, data, pkgs, copyLabel, copyColor = '#000000', isDeliveryReceipt = false) {
  const x = 30;
  const y = 35;
  const w = 535;
  const h = 750;

  const isHawb = document.documentType === 'HAWB' || document.documentType === 'FHL' || document.documentType === 'XFZB';
  const titleText = isHawb ? 'House Air Waybill' : 'Air Waybill';

  const fullAwb = document.documentNumber || '023-0317 8630';
  let prefix = '023';
  let serial = '03178630';

  if (fullAwb.includes('-')) {
    const parts = fullAwb.split('-');
    prefix = parts[0];
    serial = parts[1].replace(/\s+/g, '');
  }

  const origin = data.originAirport || 'BOM';

  doc.lineWidth(0.5).strokeColor('#000000').fillColor('#000000');

  // --- VERY TOP HEADER BAR (Above Box) ---
  doc.fontSize(12).font('Helvetica-Bold').text(prefix, x, y - 18);
  doc.fontSize(12).font('Helvetica-Bold').text(`${origin} ${serial}`, x + 50, y - 18);
  doc.fontSize(12).font('Helvetica-Bold').text(`${prefix}-${serial.substring(0, 4)} ${serial.substring(4)}`, x + w - 140, y - 18, { align: 'right', width: 140 });

  // Outer Border Box
  doc.rect(x, y, w, h).stroke();

  // Alignment Dashes
  doc.moveTo(x - 5, y + 4).lineTo(x, y + 4).stroke();
  doc.moveTo(x + w, y + 4).lineTo(x + w + 5, y + 4).stroke();
  doc.moveTo(x - 5, y + h - 4).lineTo(x, y + h - 4).stroke();
  doc.moveTo(x + w, y + h - 4).lineTo(x + w + 5, y + h - 4).stroke();

  // --- ROW 1: Shipper / Title ---
  doc.moveTo(x, y + 68).lineTo(x + w, y + 68).stroke();
  doc.moveTo(280, y).lineTo(280, y + 68).stroke();
  doc.moveTo(160, y).lineTo(160, y + 20).lineTo(280, y + 20).stroke();

  doc.fontSize(5.5).font('Helvetica-Bold').text("Shipper's Name and Address", x + 3, y + 3);
  doc.fontSize(5.5).font('Helvetica-Bold').text("Shipper's Account Number", 163, y + 3);

  // Shipper Data
  doc.font('Courier-Bold').fontSize(8);
  doc.text(data.shipperName || '**DEMO VERSION**', x + 4, y + 14, { width: 152, height: 10 });
  doc.font('Courier').fontSize(7.2);
  const shpAddr = data.shipperAddress || '2ND FLOOR, NEW IMPORT BLDG, SHAHAR CARGO COMPLEX,\nANDHERI (E) MUMBAI, INDIA.';
  doc.text(shpAddr, x + 4, y + 24, { width: 152, height: 40 });

  if (data.shipperAccountNo) {
    doc.font('Courier').fontSize(7.2).text(data.shipperAccountNo, 163, y + 10, { width: 110 });
  }

  // Not Negotiable Header Box
  doc.fontSize(5.5).font('Helvetica-Bold').text('Not Negotiable', 283, y + 3);
  doc.fontSize(12).font('Helvetica-Bold').text(titleText, 283, y + 11);
  doc.fontSize(5.5).font('Helvetica').text('Issued by', 283, y + 25);
  doc.fontSize(8.5).font('Helvetica-Bold').text(data.issuingCarrier || 'FEDEX', 325, y + 24);

  doc.fontSize(5.5).font('Helvetica').text('Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity.', 283, y + 58);

  // --- ROW 2: Consignee / Contract Terms ---
  doc.moveTo(x, y + 138).lineTo(x + w, y + 138).stroke();
  doc.moveTo(280, y + 68).lineTo(280, y + 138).stroke();
  doc.moveTo(160, y + 68).lineTo(160, y + 88).lineTo(280, y + 88).stroke();

  doc.fontSize(5.5).font('Helvetica-Bold').text("Consignee's Name and Address", x + 3, y + 71);
  doc.fontSize(5.5).font('Helvetica-Bold').text("Consignee's Account Number", 163, y + 71);

  doc.font('Courier-Bold').fontSize(8);
  doc.text(data.consigneeName || 'FEDEX EXPRESS.', x + 4, y + 82, { width: 152, height: 10 });
  doc.font('Courier').fontSize(7.2);
  const cngAddr = data.consigneeAddress || '777, FEDEX RD, HUADONG TOWN, HUADU\nDIST. GUANGZHOU, 510890, CHINA.';
  doc.text(cngAddr, x + 4, y + 92, { width: 152, height: 42 });

  if (data.consigneeAccountNo) {
    doc.font('Courier').fontSize(7.2).text(data.consigneeAccountNo, 163, y + 78, { width: 110 });
  }

  if (isDeliveryReceipt) {
    doc.fontSize(5.5).font('Helvetica-Bold').text('Received in Good Order and Condition', 283, y + 71);
    doc.moveTo(283, y + 102).lineTo(x + w - 5, y + 102).dash(2, { space: 2 }).stroke().undash();
    doc.fontSize(5.5).font('Helvetica').text('at (place)                                                        on (date/time)', 283, y + 104);
    doc.moveTo(283, y + 128).lineTo(x + w - 5, y + 128).dash(2, { space: 2 }).stroke().undash();
    doc.fontSize(5.5).font('Helvetica').text('Signature of Consignee or his Agent', 380, y + 130);
  } else {
    doc.fontSize(4.5).font('Helvetica').lineGap(0.6).text(
      'It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER, AND SHIPPER AGREES THAT THE SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH THE CARRIER DEEMS APPROPRIATE. THE SHIPPER\'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER\'S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.',
      283, y + 71, { width: 248, align: 'justify' }
    );
  }

  // --- ROW 3: Agent & Accounting ---
  doc.moveTo(x, y + 188).lineTo(x + w, y + 188).stroke();
  doc.moveTo(280, y + 138).lineTo(280, y + 188).stroke();
  doc.moveTo(x, y + 163).lineTo(280, y + 163).stroke();
  doc.moveTo(140, y + 163).lineTo(140, y + 188).stroke();

  doc.fontSize(5.5).font('Helvetica-Bold').text("Issuing Carrier's Agent Name and City", x + 3, y + 141);
  doc.font('Courier').fontSize(7.2).text(data.agentName || 'SKYWAYS AIR SERVICE PVT LTD', x + 4, y + 149, { width: 240, height: 8 });
  doc.font('Courier').fontSize(7.2).text('MUMBAI', x + 4, y + 156, { width: 240, height: 8 });

  doc.fontSize(5.5).font('Helvetica-Bold').text("Accounting Information", 283, y + 141);
  doc.font('Courier-Bold').fontSize(8).text('FREIGHT PREPAID', 410, y + 141);

  let dimsText = 'Dimension : CENTIMETERS\n';
  if (pkgs.length > 0) {
    const dimMap = {};
    pkgs.forEach(p => {
      if (p.length && p.width && p.height) {
        const key = `${p.length}X${p.width}X${p.height}`;
        dimMap[key] = (dimMap[key] || 0) + 1;
      }
    });
    const dimStrs = Object.entries(dimMap).map(([k, count]) => `${k}(${count})`);
    dimsText += dimStrs.join(',') + ',';
  } else {
    dimsText += '37X37X43(1),';
  }
  doc.font('Courier').fontSize(7.2).text(dimsText, 283, y + 149, { width: 248, height: 35 });

  doc.fontSize(5.5).font('Helvetica-Bold').text("Agent's IATA Code", x + 3, y + 165);
  doc.font('Courier').fontSize(7.2).text(data.agentIATACode || 'SKYWAYS', x + 4, y + 174, { width: 100 });

  doc.fontSize(5.5).font('Helvetica-Bold').text("Account No.", 143, y + 165);

  // --- ROW 4: Departure & Routing ---
  doc.moveTo(x, y + 218).lineTo(x + w, y + 218).stroke();
  doc.moveTo(290, y + 188).lineTo(290, y + 218).stroke();
  doc.moveTo(410, y + 188).lineTo(410, y + 218).stroke();

  doc.fontSize(5.5).font('Helvetica-Bold').text("Airport of Departure (Addr. of First Carrier) and Requested Routing", x + 3, y + 190);
  doc.font('Courier-Bold').fontSize(8).text('MUMBAI', x + 4, y + 206);

  doc.fontSize(5.5).font('Helvetica-Bold').text("Reference Number", 293, y + 190);
  doc.font('Courier').fontSize(7.2).text(document.documentNumber || '', 293, y + 206, { width: 110 });

  doc.fontSize(5.5).font('Helvetica-Bold').text("Optional Shipping Information", 413, y + 190);

  // --- ROW 5: Routing Table Bar ---
  doc.moveTo(x, y + 248).lineTo(x + w, y + 248).stroke();
  const rDivs = [20, 45, 175, 200, 222, 245, 268, 295, 317, 335, 355, 375, 465];
  rDivs.forEach(dx => {
    const rx = x + dx;
    if (rx > x && rx < x + w) {
      doc.moveTo(rx, y + 218).lineTo(rx, y + 248).stroke();
    }
  });

  doc.fontSize(5).font('Helvetica-Bold');
  doc.text('To', x + 2, y + 220);
  doc.text('By First Carrier', x + 22, y + 220);
  doc.text('Routing and Destination', x + 47, y + 220);
  doc.text('to', x + 177, y + 220);
  doc.text('by', x + 202, y + 220);
  doc.text('to', x + 224, y + 220);
  doc.text('by', x + 247, y + 220);
  doc.text('Currency', x + 270, y + 220);
  doc.text('CHGS\nCode', x + 297, y + 220);
  doc.text('WT/VAL\nPPD COLL', x + 319, y + 220);
  doc.text('Other\nPPD COLL', x + 337, y + 220);
  doc.text('Declared Value for Carriage', x + 377, y + 220);
  doc.text('Declared Value for Customs', x + 467, y + 220);

  doc.moveTo(x + 326, y + 232).lineTo(x + 335, y + 232).stroke();
  doc.moveTo(x + 346, y + 232).lineTo(x + 355, y + 232).stroke();

  doc.fontSize(7.2).font('Courier');
  doc.text(data.destinationAirport || 'CAN', x + 2, y + 234, { width: 18 });
  doc.text(data.firstCarrier || 'FX', x + 22, y + 234, { width: 22 });
  doc.text(data.currency || 'INR', x + 270, y + 234, { width: 25 });
  doc.text('X', data.paymentTerms === 'PREPAID' ? x + 320 : x + 328, y + 236);
  doc.text('X', data.paymentTerms === 'PREPAID' ? x + 339 : x + 348, y + 236);
  doc.text(data.declaredValueCarriage ? String(data.declaredValueCarriage) : 'NVD', x + 377, y + 234, { width: 85 });
  doc.text(data.declaredValueCustoms ? String(data.declaredValueCustoms) : 'NVD', x + 467, y + 234, { width: 65 });

  // --- ROW 6: Destination / Flight Date / Insurance ---
  doc.moveTo(x, y + 278).lineTo(x + w, y + 278).stroke();
  doc.moveTo(170, y + 248).lineTo(170, y + 278).stroke();
  doc.moveTo(290, y + 248).lineTo(290, y + 278).stroke();
  doc.moveTo(375, y + 248).lineTo(375, y + 278).stroke();

  doc.fontSize(5.5).font('Helvetica-Bold').text("Airport of Destination", x + 3, y + 250);
  doc.font('Courier').fontSize(7.2).text(data.destinationName || 'GUANGZHOU', x + 3, y + 264, { width: 130 });

  doc.fontSize(5.5).font('Helvetica-Bold').text("Requested Flight/Date", 173, y + 250);
  doc.font('Courier').fontSize(7.2).text(`${origin}/${data.destinationAirport || 'CAN'}`, 173, y + 264, { width: 110 });

  doc.fontSize(5.5).font('Helvetica-Bold').text("Amount of Insurance", 293, y + 250);
  doc.font('Courier').fontSize(7.2).text('XXX', 293, y + 264, { width: 75 });

  doc.fontSize(4.5).font('Helvetica').text(
    'INSURANCE - If carrier offers insurance, and such insurance is requested in accordance with the conditions thereof, indicate amount to be insured in figures in box marked "Amount of Insurance".',
    378, y + 250, { width: 180, align: 'left' }
  );

  // --- ROW 7: Handling Information ---
  doc.moveTo(x, y + 318).lineTo(x + w, y + 318).stroke();
  doc.moveTo(480, y + 278).lineTo(480, y + 318).stroke();

  doc.fontSize(5.5).font('Helvetica-Bold').text("Handling Information", x + 3, y + 280);
  const handlingText = data.specialHandlingCodes || 'PLEASE INFORM CONSIGNEE IMMEDIATELY ON ARR IVAL OF CARGO\nDANGEROUS GOODS AS PER ASSOCIATED SHIPPERS DECLERATION';
  doc.font('Courier').fontSize(7.2).text(handlingText, x + 110, y + 280, { width: 360, height: 35 });

  doc.fontSize(5.5).font('Helvetica-Bold').text("SCI", 483, y + 280);

  // --- ROW 8: CARGO TABLE HEADER & CONTENT ---
  doc.moveTo(x, y + 353).lineTo(x + w, y + 353).stroke();
  doc.moveTo(x, y + 513).lineTo(x + w, y + 513).stroke();

  const cLines = [60, 125, 135, 145, 205, 265, 335];
  cLines.forEach(cx => {
    doc.moveTo(cx, y + 318).lineTo(cx, y + 513).stroke();
  });

  doc.fontSize(5).font('Helvetica-Bold');
  doc.text('No. of\nPieces\nRCP', x + 2, y + 320, { align: 'center', width: 26 });
  doc.text('Gross\nWeight', 62, y + 320, { align: 'center', width: 60 });
  doc.text('kg\nlb', 126, y + 320, { width: 8 });

  doc.text('Rate Class\nCommodity\nItem No.', 136, y + 320, { width: 8 });
  doc.text('Chargeable\nWeight', 147, y + 320, { align: 'center', width: 56 });

  doc.moveTo(205, y + 333).lineTo(265, y + 318).stroke();
  doc.text('Rate', 210, y + 320);
  doc.text('Charge', 235, y + 330);

  doc.text('Total', 267, y + 323, { align: 'center', width: 66 });
  doc.text('Nature and Quantity of Goods\n(incl. Dimensions or Volume)', 337, y + 320, { width: 220 });

  const pcs = String(data.totalPieces || pkgs.length || 1);
  const gross = data.grossWeight ? Number(data.grossWeight).toFixed(2) : '13.00';
  const chgWeight = data.chargeableWeight ? Number(data.chargeableWeight).toFixed(2) : gross;

  doc.fontSize(7.2).font('Courier');
  doc.text(pcs, x + 2, y + 358, { align: 'center', width: 26 });
  doc.text(gross, 62, y + 358, { align: 'right', width: 58 });
  doc.text(data.weightUnit || 'K', 126, y + 358, { width: 8 });
  doc.text(data.rateClass || 'M', 136, y + 358, { width: 8 });
  doc.text(chgWeight, 147, y + 358, { align: 'right', width: 55 });
  doc.text('0.00', 207, y + 358, { align: 'right', width: 55 });
  doc.text('As Agreed', 267, y + 358, { width: 65 });

  let natureText = data.commodityDescription || 'DGR CHEMICAL\nERBIUM(III) NITRATE,\nHEXAHYDRATE,99.99%\nUN 1477/5.1/II\n\nINV NO-EXP/26-27/061\nDT. 16-JULY-2026\nSB NO\nSB DT';
  doc.text(natureText, 337, y + 358, { width: 220, height: 135 });

  doc.moveTo(x, y + 498).lineTo(x + w, y + 498).stroke();
  doc.font('Courier').fontSize(7.2);
  doc.text(pcs, x + 2, y + 502, { align: 'center', width: 26 });
  doc.text(gross, 62, y + 502, { align: 'right', width: 58 });
  doc.text('As Agreed', 267, y + 502, { width: 65 });

  // --- SECTION 9: CHARGES & SIGNATURES ---
  const chRows = [533, 558, 578, 603, 628];
  chRows.forEach(ry => {
    doc.moveTo(x, y + ry).lineTo(x + 190, y + ry).stroke();
  });

  doc.moveTo(x + 190, y + 513).lineTo(x + 190, y + 673).stroke();

  doc.fontSize(5).font('Helvetica-Bold');
  doc.text('Prepaid', x + 15, y + 515);
  doc.text('Weight Charge', x + 70, y + 515);
  doc.text('Collect', x + 125, y + 515);
  doc.text('Other Charges', x + 200, y + 515);

  doc.fontSize(7.2).font('Courier');
  doc.text('As Agreed', x + 10, y + 523, { width: 50 });

  doc.moveTo(x, y + 533).lineTo(x + 130, y + 533).lineTo(x + 150, y + 543).lineTo(x, y + 543).stroke();
  doc.fontSize(5).font('Helvetica-Bold').text('Valuation Charge', x + 70, y + 535);

  doc.moveTo(x, y + 558).lineTo(x + 110, y + 558).lineTo(x + 130, y + 568).lineTo(x, y + 568).stroke();
  doc.fontSize(5).font('Helvetica-Bold').text('Tax', x + 85, y + 560);

  doc.moveTo(x, y + 578).lineTo(x + 160, y + 578).lineTo(x + 180, y + 588).lineTo(x, y + 588).stroke();
  doc.fontSize(5).font('Helvetica-Bold').text('Total Other Charges Due Agent', x + 50, y + 580);
  doc.fontSize(7.2).font('Courier').text('As Agreed', x + 10, y + 591, { width: 160 });

  doc.moveTo(x, y + 603).lineTo(x + 160, y + 603).lineTo(x + 180, y + 613).lineTo(x, y + 613).stroke();
  doc.fontSize(5).font('Helvetica-Bold').text('Total Other Charges Due Carrier', x + 50, y + 605);
  doc.fontSize(7.2).font('Courier').text('As Agreed', x + 10, y + 616, { width: 160 });

  doc.rect(x, y + 628, 190, 20).fill('#d0d0d0').stroke();
  doc.fillColor('#000000');

  // Certification statement
  doc.fontSize(4.8).font('Helvetica').lineGap(0.6).text(
    'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.',
    x + 195, y + 588, { width: 335, height: 45, align: 'justify' }
  );

  doc.font('Courier').fontSize(7.2).text(data.agentName || 'SKYWAYS AIR SERVICE PVT LTD', x + 280, y + 636, { width: 245 });
  doc.moveTo(x + 195, y + 643).lineTo(x + w - 5, y + 643).dash(2, { space: 2 }).stroke().undash();
  doc.fontSize(5.5).font('Helvetica').text('Signature of Shipper or his Agent', x + 340, y + 646);

  // Bottom totals & execution lines
  doc.moveTo(x, y + 648).lineTo(x + w, y + 648).stroke();
  doc.moveTo(x, y + 660).lineTo(x + 110, y + 660).lineTo(x + 130, y + 673).lineTo(x, y + 673).stroke();
  doc.moveTo(x + 130, y + 673).lineTo(x + 230, y + 673).stroke();
  doc.moveTo(x + 130, y + 648).lineTo(x + 130, y + 673).stroke();

  doc.fontSize(5.5).font('Helvetica-Bold').text('Total Prepaid', x + 40, y + 650);
  doc.fontSize(5.5).font('Helvetica-Bold').text('Total Collect', x + 155, y + 650);
  doc.fontSize(7.2).font('Courier').text('As Agreed', x + 10, y + 662, { width: 90 });

  doc.moveTo(x, y + 673).lineTo(x + w, y + 673).stroke();
  const execDate = '02-AUG-2026';
  doc.fontSize(7.2).font('Courier').text(execDate, x + 205, y + 676, { width: 80 });
  doc.fontSize(7.2).font('Courier').text('MUMBAI', x + 295, y + 676, { width: 80 });
  doc.moveTo(x + 195, y + 686).lineTo(x + w - 5, y + 686).dash(2, { space: 2 }).stroke().undash();
  doc.fontSize(5.5).font('Helvetica').text('Executed on (date)                 at (place)                 Signature of Issuing Carrier or its Agent', x + 195, y + 688);

  doc.fontSize(10).font('Helvetica-Bold').text(`${prefix}-${serial.substring(0, 4)} ${serial.substring(4)}`, x + w - 140, y + 694, { align: 'right', width: 140 });

  doc.moveTo(x, y + 698).lineTo(x + w, y + 698).stroke();
  doc.moveTo(x + 100, y + 698).lineTo(x + 100, y + 733).stroke();
  doc.moveTo(x + 190, y + 698).lineTo(x + 190, y + 733).stroke();
  doc.moveTo(x + 290, y + 698).lineTo(x + 290, y + 733).stroke();

  doc.fontSize(5).font('Helvetica-Bold').text('Currency Conversion Rates', x + 15, y + 700);
  doc.fontSize(5).font('Helvetica-Bold').text('CC Charges in Dest. Currency', x + 103, y + 700);

  doc.moveTo(x + 190, y + 712).lineTo(x + 270, y + 712).lineTo(x + 290, y + 722).lineTo(x + 190, y + 722).stroke();
  doc.fontSize(5).font('Helvetica-Bold').text('Charges at Destination', x + 205, y + 714);

  doc.moveTo(x + 290, y + 712).lineTo(x + 380, y + 712).lineTo(x + 400, y + 722).lineTo(x + 290, y + 722).stroke();
  doc.fontSize(5).font('Helvetica-Bold').text('Total Collect Charges', x + 305, y + 714);

  doc.rect(x + 10, y + 712, 105, 18).stroke();
  doc.fontSize(4.5).font('Helvetica').text('For Carrier\'s Use only at Destination', x + 12, y + 716, { align: 'center', width: 101 });

  doc.fontSize(11).font('Helvetica-Bold').fillColor(copyColor).text(copyLabel, x, y + 738, { align: 'center', width: w });
  doc.fillColor('#000000');
}

/**
 * Draw Reverse Side (Conditions of Contract)
 */
export function drawExactAwbReverse(doc) {
  const x = 35;
  const y = 35;
  const w = 525;

  doc.font('Helvetica-Bold').fontSize(11).text('NOTICE CONCERNING CARRIER\'S LIMITATION OF LIABILITY', x, y, { align: 'center', width: w });

  doc.font('Helvetica').fontSize(6.5).lineGap(1.2).text(
    'If the carriage involves an ultimate destination or stop in a country other than the country of departure, the Montreal Convention or the Warsaw Convention may be applicable to the liability of the Carrier in respect of loss of, damage or delay to cargo. Carrier\'s limitation of liability in accordance with those Conventions shall be as set forth in subparagraph 4 unless a higher value is declared.',
    x, y + 16, { align: 'justify', width: w }
  );

  doc.font('Helvetica-Bold').fontSize(9).text('CONDITIONS OF CONTRACT', x, y + 42, { align: 'center', width: w });

  const colWidth = 250;
  const col1X = x;
  const col2X = x + 275;
  let yStart = y + 58;

  doc.font('Helvetica').fontSize(5.8).lineGap(1.5);

  const col1Text = `
1. In this contract and the Notices appearing hereon:
CARRIER includes the air carrier issuing this air waybill and all carriers that carry or undertake to carry the cargo or perform any other services related to such carriage.
SPECIAL DRAWING RIGHT (SDR) is a Special Drawing Right as defined by the International Monetary Fund.
WARSAW CONVENTION means whichever of the following instruments is applicable to the contract of carriage:
the Convention for the Unification of Certain Rules Relating to International Carriage by Air, signed at Warsaw, 12 October 1929;
that Convention as amended at The Hague on 28 September 1955;
that Convention as amended at The Hague 1955 and by Montreal Protocol No. 1, 2, or 4 (1975) as the case may be.
MONTREAL CONVENTION means the Convention for the Unification of Certain Rules Relating to International Carriage by Air, done at Montreal on 28 May 1999.

2. 2.1 Carriage is subject to the rules relating to liability established by the Warsaw Convention or the Montreal Convention unless such carriage is not "international carriage" as defined by the applicable Conventions.
2.2 To the extent not in conflict with the foregoing, carriage and other related services performed by each Carrier are subject to:
2.2.1 applicable laws and government regulations;
2.2.2 provisions contained in the air waybill, Carrier's conditions of carriage and related rules, regulations, and timetables (but not the times of departure and arrival stated therein) and applicable tariffs of such Carrier, which are made part hereof, and which may be inspected at any airports or other cargo sales offices from which it operates regular services. When carriage is to/from the USA, the shipper and the consignee are entitled, upon request, to receive a free copy of the Carrier's conditions of carriage.

3. The agreed stopping places (which may be altered by Carrier in case of necessity) are those places, except the place of departure and place of destination, set forth on the face hereof or shown in Carrier's timetables as scheduled stopping places for the route. Carriage to be performed hereunder by several successive Carriers is regarded as a single operation.

4. For carriage to which the Montreal Convention does not apply, Carrier's liability limitation for cargo lost, damaged or delayed shall be 26 SDRs per kilogram unless a greater per kilogram monetary limit is provided in any applicable Convention or in Carrier's tariffs or general conditions of carriage.

5. 5.1 Except when the Carrier has extended credit to the consignee without the written consent of the shipper, the shipper guarantees payment of all charges for the carriage due in accordance with Carrier's tariff, conditions of carriage and related regulations, applicable laws, government regulations, orders and requirements.
5.2 When no part of the consignment is delivered, a claim with respect to such consignment will be considered even though transportation charges thereon are unpaid.

6. 6.1 For cargo accepted for carriage, the Warsaw Convention and the Montreal Convention permit shipper to increase the limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.
`;

  const col2Text = `
6.2 In carriage to which neither the Warsaw Convention nor the Montreal Convention applies Carrier shall, in accordance with the procedures set forth in its general conditions of carriage and applicable tariffs, permit shipper to increase the limitation of liability by declaring a higher value for carriage and paying a supplemental charge if so required.

7. 7.1 In cases of loss of, damage or delay to part of the cargo, the weight to be taken into account in determining Carrier's limit of liability shall be only the weight of the package or packages concerned.
7.2 Notwithstanding any other provisions, for "foreign air transportation" as defined by the U.S. Transportation Code:
7.2.1 in the case of loss of, damage or delay to a shipment, the weight to be used in determining Carrier's limit of liability shall be the weight which is used to determine the charge for carriage of such shipment; and
7.2.2 in the case of loss of, damage or delay to a part of a shipment, the shipment weight in 7.2.1 shall be prorated to the packages covered by the same air waybill whose value is affected by the loss, damage or delay.

8. Any exclusion or limitation of liability applicable to Carrier shall apply to Carrier's agents, employees, and representatives and to any person whose aircraft or equipment is used by Carrier for carriage and such person's agents, employees and representatives.

9. Carrier undertakes to complete the carriage with reasonable dispatch. Where permitted by applicable laws, tariffs and government regulations, Carrier may use alternative carriers, aircraft or modes of transport without notice but with due regard to the interests of the shipper. Carrier is authorized by the shipper to select the routing and all intermediate stopping places.

10. Receipt by the person entitled to delivery of the cargo without complaint shall be prima facie evidence that the cargo has been delivered in good condition and in accordance with the contract of carriage.
10.1 In the case of loss of, damage or delay to cargo a written complaint must be made to Carrier by the person entitled to delivery:
10.1.1 in the case of damage, immediately after discovery of the damage and at the latest within 14 days from date of receipt;
10.1.2 in the case of delay, within 21 days from date on which cargo was placed at disposal;
10.1.3 in the case of non-delivery, within 120 days from date of issue of air waybill.
10.2 Such complaint may be made to the Carrier whose air waybill was used, or to the first Carrier or to the last Carrier.
10.3 Unless a written complaint is made within the time limits specified in 10.1 no action may be brought against Carrier.

11. Shipper shall comply with all applicable laws and government regulations of any country to or from which cargo may be carried.

12. No agent, employee or representative of Carrier has authority to alter, modify or waive any provisions of this contract.
`;

  doc.text(col1Text.trim(), col1X, yStart, { width: colWidth, align: 'justify' });
  doc.text(col2Text.trim(), col2X, yStart, { width: colWidth, align: 'justify' });
}
