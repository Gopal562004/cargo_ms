import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Printer,
  Eye,
  Download,
  Save,
  FileText,
  LayoutGrid,
  Settings,
  Zap,
  Plus,
  Trash2,
  Folder,
  Image,
  Building,
  Truck,
  Receipt,
  CheckCircle2,
  X,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { useDocumentStore } from '../../store/documentStore';
import { downloadDocumentPDF, printDocumentPDF } from '../../services/documentService';
import {
  getSavedBillingProfiles,
  saveBillingProfile,
  getSavedBuyers,
  saveBuyer,
  getSavedShippers,
  saveShipper,
} from '../../services/billingProfileService';
import BillingTemplateManagerModal from './BillingTemplateManagerModal';
import VisualTaxInvoiceSheet from './VisualTaxInvoiceSheet';
import PdfPreviewModal from '../ui/PdfPreviewModal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import GstRateSelect from '../ui/GstRateSelect';

// Helper for Indian Currency Number to Words
function numberToIndianWords(num) {
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

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Complete Excel & PDF Presets matching user files
const INVOICE_TEMPLATES = {
  pdfTemplate: {
    label: 'INV DGR-0466 (PDF Standard)',
    data: {
      copyType: 'Original Copy',
      docTitle: 'TAX INVOICE',
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
      bankName: 'HDFC BANK LTD',
      accountNumber: '06687630000070',
      ifscCode: 'HDFC0003126',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'MAHAD-4',
    },
    items: [
      { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 2, description: 'UN APPROVED BOX X6', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 160, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 3, description: 'UN APPROVED BOX X22', subText: '', hsnCode: '48191010', qty: 3, unit: 'Pcs', price: 270, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
    ],
  },
  takai: {
    label: 'Takai Chemtech (DG Doc)',
    data: {
      copyType: 'Original Copy',
      docTitle: 'TAX INVOICE',
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 9326392294',
      companyEmail: 'dgr.export.logistics@gmail.com',
      invoiceNumber: 'DGR/007/2026-27',
      invoiceDate: '17/07/2026',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'N',
      transport: '',
      ewayBillNo: '',
      airwayBillNo: '176-6268 0251',
      poNumberAndDate: 'INV NO-TCI/26-27/002',
      noOfPackages: '02 (01 BOX DG, 01 NON DG)',
      grossWeight: '',
      transportName: '',
      paidToPaid: '',
      referenceName: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
      contactNumber: '+91 9326392294',
      buyerName: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
      buyerAddress: 'A-218 Sagar Tech Plaza, Saki Naka Junction, Andheri Kurla Road, Andheri East Mumbai Maharashtra India 400072.',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27AAMCT0922D1Z1',
      consigneeName: 'TAKAI CHEMTECH INTERNATIONAL PVT LTD',
      consigneeAddress: 'A-218 Sagar Tech Plaza, Saki Naka Junction, Andheri Kurla Road, Andheri East Mumbai Maharashtra India 400072.',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27AAMCT0922D1Z1',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    items: [
      { sn: 1, description: 'DG Documentation Charges', subText: 'UN NUMBER: UN 3465/6.1/III', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 1200, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Packing Charges', subText: '01 Box X3 & 01 Non haz box', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 800, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  efficient: {
    label: 'Efficient Freight (Drums & Transport)',
    data: {
      copyType: 'Original Copy',
      docTitle: 'TAX INVOICE',
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 91062 35771',
      companyEmail: 'dgr.export.logistics@gmail.com',
      invoiceNumber: 'DGR/013/2026-27',
      invoiceDate: '06/08/2026',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'N',
      transport: 'BY ROAD',
      ewayBillNo: '',
      airwayBillNo: '',
      poNumberAndDate: '',
      noOfPackages: '50 DRUMS',
      grossWeight: '',
      transportName: 'Sai Warehouse & Transport',
      paidToPaid: 'PAID',
      referenceName: 'Mr SUNIL',
      contactNumber: '9221876157',
      buyerName: 'EFFICIENT FREIGHT FORWARDERS PVT LTD',
      buyerAddress: '2nd Floor/ C-205, Damji Shamji Corporate Square, Ghatkopar Andheri Link Road, Ghatkopar East, Mumbai-400077, Maharashtra, INDIA.',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27AAECE7206P1Z9',
      consigneeName: 'Sai Warehouse & Transport',
      consigneeAddress: 'Gala no 2 Manish Estate, Chowdhary Compound, Behind Preeti Petrol Pump Near Ganesh Compound, PURNA BHIWANDI',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27AAECE7206P1Z9',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    items: [
      { sn: 1, description: 'UN APP MC Y 30 KG OPEN TOP PLASTIC DRUMS', subText: '', hsnCode: '39233090', qty: 50, unit: 'Drum', price: 600, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Transport Charges', subText: 'Delivery to Bhiwandi', hsnCode: '996791', qty: 1, unit: 'Trip', price: 2800, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  manifest: {
    label: 'Manifest Express (DGD Charges)',
    data: {
      copyType: 'Original Copy',
      docTitle: 'TAX INVOICE',
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 9619507404',
      companyEmail: 'dgr.export.logistics@gmail.com',
      invoiceNumber: 'DGR/015/2026-27',
      invoiceDate: '07/08/2026',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'N',
      transport: 'AIR',
      ewayBillNo: '',
      airwayBillNo: '176-6507-5415',
      poNumberAndDate: 'EXP/26-27/075 DT. 30-JULY-2026',
      noOfPackages: '01 PKG',
      grossWeight: '',
      transportName: '',
      paidToPaid: '',
      referenceName: 'AADISH IMPEX PRIVATE LIMITED',
      contactNumber: '+91 9619507404',
      buyerName: 'MANIFEST EXPRESS LOGISTICS LLP',
      buyerAddress: '2ND FLOOR A WING, 218, Sagar Tech Plaza, Andheri Kurla Road, Sakinaka Junction, Mumbai, Mumbai Suburban, Maharashtra, 400072',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27ABYFM3165B1Z0',
      consigneeName: 'MANIFEST EXPRESS LOGISTICS LLP',
      consigneeAddress: '2ND FLOOR A WING, 218, Sagar Tech Plaza, Andheri Kurla Road, Sakinaka Junction, Mumbai, Mumbai Suburban, Maharashtra, 400072',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27ABYFM3165B1Z0',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    items: [
      { sn: 1, description: 'DGD Charges', subText: 'UN 1549/6.1/III', hsnCode: '996713', qty: 1, unit: 'Pcs', price: 2000, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
      { sn: 2, description: 'Packing Charges', subText: '01 Box X3 Rs. 850/-', hsnCode: '996713', qty: 1, unit: 'Box', price: 850, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
  multiGst: {
    label: 'Multiple GST Slabs (5% & 18%)',
    data: {
      copyType: 'Original Copy',
      docTitle: 'TAX INVOICE',
      companyName: 'DGR GLOBAL LOGISTICS',
      companyAddress: 'GROUND FLOOR, ROOM-003, NX TOWER GM NAGAR, NARANGI BAYPASS ROAD, VIRAR EAST',
      companyCityPin: '401305-PALGHAR, MAHARASHTRA, INDIA.',
      companyPan: 'CBKPK7600K',
      companyGstin: '27NSAPK0224B1Z7',
      companyTel: '+91 91062 35771',
      companyEmail: 'dgr.export.logistics@gmail.com',
      invoiceNumber: 'DGR/010/2026-27',
      invoiceDate: '25/07/2026',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'N',
      transport: 'BY ROAD',
      ewayBillNo: '',
      airwayBillNo: '',
      poNumberAndDate: '',
      noOfPackages: '02 BOXES',
      grossWeight: '',
      transportName: 'COURIER',
      paidToPaid: 'PAID',
      referenceName: 'Ravi',
      contactNumber: '70211 57707',
      buyerName: 'EFFICIENT FREIGHT FORWARDERS PVT LTD',
      buyerAddress: '2nd Floor/ C-205, Damji Shamji Corporate Square, Ghatkopar Andheri Link Road, Ghatkopar East, Mumbai-400077, Maharashtra, INDIA.',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '27AAECE7206P1Z9',
      consigneeName: 'Unisource Chemicals Pvt Ltd',
      consigneeAddress: 'L-15, Tarapur M.I.D.C, Kalvada Naka, Kolavade, Maharashtra 401506',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '27AAECE7206P1Z9',
      bankName: 'HDFC BANK LTD',
      accountNumber: '5020 0112 5568 92',
      ifscCode: 'HDFC0000994',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'VIRAR EAST - STATION ROAD',
    },
    items: [
      { sn: 1, description: 'UN APPROVED BOX X55', subText: '', hsnCode: '48191010', qty: 2, unit: 'Box', price: 630, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 2, description: 'COURIER CHARGES', subText: 'To Tarapur MIDC', hsnCode: '996713', qty: 1, unit: 'Trip', price: 500, gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0 },
    ],
  },
};

export default function TaxInvoiceEditor({ documentId, initialData, currentDocument, onSaved, onCancel, isEmbedded }) {
  const navigate = useNavigate();
  const { createDocument, updateDocument } = useDocumentStore();

  const isEdit = !!documentId;
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // Editor View Mode: 'VISUAL' (WYSIWYG Sheet) | 'FORM' (Standard Input Cards)
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'form' ? 'FORM' : 'VISUAL';
  const [editorMode, setEditorMode] = useState(initialMode);

  // Saved Profiles, Buyers, & Shippers Directory State
  const [savedProfiles, setSavedProfiles] = useState(() => getSavedBillingProfiles());
  const [savedBuyers, setSavedBuyers] = useState(() => getSavedBuyers());
  const [savedShippers, setSavedShippers] = useState(() => getSavedShippers());
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);

  const refreshDirectories = () => {
    setSavedProfiles(getSavedBillingProfiles());
    setSavedBuyers(getSavedBuyers());
    setSavedShippers(getSavedShippers());
  };

  // Form State
  const [formData, setFormData] = useState(() => {
    const d = initialData || currentDocument?.data || {};
    return {
      ...INVOICE_TEMPLATES.pdfTemplate.data,
      ...d,
    };
  });

  // Line Items State
  const [items, setItems] = useState(() => {
    const d = initialData || currentDocument?.data;
    if (Array.isArray(d?.items) && d.items.length > 0) {
      return d.items;
    }
    return INVOICE_TEMPLATES.pdfTemplate.items;
  });

  useEffect(() => {
    const loadedData = initialData || currentDocument?.data;
    if (loadedData && Object.keys(loadedData).length > 0) {
      setFormData((prev) => ({
        ...INVOICE_TEMPLATES.pdfTemplate.data,
        ...prev,
        ...loadedData,
      }));
      if (Array.isArray(loadedData.items) && loadedData.items.length > 0) {
        setItems(loadedData.items);
      }
    }
  }, [initialData, currentDocument]);

  const handleFieldChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const applyProfile = (profile) => {
    if (!profile) return;
    const comp = profile.companyDetails || {};
    const buyer = profile.buyer || {};
    const cons = profile.consignee || {};

    setFormData((prev) => ({
      ...prev,
      companyLogo: profile.companyLogo !== undefined ? profile.companyLogo : prev.companyLogo,
      companyName: comp.companyName || prev.companyName,
      companyAddress: comp.companyAddress || prev.companyAddress,
      companyCityPin: comp.companyCityPin || prev.companyCityPin,
      companyPan: comp.companyPan || prev.companyPan,
      companyGstin: comp.companyGstin || prev.companyGstin,
      companyTel: comp.companyTel || prev.companyTel,
      companyEmail: comp.companyEmail || prev.companyEmail,
      bankName: comp.bankName || prev.bankName,
      accountNumber: comp.accountNumber || prev.accountNumber,
      ifscCode: comp.ifscCode || prev.ifscCode,
      swiftCode: comp.swiftCode || prev.swiftCode,
      branchName: comp.branchName || prev.branchName,
      buyerName: buyer.buyerName || prev.buyerName,
      buyerAddress: buyer.buyerAddress || prev.buyerAddress,
      buyerState: buyer.buyerState || prev.buyerState,
      buyerGstin: buyer.buyerGstin || prev.buyerGstin,
      consigneeName: cons.consigneeName || buyer.buyerName || prev.consigneeName,
      consigneeAddress: cons.consigneeAddress || buyer.buyerAddress || prev.consigneeAddress,
      consigneeState: cons.consigneeState || buyer.buyerState || prev.consigneeState,
      consigneeGstin: cons.consigneeGstin || buyer.buyerGstin || prev.consigneeGstin,
      invoiceNumber: profile.invoiceNumber || prev.invoiceNumber,
      invoiceDate: profile.invoiceDate || prev.invoiceDate,
      placeOfSupply: profile.placeOfSupply || prev.placeOfSupply,
      reverseCharge: profile.reverseCharge || prev.reverseCharge,
      transport: profile.transport !== undefined ? profile.transport : prev.transport,
      ewayBillNo: profile.ewayBillNo !== undefined ? profile.ewayBillNo : prev.ewayBillNo,
      airwayBillNo: profile.airwayBillNo !== undefined ? profile.airwayBillNo : prev.airwayBillNo,
      poNumberAndDate: profile.poNumberAndDate !== undefined ? profile.poNumberAndDate : prev.poNumberAndDate,
      noOfPackages: profile.noOfPackages !== undefined ? profile.noOfPackages : prev.noOfPackages,
      grossWeight: profile.grossWeight !== undefined ? profile.grossWeight : prev.grossWeight,
      transportName: profile.transportName !== undefined ? profile.transportName : prev.transportName,
      paidToPaid: profile.paidToPaid !== undefined ? profile.paidToPaid : prev.paidToPaid,
      referenceName: profile.referenceName !== undefined ? profile.referenceName : prev.referenceName,
      contactNumber: profile.contactNumber !== undefined ? profile.contactNumber : prev.contactNumber,
      termsAndConditions: profile.termsAndConditions || prev.termsAndConditions,
    }));

    if (Array.isArray(profile.items) && profile.items.length > 0) {
      setItems(profile.items);
    }
  };

  const handleSaveCurrentAsPreset = () => {
    const presetName = prompt('Enter a name for this template preset:', formData.buyerName ? `${formData.buyerName} Standard` : 'Custom Invoice Template');
    if (!presetName || !presetName.trim()) return;

    const payload = {
      name: presetName.trim(),
      category: 'Full Invoice Template',
      companyLogo: formData.companyLogo,
      companyDetails: {
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyCityPin: formData.companyCityPin,
        companyPan: formData.companyPan,
        companyGstin: formData.companyGstin,
        companyTel: formData.companyTel,
        companyEmail: formData.companyEmail,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        swiftCode: formData.swiftCode,
        branchName: formData.branchName,
      },
      buyer: {
        buyerName: formData.buyerName,
        buyerAddress: formData.buyerAddress,
        buyerState: formData.buyerState,
        buyerGstin: formData.buyerGstin,
      },
      consignee: {
        consigneeName: formData.consigneeName || formData.buyerName,
        consigneeAddress: formData.consigneeAddress || formData.buyerAddress,
        consigneeState: formData.consigneeState || formData.buyerState,
        consigneeGstin: formData.consigneeGstin || formData.buyerGstin,
      },
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate,
      placeOfSupply: formData.placeOfSupply,
      reverseCharge: formData.reverseCharge,
      transport: formData.transport,
      ewayBillNo: formData.ewayBillNo,
      airwayBillNo: formData.airwayBillNo,
      poNumberAndDate: formData.poNumberAndDate,
      noOfPackages: formData.noOfPackages,
      grossWeight: formData.grossWeight,
      transportName: formData.transportName,
      paidToPaid: formData.paidToPaid,
      referenceName: formData.referenceName,
      contactNumber: formData.contactNumber,
      termsAndConditions: formData.termsAndConditions,
      items: items,
    };

    saveBillingProfile(payload);
    refreshProfilesAndParties();
    alert(`Template "${presetName.trim()}" saved successfully!`);
  };

  const handleSelectBuyer = (buyerName) => {
    if (!buyerName) return;
    const found = savedBuyers.find((b) => b.name === buyerName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        buyerName: found.name,
        buyerAddress: found.address,
        buyerState: found.state || 'Maharashtra (27)',
        buyerGstin: found.gstin || '',
        referenceName: found.contactPerson || prev.referenceName,
        contactNumber: found.phone || prev.contactNumber,
      }));
    }
  };

  const handleSelectShipper = (shipperName) => {
    if (!shipperName) return;
    const found = savedShippers.find((s) => s.name === shipperName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        consigneeName: found.name,
        consigneeAddress: found.address,
        consigneeState: found.state || 'Maharashtra (27)',
        consigneeGstin: found.gstin || '',
      }));
    }
  };

  const handleSaveCurrentBuyer = () => {
    if (!formData.buyerName) {
      alert('Please enter a Buyer Company Name first.');
      return;
    }
    saveBuyer({
      name: formData.buyerName,
      address: formData.buyerAddress,
      state: formData.buyerState,
      gstin: formData.buyerGstin,
      contactPerson: formData.referenceName,
      phone: formData.contactNumber,
    });
    setSavedBuyers(getSavedBuyers());
    alert(`Saved "${formData.buyerName}" to Customer Directory!`);
  };

  const handleSaveCurrentShipper = () => {
    if (!formData.consigneeName) {
      alert('Please enter a Destination / Shipper Name first.');
      return;
    }
    saveShipper({
      name: formData.consigneeName,
      address: formData.consigneeAddress,
      state: formData.consigneeState,
      gstin: formData.consigneeGstin,
    });
    setSavedShippers(getSavedShippers());
    alert(`Saved "${formData.consigneeName}" to Destination Directory!`);
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };

      if (field === 'gstRate') {
        const rate = parseFloat(value) || 0;
        item.gstRate = rate;
        item.cgstRate = rate / 2;
        item.sgstRate = rate / 2;
        item.igstRate = 0;
      }

      next[index] = item;
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        sn: prev.length + 1,
        description: '',
        subText: '',
        hsnCode: '48191010',
        qty: 1,
        unit: 'Pcs',
        price: 0,
        gstRate: 5,
        cgstRate: 2.5,
        sgstRate: 2.5,
        igstRate: 0,
      },
    ]);
  };

  const duplicateItem = (index) => {
    setItems((prev) => {
      const copy = { ...prev[index], sn: prev.length + 1 };
      return [...prev, copy];
    });
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, sn: i + 1 })));
  };

  // Calculations
  let totalQty = 0;
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let grandTotal = 0;

  const taxSlabs = {};

  items.forEach((item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const taxable = qty * price;
    const cgstR = parseFloat(item.cgstRate) || 0;
    const sgstR = parseFloat(item.sgstRate) || 0;
    const igstR = parseFloat(item.igstRate) || 0;

    const cgstA = (taxable * cgstR) / 100;
    const sgstA = (taxable * sgstR) / 100;
    const igstA = (taxable * igstR) / 100;
    const lineTotal = taxable + cgstA + sgstA + igstA;

    totalQty += qty;
    totalTaxable += taxable;
    totalCGST += cgstA;
    totalSGST += sgstA;
    totalIGST += igstA;
    grandTotal += lineTotal;

    const slabKey = `${cgstR + sgstR + igstR}%`;
    if (!taxSlabs[slabKey]) {
      taxSlabs[slabKey] = { rate: cgstR + sgstR + igstR, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    }
    taxSlabs[slabKey].taxable += taxable;
    taxSlabs[slabKey].cgst += cgstA;
    taxSlabs[slabKey].sgst += sgstA;
    taxSlabs[slabKey].igst += igstA;
    taxSlabs[slabKey].total += (cgstA + sgstA + igstA);
  });

  const amountInWords = numberToIndianWords(grandTotal);
  const unitsSet = new Set(items.map((it) => (it.unit || 'Pcs').toLowerCase()));
  const totals = {
    totalQty,
    totalTaxable,
    totalCGST,
    totalSGST,
    totalIGST,
    grandTotal,
    taxSlabs,
    amountInWords,
    unitsSet,
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payloadData = {
        ...formData,
        items,
        totalQty,
        totalTaxable,
        totalCGST,
        totalSGST,
        totalIGST,
        grandTotal,
        amountInWords,
      };

      let resultDoc;
      if (isEdit) {
        resultDoc = await updateDocument(documentId, {
          title: `Tax Invoice ${formData.invoiceNumber}`,
          documentNumber: formData.invoiceNumber,
          status: formData.status,
          statusNote: `Status updated via Invoice Editor`,
          data: payloadData,
        });
      } else {
        resultDoc = await createDocument({
          documentType: 'TAX_INVOICE',
          documentNumber: formData.invoiceNumber,
          title: `Tax Invoice ${formData.invoiceNumber}`,
          data: payloadData,
        });
      }

      if (onSaved) {
        onSaved(resultDoc);
        return;
      }

      navigate('/billing');
    } catch (err) {
      alert('Failed to save document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPrint = async () => {
    setLoading(true);
    try {
      const payloadData = {
        ...formData,
        items,
        totalQty,
        totalTaxable,
        totalCGST,
        totalSGST,
        totalIGST,
        grandTotal,
        amountInWords,
      };

      let resultDoc;
      if (isEdit) {
        resultDoc = await updateDocument(documentId, {
          title: `Tax Invoice ${formData.invoiceNumber}`,
          documentNumber: formData.invoiceNumber,
          status: formData.status,
          statusNote: `Status updated via Invoice Editor`,
          data: payloadData,
        });
      } else {
        resultDoc = await createDocument({
          documentType: 'TAX_INVOICE',
          documentNumber: formData.invoiceNumber,
          title: `Tax Invoice ${formData.invoiceNumber}`,
          data: payloadData,
        });
      }

      const targetId = resultDoc?.id || documentId;
      if (targetId) {
        await printDocumentPDF(targetId);
      }
      
      if (onSaved) {
        onSaved(resultDoc);
        return;
      }

      navigate('/billing');
    } catch (err) {
      alert('Failed to save & print bill: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentId) {
      alert('Please save the invoice first to download its PDF.');
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadDocumentPDF(documentId, `${formData.invoiceNumber || 'Tax_Invoice'}.pdf`);
    } catch (err) {
      alert('Error downloading PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      setFormData((prev) => ({ ...prev, companyLogo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, companyLogo: null }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            onClick={() => {
              if (onCancel) onCancel();
              else navigate('/billing');
            }}
          >
            <ArrowLeft size={13} /> {isEmbedded ? 'Back to Bills Hub' : 'All Bills Hub'}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Receipt size={16} />
            </div>
            <h1 className="text-xl font-bold text-slate-100">
              {isEdit ? 'Edit' : 'New'} Tax Invoice Form
            </h1>
          </div>
          {isEdit && currentDocument && (
            <select
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              value={formData.status || currentDocument.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
            >
              <option value="DRAFT" className="bg-slate-900 text-slate-300">Draft</option>
              <option value="ISSUED" className="bg-slate-900 text-amber-400">Pending Payment</option>
              <option value="COMPLETED" className="bg-slate-900 text-emerald-400">Paid / Completed</option>
              <option value="CANCELLED" className="bg-slate-900 text-rose-400">Cancelled</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Save & Print Bill Action */}
          <Button
            variant="primary"
            loading={loading}
            onClick={handleSaveAndPrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs shadow-sm"
          >
            <Printer size={14} className="mr-1.5 inline" /> Save & Print Bill
          </Button>

          {isEdit && (
            <>
              <Button
                variant="secondary"
                onClick={() => setPreviewOpen(true)}
                className="rounded text-xs"
              >
                <Eye size={14} className="mr-1.5 inline" /> Preview PDF
              </Button>
              <Button
                variant="secondary"
                loading={downloadingPdf}
                onClick={handleDownload}
                className="rounded text-xs"
              >
                <Download size={14} className="mr-1.5 inline" /> Download PDF
              </Button>
            </>
          )}

          <Button variant="secondary" onClick={handleSave} loading={loading} className="rounded text-xs">
            <Save size={13} className="mr-1 inline" /> {isEdit ? 'Save Changes' : 'Save as Draft'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              if (onCancel) onCancel();
              else navigate('/billing');
            }}
            className="rounded text-xs"
          >
            {isEmbedded ? 'Close Form' : 'Cancel'}
          </Button>
        </div>
      </div>

      {/* Quick Template Selector & Mode Switcher */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-md p-3.5 space-y-3 shadow-sm">
        {/* Row 1: Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800">
            <button
              type="button"
              onClick={() => setEditorMode('VISUAL')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                editorMode === 'VISUAL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText size={13} />
              <span>Live Printable Sheet (WYSIWYG)</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('FORM')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                editorMode === 'FORM'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Structured Form Cards</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            {editorMode === 'VISUAL' ? 'Type directly into the invoice sheet below' : 'Edit through standard categorized form cards'}
          </span>
        </div>

        {/* Row 2: Preset Templates */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="text-indigo-400 flex items-center gap-1">
              <Zap size={13} /> Quick Auto-Fill Presets:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {savedProfiles.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className="px-2.5 py-1 text-xs bg-slate-800/90 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-700 text-slate-200 rounded transition-all font-medium flex items-center gap-1"
                onClick={() => applyProfile(tpl)}
              >
                <Zap size={11} className="text-amber-400" />
                <span>{tpl.name}</span>
              </button>
            ))}

            <button
              type="button"
              className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded transition-all font-semibold flex items-center gap-1"
              onClick={handleSaveCurrentAsPreset}
              title="Save current invoice details, buyer, items, bank info as a reusable template"
            >
              <Save size={12} />
              <span>Save as Template</span>
            </button>

            <button
              type="button"
              className="px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded transition-all font-semibold flex items-center gap-1 ml-auto"
              onClick={() => setTemplateManagerOpen(true)}
            >
              <Settings size={12} />
              <span>Manage Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER VIEW: VISUAL SHEET OR STRUCTURED FORM */}
      {editorMode === 'VISUAL' ? (
        <VisualTaxInvoiceSheet
          formData={formData}
          setFormData={setFormData}
          handleFieldChange={handleFieldChange}
          items={items}
          handleItemChange={handleItemChange}
          handleAddItem={addItem}
          handleRemoveItem={removeItem}
          totals={totals}
          savedBuyers={savedBuyers}
          savedShippers={savedShippers}
          handleSelectBuyer={handleSelectBuyer}
          handleSelectShipper={handleSelectShipper}
        />
      ) : (
        <div className="space-y-5">
        
        {/* LOGO & ISSUER BRANDING SECTION */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Image size={15} className="text-indigo-400" />
                <span>Company Logo & Branding</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload a custom PNG/JPG logo to show on the top-left of the Tax Invoice, or use the default DGR logo.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5">
                <Folder size={13} />
                <span>Upload Logo Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>

              {formData.companyLogo && (
                <button
                  type="button"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded text-xs border border-slate-700 transition-colors"
                  onClick={handleRemoveLogo}
                >
                  Reset to Default DGR Logo
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded border border-slate-700 bg-slate-950 flex items-center justify-center p-1 overflow-hidden shrink-0">
              {formData.companyLogo ? (
                <img
                  src={formData.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 font-mono">
                  DGR
                </div>
              )}
            </div>

            <div className="text-xs space-y-0.5">
              <div className="font-semibold text-slate-200">
                {formData.companyLogo ? 'Custom Logo Active' : 'Default DGR Vector Logo'}
              </div>
              <div className="text-slate-400 text-[11px]">
                {formData.companyLogo
                  ? 'This image will be rendered at the top-left header of the printed PDF invoice.'
                  : 'The standard circular DGR logo will be drawn on the invoice PDF.'}
              </div>
            </div>
          </div>
        </div>

        {/* 1. INVOICE & DISPATCH DETAILS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <FileText size={15} className="text-indigo-400" />
            <span>1. Invoice & Transport Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <Input
              label="Invoice Number *"
              value={formData.invoiceNumber}
              onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
              placeholder="e.g. DGR/0466/26-27"
              required
            />
            <Input
              label="Invoice Date *"
              value={formData.invoiceDate}
              onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}
              placeholder="DD-MM-YYYY"
              required
            />
            <Input
              label="Place of Supply"
              value={formData.placeOfSupply}
              onChange={(e) => handleFieldChange('placeOfSupply', e.target.value)}
              placeholder="Maharashtra (27)"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Reverse Charge</label>
              <select
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                value={formData.reverseCharge}
                onChange={(e) => handleFieldChange('reverseCharge', e.target.value)}
              >
                <option value="N">No (N)</option>
                <option value="Y">Yes (Y)</option>
              </select>
            </div>

            <Input
              label="Airway Bill No (AWB)"
              value={formData.airwayBillNo}
              onChange={(e) => handleFieldChange('airwayBillNo', e.target.value)}
              placeholder="e.g. 176-6268 0251"
            />
            <Input
              label="Transport Mode / Transport"
              value={formData.transport}
              onChange={(e) => handleFieldChange('transport', e.target.value)}
              placeholder="e.g. BY ROAD / AIR"
            />
            <Input
              label="E-Way Bill No."
              value={formData.ewayBillNo}
              onChange={(e) => handleFieldChange('ewayBillNo', e.target.value)}
              placeholder="e.g. 28109823901"
            />
            <Input
              label="P.O. No. & Date"
              value={formData.poNumberAndDate}
              onChange={(e) => handleFieldChange('poNumberAndDate', e.target.value)}
              placeholder="e.g. PO-9821 DT. 15-JUN-2026"
            />

            <Input
              label="No. of Packages"
              value={formData.noOfPackages}
              onChange={(e) => handleFieldChange('noOfPackages', e.target.value)}
              placeholder="e.g. 02 (01 BOX DG, 01 NON DG)"
            />
            <Input
              label="Gross Weight"
              value={formData.grossWeight}
              onChange={(e) => handleFieldChange('grossWeight', e.target.value)}
              placeholder="e.g. 50.00 KG"
            />
            <Input
              label="Transport Name"
              value={formData.transportName}
              onChange={(e) => handleFieldChange('transportName', e.target.value)}
              placeholder="e.g. Sai Warehouse & Transport"
            />
            <Input
              label="Paid / To-Paid"
              value={formData.paidToPaid}
              onChange={(e) => handleFieldChange('paidToPaid', e.target.value)}
              placeholder="e.g. PAID / TO-PAY"
            />

            <Input
              label="Reference Name"
              value={formData.referenceName}
              onChange={(e) => handleFieldChange('referenceName', e.target.value)}
              placeholder="e.g. Contact person or reference"
            />
            <Input
              label="Contact Number"
              value={formData.contactNumber}
              onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
              placeholder="e.g. +91 9326392294"
            />
            <Input
              label="Copy Type Label"
              value={formData.copyType}
              onChange={(e) => handleFieldChange('copyType', e.target.value)}
              placeholder="Original Copy"
            />
          </div>
        </div>

        {/* 2. BILLED TO & SHIPPED TO ADDRESSES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Billed To */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Building size={15} className="text-indigo-400" />
                <span>2. Billed To (Buyer / Customer)</span>
              </h2>
              <button
                type="button"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 px-2 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded hover:bg-emerald-900/40 transition-colors"
                onClick={handleSaveCurrentBuyer}
                title="Save current buyer details to saved customer directory"
              >
                <Save size={12} />
                <span>Save to Directory</span>
              </button>
            </div>

            {/* Search & Select Existing Customer */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <Building size={13} /> Select from Customer Directory:
                </span>
                <span className="text-[11px] text-slate-500">Auto-fills address & GSTIN</span>
              </div>
              <select
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                onChange={(e) => {
                  handleSelectBuyer(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Choose from Customer Directory ({savedBuyers.length} saved) --
                </option>
                {savedBuyers.map((b, idx) => (
                  <option key={idx} value={b.name}>
                    {b.name} {b.gstin ? `(${b.gstin})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Buyer Company Name *"
              value={formData.buyerName}
              onChange={(e) => handleFieldChange('buyerName', e.target.value)}
              placeholder="e.g. TAKAI CHEMTECH / DGR GLOBAL LOGISTICS"
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Buyer Address *</label>
              <textarea
                rows={3}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                value={formData.buyerAddress}
                onChange={(e) => handleFieldChange('buyerAddress', e.target.value)}
                placeholder="Full address of the buyer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="State"
                value={formData.buyerState}
                onChange={(e) => handleFieldChange('buyerState', e.target.value)}
                placeholder="Maharashtra (27)"
              />
              <Input
                label="GSTIN / UIN"
                value={formData.buyerGstin}
                onChange={(e) => handleFieldChange('buyerGstin', e.target.value)}
                placeholder="27AAMCT0922D1Z1"
              />
            </div>
          </div>

          {/* Shipped To */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Truck size={15} className="text-indigo-400" />
                <span>3. Shipped To (Delivery Destination)</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/30 rounded flex items-center gap-1"
                  onClick={handleSaveCurrentShipper}
                  title="Save current destination details to directory"
                >
                  <Save size={12} />
                  <span>Save Destination</span>
                </button>
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
                  onClick={() => {
                    setFormData((p) => ({
                      ...p,
                      consigneeName: p.buyerName,
                      consigneeAddress: p.buyerAddress,
                      consigneeState: p.buyerState,
                      consigneeGstin: p.buyerGstin,
                    }));
                  }}
                >
                  <Copy size={11} /> Copy Buyer
                </button>
              </div>
            </div>

            {/* Search & Select Existing Destination */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <Truck size={13} /> Select from Destination Directory:
                </span>
                <span className="text-[11px] text-slate-500">Auto-fills delivery info</span>
              </div>
              <select
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                onChange={(e) => {
                  handleSelectShipper(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Choose from saved destinations ({savedShippers.length} saved) --
                </option>
                {savedShippers.map((s, idx) => (
                  <option key={idx} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Consignee / Destination Name"
              value={formData.consigneeName}
              onChange={(e) => handleFieldChange('consigneeName', e.target.value)}
              placeholder="e.g. Delivery Warehouse or Buyer Name"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Delivery Address</label>
              <textarea
                rows={3}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                value={formData.consigneeAddress}
                onChange={(e) => handleFieldChange('consigneeAddress', e.target.value)}
                placeholder="Full delivery destination address"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="State"
                value={formData.consigneeState}
                onChange={(e) => handleFieldChange('consigneeState', e.target.value)}
                placeholder="Maharashtra (27)"
              />
              <Input
                label="GSTIN / UIN"
                value={formData.consigneeGstin}
                onChange={(e) => handleFieldChange('consigneeGstin', e.target.value)}
                placeholder="27AAMCT0922D1Z1"
              />
            </div>
          </div>
        </div>

        {/* 3. LINE ITEMS FORM TABLE */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Receipt size={15} className="text-indigo-400" />
                <span>4. Goods & Services Line Items</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add line items, quantities, rates, and GST % slabs. Tax and total amounts calculate in real-time.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={addItem} className="rounded text-xs">
              <Plus size={13} className="mr-1 inline" /> Add Item Row
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-800 rounded overflow-hidden">
              <thead className="bg-slate-950/90 text-slate-300 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5 min-w-[220px]">Description & Details</th>
                  <th className="p-2.5 w-24 text-center">HSN/SAC</th>
                  <th className="p-2.5 w-20 text-center">Qty</th>
                  <th className="p-2.5 w-20 text-center">Unit</th>
                  <th className="p-2.5 w-24 text-right">Price (₹)</th>
                  <th className="p-2.5 w-24 text-center">GST Rate</th>
                  <th className="p-2.5 w-24 text-right">Tax (₹)</th>
                  <th className="p-2.5 w-28 text-right">Total (₹)</th>
                  <th className="p-2.5 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {items.map((item, idx) => {
                  const qty = parseFloat(item.qty) || 0;
                  const price = parseFloat(item.price) || 0;
                  const taxable = qty * price;
                  const gstR = parseFloat(item.gstRate) || 0;
                  const taxAmt = (taxable * gstR) / 100;
                  const lineTotal = taxable + taxAmt;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-2 space-y-1">
                        <input
                          type="text"
                          className="w-full px-2.5 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                          placeholder="Description of Goods & Service"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full px-2 py-0.5 text-[11px] bg-slate-950/50 border border-slate-800 rounded text-slate-400 focus:outline-none focus:border-indigo-500"
                          placeholder="Sub-details (e.g. UN 3465/6.1/III, Box specs)"
                          value={item.subText || ''}
                          onChange={(e) => handleItemChange(idx, 'subText', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-200 text-center font-mono focus:outline-none focus:border-indigo-500"
                          placeholder="HSN"
                          value={item.hsnCode || ''}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          className="w-full px-2 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-200 text-center font-mono focus:outline-none focus:border-indigo-500"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          className="w-full px-1.5 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                          value={item.unit || 'Pcs'}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Box">Box</option>
                          <option value="Drum">Drum</option>
                          <option value="Nos">Nos</option>
                          <option value="KG">KG</option>
                          <option value="Trip">Trip</option>
                          <option value="Set">Set</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          className="w-full px-2 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-200 text-right font-mono focus:outline-none focus:border-indigo-500"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <GstRateSelect
                          className="w-full px-1.5 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-200 focus:outline-none focus:border-indigo-500 text-center font-medium text-xs"
                          value={item.gstRate}
                          onChange={(val) => handleItemChange(idx, 'gstRate', val)}
                          compact
                        />
                      </td>
                      <td className="p-2 text-right text-slate-300 font-mono">
                        ₹{formatINR(taxAmt)}
                      </td>
                      <td className="p-2 text-right text-slate-100 font-mono font-bold">
                        ₹{formatINR(lineTotal)}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Duplicate Row"
                            onClick={() => duplicateItem(idx)}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Row"
                            onClick={() => removeItem(idx)}
                            disabled={items.length <= 1}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. TOTALS & GST BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            {/* GST Tax Slabs Table */}
            <div className="bg-slate-950/70 border border-slate-800 rounded p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-300">GST Slab Breakdown</h3>
              <table className="w-full text-[11px] text-left border border-slate-800 rounded overflow-hidden">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-1.5">Tax Rate</th>
                    <th className="p-1.5 text-right">Taxable Amt</th>
                    <th className="p-1.5 text-right">CGST</th>
                    <th className="p-1.5 text-right">SGST</th>
                    <th className="p-1.5 text-right">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.values(taxSlabs).map((slab, i) => (
                    <tr key={i} className="text-slate-300">
                      <td className="p-1.5 font-medium">{slab.rate}%</td>
                      <td className="p-1.5 text-right font-mono">₹{formatINR(slab.taxable)}</td>
                      <td className="p-1.5 text-right font-mono">₹{formatINR(slab.cgst)}</td>
                      <td className="p-1.5 text-right font-mono">₹{formatINR(slab.sgst)}</td>
                      <td className="p-1.5 text-right font-mono font-semibold text-indigo-400">
                        ₹{formatINR(slab.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation Card */}
            <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Quantity:</span>
                  <span className="font-semibold text-slate-200">{totalQty.toFixed(2)} Pcs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxable Amount (Subtotal):</span>
                  <span className="font-mono text-slate-200">₹{formatINR(totalTaxable)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total CGST:</span>
                  <span className="font-mono text-slate-200">₹{formatINR(totalCGST)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total SGST:</span>
                  <span className="font-mono text-slate-200">₹{formatINR(totalSGST)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-400 text-base">₹{formatINR(grandTotal)}</span>
                </div>
              </div>
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300 font-medium">
                <span className="font-bold text-indigo-400">Amount In Words: </span>
                {amountInWords}
              </div>
            </div>
          </div>
        </div>

        {/* 5. ISSUER & BANK DETAILS (COLLAPSIBLE TOGGLE) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Building size={15} className="text-indigo-400" />
              <span>5. Issuer Company & Bank Details</span>
            </h2>
            <button
              type="button"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              onClick={() => setShowCompanyDetails(!showCompanyDetails)}
            >
              {showCompanyDetails ? 'Hide Details ▲' : 'Show / Edit Details ▼'}
            </button>
          </div>

          {showCompanyDetails && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                />
                <Input
                  label="GSTIN"
                  value={formData.companyGstin}
                  onChange={(e) => handleFieldChange('companyGstin', e.target.value)}
                />
                <Input
                  label="PAN"
                  value={formData.companyPan}
                  onChange={(e) => handleFieldChange('companyPan', e.target.value)}
                />
                <Input
                  label="Phone Number"
                  value={formData.companyTel}
                  onChange={(e) => handleFieldChange('companyTel', e.target.value)}
                />
                <Input
                  label="Email"
                  value={formData.companyEmail}
                  onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                />
                <Input
                  label="City & PIN"
                  value={formData.companyCityPin}
                  onChange={(e) => handleFieldChange('companyCityPin', e.target.value)}
                />
                <div className="md:col-span-2 lg:col-span-3">
                  <Input
                    label="Company Full Address"
                    value={formData.companyAddress}
                    onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => handleFieldChange('bankName', e.target.value)}
                />
                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                />
                <Input
                  label="RTGS / NEFT IFSC"
                  value={formData.ifscCode}
                  onChange={(e) => handleFieldChange('ifscCode', e.target.value)}
                />
                <Input
                  label="Swift Code"
                  value={formData.swiftCode}
                  onChange={(e) => handleFieldChange('swiftCode', e.target.value)}
                />
                <Input
                  label="Branch"
                  value={formData.branchName}
                  onChange={(e) => handleFieldChange('branchName', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <Button
            variant="secondary"
            onClick={() => {
              if (onCancel) onCancel();
              else navigate('/billing');
            }}
            className="rounded text-xs"
          >
            {isEmbedded ? 'Close Form' : 'Cancel'}
          </Button>

          <Button variant="secondary" onClick={handleSave} loading={loading} className="rounded text-xs">
            Save as Draft
          </Button>

          <Button
            variant="primary"
            loading={loading}
            onClick={handleSaveAndPrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 text-xs shadow-sm rounded"
          >
            <Printer size={14} className="mr-1.5 inline" /> Save & Print Bill
          </Button>
        </div>
      </div>
      )}

      {/* PDF Preview Modal */}
      {previewOpen && documentId && (
        <PdfPreviewModal
          isOpen={previewOpen}
          documentId={documentId}
          title={formData.invoiceNumber || 'Tax Invoice'}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* Template & Customer Directory Manager Modal */}
      {templateManagerOpen && (
        <BillingTemplateManagerModal
          isOpen={templateManagerOpen}
          onClose={() => {
            setTemplateManagerOpen(false);
            refreshProfilesAndParties();
          }}
          onSelectTemplate={(tpl) => {
            applyProfile(tpl);
            refreshProfilesAndParties();
          }}
        />
      )}
    </div>
  );
}
