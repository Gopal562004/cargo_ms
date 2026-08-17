import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTaxInvoicePDF } from '../src/documents/commercial/taxInvoice.pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPdf() {
  console.log('Testing Tax Invoice PDF generation...');
  const sampleDoc = {
    documentNumber: 'DGR/0466/26-27',
    documentType: 'TAX_INVOICE',
    status: 'ISSUED',
    data: {
      docTitle: 'TAX INVOICE',
      copyType: 'Original Copy',
      companyName: 'DGR PACKAGING COMPANY',
      companyAddress: 'SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)',
      companyCityPin: 'MUMBAI - 400 099',
      companyPan: 'CBKPK7600K',
      companyGstin: '27CBKPK7600K1ZE',
      companyTel: '022 - 26828108',
      companyEmail: 'dgrpackaging@gmail.com',
      invoiceNumber: 'DGR/0466/26-27',
      invoiceDate: '27-06-2026',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'N',
      transport: '',
      ewayBillNo: '',
      airwayBillNo: '',
      poNumberAndDate: '',
      noOfPackages: '',
      grossWeight: '',
      transportName: '',
      paidToPaid: '',
      referenceName: '',
      contactNumber: '',
      buyerName: 'DGR GLOBAL LOGISTICS',
      buyerAddress: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27NSAPK0224B1Z7',
      consigneeName: 'DGR GLOBAL LOGISTICS',
      consigneeAddress: 'GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27NSAPK0224B1Z7',
      items: [
        {
          sn: 1,
          description: 'UN APPROVED BOX X3',
          hsnCode: '48191010',
          qty: 1,
          unit: 'Pcs',
          price: 110,
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount: 2.75,
          sgstAmount: 2.75,
          amount: 115.50
        },
        {
          sn: 2,
          description: 'UN APPROVED BOX X6',
          hsnCode: '48191010',
          qty: 1,
          unit: 'Pcs',
          price: 160,
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount: 4.00,
          sgstAmount: 4.00,
          amount: 168.00
        },
        {
          sn: 3,
          description: 'UN APPROVED BOX X22',
          hsnCode: '48191010',
          qty: 3,
          unit: 'Pcs',
          price: 270,
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount: 20.25,
          sgstAmount: 20.25,
          amount: 850.50
        }
      ],
      bankName: 'HDFC BANK LTD',
      accountNumber: '06687630000070',
      ifscCode: 'HDFC0003126',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'MAHAD-4'
    }
  };

  const pdfBuffer = await generateTaxInvoicePDF(sampleDoc);
  const outPath = path.join(__dirname, 'test_output_invoice.pdf');
  fs.writeFileSync(outPath, pdfBuffer);
  console.log('Tax Invoice PDF successfully generated! Size:', pdfBuffer.length, 'bytes');
}

testPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
