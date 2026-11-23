import { extractFieldsFromText } from './src/services/invoiceExtractor.service.js';

const ocrText = `Original Copy
INV
TAX INVOICE
STANDARD PACKAGING CO
CARGO COMPLEX, SAHAR ROAD, ANDHERI (E)
MUMBAI - 400 099
PAN : ABCDE1234F
GSTIN : 27ABCDE1234F1Z5
Tel. : 022 - 28000000 email : billing@company.com
Invoice No. : INV/0466/26-27
Dated : 27-06-2026
Place of Supply : Maharashtra (27)
Reverse Charge : N
Transport : 
E-Way Bill No. : 
AIRWAY BILL NO : 
P.O. NO. & DATE : 
NO OF PACKAGES : 
GROSS WEIGHT : 
TRANSPORT NAME : 
PAID / TO-PAID : 
REFERENCE NAME : 
CONTACT NUMBER : 
Billed to :
GLOBAL CARGO & LOGISTICS
GROUND FLOOR ROOM -003
G M NAGAR NARANGI BAYPASS ROAD
AIR CARGO TERMINAL COMPLEX, ANDHERI EAST, MUMBAI - 400099
State : Maharashtra (27)
GSTIN / UIN : 27ABCDE1234F1Z5
Shipped to :
GLOBAL CARGO & LOGISTICS
GROUND FLOOR ROOM -003
G M NAGAR NARANGI BAYPASS ROAD
AIR CARGO TERMINAL COMPLEX, ANDHERI EAST, MUMBAI - 400099
State : Maharashtra (27)
GSTIN / UIN : 27XXXXX2222X1Z5
S.N. Description of Goods & Service HSN/SAC
Code Qty. Unit Price CGST
Rate
CGST
Amount
SGST
Rate
SGST
Amount Amount(Rs.)
1. UN APPROVED BOX X3 48191010 1.00 Pcs 110.00 2.50 % 2.75 2.50 % 2.75 115.50
2. UN APPROVED BOX X6 48191010 1.00 Pcs 160.00 2.50 % 4.00 2.50 % 4.00 168.00
3. UN APPROVED BOX X22 48191010 3.00 Pcs 270.00 2.50 % 20.25 2.50 % 20.25 850.50
Grand Total 5.00 Pcs Rs. 1,134.00
Tax Rate Taxable Amt. CGST Amt. SGST Amt. Total Tax
5% 1,080.00 27.00 27.00 54.00
Rupees One Thousand One Hundred and Thirty Four Only
Bank Details
Bank name : HDFC BANK LTD A/c No: 9876XXXXX0012 RTGS / NEFT no: HDFC0000XXX Swift code : HDFCINBBXXX Branch : AIRPORT CARGO ROAD`;

const result = extractFieldsFromText(ocrText);
console.log('Result:', result);
