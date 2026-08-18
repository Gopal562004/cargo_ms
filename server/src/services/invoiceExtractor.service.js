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
    vendorAddress: '',
    billNumber: '',
    billDate: '',
    dueDate: '',
    expenseCategory: 'DGD',
    airwayBillNo: '',
    description: '',
    taxableAmount: '',
    gstRate: 18,
    grandTotal: '',
    rawExtractedText: text ? text.slice(0, 1000) : '',
  };

  if (!text || typeof text !== 'string') return result;

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Vendor Name Heuristic (Look for Seller/Company header at top, before Billed to / Shipped to)
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

  // 3. Vendor GSTIN (Top issuer GSTIN, e.g. GSTIN : 27CBKPK7600K1ZE)
  const gstinRegex = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/g;
  const gstinMatches = [...text.matchAll(gstinRegex)].map((m) => m[1]);
  if (gstinMatches.length > 0) {
    // Look specifically for GSTIN in the top header section (issuer)
    const headerSection = lines.slice(0, 15).join(' ');
    const headerMatch = headerSection.match(/(?:GSTIN|GSTIN\s*\/UIN|GST\s*No)[\s.:\-_]*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i);
    if (headerMatch && headerMatch[1]) {
      result.vendorGstin = headerMatch[1];
    } else {
      result.vendorGstin = gstinMatches[0];
    }
  }

  // 4. Invoice / Bill Number (e.g. DGR/0462/26-27 or INV-9842)
  const invNumberPatterns = [
    /(?:Invoice\s*No\.?|Bill\s*No\.?|Invoice\s*Number|Inv\s*No\.?|Tax\s*Invoice\s*No\.?)[\s.:\-_]*([A-Z0-9\/\-_]+)/i,
    /([A-Z]{2,5}\/\d{3,6}\/\d{2}-\d{2})/i, // e.g. DGR/0462/26-27
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

  // 5. Dates (Dated : 26-06-2026, Invoice Date, etc.)
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

  // 6. Due Date
  const dueDateMatch = text.match(/(?:Due\s*Date|Payment\s*Due)[\s.:\-_]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i);
  if (dueDateMatch && dueDateMatch[1]) {
    const isoDueDate = normalizeToISODate(dueDateMatch[1]);
    if (isoDueDate) result.dueDate = isoDueDate;
  }

  // 7. Grand Total / Net Payable Amount (e.g. Grand Total 20.00 Pcs ₹ 9,030.00 or 9,030.00)
  const grandTotalPatterns = [
    /(?:Grand\s*Total|Invoice\s*Total|Total\s*Amount|Total\s*Invoice\s*Value|Net\s*Payable)[\s\S]{0,35}?[₹Rs\.]\s*([0-9,]+\.[0-9]{2})/i,
    /(?:Grand\s*Total|Invoice\s*Total|Total\s*Amount|Total\s*Invoice\s*Value|Net\s*Payable)[\s.:\-_]*([0-9,]+\.[0-9]{2})/i,
    /(?:Total\s*Taxable|Total\s*Tax)[\s\S]{0,40}?([0-9,]+\.[0-9]{2})\s*$/m,
    /Rs\.?\s*([0-9,]+\.[0-9]{2})/i,
    /([0-9,]+\.[0-9]{2})\s*(?:Rupees|Rupees\s*Nine|Rupees\s*Only)/i,
  ];

  for (const pattern of grandTotalPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        result.grandTotal = num.toFixed(2);
        break;
      }
    }
  }

  // 8. Taxable Amount / Subtotal (e.g. Taxable Amt. 8,600.00)
  const taxablePatterns = [
    /(?:Taxable\s*Amt\.?|Taxable\s*Amount|Taxable\s*Value|Total\s*Taxable\s*Value|Sub\s*Total|Subtotal)[\s.:\-_]*₹?\s*([0-9,]+\.?[0-9]*)/i,
    /(?:5%|12%|18%|28%)\s+([0-9,]+\.[0-9]{2})/i,
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

  // 9. GST Rate (Check for 5%, 12%, 18%, 28%, or CGST/SGST 2.5%, 6%, 9%, 14%)
  if (
    /Tax\s*Rate\s*5%/i.test(text) ||
    /CGST\s*Rate\s*2\.5/i.test(text) ||
    /2\.50\s*%/i.test(text) ||
    text.includes('5%') ||
    text.includes('5 %') ||
    /IGST\s*@?\s*5/i.test(text)
  ) {
    result.gstRate = 5;
  } else if (
    /Tax\s*Rate\s*12%/i.test(text) ||
    /CGST\s*Rate\s*6/i.test(text) ||
    /6\.00\s*%/i.test(text) ||
    text.includes('12%') ||
    text.includes('12 %') ||
    /IGST\s*@?\s*12/i.test(text)
  ) {
    result.gstRate = 12;
  } else if (
    /Tax\s*Rate\s*18%/i.test(text) ||
    /CGST\s*Rate\s*9/i.test(text) ||
    /9\.00\s*%/i.test(text) ||
    text.includes('18%') ||
    text.includes('18 %') ||
    /IGST\s*@?\s*18/i.test(text)
  ) {
    result.gstRate = 18;
  } else if (
    /Tax\s*Rate\s*28%/i.test(text) ||
    /CGST\s*Rate\s*14/i.test(text) ||
    /14\.00\s*%/i.test(text) ||
    text.includes('28%') ||
    text.includes('28 %') ||
    /IGST\s*@?\s*28/i.test(text)
  ) {
    result.gstRate = 28;
  } else if (text.includes('0%') || /Exempt/i.test(text)) {
    result.gstRate = 0;
  }

  // Cross calculate Taxable vs Grand Total if one is missing
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

  // 10. Specific Item Description from Table
  const itemMatch = text.match(/(?:1\.\s*|1\s+)([A-Z0-9\s\-+]+?)(?=\s+4819|\s+9967|\s+\d{6,8}|\s+\d+\.\d{2}|\s+Pcs|\s+Nos)/i);
  if (itemMatch && itemMatch[1] && itemMatch[1].trim().length > 3) {
    result.description = itemMatch[1].trim();
  }

  // 11. Airway Bill / Shipment Ref
  const awbPatterns = [
    /(?:AIRWAY\s*BILL\s*NO|AWB\s*No|Airway\s*Bill|MAWB|HAWB|Air\s*Waybill)[\s.:\-_#]*([0-9]{3}[-\s]?[0-9]{8})/i,
    /(?:AWB)[\s.:\-_#]*([A-Z0-9\-_]{6,16})/i,
  ];

  for (const pattern of awbPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim() && !/^(NO|DATE|NAME|REF|ERENCE)$/i.test(match[1].trim())) {
      result.airwayBillNo = match[1].trim();
      break;
    }
  }

  // 12. Categorization & Default Description Heuristics
  const lower = (text + ' ' + (result.description || '')).toLowerCase();
  if (lower.includes('box') || lower.includes('un approved box') || lower.includes('packaging') || lower.includes('un 4g') || lower.includes('carton') || lower.includes('corrugated') || lower.includes('dgr packaging')) {
    result.expenseCategory = 'PACKAGING';
    if (!result.description) result.description = 'UN approved packaging boxes (UN BOX)';
  } else if (lower.includes('dgd') || lower.includes('dangerous goods') || lower.includes('iata dgr') || lower.includes('dg certification') || lower.includes('documentation')) {
    result.expenseCategory = 'DGD';
    if (!result.description) result.description = 'DGD preparation, inspection & dangerous goods documentation';
  } else if (lower.includes('air freight') || lower.includes('airline') || lower.includes('air cargo') || lower.includes('mawb')) {
    result.expenseCategory = 'AIR_FREIGHT';
    if (!result.description) result.description = 'Air freight transport charges';
  } else if (lower.includes('ocean freight') || lower.includes('sea freight') || lower.includes('bill of lading') || lower.includes('container')) {
    result.expenseCategory = 'SEA_FREIGHT';
    if (!result.description) result.description = 'Ocean / Sea freight container shipping';
  } else if (lower.includes('customs') || lower.includes('cha') || lower.includes('clearance') || lower.includes('brokerage')) {
    result.expenseCategory = 'CUSTOMS';
    if (!result.description) result.description = 'Customs clearance & brokerage fees';
  } else if (lower.includes('transport') || lower.includes('cartage') || lower.includes('courier') || lower.includes('delivery')) {
    result.expenseCategory = 'TRANSPORT';
    if (!result.description) result.description = 'Local transport & cartage charges';
  } else if (lower.includes('warehouse') || lower.includes('storage') || lower.includes('handling')) {
    result.expenseCategory = 'WAREHOUSE';
    if (!result.description) result.description = 'Warehouse handling & storage fees';
  }

  return result;
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
