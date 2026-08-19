import { extractFieldsFromText } from '../src/services/invoiceExtractor.service.js';

const ocrText = `Original Copy
 TAX INVOICE 
 DGR PACKAGING COMPANY 
 SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E) 
 MUMBAI - 400 099 
 PAN : CBKPK7600K 
 GSTIN : 27CBKPK7600K1ZE 
 Tel. : 022 - 26828108 email : dgrpackaging@gmail.com 
Invoice No. : DGR/0495/26-27 P.O. NO. & DATE : 
Dated : 05-07-2026 NO OF PACKAGES : 
Place of Supply : Maharashtra (27) GROSS WEIGHT : 
Reverse Charge : N TRANSPORT NAME : 
Transport : PAID / TO-PAID : 
E-Way Bill No. : REFERENCE NAME: : Mayur Kadam 
AIRWAY BILL NO : CONTACT NUMBER : 9028345261 
Billed to : Shipped to : 
DGR GLOBAL LOGISTICS Sai Warehouse & Transport 
GROUND FLOOR ROOM -003 Gala no 2 Manish Estate, Chowdhary 
G M NAGAR NARANGI BAYPASS ROAD Compound , Behind Preeti Petrol Pump 
VIRAR EAST VASAI VIRAR PALGHAR -401305 Near Ganesh Compound, PURNA BHIWANDI 
 
State : Maharashtra (27) State : Maharashtra (27) 
GSTIN / UIN : 27NSAPK0224B1Z7 GSTIN / UIN : 27NSAPK0224B1Z7 
 
S.N. Description of Goods & Service HSN/SAC Qty. Unit Price CGST CGST SGST SGST Amount(' )
 Code Rate Amount Rate Amount 
 1. UN APPROVED Y 75 OPEN TOP DRUM 39233090 200.00 Pcs 560.00 9.00 % 10,080.00 9.00 % 10,080.00 1,32,160.00
 2. Transport Charges 996531 1.00 UNIT 7,000.00 9.00 % 630.00 9.00 % 630.00 8,260.00
 Grand Total 201.00 Units ' 1,40,420.00
 
Tax Rate Taxable Amt. CGST Amt. SGST Amt. Total Tax
18% 1,19,000.00 10,710.00 10,710.00 21,420.00
RupeesOne Lakh Forty Thousand Four Hundred Twenty Only 
 Bank Details
Bank name : HDFC BANK LTD A/c No: 06687630000070 RTGS / NEFT no:HDFC0003126 Swift code for HDFC Bank : HDFCINBBXXX Branch :MAHAD-4
Terms & Conditions Receiver's Signature :
1. Goods once sold will not be taken back. 
2. Interest @ 18% p.a. will be charged if the payment 
Is not made with in the stipulated time. For DGR PACKAGING COMPANY
3.Descrepancy if any,in billed item must be 
Communicated within 7 Days 
4.Subject to 'Maharashtra' Jurisdiction only. Authorised Signatory`;

const res = extractFieldsFromText(ocrText, 'DGR_0495_26-27.pdf');
console.log('Result:', JSON.stringify(res, null, 2));
