import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  RotateCcw,
  Receipt,
  Plus,
  Building,
  Truck,
  Pencil,
  Trash2,
  Save,
  FileText,
  CheckCircle2,
  Image,
  Folder,
  Sparkles,
  X,
  Search,
  Zap,
  Copy,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import {
  getSavedBillingProfiles,
  saveBillingProfile,
  deleteBillingProfile,
  resetBillingProfilesToDefault,
  getSavedBuyers,
  saveBuyer,
  deleteBuyer,
  getSavedShippers,
  saveShipper,
  deleteShipper,
  getSavedVendors,
  saveVendor,
  deleteVendor,
  resetVendorsToDefault,
  getSavedItemPresets,
  saveItemPreset,
  deleteItemPreset,
  resetItemPresetsToDefault,
} from '../services/billingProfileService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GstRateSelect from '../components/ui/GstRateSelect';

export default function BillingTemplatesPage() {
  const navigate = useNavigate();

  // Active Tab: 'TEMPLATES' | 'ITEMS' | 'BUYERS' | 'SHIPPERS' | 'VENDORS'
  const [activeTab, setActiveTab] = useState('TEMPLATES');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data lists
  const [templates, setTemplates] = useState([]);
  const [itemPresets, setItemPresets] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Modal / Form Edit states
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [isEditingItemPreset, setIsEditingItemPreset] = useState(false);
  const [editingItemPreset, setEditingItemPreset] = useState(null);

  const [isEditingBuyer, setIsEditingBuyer] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);

  const [isEditingShipper, setIsEditingShipper] = useState(false);
  const [editingShipper, setEditingShipper] = useState(null);

  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Item Preset Form State
  const [itemPresetForm, setItemPresetForm] = useState({
    id: null,
    label: '',
    description: '',
    subText: '',
    hsnCode: '48191010',
    unit: 'Pcs',
    price: 0,
    gstRate: 18,
    category: 'PACKAGING',
  });

  // Vendor Form State
  const [vendorForm, setVendorForm] = useState({
    id: null,
    name: '',
    address: '',
    state: 'Maharashtra (27)',
    gstin: '',
    category: 'DGD',
    defaultGstRate: 18,
    defaultDescription: '',
    contactPerson: '',
    phone: '',
    email: '',
  });

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'Full Invoice Template',
    companyLogo: null,
    companyName: 'DGR PACKAGING COMPANY',
    companyAddress: 'SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)',
    companyCityPin: 'MUMBAI - 400 099',
    companyPan: 'CBKPK7600K',
    companyGstin: '27CBKPK7600K1ZE',
    companyTel: '022 - 26828108',
    companyEmail: 'dgrpackaging@gmail.com',
    buyerName: '',
    buyerAddress: '',
    buyerState: 'Maharashtra (27)',
    buyerGstin: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeState: 'Maharashtra (27)',
    consigneeGstin: '',
    bankName: 'HDFC BANK LTD',
    accountNumber: '06687630000070',
    ifscCode: 'HDFC0003126',
    swiftCode: 'HDFCINBBXXX',
    branchName: 'MAHAD-4',
    termsAndConditions: `1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.\n3. Discrepancy if any, in billed item must be communicated within 7 days.\n4. Subject to 'Maharashtra' Jurisdiction only.`,
    transport: 'BY ROAD',
    airwayBillNo: '',
    poNumberAndDate: '',
    noOfPackages: '',
    grossWeight: '',
    contactNumber: '',
    items: [
      { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 2, description: 'UN APPROVED BOX X6', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 160, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 3, description: 'UN APPROVED BOX X22', subText: '', hsnCode: '48191010', qty: 3, unit: 'Pcs', price: 270, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
    ],
  });

  // Buyer Form State
  const [buyerForm, setBuyerForm] = useState({
    id: null,
    name: '',
    address: '',
    state: 'Maharashtra (27)',
    gstin: '',
    contactPerson: '',
    phone: '',
    email: '',
  });

  // Shipper Form State
  const [shipperForm, setShipperForm] = useState({
    id: null,
    name: '',
    address: '',
    state: 'Maharashtra (27)',
    gstin: '',
    contactPerson: '',
    phone: '',
  });

  const loadAllData = () => {
    setTemplates(getSavedBillingProfiles());
    setItemPresets(getSavedItemPresets());
    setBuyers(getSavedBuyers());
    setShippers(getSavedShippers());
    setVendors(getSavedVendors());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // --------------------------------------------------------------------------
  // ITEM PRESETS DIRECTORY HANDLERS
  // --------------------------------------------------------------------------
  const handleStartCreateItemPreset = () => {
    setEditingItemPreset(null);
    setItemPresetForm({
      id: null,
      label: '',
      description: '',
      subText: '',
      hsnCode: '48191010',
      unit: 'Pcs',
      price: 0,
      gstRate: 18,
      category: 'PACKAGING',
    });
    setIsEditingItemPreset(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditItemPreset = (item) => {
    setEditingItemPreset(item);
    setItemPresetForm({ ...item });
    setIsEditingItemPreset(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveItemPreset = (e) => {
    e.preventDefault();
    if (!itemPresetForm.description) {
      alert('Please enter Item / Service Description.');
      return;
    }
    const label = itemPresetForm.label || `+ ${itemPresetForm.description} (${itemPresetForm.hsnCode || 'HSN'})`;
    saveItemPreset({
      ...itemPresetForm,
      label,
    });
    loadAllData();
    setIsEditingItemPreset(false);
    setEditingItemPreset(null);
    showNotification(`Item Preset "${itemPresetForm.description}" saved to directory!`);
  };

  const handleDeleteItemPreset = (id) => {
    if (window.confirm('Delete this item preset from directory?')) {
      deleteItemPreset(id);
      loadAllData();
      showNotification('Item preset removed from directory.');
    }
  };

  const handleResetItemPresets = () => {
    if (window.confirm('Reset all item presets to built-in standard logistics list?')) {
      resetItemPresetsToDefault();
      loadAllData();
      showNotification('Item presets restored to default.');
    }
  };

  // --------------------------------------------------------------------------
  // VENDOR / SUPPLIER DIRECTORY HANDLERS
  // --------------------------------------------------------------------------
  const handleStartCreateVendor = () => {
    setEditingVendor(null);
    setVendorForm({
      id: null,
      name: '',
      address: '',
      state: 'Maharashtra (27)',
      gstin: '',
      category: 'DGD',
      defaultGstRate: 18,
      defaultDescription: '',
      contactPerson: '',
      phone: '',
      email: '',
    });
    setIsEditingVendor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditVendor = (v) => {
    setEditingVendor(v);
    setVendorForm({ ...v });
    setIsEditingVendor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (!vendorForm.name) {
      alert('Please enter Vendor / Supplier Company Name.');
      return;
    }

    saveVendor(vendorForm);
    loadAllData();
    setIsEditingVendor(false);
    setEditingVendor(null);
    showNotification(`Vendor / Supplier "${vendorForm.name}" saved to directory!`);
  };

  const handleDeleteVendor = (id) => {
    if (window.confirm('Delete this vendor template from directory?')) {
      deleteVendor(id);
      loadAllData();
      showNotification('Vendor template removed from directory.');
    }
  };

  // --------------------------------------------------------------------------
  // TEMPLATE HANDLERS
  // --------------------------------------------------------------------------
  const handleStartCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      category: 'Full Invoice Template',
      companyLogo: null,
      companyName: 'DGR PACKAGING COMPANY',
      companyAddress: 'SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)',
      companyCityPin: 'MUMBAI - 400 099',
      companyPan: 'CBKPK7600K',
      companyGstin: '27CBKPK7600K1ZE',
      companyTel: '022 - 26828108',
      companyEmail: 'dgrpackaging@gmail.com',
      buyerName: '',
      buyerAddress: '',
      buyerState: 'Maharashtra (27)',
      buyerGstin: '',
      consigneeName: '',
      consigneeAddress: '',
      consigneeState: 'Maharashtra (27)',
      consigneeGstin: '',
      bankName: 'HDFC BANK LTD',
      accountNumber: '06687630000070',
      ifscCode: 'HDFC0003126',
      swiftCode: 'HDFCINBBXXX',
      branchName: 'MAHAD-4',
      termsAndConditions: `1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.\n3. Discrepancy if any, in billed item must be communicated within 7 days.\n4. Subject to 'Maharashtra' Jurisdiction only.`,
      transport: 'BY ROAD',
      airwayBillNo: '',
      poNumberAndDate: '',
      noOfPackages: '',
      grossWeight: '',
      contactNumber: '',
      items: [
        { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
        { sn: 2, description: 'UN APPROVED BOX X6', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 160, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
        { sn: 3, description: 'UN APPROVED BOX X22', subText: '', hsnCode: '48191010', qty: 3, unit: 'Pcs', price: 270, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      ],
    });
    setIsEditingTemplate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditTemplate = (p) => {
    setEditingTemplate(p);
    const comp = p.companyDetails || {};
    const buyer = p.buyer || {};
    const cons = p.consignee || {};

    setTemplateForm({
      name: p.name || '',
      category: p.category || 'Full Invoice Template',
      companyLogo: p.companyLogo || null,
      companyName: comp.companyName || 'DGR PACKAGING COMPANY',
      companyAddress: comp.companyAddress || '',
      companyCityPin: comp.companyCityPin || '',
      companyPan: comp.companyPan || '',
      companyGstin: comp.companyGstin || '',
      companyTel: comp.companyTel || '',
      companyEmail: comp.companyEmail || '',
      buyerName: buyer.buyerName || '',
      buyerAddress: buyer.buyerAddress || '',
      buyerState: buyer.buyerState || 'Maharashtra (27)',
      buyerGstin: buyer.buyerGstin || '',
      consigneeName: cons.consigneeName || '',
      consigneeAddress: cons.consigneeAddress || '',
      consigneeState: cons.consigneeState || 'Maharashtra (27)',
      consigneeGstin: cons.consigneeGstin || '',
      bankName: comp.bankName || 'HDFC BANK LTD',
      accountNumber: comp.accountNumber || '',
      ifscCode: comp.ifscCode || '',
      swiftCode: comp.swiftCode || '',
      branchName: comp.branchName || '',
      termsAndConditions: p.termsAndConditions || `1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.\n3. Discrepancy if any, in billed item must be communicated within 7 days.\n4. Subject to 'Maharashtra' Jurisdiction only.`,
      transport: p.transport || '',
      airwayBillNo: p.airwayBillNo || '',
      poNumberAndDate: p.poNumberAndDate || '',
      noOfPackages: p.noOfPackages || '',
      grossWeight: p.grossWeight || '',
      contactNumber: p.contactNumber || '',
      items: p.items && p.items.length > 0 ? p.items : [
        { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      ],
    });
    setIsEditingTemplate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTemplateForm((prev) => ({ ...prev, companyLogo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddTemplateItem = () => {
    setTemplateForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          sn: prev.items.length + 1,
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
      ],
    }));
  };

  const handleRemoveTemplateItem = (index) => {
    setTemplateForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleTemplateItemChange = (index, field, value) => {
    setTemplateForm((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = { ...nextItems[index], [field]: value };

      if (field === 'gstRate') {
        const rate = parseFloat(value) || 0;
        nextItems[index].cgstRate = rate / 2;
        nextItems[index].sgstRate = rate / 2;
        nextItems[index].igstRate = 0;
      }
      return { ...prev, items: nextItems };
    });
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!templateForm.name) {
      alert('Please enter a Template / Preset Name.');
      return;
    }

    const payload = {
      id: editingTemplate ? editingTemplate.id : undefined,
      name: templateForm.name,
      category: templateForm.category,
      companyLogo: templateForm.companyLogo,
      companyDetails: {
        companyName: templateForm.companyName,
        companyAddress: templateForm.companyAddress,
        companyCityPin: templateForm.companyCityPin,
        companyPan: templateForm.companyPan,
        companyGstin: templateForm.companyGstin,
        companyTel: templateForm.companyTel,
        companyEmail: templateForm.companyEmail,
        bankName: templateForm.bankName,
        accountNumber: templateForm.accountNumber,
        ifscCode: templateForm.ifscCode,
        swiftCode: templateForm.swiftCode,
        branchName: templateForm.branchName,
      },
      buyer: {
        buyerName: templateForm.buyerName,
        buyerAddress: templateForm.buyerAddress,
        buyerState: templateForm.buyerState,
        buyerGstin: templateForm.buyerGstin,
      },
      consignee: {
        consigneeName: templateForm.consigneeName || templateForm.buyerName,
        consigneeAddress: templateForm.consigneeAddress || templateForm.buyerAddress,
        consigneeState: templateForm.consigneeState || templateForm.buyerState,
        consigneeGstin: templateForm.consigneeGstin || templateForm.buyerGstin,
      },
      transport: templateForm.transport,
      airwayBillNo: templateForm.airwayBillNo,
      poNumberAndDate: templateForm.poNumberAndDate,
      noOfPackages: templateForm.noOfPackages,
      grossWeight: templateForm.grossWeight,
      contactNumber: templateForm.contactNumber,
      termsAndConditions: templateForm.termsAndConditions,
      items: templateForm.items,
    };

    saveBillingProfile(payload);
    loadAllData();
    setIsEditingTemplate(false);
    setEditingTemplate(null);
    showNotification(`Template "${templateForm.name}" saved successfully!`);
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteBillingProfile(id);
      loadAllData();
      showNotification('Template deleted successfully.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all templates to the original standard templates?')) {
      resetBillingProfilesToDefault();
      loadAllData();
      showNotification('Reset templates to default standard successfully!');
    }
  };

  const handleUseTemplate = (p) => {
    navigate('/documents/new/TAX_INVOICE', {
      state: {
        templateData: {
          ...p.companyDetails,
          ...p.buyer,
          ...p.consignee,
          companyLogo: p.companyLogo,
          items: p.items,
          invoiceNumber: p.invoiceNumber || 'DGR/0466/26-27',
          invoiceDate: p.invoiceDate || '27-06-2026',
        },
      },
    });
  };

  // --------------------------------------------------------------------------
  // BUYER DIRECTORY HANDLERS
  // --------------------------------------------------------------------------
  const handleStartCreateBuyer = () => {
    setEditingBuyer(null);
    setBuyerForm({
      id: null,
      name: '',
      address: '',
      state: 'Maharashtra (27)',
      gstin: '',
      contactPerson: '',
      phone: '',
      email: '',
    });
    setIsEditingBuyer(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditBuyer = (b) => {
    setEditingBuyer(b);
    setBuyerForm({ ...b });
    setIsEditingBuyer(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveBuyer = (e) => {
    e.preventDefault();
    if (!buyerForm.name) {
      alert('Please enter Buyer / Customer Company Name.');
      return;
    }

    saveBuyer(buyerForm);
    loadAllData();
    setIsEditingBuyer(false);
    setEditingBuyer(null);
    showNotification(`Customer "${buyerForm.name}" saved to directory!`);
  };

  const handleDeleteBuyer = (id) => {
    if (window.confirm('Delete this customer from directory?')) {
      deleteBuyer(id);
      loadAllData();
      showNotification('Customer removed from directory.');
    }
  };

  // --------------------------------------------------------------------------
  // SHIPPER / DESTINATION DIRECTORY HANDLERS
  // --------------------------------------------------------------------------
  const handleStartCreateShipper = () => {
    setEditingShipper(null);
    setShipperForm({
      id: null,
      name: '',
      address: '',
      state: 'Maharashtra (27)',
      gstin: '',
      contactPerson: '',
      phone: '',
    });
    setIsEditingShipper(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditShipper = (s) => {
    setEditingShipper(s);
    setShipperForm({ ...s });
    setIsEditingShipper(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveShipper = (e) => {
    e.preventDefault();
    if (!shipperForm.name) {
      alert('Please enter Shipper / Destination Name.');
      return;
    }

    saveShipper(shipperForm);
    loadAllData();
    setIsEditingShipper(false);
    setEditingShipper(null);
    showNotification(`Destination "${shipperForm.name}" saved to directory!`);
  };

  const handleDeleteShipper = (id) => {
    if (window.confirm('Delete this destination location from directory?')) {
      deleteShipper(id);
      loadAllData();
      showNotification('Destination removed from directory.');
    }
  };

  // Filtered lists
  const filteredTemplates = templates.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.buyer?.buyerName || '').toLowerCase().includes(q) ||
      (p.buyer?.buyerGstin || '').toLowerCase().includes(q) ||
      (p.companyDetails?.companyName || '').toLowerCase().includes(q)
    );
  });

  const filteredItemPresets = itemPresets.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.label || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.subText || '').toLowerCase().includes(q) ||
      (item.hsnCode || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );
  });

  const filteredBuyers = buyers.filter((b) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.name || '').toLowerCase().includes(q) ||
      (b.gstin || '').toLowerCase().includes(q) ||
      (b.address || '').toLowerCase().includes(q) ||
      (b.contactPerson || '').toLowerCase().includes(q)
    );
  });

  const filteredShippers = shippers.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q) ||
      (s.gstin || '').toLowerCase().includes(q)
    );
  });

  const filteredVendors = vendors.filter((v) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (v.name || '').toLowerCase().includes(q) ||
      (v.address || '').toLowerCase().includes(q) ||
      (v.gstin || '').toLowerCase().includes(q) ||
      (v.category || '').toLowerCase().includes(q) ||
      (v.defaultDescription || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bookmark size={17} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Billing Templates & Directory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage full invoice templates, cargo & packaging item presets, customer buyer profiles, delivery destinations, and vendor profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === 'TEMPLATES' && (
            <Button
              variant="secondary"
              onClick={handleResetDefaults}
              title="Reset standard templates to initial state"
              className="rounded text-xs"
            >
              <RotateCcw size={13} className="mr-1.5 inline" /> Reset Defaults
            </Button>
          )}

          {activeTab === 'ITEMS' && (
            <Button
              variant="secondary"
              onClick={handleResetItemPresets}
              title="Reset standard logistics items to initial state"
              className="rounded text-xs"
            >
              <RotateCcw size={13} className="mr-1.5 inline" /> Reset Items
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => navigate('/billing')}
            className="rounded text-xs"
          >
            <Receipt size={13} className="mr-1.5 inline" /> Bills Register
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/billing/purchases')}
            className="rounded text-xs"
          >
            <ShoppingBag size={13} className="mr-1.5 inline" /> Purchase Bills
          </Button>

          {activeTab === 'TEMPLATES' && (
            <Button
              variant="primary"
              onClick={handleStartCreateTemplate}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus size={13} className="mr-1.5 inline" /> New Template
            </Button>
          )}

          {activeTab === 'ITEMS' && (
            <Button
              variant="primary"
              onClick={handleStartCreateItemPreset}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus size={13} className="mr-1.5 inline" /> Add Item Preset
            </Button>
          )}

          {activeTab === 'BUYERS' && (
            <Button
              variant="primary"
              onClick={handleStartCreateBuyer}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus size={13} className="mr-1.5 inline" /> Add Customer
            </Button>
          )}

          {activeTab === 'SHIPPERS' && (
            <Button
              variant="primary"
              onClick={handleStartCreateShipper}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus size={13} className="mr-1.5 inline" /> Add Destination
            </Button>
          )}

          {activeTab === 'VENDORS' && (
            <Button
              variant="primary"
              onClick={handleStartCreateVendor}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus size={13} className="mr-1.5 inline" /> Add Vendor Template
            </Button>
          )}
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-md text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            className="text-emerald-400 hover:text-white font-bold text-xs"
            onClick={() => setSuccessMsg('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* DIRECTORY SECTION TABS */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'TEMPLATES'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          onClick={() => {
            setActiveTab('TEMPLATES');
            setIsEditingTemplate(false);
            setIsEditingItemPreset(false);
            setIsEditingBuyer(false);
            setIsEditingShipper(false);
            setIsEditingVendor(false);
          }}
        >
          <Zap size={14} className={activeTab === 'TEMPLATES' ? 'text-white' : 'text-amber-400'} />
          <span>Full Invoice Templates ({templates.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ITEMS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          onClick={() => {
            setActiveTab('ITEMS');
            setIsEditingTemplate(false);
            setIsEditingItemPreset(false);
            setIsEditingBuyer(false);
            setIsEditingShipper(false);
            setIsEditingVendor(false);
          }}
        >
          <Package size={14} className={activeTab === 'ITEMS' ? 'text-white' : 'text-amber-400'} />
          <span>Cargo & Packaging Items ({itemPresets.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'BUYERS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          onClick={() => {
            setActiveTab('BUYERS');
            setIsEditingTemplate(false);
            setIsEditingItemPreset(false);
            setIsEditingBuyer(false);
            setIsEditingShipper(false);
            setIsEditingVendor(false);
          }}
        >
          <Building size={14} className={activeTab === 'BUYERS' ? 'text-white' : 'text-indigo-400'} />
          <span>Customer Directory (Billed To) ({buyers.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'SHIPPERS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          onClick={() => {
            setActiveTab('SHIPPERS');
            setIsEditingTemplate(false);
            setIsEditingItemPreset(false);
            setIsEditingBuyer(false);
            setIsEditingShipper(false);
            setIsEditingVendor(false);
          }}
        >
          <Truck size={14} className={activeTab === 'SHIPPERS' ? 'text-white' : 'text-emerald-400'} />
          <span>Delivery Destinations (Shipped To) ({shippers.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'VENDORS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          onClick={() => {
            setActiveTab('VENDORS');
            setIsEditingTemplate(false);
            setIsEditingItemPreset(false);
            setIsEditingBuyer(false);
            setIsEditingShipper(false);
            setIsEditingVendor(false);
          }}
        >
          <ShoppingBag size={14} className={activeTab === 'VENDORS' ? 'text-white' : 'text-purple-400'} />
          <span>Vendor & Expense Profiles ({vendors.length})</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-md p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {activeTab === 'TEMPLATES' && `Showing ${filteredTemplates.length} of ${templates.length} templates`}
          {activeTab === 'ITEMS' && `Showing ${filteredItemPresets.length} of ${itemPresets.length} item presets`}
          {activeTab === 'BUYERS' && `Showing ${filteredBuyers.length} of ${buyers.length} customers`}
          {activeTab === 'SHIPPERS' && `Showing ${filteredShippers.length} of ${shippers.length} destinations`}
          {activeTab === 'VENDORS' && `Showing ${filteredVendors.length} of ${vendors.length} vendor templates`}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FULL INVOICE TEMPLATES */}
      {/* ========================================================================= */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          {/* Template Edit Form */}
          {isEditingTemplate && (
            <div className="p-5 bg-slate-900/95 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  <span>{editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Billing Template'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
                  onClick={() => setIsEditingTemplate(false)}
                >
                  <X size={13} /> Close
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-5">
                {/* Logo & Preset Name */}
                <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Image size={14} className="text-indigo-400" /> Template Logo & Branding
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <Input
                      label="Template / Preset Name *"
                      placeholder="e.g. Takai Chemtech Regular DG Order"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      required
                    />

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded border border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                        {templateForm.companyLogo ? (
                          <img src={templateForm.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-xs text-slate-400">DGR</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold inline-block">
                          Upload Custom Logo
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        {templateForm.companyLogo && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setTemplateForm((p) => ({ ...p, companyLogo: null }))}
                              className="text-[11px] text-rose-400 hover:underline font-semibold"
                            >
                              Reset Logo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company / Seller Info */}
                <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Building size={14} className="text-indigo-400" /> Issuer / Seller Company Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Company Name *"
                      value={templateForm.companyName}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyName: e.target.value })}
                      required
                    />
                    <Input
                      label="PAN Number"
                      value={templateForm.companyPan}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyPan: e.target.value })}
                    />
                    <Input
                      label="GSTIN *"
                      value={templateForm.companyGstin}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyGstin: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Address Line"
                      value={templateForm.companyAddress}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyAddress: e.target.value })}
                    />
                    <Input
                      label="City - PIN"
                      value={templateForm.companyCityPin}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyCityPin: e.target.value })}
                    />
                    <Input
                      label="Phone / Email"
                      value={templateForm.companyTel}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyTel: e.target.value })}
                    />
                  </div>
                </div>

                {/* Buyer and Consignee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Buyer */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} className="text-indigo-400" /> Default Buyer (Billed To)
                      </h3>
                      {buyers.length > 0 && (
                        <select
                          className="text-xs bg-slate-900 border border-slate-700 text-indigo-300 rounded px-2 py-1 outline-none hover:border-indigo-500 focus:border-indigo-500 font-medium max-w-[210px] truncate"
                          value=""
                          onChange={(e) => {
                            const found = buyers.find((b) => b.id === e.target.value || b.name === e.target.value);
                            if (found) {
                              setTemplateForm((prev) => ({
                                ...prev,
                                buyerName: found.name || '',
                                buyerAddress: found.address || '',
                                buyerState: found.state || 'Maharashtra (27)',
                                buyerGstin: found.gstin || '',
                                contactNumber: found.phone || prev.contactNumber,
                              }));
                            }
                          }}
                        >
                          <option value="" disabled>-- Pick from Customer Directory ({buyers.length}) --</option>
                          {buyers.map((b, i) => (
                            <option key={b.id || i} value={b.id || b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <Input
                      label="Buyer Name"
                      placeholder="e.g. DGR GLOBAL LOGISTICS"
                      value={templateForm.buyerName}
                      onChange={(e) => setTemplateForm({ ...templateForm, buyerName: e.target.value })}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-medium">Billing Address</label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                        placeholder="Full billing address..."
                        value={templateForm.buyerAddress}
                        onChange={(e) => setTemplateForm({ ...templateForm, buyerAddress: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="State"
                        value={templateForm.buyerState}
                        onChange={(e) => setTemplateForm({ ...templateForm, buyerState: e.target.value })}
                      />
                      <Input
                        label="GSTIN"
                        placeholder="e.g. 27NSAPK0224B1Z7"
                        value={templateForm.buyerGstin}
                        onChange={(e) => setTemplateForm({ ...templateForm, buyerGstin: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Consignee */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Truck size={14} className="text-indigo-400" /> Default Consignee (Shipped To)
                      </h3>
                      <div className="flex items-center gap-2">
                        {shippers.length > 0 && (
                          <select
                            className="text-xs bg-slate-900 border border-slate-700 text-emerald-300 rounded px-2 py-1 outline-none hover:border-emerald-500 focus:border-emerald-500 font-medium max-w-[170px] truncate"
                            value=""
                            onChange={(e) => {
                              const found = shippers.find((s) => s.id === e.target.value || s.name === e.target.value);
                              if (found) {
                                setTemplateForm((prev) => ({
                                  ...prev,
                                  consigneeName: found.name || '',
                                  consigneeAddress: found.address || '',
                                  consigneeState: found.state || 'Maharashtra (27)',
                                  consigneeGstin: found.gstin || '',
                                }));
                              }
                            }}
                          >
                            <option value="" disabled>-- Pick Destination ({shippers.length}) --</option>
                            {shippers.map((s, i) => (
                              <option key={s.id || i} value={s.id || s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                          onClick={() =>
                            setTemplateForm({
                              ...templateForm,
                              consigneeName: templateForm.buyerName,
                              consigneeAddress: templateForm.buyerAddress,
                              consigneeState: templateForm.buyerState,
                              consigneeGstin: templateForm.buyerGstin,
                            })
                          }
                        >
                          <Copy size={11} /> Copy Buyer
                        </button>
                      </div>
                    </div>
                    <Input
                      label="Destination Name"
                      placeholder="e.g. DGR GLOBAL LOGISTICS"
                      value={templateForm.consigneeName}
                      onChange={(e) => setTemplateForm({ ...templateForm, consigneeName: e.target.value })}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-medium">Delivery Address</label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                        value={templateForm.consigneeAddress}
                        onChange={(e) => setTemplateForm({ ...templateForm, consigneeAddress: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="State"
                        value={templateForm.consigneeState}
                        onChange={(e) => setTemplateForm({ ...templateForm, consigneeState: e.target.value })}
                      />
                      <Input
                        label="GSTIN"
                        value={templateForm.consigneeGstin}
                        onChange={(e) => setTemplateForm({ ...templateForm, consigneeGstin: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Default Line Items */}
                <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} className="text-indigo-400" /> Default Goods & Services Line Items (Preset Items & UN Boxes)
                    </h3>
                    <Button size="sm" variant="secondary" onClick={handleAddTemplateItem} className="rounded text-xs">
                      <Plus size={13} className="mr-1 inline" /> Add Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {templateForm.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-400">#{idx + 1}</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                            onClick={() => handleRemoveTemplateItem(idx)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Description (e.g. UN APPROVED BOX X3)"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500"
                            value={item.description}
                            onChange={(e) => handleTemplateItemChange(idx, 'description', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Sub-text / UN Spec (e.g. UN 3465/6.1/III)"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-500"
                            value={item.subText || ''}
                            onChange={(e) => handleTemplateItemChange(idx, 'subText', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                          <input
                            type="text"
                            placeholder="HSN/SAC (e.g. 48191010)"
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100"
                            value={item.hsnCode}
                            onChange={(e) => handleTemplateItemChange(idx, 'hsnCode', e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100"
                            value={item.qty}
                            onChange={(e) => handleTemplateItemChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                          />
                          <input
                            type="text"
                            placeholder="Unit (Pcs, Box, Trip)"
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100"
                            value={item.unit || 'Pcs'}
                            onChange={(e) => handleTemplateItemChange(idx, 'unit', e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100"
                            value={item.price}
                            onChange={(e) => handleTemplateItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          />
                          <div>
                            <GstRateSelect
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 font-medium"
                              value={item.gstRate}
                              onChange={(val) => handleTemplateItemChange(idx, 'gstRate', val)}
                              compact
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={14} className="text-indigo-400" /> Bank Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Bank Name"
                      value={templateForm.bankName}
                      onChange={(e) => setTemplateForm({ ...templateForm, bankName: e.target.value })}
                    />
                    <Input
                      label="Account Number"
                      value={templateForm.accountNumber}
                      onChange={(e) => setTemplateForm({ ...templateForm, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="RTGS / NEFT / IFSC"
                      value={templateForm.ifscCode}
                      onChange={(e) => setTemplateForm({ ...templateForm, ifscCode: e.target.value })}
                    />
                    <Input
                      label="Swift Code"
                      value={templateForm.swiftCode}
                      onChange={(e) => setTemplateForm({ ...templateForm, swiftCode: e.target.value })}
                    />
                    <Input
                      label="Branch Name"
                      value={templateForm.branchName}
                      onChange={(e) => setTemplateForm({ ...templateForm, branchName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Default Terms & Conditions */}
                <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} className="text-indigo-400" /> Default Terms & Conditions
                  </h3>
                  <textarea
                    rows={4}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                    value={templateForm.termsAndConditions}
                    onChange={(e) => setTemplateForm({ ...templateForm, termsAndConditions: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsEditingTemplate(false)} className="rounded text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    <Save size={13} className="mr-1.5 inline" /> Save Template Profile
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Templates Grid with Logo and Full Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((p) => {
              const buyer = p.buyer || {};
              const cons = p.consignee || {};
              const comp = p.companyDetails || {};
              const itemsList = p.items || [];

              return (
                <div
                  key={p.id}
                  className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3.5 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header with Logo */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded border border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
                        {p.companyLogo ? (
                          <img src={p.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-xs text-indigo-400 font-mono">DGR</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Zap size={13} className="text-amber-400 shrink-0" />
                          <h3 className="font-bold text-slate-100 text-xs truncate">{p.name}</h3>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          Issuer: <span className="text-slate-300 font-semibold">{comp.companyName || 'DGR PACKAGING COMPANY'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer & Destination Details */}
                    <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 font-medium">Billed To: </span>
                        <span className="font-semibold text-slate-200">{buyer.buyerName || 'Unspecified'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        <span className="text-slate-500">GSTIN: </span>
                        <span className="font-mono text-indigo-300 font-bold">{buyer.buyerGstin || '-'}</span>
                      </div>
                      {cons.consigneeName && (
                        <div className="text-[11px] text-slate-400 truncate">
                          <span className="text-slate-500">Shipped To: </span>
                          <span>{cons.consigneeName}</span>
                        </div>
                      )}
                      {itemsList.length > 0 && (
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className="text-slate-500">Items: </span>
                          <span className="text-slate-300 font-mono text-[10px]">
                            {itemsList.map((it) => `${it.description || 'Item'} (${it.gstRate || 0}% GST)`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1.5 shadow-sm"
                      onClick={() => handleUseTemplate(p)}
                    >
                      <Zap size={13} />
                      <span>Create Bill</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                        onClick={() => handleStartEditTemplate(p)}
                        title="Edit Template"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        onClick={() => handleDeleteTemplate(p.id)}
                        title="Delete Template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CARGO & LOGISTICS ITEM PRESETS */}
      {/* ========================================================================= */}
      {activeTab === 'ITEMS' && (
        <div className="space-y-6">
          {/* Item Preset Create / Edit Card */}
          {isEditingItemPreset && (
            <div className="p-5 bg-slate-900/95 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Package size={16} className="text-amber-400" />
                  <span>{editingItemPreset ? `Edit Item Preset: ${editingItemPreset.description}` : 'Add New Item Preset'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
                  onClick={() => setIsEditingItemPreset(false)}
                >
                  <X size={13} /> Close
                </button>
              </div>

              <form onSubmit={handleSaveItemPreset} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Input
                    label="Item / Service Description *"
                    placeholder="e.g. UN APPROVED BOX X3"
                    value={itemPresetForm.description}
                    onChange={(e) => setItemPresetForm({ ...itemPresetForm, description: e.target.value })}
                    required
                  />

                  <Input
                    label="Fast-Add Button Label"
                    placeholder="e.g. + UN Box X3 (4819)"
                    value={itemPresetForm.label}
                    onChange={(e) => setItemPresetForm({ ...itemPresetForm, label: e.target.value })}
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Service / Logistics Category</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={itemPresetForm.category}
                      onChange={(e) => setItemPresetForm({ ...itemPresetForm, category: e.target.value })}
                    >
                      <option value="PACKAGING">PACKAGING (UN Boxes, Drums, Shrink Wrap)</option>
                      <option value="DOCUMENTATION">DOCUMENTATION (IATA DGD, IMO DGD)</option>
                      <option value="FREIGHT">FREIGHT (Air / Ocean Freight Charges)</option>
                      <option value="TRANSPORT">TRANSPORT (Cartage, Road Transport)</option>
                      <option value="CLEARANCE">CLEARANCE (Airport TSP, Customs CHA)</option>
                      <option value="WAREHOUSE">WAREHOUSE (Palletization, Storage)</option>
                      <option value="OTHER">OTHER SERVICE</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Sub-Text / Technical Specs</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500"
                    placeholder="e.g. UN Approved 4G Fibreboard Packaging Box or UN 3465/6.1/III"
                    value={itemPresetForm.subText}
                    onChange={(e) => setItemPresetForm({ ...itemPresetForm, subText: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="HSN / SAC Code *"
                    placeholder="e.g. 48191010 or 998319"
                    value={itemPresetForm.hsnCode}
                    onChange={(e) => setItemPresetForm({ ...itemPresetForm, hsnCode: e.target.value })}
                    required
                  />

                  <Input
                    label="Unit of Measurement"
                    placeholder="e.g. Pcs, Box, Drum, Job, Trip"
                    value={itemPresetForm.unit}
                    onChange={(e) => setItemPresetForm({ ...itemPresetForm, unit: e.target.value })}
                  />

                  <Input
                    label="Default Unit Price (₹)"
                    type="number"
                    step="any"
                    placeholder="e.g. 110.00"
                    value={itemPresetForm.price}
                    onChange={(e) => setItemPresetForm({ ...itemPresetForm, price: e.target.value })}
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">GST Rate %</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={itemPresetForm.gstRate}
                      onChange={(e) => setItemPresetForm({ ...itemPresetForm, gstRate: parseFloat(e.target.value) || 0 })}
                    >
                      <option value="0">0% (Nil / Exempt)</option>
                      <option value="5">5% (UN Boxes)</option>
                      <option value="12">12%</option>
                      <option value="18">18% (DGD, Drums & Freight)</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsEditingItemPreset(false)} className="rounded text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    <Save size={13} className="mr-1.5 inline" /> Save Item Preset
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItemPresets.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3.5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Package size={14} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-xs leading-tight">{item.description}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-300 rounded border border-amber-500/30 font-medium">
                          {item.category || 'PACKAGING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/80">
                    {item.subText && (
                      <div className="text-[11px] text-slate-400 italic">
                        {item.subText}
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">HSN / SAC: </span>
                      <span className="font-mono text-indigo-300 font-bold">{item.hsnCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Default Price: </span>
                      <span className="font-mono font-bold text-slate-100">₹{(parseFloat(item.price) || 0).toFixed(2)} / {item.unit || 'Pcs'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">GST Slab: </span>
                      <span className="font-mono font-semibold text-emerald-400">{item.gstRate || 0}% GST</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1"
                    onClick={() => {
                      navigate('/documents/new/TAX_INVOICE');
                    }}
                  >
                    <Plus size={13} />
                    <span>Use in Invoice</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleStartEditItemPreset(item)}
                      title="Edit Item Preset"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleDeleteItemPreset(item.id)}
                      title="Delete Item Preset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMER / BUYER DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'BUYERS' && (
        <div className="space-y-6">
          {/* Buyer Create / Edit Card */}
          {isEditingBuyer && (
            <div className="p-5 bg-slate-900/95 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Building size={16} className="text-indigo-400" />
                  <span>{editingBuyer ? `Edit Customer: ${editingBuyer.name}` : 'Add New Customer Profile'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
                  onClick={() => setIsEditingBuyer(false)}
                >
                  <X size={13} /> Close
                </button>
              </div>

              <form onSubmit={handleSaveBuyer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Customer / Buyer Company Name *"
                    placeholder="e.g. TAKAI CHEMTECH INTERNATIONAL PVT LTD"
                    value={buyerForm.name}
                    onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="GSTIN / UIN *"
                    placeholder="e.g. 27AAMCT0922D1Z1"
                    value={buyerForm.gstin}
                    onChange={(e) => setBuyerForm({ ...buyerForm, gstin: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Full Billing Address *</label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                    placeholder="Company address for Tax Invoices"
                    value={buyerForm.address}
                    onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="State / Place of Supply"
                    value={buyerForm.state}
                    onChange={(e) => setBuyerForm({ ...buyerForm, state: e.target.value })}
                  />
                  <Input
                    label="Contact Person / Ref"
                    placeholder="e.g. Mr Sunil"
                    value={buyerForm.contactPerson}
                    onChange={(e) => setBuyerForm({ ...buyerForm, contactPerson: e.target.value })}
                  />
                  <Input
                    label="Contact Phone"
                    placeholder="e.g. +91 9326392294"
                    value={buyerForm.phone}
                    onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsEditingBuyer(false)} className="rounded text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    <Save size={13} className="mr-1.5 inline" /> Save Customer to Directory
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Customers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuyers.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3.5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Building size={14} />
                      </div>
                      <h3 className="font-bold text-slate-100 text-xs leading-tight">{b.name}</h3>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 font-medium">GSTIN: </span>
                      <span className="font-mono text-indigo-300 font-bold">{b.gstin || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">State: </span>
                      <span className="text-slate-300">{b.state || 'Maharashtra (27)'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      <span className="text-slate-500">Address: </span>
                      <span>{b.address ? b.address.replace(/\n/g, ', ') : '-'}</span>
                    </div>
                    {b.contactPerson && (
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500">Contact: </span>
                        <span>{b.contactPerson} {b.phone ? `(${b.phone})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1"
                    onClick={() => {
                      navigate('/documents/new/TAX_INVOICE', {
                        state: {
                          templateData: {
                            buyerName: b.name,
                            buyerAddress: b.address,
                            buyerState: b.state,
                            buyerGstin: b.gstin,
                            referenceName: b.contactPerson || '',
                            contactNumber: b.phone || '',
                          },
                        },
                      });
                    }}
                  >
                    <Plus size={13} />
                    <span>Bill this Customer</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleStartEditBuyer(b)}
                      title="Edit Customer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleDeleteBuyer(b.id)}
                      title="Delete Customer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SHIPPERS & DESTINATIONS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'SHIPPERS' && (
        <div className="space-y-6">
          {/* Destination Create / Edit Card */}
          {isEditingShipper && (
            <div className="p-5 bg-slate-900/95 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Truck size={16} className="text-indigo-400" />
                  <span>{editingShipper ? `Edit Destination: ${editingShipper.name}` : 'Add New Delivery Destination'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
                  onClick={() => setIsEditingShipper(false)}
                >
                  <X size={13} /> Close
                </button>
              </div>

              <form onSubmit={handleSaveShipper} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Destination / Warehouse Name *"
                    placeholder="e.g. Sai Warehouse & Transport / Bhiwandi Site"
                    value={shipperForm.name}
                    onChange={(e) => setShipperForm({ ...shipperForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="GSTIN / UIN"
                    placeholder="e.g. 27AAECE7206P1Z9"
                    value={shipperForm.gstin}
                    onChange={(e) => setShipperForm({ ...shipperForm, gstin: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Delivery Destination Address *</label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                    placeholder="Full physical delivery location address"
                    value={shipperForm.address}
                    onChange={(e) => setShipperForm({ ...shipperForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="State"
                    value={shipperForm.state}
                    onChange={(e) => setShipperForm({ ...shipperForm, state: e.target.value })}
                  />
                  <Input
                    label="Site Contact Person"
                    placeholder="e.g. Mr Ramesh"
                    value={shipperForm.contactPerson}
                    onChange={(e) => setShipperForm({ ...shipperForm, contactPerson: e.target.value })}
                  />
                  <Input
                    label="Site Phone"
                    placeholder="e.g. +91 9820011223"
                    value={shipperForm.phone}
                    onChange={(e) => setShipperForm({ ...shipperForm, phone: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsEditingShipper(false)} className="rounded text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    <Save size={13} className="mr-1.5 inline" /> Save Destination to Directory
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Shippers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShippers.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3.5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Truck size={14} />
                      </div>
                      <h3 className="font-bold text-slate-100 text-xs leading-tight">{s.name}</h3>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 font-medium">GSTIN: </span>
                      <span className="font-mono text-indigo-300 font-bold">{s.gstin || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">State: </span>
                      <span className="text-slate-300">{s.state || 'Maharashtra (27)'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      <span className="text-slate-500">Address: </span>
                      <span>{s.address ? s.address.replace(/\n/g, ', ') : '-'}</span>
                    </div>
                    {s.contactPerson && (
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500">Contact: </span>
                        <span>{s.contactPerson} {s.phone ? `(${s.phone})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-200 hover:text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1"
                    onClick={() => {
                      navigate('/documents/new/TAX_INVOICE', {
                        state: {
                          templateData: {
                            consigneeName: s.name,
                            consigneeAddress: s.address,
                            consigneeState: s.state,
                            consigneeGstin: s.gstin,
                            transportName: s.name,
                          },
                        },
                      });
                    }}
                  >
                    <Plus size={13} />
                    <span>Ship to this Location</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleStartEditShipper(s)}
                      title="Edit Destination"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleDeleteShipper(s.id)}
                      title="Delete Destination"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VENDOR & EXPENSE PROFILES DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'VENDORS' && (
        <div className="space-y-6">
          {/* Vendor Create / Edit Card */}
          {isEditingVendor && (
            <div className="p-5 bg-slate-900/95 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-indigo-400" />
                  <span>{editingVendor ? `Edit Vendor Template: ${editingVendor.name}` : 'Add New Vendor Template'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors flex items-center gap-1"
                  onClick={() => setIsEditingVendor(false)}
                >
                  <X size={13} /> Close
                </button>
              </div>

              <form onSubmit={handleSaveVendor} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Vendor / Company Name *"
                      placeholder="e.g. DGR Packaging Company / Celebi Cargo Terminal"
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Vendor GSTIN (Optional)"
                    placeholder="e.g. 27CBKPK7600K1ZE"
                    value={vendorForm.gstin}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Expense Category</label>
                    <select
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                      value={vendorForm.category}
                      onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    >
                      <option value="DGD">DGD Documentation Charges</option>
                      <option value="PACKAGING">Packaging & UN Boxes</option>
                      <option value="AIR_FREIGHT">Airline Freight Cost</option>
                      <option value="SEA_FREIGHT">Ocean Freight Cost</option>
                      <option value="CUSTOMS">Customs Clearance & Brokerage</option>
                      <option value="TRANSPORT">Transport / Cartage / Courier</option>
                      <option value="WAREHOUSE">Warehouse & Handling</option>
                      <option value="OTHER">Other Vendor Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Default GST Rate</label>
                    <select
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                      value={vendorForm.defaultGstRate}
                      onChange={(e) => setVendorForm({ ...vendorForm, defaultGstRate: parseFloat(e.target.value) })}
                    >
                      <option value="0">0% (Nil / Exempt)</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST (Standard Services)</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  <Input
                    label="State"
                    value={vendorForm.state}
                    onChange={(e) => setVendorForm({ ...vendorForm, state: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Default Service / Product Description</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                    placeholder="e.g. UN Approved 4G Fibreboard Boxes, DG Packaging & Labeling Materials"
                    value={vendorForm.defaultDescription}
                    onChange={(e) => setVendorForm({ ...vendorForm, defaultDescription: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Vendor Office / Warehouse Address</label>
                  <textarea
                    rows={2}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                    placeholder="Full physical address of supplier"
                    value={vendorForm.address}
                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Contact Person"
                    placeholder="e.g. Mr Sunil"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                  />
                  <Input
                    label="Phone"
                    placeholder="e.g. +91 9326392294"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  />
                  <Input
                    label="Email"
                    placeholder="e.g. vendor@logistics.com"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsEditingVendor(false)} className="rounded text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    <Save size={13} className="mr-1.5 inline" /> Save Vendor Template
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3.5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                        <ShoppingBag size={14} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-xs leading-tight">{v.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 rounded border border-indigo-500/30 font-medium">
                          {v.category || 'EXPENSE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 font-medium">GSTIN: </span>
                      <span className="font-mono text-indigo-300 font-bold">{v.gstin || 'N/A'}</span>
                    </div>
                    {v.defaultDescription && (
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500">Service: </span>
                        <span>{v.defaultDescription}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      <span className="text-slate-500">Address: </span>
                      <span>{v.address ? v.address.replace(/\n/g, ', ') : '-'}</span>
                    </div>
                    {(v.contactPerson || v.phone) && (
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500">Contact: </span>
                        <span>{v.contactPerson} {v.phone ? `(${v.phone})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1"
                    onClick={() => {
                      navigate('/billing/purchases');
                    }}
                  >
                    <Plus size={13} />
                    <span>Record Bill</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleStartEditVendor(v)}
                      title="Edit Vendor Template"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      onClick={() => handleDeleteVendor(v.id)}
                      title="Delete Vendor Template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
