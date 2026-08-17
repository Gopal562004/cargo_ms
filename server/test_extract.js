import { extractFieldsFromText } from './src/services/invoiceExtractor.service.js';

const ocrText = `Original Copy
DGR
TAX INVOICE
DGR PACKAGING COMPANY
SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)
MUMBAI - 400 099
PAN : CBKPK7600K
GSTIN : 27CBKPK7600K1ZE
Tel. : 022 - 26828108 email : dgrpackaging@gmail.com
Invoice No. : DGR/0466/26-27
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
DGR GLOBAL LOGISTICS
GROUND FLOOR ROOM -003
G M NAGAR NARANGI BAYPASS ROAD
VIRAR EAST VASAI VIRAR PALGHAR -401305
State : Maharashtra (27)
GSTIN / UIN : 27NSAPK0224B1Z7
Shipped to :
DGR GLOBAL LOGISTICS
GROUND FLOOR ROOM -003
G M NAGAR NARANGI BAYPASS ROAD
VIRAR EAST VASAI VIRAR PALGHAR -401305
State : Maharashtra (27)
GSTIN / UIN : 27NSAPK0224B1Z7
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
Bank name : HDFC BANK LTD A/c No: 06687630000070 RTGS / NEFT no: HDFC0003126 Swift code : HDFCINBBXXX Branch : MAHAD-4`;

const result = extractFieldsFromText(ocrText);
console.log('Result:', result);
