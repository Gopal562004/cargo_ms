import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Zap,
  Plus,
  Pencil,
  Trash2,
  Image,
  Building,
  Truck,
  Save,
  X,
  Copy,
  Package,
  CreditCard,
  FileText,
  Layers,
} from 'lucide-react';
import {
  getSavedBillingProfiles,
  saveBillingProfile,
  deleteBillingProfile,
  getSavedBuyers,
  getSavedShippers,
} from '../../services/billingProfileService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import GstRateSelect from '../ui/GstRateSelect';

export default function BillingTemplateManagerModal({ isOpen, onClose, onSelectTemplate }) {
  const [profiles, setProfiles] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formTab, setFormTab] = useState('COMPANY'); // 'COMPANY' | 'PARTIES' | 'ITEMS' | 'BANK'

  // Form State for creating/editing a profile
  const [formData, setFormData] = useState({
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
    invoiceNumber: '',
    invoiceDate: '',
    placeOfSupply: 'Maharashtra (27)',
    reverseCharge: 'N',
    transport: 'BY ROAD',
    ewayBillNo: '',
    airwayBillNo: '',
    poNumberAndDate: '',
    noOfPackages: '',
    grossWeight: '',
    transportName: '',
    paidToPaid: 'PAID',
    referenceName: '',
    contactNumber: '',
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
    items: [
      { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 2, description: 'UN APPROVED BOX X6', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 160, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      { sn: 3, description: 'UN APPROVED BOX X22', subText: '', hsnCode: '48191010', qty: 3, unit: 'Pcs', price: 270, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
    ],
  });

  const loadProfiles = () => {
    setProfiles(getSavedBillingProfiles());
    setBuyers(getSavedBuyers());
    setShippers(getSavedShippers());
  };

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      setIsCreating(false);
      setEditingProfile(null);
      setFormTab('COMPANY');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingProfile(null);
    setFormData({
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
      invoiceNumber: '',
      invoiceDate: '',
      placeOfSupply: 'Maharashtra (27)',
      reverseCharge: 'N',
      transport: 'BY ROAD',
      ewayBillNo: '',
      airwayBillNo: '',
      poNumberAndDate: '',
      noOfPackages: '',
      grossWeight: '',
      transportName: '',
      paidToPaid: 'PAID',
      referenceName: '',
      contactNumber: '',
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
      items: [
        { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
        { sn: 2, description: 'UN APPROVED BOX X6', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 160, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
        { sn: 3, description: 'UN APPROVED BOX X22', subText: '', hsnCode: '48191010', qty: 3, unit: 'Pcs', price: 270, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      ],
    });
    setIsCreating(true);
    setFormTab('COMPANY');
  };

  const handleStartEdit = (p) => {
    setEditingProfile(p);
    const comp = p.companyDetails || {};
    const buyer = p.buyer || {};
    const cons = p.consignee || {};
    setFormData({
      name: p.name || '',
      category: p.category || 'Full Invoice Template',
      companyLogo: p.companyLogo || null,
      companyName: comp.companyName || '',
      companyAddress: comp.companyAddress || '',
      companyCityPin: comp.companyCityPin || '',
      companyPan: comp.companyPan || '',
      companyGstin: comp.companyGstin || '',
      companyTel: comp.companyTel || '',
      companyEmail: comp.companyEmail || '',
      invoiceNumber: p.invoiceNumber || '',
      invoiceDate: p.invoiceDate || '',
      placeOfSupply: p.placeOfSupply || 'Maharashtra (27)',
      reverseCharge: p.reverseCharge || 'N',
      transport: p.transport || '',
      ewayBillNo: p.ewayBillNo || '',
      airwayBillNo: p.airwayBillNo || '',
      poNumberAndDate: p.poNumberAndDate || '',
      noOfPackages: p.noOfPackages || '',
      grossWeight: p.grossWeight || '',
      transportName: p.transportName || '',
      paidToPaid: p.paidToPaid || 'PAID',
      referenceName: p.referenceName || '',
      contactNumber: p.contactNumber || '',
      bankName: comp.bankName || '',
      accountNumber: comp.accountNumber || '',
      ifscCode: comp.ifscCode || '',
      swiftCode: comp.swiftCode || '',
      branchName: comp.branchName || '',
      termsAndConditions: p.termsAndConditions || `1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.\n3. Discrepancy if any, in billed item must be communicated within 7 days.\n4. Subject to 'Maharashtra' Jurisdiction only.`,
      buyerName: buyer.buyerName || '',
      buyerAddress: buyer.buyerAddress || '',
      buyerState: buyer.buyerState || 'Maharashtra (27)',
      buyerGstin: buyer.buyerGstin || '',
      consigneeName: cons.consigneeName || '',
      consigneeAddress: cons.consigneeAddress || '',
      consigneeState: cons.consigneeState || 'Maharashtra (27)',
      consigneeGstin: cons.consigneeGstin || '',
      items: p.items && p.items.length > 0 ? p.items : [
        { sn: 1, description: 'UN APPROVED BOX X3', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 110, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      ],
    });
    setIsCreating(true);
    setFormTab('COMPANY');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, companyLogo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
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

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
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

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter a Template / Preset Name.');
      return;
    }

    const payload = {
      id: editingProfile ? editingProfile.id : undefined,
      name: formData.name,
      category: formData.category,
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
      items: formData.items,
    };

    saveBillingProfile(payload);
    loadProfiles();
    setIsCreating(false);
    setEditingProfile(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this custom template?')) {
      deleteBillingProfile(id);
      loadProfiles();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Bookmark size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isCreating ? (editingProfile ? 'Edit Complete Template' : 'Create New Complete Template') : 'Saved Templates & Customer Directory'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure full template defaults: Company details, Buyer/Shipper, UN Items, Bank & Terms for 1-click invoice filling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <Button size="sm" variant="primary" onClick={handleStartCreate} className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                <Plus size={13} className="mr-1 inline" /> New Template
              </Button>
            )}
            <button
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!isCreating ? (
            /* LIST OF SAVED TEMPLATES */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((p) => {
                const buyer = p.buyer || {};
                const comp = p.companyDetails || {};
                const itemCount = Array.isArray(p.items) ? p.items.length : 0;

                return (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-md space-y-3 shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Zap size={14} className="text-amber-400" />
                          <span className="font-bold text-slate-100 text-xs">{p.name}</span>
                        </div>
                        {p.isBuiltIn ? (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
                            Built-In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded">
                            Custom
                          </span>
                        )}
                      </div>

                      <div className="text-xs space-y-1 text-slate-300 pt-1 border-t border-slate-800/80">
                        <div>
                          <span className="text-slate-500 font-medium">Issuer: </span>
                          <span className="font-semibold text-slate-200">{comp.companyName || 'DGR PACKAGING COMPANY'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Billed To: </span>
                          <span className="text-slate-300">{buyer.buyerName || 'Unspecified'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>GSTIN: <span className="font-mono text-slate-300">{buyer.buyerGstin || comp.companyGstin || '-'}</span></span>
                          <span className="text-indigo-400 font-mono">{itemCount} items preset</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors flex-1 flex items-center justify-center gap-1 shadow-sm"
                        onClick={() => {
                          if (onSelectTemplate) onSelectTemplate(p);
                          onClose();
                        }}
                      >
                        <Zap size={13} />
                        <span>Apply to Invoice</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                          onClick={() => handleStartEdit(p)}
                          title="Edit Template"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          onClick={() => handleDelete(p.id)}
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
          ) : (
            /* CREATE / EDIT TEMPLATE FORM WITH TABS */
            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Template Name & Main Info Banner */}
              <div className="bg-slate-950/80 border border-slate-800 rounded p-3 sm:p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Template / Preset Name *"
                    placeholder="e.g. INV DGR-0466 (PDF Standard)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 mt-auto">
                      <Image size={13} />
                      <span>{formData.companyLogo ? 'Change Logo' : 'Upload Template Logo'}</span>
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
                        className="text-xs text-rose-400 hover:underline mt-auto"
                        onClick={() => setFormData({ ...formData, companyLogo: null })}
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs for Form Sections */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setFormTab('COMPANY')}
                  className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    formTab === 'COMPANY'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Building size={13} />
                  <span>1. Issuer & Meta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormTab('PARTIES')}
                  className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    formTab === 'PARTIES'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Truck size={13} />
                  <span>2. Buyer & Destination</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormTab('ITEMS')}
                  className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    formTab === 'ITEMS'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Package size={13} />
                  <span>3. Preset Line Items ({formData.items.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormTab('BANK')}
                  className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    formTab === 'BANK'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard size={13} />
                  <span>4. Bank & Terms</span>
                </button>
              </div>

              {/* TAB 1: ISSUER / COMPANY & META */}
              {formTab === 'COMPANY' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Building size={14} className="text-indigo-400" /> Company / Issuer Header Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Company Name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                      <Input
                        label="City & PIN Code"
                        value={formData.companyCityPin}
                        onChange={(e) => setFormData({ ...formData, companyCityPin: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-medium">Company Full Address</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 mt-1"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        label="PAN"
                        value={formData.companyPan}
                        onChange={(e) => setFormData({ ...formData, companyPan: e.target.value })}
                      />
                      <Input
                        label="GSTIN"
                        value={formData.companyGstin}
                        onChange={(e) => setFormData({ ...formData, companyGstin: e.target.value })}
                      />
                      <Input
                        label="Tel / Phone"
                        value={formData.companyTel}
                        onChange={(e) => setFormData({ ...formData, companyTel: e.target.value })}
                      />
                      <Input
                        label="Email"
                        value={formData.companyEmail}
                        onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} className="text-indigo-400" /> Invoice Defaults & Transport Fields
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        label="Place of Supply"
                        value={formData.placeOfSupply}
                        onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                      />
                      <Input
                        label="Reverse Charge (Y/N)"
                        value={formData.reverseCharge}
                        onChange={(e) => setFormData({ ...formData, reverseCharge: e.target.value })}
                      />
                      <Input
                        label="Transport Mode"
                        placeholder="e.g. BY ROAD"
                        value={formData.transport}
                        onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                      />
                      <Input
                        label="Airway Bill No"
                        placeholder="e.g. 176-6268 0251"
                        value={formData.airwayBillNo}
                        onChange={(e) => setFormData({ ...formData, airwayBillNo: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        label="P.O. No. & Date"
                        placeholder="e.g. PO-9821 DT. 15-JUN-2026"
                        value={formData.poNumberAndDate}
                        onChange={(e) => setFormData({ ...formData, poNumberAndDate: e.target.value })}
                      />
                      <Input
                        label="No. of Packages"
                        placeholder="e.g. 02 (01 BOX DG, 01 NON DG)"
                        value={formData.noOfPackages}
                        onChange={(e) => setFormData({ ...formData, noOfPackages: e.target.value })}
                      />
                      <Input
                        label="Gross Weight"
                        placeholder="e.g. 50.00 KG"
                        value={formData.grossWeight}
                        onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                      />
                      <Input
                        label="Contact Number"
                        placeholder="e.g. +91 9326392294"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BUYER & CONSIGNEE */}
              {formTab === 'PARTIES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} className="text-indigo-400" /> Billed To (Buyer)
                      </h3>
                      {buyers.length > 0 && (
                        <select
                          className="text-xs bg-slate-900 border border-slate-700 text-indigo-300 rounded px-2 py-1 outline-none hover:border-indigo-500 focus:border-indigo-500 font-medium max-w-[200px] truncate"
                          value=""
                          onChange={(e) => {
                            const found = buyers.find((b) => b.id === e.target.value || b.name === e.target.value);
                            if (found) {
                              setFormData((prev) => ({
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
                      label="Buyer Company Name *"
                      placeholder="e.g. DGR GLOBAL LOGISTICS"
                      value={formData.buyerName}
                      onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                      required
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-medium">Buyer Full Address</label>
                      <textarea
                        rows={3}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                        placeholder="e.g. GROUND FLOOR ROOM -003\nG M NAGAR NARANGI BAYPASS ROAD\nVIRAR EAST VASAI VIRAR PALGHAR -401305"
                        value={formData.buyerAddress}
                        onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="State"
                        value={formData.buyerState}
                        onChange={(e) => setFormData({ ...formData, buyerState: e.target.value })}
                      />
                      <Input
                        label="GSTIN / UIN"
                        value={formData.buyerGstin}
                        onChange={(e) => setFormData({ ...formData, buyerGstin: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Truck size={14} className="text-indigo-400" /> Shipped To (Destination)
                      </h3>
                      <div className="flex items-center gap-2">
                        {shippers.length > 0 && (
                          <select
                            className="text-xs bg-slate-900 border border-slate-700 text-emerald-300 rounded px-2 py-1 outline-none hover:border-emerald-500 focus:border-emerald-500 font-medium max-w-[160px] truncate"
                            value=""
                            onChange={(e) => {
                              const found = shippers.find((s) => s.id === e.target.value || s.name === e.target.value);
                              if (found) {
                                setFormData((prev) => ({
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
                            setFormData({
                              ...formData,
                              consigneeName: formData.buyerName,
                              consigneeAddress: formData.buyerAddress,
                              consigneeState: formData.buyerState,
                              consigneeGstin: formData.buyerGstin,
                            })
                          }
                        >
                          <Copy size={11} /> Copy Buyer Details
                        </button>
                      </div>
                    </div>
                    <Input
                      label="Destination Name"
                      placeholder="e.g. DGR GLOBAL LOGISTICS"
                      value={formData.consigneeName}
                      onChange={(e) => setFormData({ ...formData, consigneeName: e.target.value })}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 font-medium">Delivery Address</label>
                      <textarea
                        rows={3}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                        placeholder="Delivery address..."
                        value={formData.consigneeAddress}
                        onChange={(e) => setFormData({ ...formData, consigneeAddress: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="State"
                        value={formData.consigneeState}
                        onChange={(e) => setFormData({ ...formData, consigneeState: e.target.value })}
                      />
                      <Input
                        label="GSTIN / UIN"
                        value={formData.consigneeGstin}
                        onChange={(e) => setFormData({ ...formData, consigneeGstin: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LINE ITEMS / PRESET BOXES */}
              {formTab === 'ITEMS' && (
                <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Package size={14} className="text-indigo-400" /> Preset Line Items (UN Approved Boxes / Services)
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={handleAddItem}
                      className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                    >
                      <Plus size={12} className="mr-1 inline" /> Add Line Item
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-md space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          <button
                            type="button"
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            onClick={() => handleRemoveItem(idx)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            label="Description"
                            placeholder="e.g. UN APPROVED BOX X3"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          />
                          <Input
                            label="Sub-text / UN Spec"
                            placeholder="e.g. UN 3465/6.1/III"
                            value={item.subText || ''}
                            onChange={(e) => handleItemChange(idx, 'subText', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <Input
                            label="HSN/SAC"
                            value={item.hsnCode || '48191010'}
                            onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          />
                          <Input
                            label="Qty"
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                          />
                          <Input
                            label="Unit"
                            value={item.unit || 'Pcs'}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          />
                          <Input
                            label="Price (Rs.)"
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          />
                          <div>
                            <label className="text-xs text-slate-400 font-medium">GST Rate</label>
                            <GstRateSelect
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 mt-1"
                              value={item.gstRate ?? 5}
                              onChange={(val) => handleItemChange(idx, 'gstRate', val)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: BANK DETAILS & TERMS */}
              {formTab === 'BANK' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard size={14} className="text-indigo-400" /> Bank Account Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Bank Name"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      />
                      <Input
                        label="Account Number"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="RTGS / NEFT / IFSC"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      />
                      <Input
                        label="Swift Code"
                        value={formData.swiftCode}
                        onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      />
                      <Input
                        label="Branch"
                        value={formData.branchName}
                        onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-2">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} className="text-indigo-400" /> Default Terms & Conditions
                    </h3>
                    <textarea
                      rows={4}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                      value={formData.termsAndConditions}
                      onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProfile(null);
                  }}
                  className="rounded text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                  <Save size={13} className="mr-1.5 inline" /> Save Template
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
