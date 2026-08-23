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
  Image as ImageIcon,
  Building,
  Truck,
  Receipt,
  CheckCircle2,
  X,
  ArrowLeft,
  Copy,
  Package,
  Layers,
  Sparkles,
  QrCode,
  Landmark,
  Phone,
  User,
} from 'lucide-react';
import { useDocumentStore } from '../../store/documentStore';
import { downloadDocumentPDF, printDocumentPDF } from '../../services/documentService';
import {
  getSavedBillingProfiles,
  syncOnlineTemplates,
  saveBillingProfile,
  getSavedBuyers,
  saveBuyer,
  getSavedShippers,
  saveShipper,
  getSavedItemPresets,
  profileToEditorState,
} from '../../services/billingProfileService';
import BillingTemplateManagerModal from './BillingTemplateManagerModal';
import VisualTaxInvoiceSheet from './VisualTaxInvoiceSheet';
import PdfPreviewModal from '../ui/PdfPreviewModal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import GstRateSelect from '../ui/GstRateSelect';

export const INDIAN_GST_STATES = {
  '01': 'Jammu & Kashmir (01)',
  '02': 'Himachal Pradesh (02)',
  '03': 'Punjab (03)',
  '04': 'Chandigarh (04)',
  '05': 'Uttarakhand (05)',
  '06': 'Haryana (06)',
  '07': 'Delhi (07)',
  '08': 'Rajasthan (08)',
  '09': 'Uttar Pradesh (09)',
  '10': 'Bihar (10)',
  '11': 'Sikkim (11)',
  '12': 'Arunachal Pradesh (12)',
  '13': 'Nagaland (13)',
  '14': 'Manipur (14)',
  '15': 'Mizoram (15)',
  '16': 'Tripura (16)',
  '17': 'Meghalaya (17)',
  '18': 'Assam (18)',
  '19': 'West Bengal (19)',
  '20': 'Jharkhand (20)',
  '21': 'Odisha (21)',
  '22': 'Chhattisgarh (22)',
  '23': 'Madhya Pradesh (23)',
  '24': 'Gujarat (24)',
  '26': 'Daman & Diu and Dadra & Nagar Haveli (26)',
  '27': 'Maharashtra (27)',
  '29': 'Karnataka (29)',
  '30': 'Goa (30)',
  '31': 'Lakshadweep (31)',
  '32': 'Kerala (32)',
  '33': 'Tamil Nadu (33)',
  '34': 'Puducherry (34)',
  '35': 'Andaman & Nicobar Islands (35)',
  '36': 'Telangana (36)',
  '37': 'Andhra Pradesh (37)',
  '38': 'Ladakh (38)',
  '97': 'Other Territory (97)',
};

export const LOGISTICS_ITEM_PRESETS = [
  {
    id: 'box_x3',
    label: '+ UN Box X3 (4819)',
    description: 'UN APPROVED BOX X3',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Pcs',
    price: 110,
    gstRate: 5,
  },
  {
    id: 'box_x6',
    label: '+ UN Box X6 (4819)',
    description: 'UN APPROVED BOX X6',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Pcs',
    price: 160,
    gstRate: 5,
  },
  {
    id: 'box_x22',
    label: '+ UN Box X22 (4819)',
    description: 'UN APPROVED BOX X22',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Pcs',
    price: 270,
    gstRate: 5,
  },
  {
    id: 'box_x55',
    label: '+ UN Box X55 (4819)',
    description: 'UN APPROVED BOX X55',
    subText: 'UN Approved 4G Fibreboard Packaging Box',
    hsnCode: '48191010',
    unit: 'Box',
    price: 630,
    gstRate: 5,
  },
  {
    id: 'drum_y75',
    label: '+ UN Drum Y75 (3923)',
    description: 'UN APPROVED Y 75 OPEN TOP DRUM',
    subText: 'DG Packaging Open Top Plastic Drum',
    hsnCode: '39233090',
    unit: 'Pcs',
    price: 560,
    gstRate: 18,
  },
  {
    id: 'drum_y30',
    label: '+ UN Drum Y30 (3923)',
    description: 'UN APP MC Y 30 KG OPEN TOP PLASTIC DRUMS',
    subText: 'DG Packaging Open Top Plastic Drum',
    hsnCode: '39233090',
    unit: 'Drum',
    price: 600,
    gstRate: 18,
  },
  {
    id: 'dgd_charges',
    label: '+ IATA DGD Charges (9983)',
    description: 'Dangerous Goods Declaration (DGD) & Inspection',
    subText: 'IATA DG Documentation & Compliance',
    hsnCode: '998319',
    unit: 'Job',
    price: 1500,
    gstRate: 18,
  },
  {
    id: 'packing_charges',
    label: '+ DG Packing Fee (9967)',
    description: 'DG Cargo Repacking & Palletization Charges',
    subText: '',
    hsnCode: '996713',
    unit: 'Pcs',
    price: 800,
    gstRate: 18,
  },
  {
    id: 'air_freight',
    label: '+ Air Freight (9965)',
    description: 'Airline Master Freight Charges & Surcharges (FSC/SSC)',
    subText: 'Air Waybill Freight Logistics',
    hsnCode: '996511',
    unit: 'Shipment',
    price: 5000,
    gstRate: 18,
  },
  {
    id: 'transport_lr',
    label: '+ Transport / Cartage (9965)',
    description: 'Local Transport & Cartage Charges',
    subText: 'Delivery to Sahar Cargo / Bhiwandi',
    hsnCode: '996531',
    unit: 'Trip',
    price: 2500,
    gstRate: 18,
  },
  {
    id: 'terminal_tsp',
    label: '+ Terminal / TSP (9967)',
    description: 'Airport TSP & Terminal Handling Charges (MIAL/AAI)',
    subText: 'Air Cargo Complex Clearance',
    hsnCode: '996719',
    unit: 'Job',
    price: 2000,
    gstRate: 18,
  },
];

// Helper for Indian Currency Number to Words
export function numberToIndianWords(num) {
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

function getIndianStateFromGstin(gstin) {
  if (!gstin || typeof gstin !== 'string') return null;
  const clean = gstin.trim();
  if (clean.length >= 2) {
    const code = clean.substring(0, 2);
    return INDIAN_GST_STATES[code] || null;
  }
  return null;
}

function formatINR(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}



export default function TaxInvoiceEditor({ documentId, initialData, currentDocument, onSaved, onCancel, isEmbedded }) {
  const navigate = useNavigate();
  const { documents, createDocument, updateDocument, clearCurrent } = useDocumentStore();

  const isEdit = !!documentId;
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // Editor View Mode: 'VISUAL' (WYSIWYG Sheet) | 'FORM' (Standard Input Cards)
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'form' ? 'FORM' : 'VISUAL';
  const [editorMode, setEditorMode] = useState(initialMode);

  // Saved Profiles, Buyers, Shippers & Item Presets Directory State
  const [savedProfiles, setSavedProfiles] = useState(() => getSavedBillingProfiles());
  const [savedBuyers, setSavedBuyers] = useState(() => getSavedBuyers());
  const [savedShippers, setSavedShippers] = useState(() => getSavedShippers());
  const [savedItemPresets, setSavedItemPresets] = useState(() => getSavedItemPresets());
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);

  const refreshDirectories = () => {
    setSavedProfiles(getSavedBillingProfiles());
    setSavedBuyers(getSavedBuyers());
    setSavedShippers(getSavedShippers());
    setSavedItemPresets(getSavedItemPresets());
  };

  // Form State & Line Items State
  const [formData, setFormData] = useState(() => {
    const defaultProfile = savedProfiles && savedProfiles.length > 0 ? savedProfiles[0] : null;
    const d = documentId ? (initialData || currentDocument?.data || {}) : (initialData || {});
    const { formData: initialForm } = profileToEditorState(defaultProfile, d);
    return initialForm;
  });

  const [items, setItems] = useState(() => {
    const defaultProfile = savedProfiles && savedProfiles.length > 0 ? savedProfiles[0] : null;
    const d = documentId ? (initialData || currentDocument?.data || {}) : (initialData || {});
    const { items: initialItems } = profileToEditorState(defaultProfile, d);
    return initialItems;
  });

  useEffect(() => {
    if (documentId) {
      const loadedData = initialData || currentDocument?.data;
      if (loadedData && Object.keys(loadedData).length > 0) {
        const defaultProfile = savedProfiles && savedProfiles.length > 0 ? savedProfiles[0] : null;
        const { formData: mergedForm, items: mergedItems } = profileToEditorState(defaultProfile, loadedData);
        setFormData(mergedForm);
        if (Array.isArray(loadedData.items) && loadedData.items.length > 0) {
          setItems(loadedData.items);
        } else if (mergedItems && mergedItems.length > 0) {
          setItems(mergedItems);
        }
      }
    } else {
      const defaultProfile = savedProfiles && savedProfiles.length > 0 ? savedProfiles[0] : null;
      const { formData: defaultForm, items: defaultItems } = profileToEditorState(defaultProfile, initialData || {});
      setFormData(defaultForm);
      setItems(defaultItems);
    }
  }, [documentId, initialData, currentDocument, savedProfiles]);

  useEffect(() => {
    syncOnlineTemplates().then((fresh) => {
      if (fresh && fresh.length > 0) {
        setSavedProfiles(fresh);
      }
    });
  }, []);

  // Recalculate item tax rates based on taxType (INTRA_STATE vs INTER_STATE)
  const applyTaxTypeToItems = (taxType, currentItems) => {
    return currentItems.map((item) => {
      const gstRate = parseFloat(item.gstRate) || 0;
      if (taxType === 'INTRA_STATE') {
        return {
          ...item,
          cgstRate: gstRate / 2,
          sgstRate: gstRate / 2,
          igstRate: 0,
        };
      } else {
        return {
          ...item,
          cgstRate: 0,
          sgstRate: 0,
          igstRate: gstRate,
        };
      }
    });
  };

  const handleFieldChange = (field, val) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };

      // Auto-detect State & POS when Buyer GSTIN is changed
      if (field === 'buyerGstin') {
        const detectedState = getIndianStateFromGstin(val);
        if (detectedState) {
          updated.buyerState = detectedState;
          updated.placeOfSupply = detectedState;
        }
        const taxType = (val.startsWith('27') || !val) ? 'INTRA_STATE' : 'INTER_STATE';
        updated.taxType = taxType;
        setItems((itList) => applyTaxTypeToItems(taxType, itList));
      } else if (field === 'taxType') {
        setItems((itList) => applyTaxTypeToItems(val, itList));
      } else if (field === 'placeOfSupply') {
        const taxType = val.includes('(27)') ? 'INTRA_STATE' : 'INTER_STATE';
        updated.taxType = taxType;
        setItems((itList) => applyTaxTypeToItems(taxType, itList));
      }

      return updated;
    });
  };

  const applyProfile = (profile) => {
    if (!profile) return;
    const comp = profile.companyDetails || {};
    const buyer = profile.buyer || {};
    const cons = profile.consignee || {};

    const taxType = (buyer.buyerGstin?.startsWith('27') || !buyer.buyerGstin) ? 'INTRA_STATE' : 'INTER_STATE';

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
      taxType,
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
      setItems(applyTaxTypeToItems(taxType, profile.items));
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
      taxType: formData.taxType,
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
    refreshDirectories();
    alert(`Template "${presetName.trim()}" saved successfully!`);
  };

  const handleSelectBuyer = (buyerName) => {
    if (!buyerName) return;
    const found = savedBuyers.find((b) => b.name === buyerName);
    if (found) {
      const gstin = found.gstin || '';
      const state = found.state || getIndianStateFromGstin(gstin) || 'Maharashtra (27)';
      const taxType = (gstin.startsWith('27') || !gstin) ? 'INTRA_STATE' : 'INTER_STATE';

      setFormData((prev) => ({
        ...prev,
        buyerName: found.name,
        buyerAddress: found.address,
        buyerState: state,
        buyerGstin: gstin,
        placeOfSupply: state,
        taxType,
        referenceName: found.contactPerson || prev.referenceName,
        contactNumber: found.phone || prev.contactNumber,
      }));

      setItems((itList) => applyTaxTypeToItems(taxType, itList));
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
        if (formData.taxType === 'INTER_STATE') {
          item.cgstRate = 0;
          item.sgstRate = 0;
          item.igstRate = rate;
        } else {
          item.cgstRate = rate / 2;
          item.sgstRate = rate / 2;
          item.igstRate = 0;
        }
      }

      next[index] = item;
      return next;
    });
  };

  const handleAddPresetItem = (preset) => {
    const isInterState = formData.taxType === 'INTER_STATE';
    const gstRate = preset.gstRate || 18;
    setItems((prev) => [
      ...prev,
      {
        sn: prev.length + 1,
        description: preset.description,
        subText: preset.subText || '',
        hsnCode: preset.hsnCode || '9983',
        qty: 1,
        unit: preset.unit || 'Pcs',
        price: preset.price || 0,
        gstRate,
        cgstRate: isInterState ? 0 : gstRate / 2,
        sgstRate: isInterState ? 0 : gstRate / 2,
        igstRate: isInterState ? gstRate : 0,
      },
    ]);
  };

  const addItem = () => {
    const isInterState = formData.taxType === 'INTER_STATE';
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
        cgstRate: isInterState ? 0 : 2.5,
        sgstRate: isInterState ? 0 : 2.5,
        igstRate: isInterState ? 5 : 0,
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

    const totalRate = cgstR + sgstR + igstR;
    const slabKey = `${totalRate}%`;
    if (!taxSlabs[slabKey]) {
      taxSlabs[slabKey] = { rate: totalRate, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
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
          status: formData.status || 'ISSUED',
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
          status: formData.status || 'ISSUED',
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
    } catch (err) {
      alert('Failed to save and print invoice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentId) return;
    setDownloadingPdf(true);
    try {
      await downloadDocumentPDF(documentId, `Invoice_${formData.invoiceNumber || 'Document'}.pdf`);
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
    reader.onload = (ev) => {
      handleFieldChange('companyLogo', ev.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleFieldChange('companyLogo', null);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-sm">
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
              clearCurrent();
              if (onCancel) onCancel();
              else navigate('/billing');
            }}
            className="rounded text-xs"
          >
            {isEmbedded ? 'Close Form' : 'Cancel'}
          </Button>
        </div>
      </div>

      {/* Quick Template Selector & Fast-Add Item Presets Bar */}
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

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Tax Routing:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
              formData.taxType === 'INTRA_STATE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}>
              {formData.taxType === 'INTRA_STATE' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
            </span>
          </div>
        </div>

        {/* Row 2: 1-Click Fast-Add Freight & Packaging Item Presets */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Package size={13} className="text-amber-400" />
            <span>1-Click Add Freight & DG Packaging Items:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(savedItemPresets.length > 0 ? savedItemPresets : LOGISTICS_ITEM_PRESETS).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleAddPresetItem(preset)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-all flex items-center gap-1"
                title={`Add ${preset.description} (₹${preset.price})`}
              >
                <Plus size={11} className="text-indigo-400" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Preset Templates */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="text-indigo-400 flex items-center gap-1">
              <Zap size={13} /> Full Invoice Presets:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {savedProfiles.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700 text-slate-200 rounded transition-all font-medium flex items-center gap-1.5 cursor-pointer"
                onClick={() => applyProfile(tpl)}
              >
                <Zap size={11} className="text-amber-400" />
                <span>{tpl.name}</span>
              </button>
            ))}

            <button
              type="button"
              className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-all font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
              onClick={handleSaveCurrentAsPreset}
              title="Save current invoice details as a reusable template"
            >
              <Save size={12} />
              <span>Save as Template</span>
            </button>

            <button
              type="button"
              className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all font-semibold flex items-center gap-1 ml-auto cursor-pointer shadow-sm"
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
          itemPresets={savedItemPresets}
          handleSelectBuyer={handleSelectBuyer}
          handleSelectShipper={handleSelectShipper}
          handleAddPresetItem={handleAddPresetItem}
        />
      ) : (
        <div className="space-y-5">
          {/* LOGO & ISSUER BRANDING SECTION */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ImageIcon size={15} className="text-indigo-400" />
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
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Place of Supply (POS)</label>
                <select
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={formData.placeOfSupply}
                  onChange={(e) => handleFieldChange('placeOfSupply', e.target.value)}
                >
                  {Object.entries(INDIAN_GST_STATES).map(([code, name]) => (
                    <option key={code} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Tax Structure</label>
                <select
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={formData.taxType}
                  onChange={(e) => handleFieldChange('taxType', e.target.value)}
                >
                  <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                  <option value="INTER_STATE">Inter-State (IGST)</option>
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
                placeholder="e.g. BY ROAD / AIR / SEA"
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
                label="Transport Name / Vehicle #"
                value={formData.transportName}
                onChange={(e) => handleFieldChange('transportName', e.target.value)}
                placeholder="e.g. Sai Warehouse & Transport / MH-04-XX-1234"
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
                placeholder="e.g. Mayur Kadam"
              />
              <Input
                label="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                placeholder="e.g. 9028345261"
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
                  onChange={(e) => handleFieldChange('buyerGstin', e.target.value.toUpperCase())}
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
                placeholder="e.g. Sai Warehouse & Transport / Bhiwandi"
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
                  onChange={(e) => handleFieldChange('consigneeGstin', e.target.value.toUpperCase())}
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
                            className="w-full px-2 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-100 text-center font-mono focus:outline-none focus:border-indigo-500"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-200 text-center focus:outline-none focus:border-indigo-500"
                            placeholder="Pcs"
                            value={item.unit || 'Pcs'}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="any"
                            className="w-full px-2 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-slate-100 text-right font-mono focus:outline-none focus:border-indigo-500"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <select
                            className="w-full px-2 py-1 bg-slate-950/80 border border-slate-700/90 rounded text-xs text-slate-200 text-center focus:outline-none focus:border-indigo-500"
                            value={item.gstRate}
                            onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-mono text-slate-300 font-medium">
                          ₹{formatINR(taxAmt)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-100">
                          ₹{formatINR(lineTotal)}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
                              onClick={() => duplicateItem(idx)}
                              title="Duplicate row"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-rose-400 p-1 hover:bg-rose-900/20 rounded disabled:opacity-30"
                              disabled={items.length <= 1}
                              onClick={() => removeItem(idx)}
                              title="Remove item"
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
          </div>

          {/* 4. FINANCIAL TOTALS & GST BREAKDOWN */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-md p-4 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Receipt size={15} className="text-indigo-400" />
              <span>5. Tax Summary & Grand Total</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tax Slabs Summary */}
              <div className="p-3 bg-slate-950/80 rounded border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">GST Slab Breakdown:</div>
                <div className="grid grid-cols-5 gap-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800 pb-1">
                  <span>Rate</span>
                  <span className="text-right">Taxable</span>
                  <span className="text-right">CGST</span>
                  <span className="text-right">SGST</span>
                  <span className="text-right">Total Tax</span>
                </div>
                {Object.values(taxSlabs).map((slab, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 text-xs font-mono text-slate-200">
                    <span className="font-bold text-indigo-400">{slab.rate}%</span>
                    <span className="text-right">₹{formatINR(slab.taxable)}</span>
                    <span className="text-right">₹{formatINR(slab.cgst)}</span>
                    <span className="text-right">₹{formatINR(slab.sgst)}</span>
                    <span className="text-right font-bold text-slate-100">₹{formatINR(slab.total)}</span>
                  </div>
                ))}
              </div>

              {/* Grand Total Cards */}
              <div className="p-3 bg-slate-950/80 rounded border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Taxable Value:</span>
                  <span className="font-mono font-bold text-slate-200">₹{formatINR(totalTaxable)}</span>
                </div>
                {formData.taxType === 'INTER_STATE' ? (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total IGST:</span>
                    <span className="font-mono font-bold text-slate-200">₹{formatINR(totalIGST)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total CGST:</span>
                      <span className="font-mono font-bold text-slate-200">₹{formatINR(totalCGST)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total SGST:</span>
                      <span className="font-mono font-bold text-slate-200">₹{formatINR(totalSGST)}</span>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-100">Grand Total Invoice Value:</span>
                  <span className="font-mono font-extrabold text-indigo-400 text-lg">₹{formatINR(grandTotal)}</span>
                </div>
                <div className="text-[11px] italic text-slate-400 pt-1">
                  {amountInWords}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Manager Modal */}
      {templateManagerOpen && (
        <BillingTemplateManagerModal
          isOpen={templateManagerOpen}
          onClose={() => {
            setTemplateManagerOpen(false);
            refreshDirectories();
          }}
          onApplyProfile={(profile) => {
            applyProfile(profile);
            setTemplateManagerOpen(false);
          }}
        />
      )}

      {/* PDF Preview Modal */}
      {previewOpen && documentId && (
        <PdfPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          documentId={documentId}
          title={`Tax Invoice ${formData.invoiceNumber || ''}`}
        />
      )}
    </div>
  );
}
