import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  RotateCcw,
  Receipt,
  Plus,
  Building,
  Pencil,
  Trash2,
  Save,
  FileText,
  CheckCircle2,
  X,
  Search,
  Zap,
  ShoppingBag,
  Package,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  SlidersHorizontal,
  Hash,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  getSavedBillingProfiles,
  syncOnlineTemplates,
  saveBillingProfile,
  deleteBillingProfile,
  resetBillingProfilesToDefault,
  getSavedParties,
  saveParty,
  deleteParty,
  resetPartiesToDefault,
  getSavedItemPresets,
  saveItemPreset,
  deleteItemPreset,
  resetItemPresetsToDefault,
  getIndianStateFromGstin,
  getNumberingSettings,
  saveNumberingSettings,
  DEFAULT_NUMBERING_SETTINGS,
  getNextInvoiceNumber,
} from '../services/billingProfileService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function BillingTemplatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Main Tab: 'TEMPLATES' | 'ITEMS' | 'PARTIES' | 'NUMBERING'
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'TEMPLATES');

  useEffect(() => {
    if (tabFromUrl && ['TEMPLATES', 'ITEMS', 'PARTIES', 'NUMBERING'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
    setIsEditingTemplate(false);
    setIsEditingItemPreset(false);
    setIsEditingParty(false);
  };
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data lists
  const [templates, setTemplates] = useState([]);
  const [itemPresets, setItemPresets] = useState([]);
  const [parties, setParties] = useState([]);

  // Modal / Form Edit states
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [isEditingItemPreset, setIsEditingItemPreset] = useState(false);
  const [editingItemPreset, setEditingItemPreset] = useState(null);

  const [isEditingParty, setIsEditingParty] = useState(false);
  const [editingParty, setEditingParty] = useState(null);

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

  // Single Directory / Company Form State
  const [partyForm, setPartyForm] = useState({
    id: null,
    name: '',
    address: '',
    state: 'Maharashtra (27)',
    gstin: '',
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

  // Financial Year & Invoice Numbering Series State
  const [numberingForm, setNumberingForm] = useState(() => getNumberingSettings());

  const loadAllData = async () => {
    setTemplates(getSavedBillingProfiles());
    setItemPresets(getSavedItemPresets());
    setParties(getSavedParties());
    setNumberingForm(getNumberingSettings());

    const onlineTemplates = await syncOnlineTemplates();
    if (onlineTemplates) {
      setTemplates(onlineTemplates);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleSaveNumbering = (e) => {
    e.preventDefault();
    saveNumberingSettings(numberingForm);
    showNotification('Financial Year & Invoice Numbering Series profile saved successfully!');
  };

  const handleResetNumbering = () => {
    if (window.confirm('Reset numbering settings to default (DGR/001/2026-27)?')) {
      saveNumberingSettings(DEFAULT_NUMBERING_SETTINGS);
      setNumberingForm(DEFAULT_NUMBERING_SETTINGS);
      showNotification('Numbering settings restored to default.');
    }
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
  // UNIFIED COMPANY DIRECTORY HANDLERS (ONE DIRECTORY FOR ALL)
  // --------------------------------------------------------------------------
  const handleStartCreateParty = () => {
    setEditingParty(null);
    setPartyForm({
      id: null,
      name: '',
      address: '',
      state: 'Maharashtra (27)',
      gstin: '',
      contactPerson: '',
      phone: '',
      email: '',
    });
    setIsEditingParty(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditParty = (party) => {
    setEditingParty(party);
    setPartyForm({
      id: party.id,
      name: party.name || '',
      address: party.address || '',
      state: party.state || 'Maharashtra (27)',
      gstin: party.gstin || '',
      contactPerson: party.contactPerson || '',
      phone: party.phone || '',
      email: party.email || '',
    });
    setIsEditingParty(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveParty = (e) => {
    e.preventDefault();
    if (!partyForm.name?.trim()) {
      alert('Please enter Company / Party Name.');
      return;
    }
    saveParty(partyForm);
    loadAllData();
    setIsEditingParty(false);
    setEditingParty(null);
    showNotification(`Saved "${partyForm.name}" to directory!`);
  };

  const handleDeleteParty = (id) => {
    if (window.confirm('Delete this company from directory?')) {
      deleteParty(id);
      loadAllData();
      showNotification('Company removed from directory.');
    }
  };

  const handleResetParties = () => {
    if (window.confirm('Reset directory back to default standard companies?')) {
      resetPartiesToDefault();
      loadAllData();
      showNotification('Directory restored to defaults.');
    }
  };

  // --------------------------------------------------------------------------
  // FULL TEMPLATE HANDLERS
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
      ],
    });
    setIsEditingTemplate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditTemplate = (tpl) => {
    setEditingTemplate(tpl);
    const comp = tpl.companyDetails || {};
    const buyer = tpl.buyer || {};
    const cons = tpl.consignee || {};

    setTemplateForm({
      name: tpl.name || '',
      category: tpl.category || 'Full Invoice Template',
      companyLogo: tpl.companyLogo || null,
      companyName: comp.companyName || '',
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
      termsAndConditions: tpl.termsAndConditions || '',
      transport: tpl.transport || 'BY ROAD',
      airwayBillNo: tpl.airwayBillNo || '',
      poNumberAndDate: tpl.poNumberAndDate || '',
      noOfPackages: tpl.noOfPackages || '',
      grossWeight: tpl.grossWeight || '',
      contactNumber: tpl.contactNumber || '',
      items: Array.isArray(tpl.items) && tpl.items.length > 0 ? tpl.items : [],
    });
    setIsEditingTemplate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!templateForm.name) {
      alert('Please enter a Template Name.');
      return;
    }

    const payload = {
      id: editingTemplate?.id,
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
    if (window.confirm('Delete this template permanently?')) {
      deleteBillingProfile(id);
      loadAllData();
      showNotification('Template deleted.');
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
  // FILTERED DATA
  // --------------------------------------------------------------------------
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

  const filteredParties = parties.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.gstin || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q) ||
      (p.contactPerson || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
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
            Manage full invoice templates, cargo & packaging item presets, and your company directory.
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

          {activeTab === 'PARTIES' && (
            <Button
              variant="secondary"
              onClick={handleResetParties}
              title="Reset directory to standard default companies"
              className="rounded text-xs"
            >
              <RotateCcw size={13} className="mr-1.5 inline" /> Reset Directory
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

          {activeTab === 'PARTIES' && (
            <Button
              variant="primary"
              onClick={handleStartCreateParty}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus size={13} className="mr-1.5 inline" /> Add Company
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
          onClick={() => handleTabChange('TEMPLATES')}
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
          onClick={() => handleTabChange('ITEMS')}
        >
          <Package size={14} className={activeTab === 'ITEMS' ? 'text-white' : 'text-amber-400'} />
          <span>Cargo & Packaging Items ({itemPresets.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'PARTIES'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          onClick={() => handleTabChange('PARTIES')}
        >
          <Building size={14} className={activeTab === 'PARTIES' ? 'text-white' : 'text-indigo-400'} />
          <span>Company & Directory ({parties.length})</span>
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'NUMBERING'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          onClick={() => handleTabChange('NUMBERING')}
        >
          <SlidersHorizontal size={14} className={activeTab === 'NUMBERING' ? 'text-white' : 'text-emerald-400'} />
          <span>Financial Year & Series Settings</span>
        </button>
      </div>

      {/* SEARCH BAR (for lists) */}
      {activeTab !== 'NUMBERING' && (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder={
              activeTab === 'TEMPLATES'
                ? 'Search templates by title, buyer, company...'
                : activeTab === 'ITEMS'
                ? 'Search items by description, HSN code, category...'
                : 'Search companies by name, GSTIN, address, contact...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 self-center sm:self-auto">
          {activeTab === 'TEMPLATES' && `Showing ${filteredTemplates.length} of ${templates.length} templates`}
          {activeTab === 'ITEMS' && `Showing ${filteredItemPresets.length} of ${itemPresets.length} item presets`}
          {activeTab === 'PARTIES' && `Showing ${filteredParties.length} of ${parties.length} companies`}
        </span>
      </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FULL INVOICE TEMPLATES */}
      {/* ========================================================================= */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          {/* Template Create / Edit Form Card */}
          {isEditingTemplate && (
            <div className="p-5 bg-slate-900 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Bookmark size={16} className="text-indigo-400" />
                  <span>{editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Invoice Template'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-100 px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsEditingTemplate(false)}
                >
                  <X size={13} /> Close Form
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-5">
                {/* Template Name & Logo Banner */}
                <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-md space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Template Name / Preset Label *"
                      placeholder="e.g. Standard DG Export / Celebi DGD Invoice"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Template Category"
                      placeholder="e.g. Full Invoice Template"
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    />
                  </div>

                  {/* Logo Upload Row */}
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                    <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2">
                      <ImageIcon size={13} className="text-indigo-400" />
                      <span>{templateForm.companyLogo ? 'Change Template Logo' : 'Upload Template Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setTemplateForm((prev) => ({ ...prev, companyLogo: ev.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {templateForm.companyLogo && (
                      <div className="flex items-center gap-2">
                        <img src={templateForm.companyLogo} alt="Logo" className="h-6 w-auto max-w-[60px] object-contain border border-slate-700 rounded p-0.5 bg-white" />
                        <button
                          type="button"
                          className="text-xs text-rose-400 hover:underline"
                          onClick={() => setTemplateForm((prev) => ({ ...prev, companyLogo: null }))}
                        >
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Details Section */}
                <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-md space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Building size={14} /> 1. Issuer / Your Company Details
                    </h3>
                    {parties.length > 0 && (
                      <select
                        className="text-xs bg-slate-900 border border-slate-700 text-indigo-300 rounded px-2 py-1 outline-none hover:border-indigo-500 focus:border-indigo-500 font-medium max-w-[220px] truncate"
                        value=""
                        onChange={(e) => {
                          const found = parties.find((p) => p.id === e.target.value || p.name === e.target.value);
                          if (found) {
                            setTemplateForm((prev) => ({
                              ...prev,
                              companyName: found.name || '',
                              companyAddress: found.address || '',
                              companyGstin: found.gstin || '',
                              companyTel: found.phone || prev.companyTel,
                              companyEmail: found.email || prev.companyEmail,
                            }));
                          }
                        }}
                      >
                        <option value="" disabled>-- Pick from Directory ({parties.length}) --</option>
                        {parties.map((p) => (
                          <option key={p.id} value={p.id || p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input
                        label="Company Name"
                        value={templateForm.companyName}
                        onChange={(e) => setTemplateForm({ ...templateForm, companyName: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Company GSTIN"
                      value={templateForm.companyGstin}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyGstin: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Address"
                      value={templateForm.companyAddress}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyAddress: e.target.value })}
                    />
                    <Input
                      label="City, State & Pin Code"
                      value={templateForm.companyCityPin}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyCityPin: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="PAN No"
                      value={templateForm.companyPan}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyPan: e.target.value })}
                    />
                    <Input
                      label="Telephone / Mobile"
                      value={templateForm.companyTel}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyTel: e.target.value })}
                    />
                    <Input
                      label="Email"
                      value={templateForm.companyEmail}
                      onChange={(e) => setTemplateForm({ ...templateForm, companyEmail: e.target.value })}
                    />
                  </div>
                </div>

                {/* Buyer & Consignee Details */}
                <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-md space-y-3">
                  <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Truck size={14} /> 2. Customer (Billed To) & Delivery (Shipped To)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3 p-3 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-300">Billed To (Buyer)</h4>
                        {parties.length > 0 && (
                          <select
                            className="text-[11px] bg-slate-900 border border-slate-700 text-indigo-300 rounded px-1.5 py-0.5 outline-none hover:border-indigo-500 font-medium max-w-[170px] truncate"
                            value=""
                            onChange={(e) => {
                              const found = parties.find((p) => p.id === e.target.value || p.name === e.target.value);
                              if (found) {
                                setTemplateForm((prev) => ({
                                  ...prev,
                                  buyerName: found.name || '',
                                  buyerAddress: found.address || '',
                                  buyerState: found.state || 'Maharashtra (27)',
                                  buyerGstin: found.gstin || '',
                                }));
                              }
                            }}
                          >
                            <option value="" disabled>-- Pick Customer --</option>
                            {parties.map((p) => (
                              <option key={p.id} value={p.id || p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <Input
                        label="Buyer Name"
                        value={templateForm.buyerName}
                        onChange={(e) => setTemplateForm({ ...templateForm, buyerName: e.target.value })}
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-medium">Buyer Address</label>
                        <textarea
                          rows={2}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                          value={templateForm.buyerAddress}
                          onChange={(e) => setTemplateForm({ ...templateForm, buyerAddress: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Buyer GSTIN"
                          value={templateForm.buyerGstin}
                          onChange={(e) => setTemplateForm({ ...templateForm, buyerGstin: e.target.value })}
                        />
                        <Input
                          label="Buyer State"
                          value={templateForm.buyerState}
                          onChange={(e) => setTemplateForm({ ...templateForm, buyerState: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-3 bg-slate-900/50 rounded border border-slate-800">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-300">Shipped To (Consignee)</h4>
                        <div className="flex items-center gap-1.5">
                          {parties.length > 0 && (
                            <select
                              className="text-[11px] bg-slate-900 border border-slate-700 text-emerald-300 rounded px-1.5 py-0.5 outline-none hover:border-emerald-500 font-medium max-w-[130px] truncate"
                              value=""
                              onChange={(e) => {
                                const found = parties.find((p) => p.id === e.target.value || p.name === e.target.value);
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
                              <option value="" disabled>-- Pick Destination --</option>
                              {parties.map((p) => (
                                <option key={p.id} value={p.id || p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            type="button"
                            className="text-[11px] text-indigo-400 hover:underline"
                            onClick={() =>
                              setTemplateForm((prev) => ({
                                ...prev,
                                consigneeName: prev.buyerName,
                                consigneeAddress: prev.buyerAddress,
                                consigneeState: prev.buyerState,
                                consigneeGstin: prev.buyerGstin,
                              }))
                            }
                          >
                            Copy Buyer
                          </button>
                        </div>
                      </div>
                      <Input
                        label="Consignee Name"
                        value={templateForm.consigneeName}
                        onChange={(e) => setTemplateForm({ ...templateForm, consigneeName: e.target.value })}
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-medium">Consignee Address</label>
                        <textarea
                          rows={2}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                          value={templateForm.consigneeAddress}
                          onChange={(e) => setTemplateForm({ ...templateForm, consigneeAddress: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Consignee GSTIN"
                          value={templateForm.consigneeGstin}
                          onChange={(e) => setTemplateForm({ ...templateForm, consigneeGstin: e.target.value })}
                        />
                        <Input
                          label="Consignee State"
                          value={templateForm.consigneeState}
                          onChange={(e) => setTemplateForm({ ...templateForm, consigneeState: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Default Line Items Section */}
                <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Package size={14} /> 3. Default Items & Packages ({templateForm.items.length})
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
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
                        }))
                      }
                      className="rounded text-xs"
                    >
                      <Plus size={12} className="mr-1 inline" /> Add Line Item
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {templateForm.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-md space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-400">Item #{idx + 1}</span>
                          <button
                            type="button"
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            onClick={() =>
                              setTemplateForm((prev) => ({
                                ...prev,
                                items: prev.items.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            label="Description"
                            placeholder="e.g. UN APPROVED BOX X3"
                            value={item.description}
                            onChange={(e) => {
                              const next = [...templateForm.items];
                              next[idx].description = e.target.value;
                              setTemplateForm({ ...templateForm, items: next });
                            }}
                          />
                          <Input
                            label="Sub-text / UN Spec"
                            placeholder="e.g. UN 3465/6.1/III"
                            value={item.subText || ''}
                            onChange={(e) => {
                              const next = [...templateForm.items];
                              next[idx].subText = e.target.value;
                              setTemplateForm({ ...templateForm, items: next });
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Input
                            label="HSN/SAC"
                            value={item.hsnCode || '48191010'}
                            onChange={(e) => {
                              const next = [...templateForm.items];
                              next[idx].hsnCode = e.target.value;
                              setTemplateForm({ ...templateForm, items: next });
                            }}
                          />
                          <Input
                            label="Qty"
                            type="number"
                            value={item.qty}
                            onChange={(e) => {
                              const next = [...templateForm.items];
                              next[idx].qty = parseFloat(e.target.value) || 0;
                              setTemplateForm({ ...templateForm, items: next });
                            }}
                          />
                          <Input
                            label="Unit Price (₹)"
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const next = [...templateForm.items];
                              next[idx].price = parseFloat(e.target.value) || 0;
                              setTemplateForm({ ...templateForm, items: next });
                            }}
                          />
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-400 font-medium">GST Rate %</label>
                            <select
                              className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                              value={item.gstRate ?? 5}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                const next = [...templateForm.items];
                                next[idx].gstRate = rate;
                                next[idx].cgstRate = rate / 2;
                                next[idx].sgstRate = rate / 2;
                                next[idx].igstRate = 0;
                                setTemplateForm({ ...templateForm, items: next });
                              }}
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-md space-y-3">
                  <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <CreditCard size={14} /> 4. Default Bank Account
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <Input
                      label="IFSC Code"
                      value={templateForm.ifscCode}
                      onChange={(e) => setTemplateForm({ ...templateForm, ifscCode: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Branch Name"
                      value={templateForm.branchName}
                      onChange={(e) => setTemplateForm({ ...templateForm, branchName: e.target.value })}
                    />
                    <Input
                      label="SWIFT Code"
                      value={templateForm.swiftCode}
                      onChange={(e) => setTemplateForm({ ...templateForm, swiftCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsEditingTemplate(false)} className="rounded text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    <Save size={13} className="mr-1.5 inline" /> Save Template
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="p-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-lg text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Bookmark size={22} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">No Billing Templates Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {search ? `No templates match "${search}". Try clearing your search.` : 'You have no saved invoice templates. Click "New Template" or "Reset Defaults" to load starter presets.'}
              </p>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <Button
                  variant="primary"
                  onClick={handleStartCreateTemplate}
                  className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  <Plus size={13} className="mr-1.5 inline" /> Create Template
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleResetDefaults}
                  className="rounded text-xs"
                >
                  <RotateCcw size={13} className="mr-1.5 inline" /> Reset Defaults
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3.5 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                          {p.companyLogo ? (
                            <img src={p.companyLogo} alt="Logo" className="w-5 h-5 object-contain" />
                          ) : (
                            <FileText size={14} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 text-xs leading-tight">{p.name}</h3>
                          <span className="text-[10px] text-slate-400">{p.category || 'Full Template'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 font-medium">Issuer: </span>
                        <span className="font-medium text-slate-200">{p.companyDetails?.companyName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Billed To: </span>
                        <span className="font-medium text-indigo-300">{p.buyer?.buyerName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">GSTIN: </span>
                        <span className="font-mono text-slate-400">{p.buyer?.buyerGstin || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Shipped To: </span>
                        <span className="text-slate-300">{p.consignee?.consigneeName || '-'}</span>
                      </div>
                      {p.items && p.items.length > 0 && (
                        <div className="text-[11px] text-slate-400 pt-1">
                          <span className="text-slate-500">Items: </span>
                          <span className="line-clamp-1">
                            {p.items.map((it) => `${it.description} (${it.gstRate}% GST)`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1"
                      onClick={() => handleUseTemplate(p)}
                    >
                      <Plus size={13} />
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CARGO & PACKAGING ITEM PRESETS */}
      {/* ========================================================================= */}
      {activeTab === 'ITEMS' && (
        <div className="space-y-6">
          {/* Item Preset Create / Edit Card */}
          {isEditingItemPreset && (
            <div className="p-5 bg-slate-900 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Package size={16} className="text-amber-400" />
                  <span>{editingItemPreset ? `Edit Item Preset: ${editingItemPreset.description}` : 'Add New Item Preset'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-100 px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
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
          {filteredItemPresets.length === 0 ? (
            <div className="p-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-lg text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Package size={22} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">No Item Presets Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {search ? `No item presets match "${search}". Try clearing your search.` : 'You have no saved packaging or service presets. Click "Add Item Preset" or "Reset Items" to restore standard logistics items.'}
              </p>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <Button
                  variant="primary"
                  onClick={handleStartCreateItemPreset}
                  className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  <Plus size={13} className="mr-1.5 inline" /> Add Item Preset
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleResetItemPresets}
                  className="rounded text-xs"
                >
                  <RotateCcw size={13} className="mr-1.5 inline" /> Reset Items
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredItemPresets.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-2.5 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded font-mono font-bold border border-indigo-500/20">
                        {item.hsnCode || 'SAC'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-bold border border-emerald-500/20">
                        {item.gstRate}% GST
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 leading-tight line-clamp-2">
                      {item.description}
                    </h4>
                    {item.subText && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">{item.subText}</p>
                    )}
                    <div className="pt-1 flex items-center justify-between text-xs text-slate-300 font-semibold border-t border-slate-800/80">
                      <span>Rate:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        ₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {item.unit || 'Pcs'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-1.5">
                    <button
                      type="button"
                      className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded text-[11px] font-medium transition-colors flex-1 flex items-center justify-center gap-1"
                      onClick={() => {
                        navigate('/documents/new/TAX_INVOICE');
                      }}
                    >
                      <Plus size={12} />
                      <span>Use Item</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                        onClick={() => handleStartEditItemPreset(item)}
                        title="Edit Item Preset"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        onClick={() => handleDeleteItemPreset(item.id)}
                        title="Delete Item Preset"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UNIFIED COMPANY DIRECTORY (ONE SINGLE DIRECTORY WITHOUT CATEGORIES) */}
      {/* ========================================================================= */}
      {activeTab === 'PARTIES' && (
        <div className="space-y-5">
          {/* Company Create / Edit Card */}
          {isEditingParty && (
            <div className="p-5 bg-slate-900 border border-indigo-500/50 rounded-md shadow-xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Building size={16} className="text-indigo-400" />
                  <span>{editingParty ? `Edit Company: ${editingParty.name}` : 'Add New Company'}</span>
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-100 px-2.5 py-1 bg-slate-800 rounded hover:bg-slate-700 border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsEditingParty(false)}
                >
                  <X size={13} /> Close
                </button>
              </div>

              <form onSubmit={handleSaveParty} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Company Name *"
                      placeholder="e.g. DGR GLOBAL LOGISTICS / TAKAI CHEMTECH / CELEBI"
                      value={partyForm.name}
                      onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="GSTIN (Optional)"
                    placeholder="e.g. 27NSAPK0224B1Z7"
                    value={partyForm.gstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      const detected = getIndianStateFromGstin(val);
                      setPartyForm({
                        ...partyForm,
                        gstin: val,
                        state: detected || partyForm.state,
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Address</label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                      placeholder="Full office or warehouse address..."
                      value={partyForm.address}
                      onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
                    />
                  </div>
                  <Input
                    label="State"
                    placeholder="e.g. Maharashtra (27)"
                    value={partyForm.state}
                    onChange={(e) => setPartyForm({ ...partyForm, state: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Contact Person"
                    placeholder="e.g. Mr Sunil / Rajesh"
                    value={partyForm.contactPerson}
                    onChange={(e) => setPartyForm({ ...partyForm, contactPerson: e.target.value })}
                  />
                  <Input
                    label="Phone / Mobile"
                    placeholder="e.g. +91 9326392294"
                    value={partyForm.phone}
                    onChange={(e) => setPartyForm({ ...partyForm, phone: e.target.value })}
                  />
                  <Input
                    label="Email"
                    placeholder="e.g. accounts@logistics.com"
                    value={partyForm.email}
                    onChange={(e) => setPartyForm({ ...partyForm, email: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button type="button" variant="secondary" onClick={() => setIsEditingParty(false)} className="rounded text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                    <Save size={13} className="mr-1.5 inline" /> Save Company
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Companies Grid */}
          {filteredParties.length === 0 ? (
            <div className="p-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-lg text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Building size={22} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">No Companies Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {search
                  ? `No directory entries match "${search}". Try clearing your search.`
                  : 'You have no saved companies. Click "Add Company" or "Reset Directory" to restore defaults.'}
              </p>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <Button
                  variant="primary"
                  onClick={handleStartCreateParty}
                  className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  <Plus size={13} className="mr-1.5 inline" /> Add Company
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleResetParties}
                  className="rounded text-xs"
                >
                  <RotateCcw size={13} className="mr-1.5 inline" /> Reset Directory
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParties.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3.5 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <Building size={14} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 text-xs leading-tight">{p.name}</h3>
                          <span className="text-[10px] text-slate-400">{p.state || 'Maharashtra'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 font-medium">GSTIN: </span>
                        <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {p.gstin || 'N/A'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        <span className="text-slate-500">Address: </span>
                        <span>{p.address ? p.address.replace(/\n/g, ', ') : '-'}</span>
                      </div>
                      {(p.contactPerson || p.phone) && (
                        <div className="text-[11px] text-slate-400">
                          <span className="text-slate-500">Contact: </span>
                          <span>{p.contactPerson} {p.phone ? `(${p.phone})` : ''}</span>
                        </div>
                      )}
                      {p.email && (
                        <div className="text-[11px] text-slate-400">
                          <span className="text-slate-500">Email: </span>
                          <span>{p.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1"
                      onClick={() => {
                        navigate('/documents/new/TAX_INVOICE', {
                          state: {
                            templateData: {
                              buyerName: p.name,
                              buyerAddress: p.address,
                              buyerState: p.state,
                              buyerGstin: p.gstin,
                              consigneeName: p.name,
                              consigneeAddress: p.address,
                              consigneeState: p.state,
                              consigneeGstin: p.gstin,
                              placeOfSupply: p.state,
                              referenceName: p.contactPerson,
                              contactNumber: p.phone,
                            },
                          },
                        });
                      }}
                      title="Create tax invoice for this company"
                    >
                      <Plus size={13} />
                      <span>Create Bill</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                        onClick={() => handleStartEditParty(p)}
                        title="Edit Company"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        onClick={() => handleDeleteParty(p.id)}
                        title="Delete Company"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FINANCIAL YEAR & INVOICE NUMBERING SERIES SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'NUMBERING' && (() => {
        const activeProfile = numberingForm;
        const fyCode = activeProfile.financialYear || '2026-27';
        const prefix = activeProfile.prefix || 'DGR/';
        const padding = parseInt(activeProfile.paddingDigits, 10) || 3;
        const startSeq = parseInt(activeProfile.startSequence, 10) || 1;
        const suffix = activeProfile.suffix ? `/${activeProfile.suffix}` : '';

        const sample1 = `${prefix}${startSeq.toString().padStart(padding, '0')}/${fyCode}${suffix}`;
        const sample2 = `${prefix}${(startSeq + 1).toString().padStart(padding, '0')}/${fyCode}${suffix}`;
        const sample3 = `${prefix}${(startSeq + 2).toString().padStart(padding, '0')}/${fyCode}${suffix}`;

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Active Financial Year Series Profile (FY {fyCode})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure your official GST tax invoice numbering format, starting series sequence, and Indian financial year cycles.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate('/settings')}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                  >
                    <Settings size={13} className="mr-1.5 inline" /> Open Full FY Management in Settings
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Active Financial Year:</span>
                  <span className="text-base font-black text-slate-900 font-mono">FY {fyCode}</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Invoice Prefix:</span>
                  <span className="text-base font-black text-indigo-700 font-mono">{prefix}</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Zero-Padding / Alignment:</span>
                  <span className="text-base font-black text-slate-800 font-mono">{padding} Digits ({startSeq.toString().padStart(padding, '0')})</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Next Generated Bill:</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">{sample1}</span>
                </div>
              </div>

              {/* Live Series Preview Bar */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span>Sequential Invoice Numbering Progression:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-white border border-indigo-200 rounded-md">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">First Next Bill</span>
                    <span className="text-sm font-black text-slate-900 font-mono">{sample1}</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-md">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Second Bill</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{sample2}</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-md">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Third Bill</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{sample3}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResetNumbering}
                  className="text-xs"
                >
                  <RotateCcw size={13} className="mr-1.5 inline" /> Reset Series to Default
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/settings')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2"
                >
                  <Pencil size={13} className="mr-1.5 inline" /> Edit Series & Manage Multiple FYs in Settings &rarr;
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
