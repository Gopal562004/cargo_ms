import React, { useState, useEffect } from 'react';
import { getSavedBillingProfiles, saveBillingProfile, deleteBillingProfile } from '../../services/billingProfileService';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function BillingTemplateManagerModal({ isOpen, onClose, onSelectTemplate }) {
  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

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
    items: [
      { sn: 1, description: 'UN APPROVED BOX', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 100, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
    ],
  });

  const loadProfiles = () => {
    setProfiles(getSavedBillingProfiles());
  };

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      setIsCreating(false);
      setEditingProfile(null);
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
      items: [
        { sn: 1, description: 'UN APPROVED BOX', subText: '', hsnCode: '48191010', qty: 1, unit: 'Pcs', price: 100, gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0 },
      ],
    });
    setIsCreating(true);
  };

  const handleStartEdit = (p) => {
    setEditingProfile(p);
    const comp = p.companyDetails || {};
    const buyer = p.buyer || {};
    const cons = p.consignee || {};
    setFormData({
      name: p.name,
      category: p.category || 'Full Invoice Template',
      companyLogo: p.companyLogo || null,
      companyName: comp.companyName || '',
      companyAddress: comp.companyAddress || '',
      companyCityPin: comp.companyCityPin || '',
      companyPan: comp.companyPan || '',
      companyGstin: comp.companyGstin || '',
      companyTel: comp.companyTel || '',
      companyEmail: comp.companyEmail || '',
      bankName: comp.bankName || '',
      accountNumber: comp.accountNumber || '',
      ifscCode: comp.ifscCode || '',
      swiftCode: comp.swiftCode || '',
      branchName: comp.branchName || '',
      buyerName: buyer.buyerName || '',
      buyerAddress: buyer.buyerAddress || '',
      buyerState: buyer.buyerState || 'Maharashtra (27)',
      buyerGstin: buyer.buyerGstin || '',
      consigneeName: cons.consigneeName || '',
      consigneeAddress: cons.consigneeAddress || '',
      consigneeState: cons.consigneeState || 'Maharashtra (27)',
      consigneeGstin: cons.consigneeGstin || '',
      items: p.items || [],
    });
    setIsCreating(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, companyLogo: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.buyerName) {
      alert('Please enter Template Name and Buyer Company Name.');
      return;
    }

    const payload = {
      id: editingProfile?.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📑</span>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isCreating ? (editingProfile ? 'Edit Template / Party' : 'Create New Template / Party') : 'Saved Templates & Customer Directory'}
              </h2>
              <p className="text-xs text-slate-400">
                Save repetitive buyers, addresses, GSTINs, bank info, and logos for 1-click invoice filling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <Button size="sm" variant="primary" icon="➕" onClick={handleStartCreate}>
                New Template
              </Button>
            )}
            <button
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              onClick={onClose}
            >
              ✕
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

                return (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl space-y-3 shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">⚡</span>
                          <span className="font-bold text-slate-100 text-sm">{p.name}</span>
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
                          <span className="text-slate-500 font-medium">Buyer: </span>
                          <span className="font-semibold text-slate-200">{buyer.buyerName || 'Unspecified'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          <span className="text-slate-500">GSTIN: </span>
                          <span className="font-mono text-slate-300">{buyer.buyerGstin || '-'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          <span className="text-slate-500">Issuer: </span>
                          <span>{comp.companyName || 'DGR'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex-1"
                        onClick={() => {
                          if (onSelectTemplate) onSelectTemplate(p);
                          onClose();
                        }}
                      >
                        ⚡ Apply to Invoice
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                          onClick={() => handleStartEdit(p)}
                          title="Edit Template"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          onClick={() => handleDelete(p.id)}
                          title="Delete Template"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* CREATE / EDIT TEMPLATE FORM */
            <form onSubmit={handleSaveForm} className="space-y-6">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Template Details & Logo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Template / Preset Name *"
                    placeholder="e.g. Takai Chemtech Regular Order"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 mt-auto">
                      <span>🖼️</span>
                      <span>{formData.companyLogo ? 'Change Logo Image' : 'Upload Template Logo'}</span>
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

              {/* Buyer & Consignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    2. Billed To (Buyer)
                  </h3>
                  <Input
                    label="Buyer Company Name *"
                    placeholder="e.g. MANIFEST EXPRESS LOGISTICS LLP"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Buyer Full Address</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
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

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      3. Shipped To (Destination)
                    </h3>
                    <button
                      type="button"
                      className="text-xs text-indigo-400 hover:underline"
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
                      + Copy Buyer Details
                    </button>
                  </div>
                  <Input
                    label="Destination Name"
                    value={formData.consigneeName}
                    onChange={(e) => setFormData({ ...formData, consigneeName: e.target.value })}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Delivery Address</label>
                    <textarea
                      rows={2}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProfile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  💾 Save Template
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
