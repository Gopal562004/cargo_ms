const fs = require('fs');
const path = require('path');
const { generateTaxInvoicePDF } = require('../server/src/documents/commercial/taxInvoice.pdf');

async function test() {
  const testDoc = {
    documentNumber: 'DGR/0466/26-27',
    data: {
      invoiceNumber: 'DGR/0466/26-27',
      invoiceDate: '27-06-2026',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'N',
      buyerName: 'DGR GLOBAL LOGISTICS',
      buyerAddress: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27NSAPK0224B1Z7',
      consigneeName: 'DGR GLOBAL LOGISTICS',
      consigneeAddress: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27NSAPK0224B1Z7',
      companyName: 'DGR PACKAGING COMPANY',
      companyAddress: 'SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)',
      companyCityPin: 'MUMBAI - 400 099',
      companyPan: 'CBKPK7600K',
      companyGstin: '27CBKPK7600K1ZE',
      companyTel: '022 - 26828108',
      companyEmail: 'dgrpackaging@gmail.com',
      bankName: 'HDFC BANK LTD',
      accountNumber: '06687630000070',
      ifscCode: 'HDFC0003126',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'MAHAD-4',
      items: [
        { sn: 1, description: 'UN APPROVED BOX X3', subText: 'UN 3465/6.1/III, Box specs', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
        { sn: 2, description: 'UN APPROVED BOX X6', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 160, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
        { sn: 3, description: 'UN APPROVED BOX X22 (HEAVY DUTY CORRUGATED BOX FOR DANGEROUS GOODS TRANSPORT)', subText: 'Tested as per ICAO / IATA Section 5 standards', hsnCode: '48191010', qty: 3, unit: 'Pcs', price: 270, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      ]
    }
  };

  const buffer = await generateTaxInvoicePDF(testDoc);
  const outPath = path.join(__dirname, 'test_dynamic_tax_invoice.pdf');
  fs.writeFileSync(outPath, buffer);
  console.log('Generated test PDF at:', outPath);
}

test().catch(console.error);
