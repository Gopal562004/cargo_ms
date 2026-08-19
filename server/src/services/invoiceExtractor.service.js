import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extract structured invoice/purchase bill fields from a raw PDF buffer or text.
 */
export async function parseInvoiceFile(base64Data, fileName = '') {
  let rawText = '';

  try {
    if (base64Data.startsWith('data:application/pdf') || base64Data.startsWith('data:;base64,') || (fileName && fileName.endsWith('.pdf'))) {
      const base64Content = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
      const buffer = Buffer.from(base64Content, 'base64');
      const pdfData = await pdfParse(buffer);
      rawText = pdfData?.text || '';
    } else {
      rawText = base64Data;
    }
  } catch (err) {
    console.error('Error parsing PDF text in invoice extractor:', err);
    rawText = '';
  }

  return extractFieldsFromText(rawText, fileName);
}

/**
 * Heuristic parsing of invoice text
 */
export function extractFieldsFromText(text, fileName = '') {
  const result = {
    vendorName: '',
    vendorGstin: '',
    vendorPan: '',
    vendorAddress: '',
    placeOfSupply: '',
    billNumber: '',
    billDate: '',
    dueDate: '',
    expenseCategory: 'DGD',
    hsnSacCode: '',
    airwayBillNo: '',
    description: '',
    taxableAmount: '',
    gstRate: 18,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalGst: 0,
    grandTotal: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankSwiftCode: '',
    bankBranch: '',
    referenceName: '',
    contactNumber: '',
    shippedToName: '',
    shippedToAddress: '',
    rawExtractedText: text ? text.slice(0, 1500) : '',
  };

  if (!text || typeof text !== 'string') return result;

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Vendor Name Heuristic (Look for Seller/Company header at top)
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i];
    if (
      line.length >= 4 &&
      line.length <= 70 &&
      !/(?:Tax\s*Invoice|Invoice|Original\s*Copy|Duplicate\s*Copy|Customer\s*Copy|Page\s*\d|Rupees|Bank\s*Details)/i.test(line) &&
      !line.startsWith('SHOP NO') &&
      !line.startsWith('GROUND FLOOR') &&
      !line.startsWith('PAN :') &&
      !line.startsWith('GSTIN') &&
      !line.startsWith('Tel') &&
      !line.startsWith('http') &&
      !line.includes('@') &&
      !line.startsWith('Invoice No') &&
      !line.startsWith('Dated')
    ) {
      result.vendorName = line.replace(/^[#\-*_\s]+/, '').trim();
      break;
    }
  }

  // 2. Vendor Address
  const addressLines = [];
  let foundVendorName = false;
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i];
    if (result.vendorName && line.includes(result.vendorName)) {
      foundVendorName = true;
      continue;
    }
    if (foundVendorName) {
      if (line.startsWith('PAN :') || line.startsWith('GSTIN') || line.startsWith('Tel') || line.startsWith('Invoice No')) {
        break;
      }
      addressLines.push(line);
    }
  }
  if (addressLines.length > 0) {
    result.vendorAddress = addressLines.join(' ').replace(/\s+/g, ' ').trim();
  }

  // 3. Vendor PAN & GSTIN
  const panMatch = text.match(/\bPAN\s*:\s*([A-Z]{5}[0-9]{4}[A-Z]{1})\b/i);
  if (panMatch && panMatch[1]) {
    result.vendorPan = panMatch[1].toUpperCase().trim();
  }

  const gstinRegex = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/g;
  const gstinMatches = [...text.matchAll(gstinRegex)].map((m) => m[1]);
  if (gstinMatches.length > 0) {
    const headerSection = lines.slice(0, 15).join(' ');
    const headerMatch = headerSection.match(/(?:GSTIN|GSTIN\s*\/UIN|GST\s*No)[\s.:\-_]*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i);
    if (headerMatch && headerMatch[1]) {
      result.vendorGstin = headerMatch[1].toUpperCase();
    } else {
      result.vendorGstin = gstinMatches[0].toUpperCase();
    }
  }

  // 4. Place of Supply
  const posMatch = text.match(/Place\s*of\s*Supply\s*:\s*([A-Za-z\s]+(?:\(\d{2}\))?)/i);
  if (posMatch && posMatch[1]) {
    result.placeOfSupply = posMatch[1].trim();
  }

  // 5. Invoice / Bill Number (e.g. DGR/0495/26-27 or INV-9842)
  const invNumberPatterns = [
    /(?:Invoice\s*No\.?|Bill\s*No\.?|Invoice\s*Number|Inv\s*No\.?|Tax\s*Invoice\s*No\.?)[\s.:\-_]*([A-Z0-9\/\-_]+)/i,
    /([A-Z]{2,5}\/\d{3,6}\/\d{2}-\d{2})/i, // e.g. DGR/0495/26-27
    /(INV[\-_/]\d{3,8})/i,
    /(?:Invoice|Bill)\s*#\s*([A-Z0-9\/\-_]+)/i,
  ];

  for (const pattern of invNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length >= 3 && !['DATE', 'NUMBER', 'NO', 'ORIGINAL', 'TAX', 'COPY'].includes(match[1].toUpperCase())) {
      result.billNumber = match[1].trim();
      break;
    }
  }

  // 6. Dates (Dated : 05-07-2026, Invoice Date, etc.)
  const datePatterns = [
    /(?:Dated|Invoice\s*Date|Bill\s*Date|Date\s*of\s*Issue)[\s.:\-_]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i,
    /(?:Date)[\s.:\-_]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i,
    /(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const normalizedDate = normalizeToISODate(match[1]);
      if (normalizedDate) {
        result.billDate = normalizedDate;
        break;
      }
    }
  }

  // 7. Due Date
  const dueDateMatch = text.match(/(?:Due\s*Date|Payment\s*Due)[\s.:\-_]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i);
  if (dueDateMatch && dueDateMatch[1]) {
    const isoDueDate = normalizeToISODate(dueDateMatch[1]);
    if (isoDueDate) result.dueDate = isoDueDate;
  }

  // 8. Taxable Amount (e.g. Taxable Amt. 1,19,000.00)
  const taxablePatterns = [
    /(?:Taxable\s*Amt\.?|Taxable\s*Amount|Taxable\s*Value|Total\s*Taxable\s*Value|Sub\s*Total|Subtotal)[\s.:\-_]*[₹`Rs\.]*\s*([0-9,]+\.[0-9]{2})/i,
    /(?:5%|12%|18%|28%)\s+([0-9,]+\.[0-9]{2})/i,
    /(?:Taxable\s*Amt\.?|Taxable\s*Amount)[\s\S]{0,25}?([0-9,]+\.[0-9]{2})/i,
  ];

  for (const pattern of taxablePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        result.taxableAmount = num.toFixed(2);
        break;
      }
    }
  }

  // 9. Grand Total / Invoice Amount (Skip unit counts like 201.00 Units)
  const grandTotalPatterns = [
    /(?:Grand\s*Total)[\s\S]{0,40}?[`'₹Rs\.]\s*([0-9,]+\.[0-9]{2})/i,
    /(?:Invoice\s*Total|Total\s*Amount|Total\s*Invoice\s*Value|Net\s*Payable)[\s.:\-_]*[`'₹Rs\.]*\s*([0-9,]+\.[0-9]{2})/i,
    /[`'₹]\s*([0-9,]+\.[0-9]{2})\s*$/m,
    /(?:Rupees|Rs\.?)\s*(?:[A-Za-z\s]+?)\s*([0-9,]+\.[0-9]{2})/i,
    /(?:Grand\s*Total)[\s\S]{0,60}?([0-9,]+\.[0-9]{2})\s*(?:Rupees|Bank\s*Details|$)/i,
  ];

  for (const pattern of grandTotalPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 10) {
        result.grandTotal = num.toFixed(2);
        break;
      }
    }
  }

  // 10. Tax Rates & Tax Breakdown (CGST, SGST, IGST)
  if (/18%|18\s*%/i.test(text) || /CGST.*9\.00/i.test(text) || /9\.00\s*%/i.test(text)) {
    result.gstRate = 18;
  } else if (/12%|12\s*%/i.test(text) || /CGST.*6\.00/i.test(text) || /6\.00\s*%/i.test(text)) {
    result.gstRate = 12;
  } else if (/5%|5\s*%/i.test(text) || /CGST.*2\.50/i.test(text) || /2\.50\s*%/i.test(text)) {
    result.gstRate = 5;
  } else if (/28%|28\s*%/i.test(text) || /CGST.*14\.00/i.test(text)) {
    result.gstRate = 28;
  } else if (text.includes('0%') || /Exempt/i.test(text)) {
    result.gstRate = 0;
  }

  // Check specific CGST / SGST / Total Tax values
  const cgstMatch = text.match(/CGST\s*Amt\.?[\s.:\-_]*([0-9,]+\.[0-9]{2})/i);
  if (cgstMatch && cgstMatch[1]) {
    result.cgstAmount = parseFloat(cgstMatch[1].replace(/,/g, '')) || 0;
  }

  const sgstMatch = text.match(/SGST\s*Amt\.?[\s.:\-_]*([0-9,]+\.[0-9]{2})/i);
  if (sgstMatch && sgstMatch[1]) {
    result.sgstAmount = parseFloat(sgstMatch[1].replace(/,/g, '')) || 0;
  }

  const totalTaxMatch = text.match(/Total\s*Tax[\s.:\-_]*([0-9,]+\.[0-9]{2})/i);
  if (totalTaxMatch && totalTaxMatch[1]) {
    result.totalGst = parseFloat(totalTaxMatch[1].replace(/,/g, '')) || 0;
  }

  // Recalculate if missing
  if (!result.taxableAmount && result.grandTotal) {
    const total = parseFloat(result.grandTotal);
    const rate = parseFloat(result.gstRate) || 0;
    const taxable = total / (1 + rate / 100);
    result.taxableAmount = taxable.toFixed(2);
  } else if (result.taxableAmount && !result.grandTotal) {
    const taxable = parseFloat(result.taxableAmount);
    const rate = parseFloat(result.gstRate) || 0;
    const total = taxable * (1 + rate / 100);
    result.grandTotal = total.toFixed(2);
  }

  // 11. HSN / SAC Code & Item Description
  const hsnMatch = text.match(/\b(3923[0-9]{4}|4819[0-9]{4}|9965[0-9]{2}|9967[0-9]{2}|9983[0-9]{2}|4819|9965|9967|9983)\b/);
  if (hsnMatch && hsnMatch[1]) {
    result.hsnSacCode = hsnMatch[1];
  }

  // Description cleanup (extract item description without HSN code merged in)
  const itemMatch = text.match(/(?:1\.\s*|1\s+)([A-Z0-9\s\-+]+?)(?=\s+(?:3923|4819|9965|9967|\d{6,8})\b|\s+\d+\.\d{2}|\s+Pcs|\s+Nos|\s+UNIT)/i);
  if (itemMatch && itemMatch[1] && itemMatch[1].trim().length > 3) {
    let cleanDesc = itemMatch[1].replace(/[0-9]{6,8}$/, '').trim();
    result.description = cleanDesc;
  }

  // 12. Vendor Bank Details
  const bankNameMatch = text.match(/Bank\s*name\s*:\s*([A-Za-z\s]+?)(?=\s*A\/c|\s*RTGS|\s*IFSC|\s*$)/i);
  if (bankNameMatch && bankNameMatch[1]) {
    result.bankName = bankNameMatch[1].trim();
  }

  const accNoMatch = text.match(/A\/c\s*No[\s.:\-_]*([0-9]{8,18})/i);
  if (accNoMatch && accMatchHelper(accNoMatch[1])) {
    result.bankAccountNumber = accNoMatch[1].trim();
  }

  const ifscMatch = text.match(/(?:RTGS\s*\/|NEFT\s*no|IFSC\s*code|IFSC)[\s.:\-_]*([A-Z]{4}0[A-Z0-9]{6})/i);
  if (ifscMatch && ifscMatch[1]) {
    result.bankIfscCode = ifscMatch[1].trim().toUpperCase();
  }

  const swiftMatch = text.match(/Swift\s*code[\s\S]{0,25}?:?\s*([A-Z0-9]{8,11})/i);
  if (swiftMatch && swiftMatch[1]) {
    result.bankSwiftCode = swiftMatch[1].trim().toUpperCase();
  }

  const branchMatch = text.match(/Branch\s*:\s*([A-Za-z0-9\-]+)/i);
  if (branchMatch && branchMatch[1]) {
    result.bankBranch = branchMatch[1].trim();
  }

  // 13. Reference Person & Contact
  const refMatch = text.match(/REFERENCE\s*NAME\s*:?\s*:?\s*([A-Za-z\s]+?)(?=\s*CONTACT|\s*AIRWAY|\s*TRANSPORT|\s*Billed|$)/i);
  if (refMatch && refMatch[1] && refMatch[1].trim().length > 2) {
    result.referenceName = refMatch[1].trim();
  }

  const contactMatch = text.match(/CONTACT\s*NUMBER\s*:?\s*:?\s*([0-9]{10})/i);
  if (contactMatch && contactMatch[1]) {
    result.contactNumber = contactMatch[1].trim();
  }

  // 14. Shipped To / Delivery Destination
  const shippedToMatch = text.match(/Shipped\s*to\s*:?\s*\n?([A-Za-z0-9\s&,.\-]+?)(?=\s*State\s*:|\s*GSTIN\s*:|\s*S\.N\.|\s*Description)/i);
  if (shippedToMatch && shippedToMatch[1]) {
    const shippedLines = shippedToMatch[1].split('\n').map((l) => l.trim()).filter(Boolean);
    if (shippedLines.length > 0) {
      result.shippedToName = shippedLines[0];
      if (shippedLines.length > 1) {
        result.shippedToAddress = shippedLines.slice(1).join(', ').replace(/\s+/g, ' ');
      }
    }
  }

  // 15. Expense Category Classification
  const lower = (text + ' ' + (result.description || '') + ' ' + (result.vendorName || '')).toLowerCase();
  if (
    lower.includes('box') ||
    lower.includes('drum') ||
    lower.includes('open top drum') ||
    lower.includes('packaging') ||
    lower.includes('un 4g') ||
    lower.includes('carton') ||
    lower.includes('corrugated') ||
    lower.includes('dgr packaging')
  ) {
    result.expenseCategory = 'PACKAGING';
    if (!result.hsnSacCode) result.hsnSacCode = '4819';
    if (!result.description) result.description = 'UN approved packaging boxes / open top drums';
  } else if (lower.includes('dgd') || lower.includes('dangerous goods') || lower.includes('iata dgr') || lower.includes('dg certification') || lower.includes('inspection')) {
    result.expenseCategory = 'DGD';
    if (!result.hsnSacCode) result.hsnSacCode = '9983';
    if (!result.description) result.description = 'DGD preparation, inspection & dangerous goods documentation';
  } else if (lower.includes('air freight') || lower.includes('airline') || lower.includes('air cargo') || lower.includes('mawb')) {
    result.expenseCategory = 'AIR_FREIGHT';
    if (!result.hsnSacCode) result.hsnSacCode = '9965';
    if (!result.description) result.description = 'Air freight transport charges';
  } else if (lower.includes('ocean freight') || lower.includes('sea freight') || lower.includes('bill of lading') || lower.includes('container')) {
    result.expenseCategory = 'SEA_FREIGHT';
    if (!result.hsnSacCode) result.hsnSacCode = '9965';
    if (!result.description) result.description = 'Ocean / Sea freight container shipping';
  } else if (lower.includes('customs') || lower.includes('cha') || lower.includes('clearance') || lower.includes('brokerage')) {
    result.expenseCategory = 'CUSTOMS';
    if (!result.hsnSacCode) result.hsnSacCode = '9967';
    if (!result.description) result.description = 'Customs clearance & brokerage fees';
  } else if (lower.includes('transport') || lower.includes('cartage') || lower.includes('courier') || lower.includes('delivery')) {
    result.expenseCategory = 'TRANSPORT';
    if (!result.hsnSacCode) result.hsnSacCode = '9965';
    if (!result.description) result.description = 'Local transport & cartage charges';
  } else if (lower.includes('warehouse') || lower.includes('storage') || lower.includes('handling')) {
    result.expenseCategory = 'TERMINAL_HANDLING';
    if (!result.hsnSacCode) result.hsnSacCode = '9967';
    if (!result.description) result.description = 'Warehouse handling & storage fees';
  }

  return result;
}

function accMatchHelper(acc) {
  return acc && acc.length >= 8 && !/^[0]+$/.test(acc);
}

function normalizeToISODate(dateStr) {
  if (!dateStr) return '';
  const clean = dateStr.trim().replace(/[\/\.]/g, '-');
  const parts = clean.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    } else if (parts[2].length === 2) {
      // DD-MM-YY
      const year = parseInt(parts[2], 10) > 50 ? `19${parts[2]}` : `20${parts[2]}`;
      return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return '';
}
