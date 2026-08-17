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

  // 1. GSTIN: Look for Vendor's GSTIN (Top issuer GSTIN, e.g. 27CBKPK7600K1ZE)
  const gstinRegex = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/g;
  const gstinMatches = [...text.matchAll(gstinRegex)].map((m) => m[1]);
  if (gstinMatches.length > 0) {
    // Check if there is a GSTIN in the top 15 lines (which is the issuer)
    const headerSection = lines.slice(0, 15).join(' ');
    const headerGstin = headerSection.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
    result.vendorGstin = headerGstin ? headerGstin[1] : gstinMatches[0];
  }

  // 2. Invoice / Bill Number
  const invNumberPatterns = [
    /(?:Invoice|Bill|Inv|Tax\s*Invoice|Document)\s*(?:No|Number|#|Ref)[\s.:\-_]*([A-Z0-9\/\-_]+)/i,
    /(?:Invoice|Bill)\s*#\s*([A-Z0-9\/\-_]+)/i,
    /([A-Z]{2,5}\/\d{3,6}\/\d{2}-\d{2})/i, // e.g. DGR/0466/26-27
    /(INV[\-_]\d{3,8})/i,
  ];

  for (const pattern of invNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length >= 3 && !['DATE', 'NUMBER', 'NO', 'ORIGINAL', 'TAX'].includes(match[1].toUpperCase())) {
      result.billNumber = match[1].trim();
      break;
    }
  }

  // 3. Dates (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, DD Month YYYY)
  const datePatterns = [
    /(?:Invoice\s*Date|Bill\s*Date|Dated|Date\s*of\s*Issue)[\s.:\-_]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i,
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

  // 4. Due Date
  const dueDateMatch = text.match(/(?:Due\s*Date|Payment\s*Due)[\s.:\-_]*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i);
  if (dueDateMatch && dueDateMatch[1]) {
    const isoDueDate = normalizeToISODate(dueDateMatch[1]);
    if (isoDueDate) result.dueDate = isoDueDate;
  }

  // 5. Grand Total / Net Payable Amount
  const grandTotalPatterns = [
    /(?:Grand\s*Total|Invoice\s*Total|Total\s*Amount|Total\s*Invoice\s*Value|Net\s*Payable|Total\s*\(₹\)|Total\s*INR)[\s\S]{0,20}?Rs\.?\s*([0-9,]+\.?[0-9]*)/i,
    /(?:Grand\s*Total|Invoice\s*Total|Total\s*Amount|Total\s*Invoice\s*Value|Net\s*Payable|Total\s*\(₹\)|Total\s*INR)[\s.:\-_]*₹?\s*([0-9,]+\.?[0-9]*)/i,
    /Rs\.?\s*([0-9,]+\.[0-9]{2})/i,
    /(?:Total)[\s.:\-_]*₹?\s*([0-9,]+\.[0-9]{2})/i,
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

  // 6. Taxable Amount / Subtotal
  const taxablePatterns = [
    /(?:Taxable\s*Amt\.?|Taxable\s*Amount|Taxable\s*Value|Total\s*Taxable\s*Value|Sub\s*Total|Subtotal)[\s.:\-_]*₹?\s*([0-9,]+\.?[0-9]*)/i,
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

  // 7. GST Rate
  if (text.includes('18%') || text.includes('18 %') || text.includes('9.00%') || text.includes('9.00 %') || /IGST\s*@?\s*18/i.test(text)) {
    result.gstRate = 18;
  } else if (text.includes('12%') || text.includes('12 %') || text.includes('6.00%') || /IGST\s*@?\s*12/i.test(text)) {
    result.gstRate = 12;
  } else if (text.includes('5%') || text.includes('5 %') || text.includes('2.50 %') || text.includes('2.5%') || text.includes('2.50%') || /IGST\s*@?\s*5/i.test(text)) {
    result.gstRate = 5;
  } else if (text.includes('28%') || text.includes('14%') || /IGST\s*@?\s*28/i.test(text)) {
    result.gstRate = 28;
  } else if (text.includes('0%') || /Exempt/i.test(text)) {
    result.gstRate = 0;
  }

  // If taxable is missing but grandTotal is present
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

  // 8. Airway Bill / Shipment Ref (Only real AWB formats)
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

  // 9. Vendor Name Heuristic (Look for Seller/Company header at top)
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (
      line.length >= 4 &&
      line.length <= 60 &&
      !/(?:Tax\s*Invoice|Invoice|Original|Duplicate|Customer\s*Copy|Page\s*\d|DGR$)/i.test(line) &&
      !line.startsWith('SHOP NO') &&
      !line.startsWith('PAN :') &&
      !line.startsWith('GSTIN') &&
      !line.startsWith('Tel') &&
      !line.startsWith('http') &&
      !line.includes('@')
    ) {
      result.vendorName = line.replace(/^[#\-*_\s]+/, '').trim();
      break;
    }
  }

  // 10. Categorization & Description Heuristics
  const lower = text.toLowerCase();
  if (lower.includes('box') || lower.includes('un approved box') || lower.includes('packaging') || lower.includes('un 4g') || lower.includes('carton') || lower.includes('corrugated') || lower.includes('dgr packaging')) {
    result.expenseCategory = 'PACKAGING';
    result.description = 'UN approved packaging boxes (UN BOX X3, X6, X22)';
  } else if (lower.includes('dgd') || lower.includes('dangerous goods') || lower.includes('iata dgr') || lower.includes('dg certification')) {
    result.expenseCategory = 'DGD';
    result.description = 'DGD preparation, inspection & dangerous goods documentation';
  } else if (lower.includes('air freight') || lower.includes('airline') || lower.includes('air cargo') || lower.includes('mawb')) {
    result.expenseCategory = 'AIR_FREIGHT';
    result.description = 'Air freight transport charges';
  } else if (lower.includes('ocean freight') || lower.includes('sea freight') || lower.includes('bill of lading') || lower.includes('container')) {
    result.expenseCategory = 'SEA_FREIGHT';
    result.description = 'Ocean / Sea freight container shipping';
  } else if (lower.includes('customs') || lower.includes('cha') || lower.includes('clearance') || lower.includes('brokerage')) {
    result.expenseCategory = 'CUSTOMS';
    result.description = 'Customs clearance & brokerage fees';
  } else if (lower.includes('transport') || lower.includes('cartage') || lower.includes('courier') || lower.includes('delivery')) {
    result.expenseCategory = 'TRANSPORT';
    result.description = 'Local transport & cartage charges';
  } else if (lower.includes('warehouse') || lower.includes('storage') || lower.includes('handling')) {
    result.expenseCategory = 'WAREHOUSE';
    result.description = 'Warehouse handling & storage fees';
  } else {
    result.description = 'Vendor supplies / documentation services';
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
