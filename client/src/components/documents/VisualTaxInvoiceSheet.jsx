import React, { useRef } from 'react';
import { Plus, X, Building, Truck, Copy } from 'lucide-react';

/**
 * VisualTaxInvoiceSheet - Pixel-perfect, WYSIWYG printable A4 sheet editor for Tax Invoices.
 * Allows users to click and type directly on the invoice layout as it will appear on the final PDF / physical printout.
 */
export default function VisualTaxInvoiceSheet({
  formData,
  setFormData,
  handleFieldChange,
  items,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
  totals,
  savedBuyers = [],
  savedShippers = [],
  handleSelectBuyer,
  handleSelectShipper,
}) {
  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleFieldChange('companyLogo', ev.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const unitLabel = totals.unitsSet.size === 1 ? (items[0]?.unit || 'Pcs') : 'Qty';

  return (
    <div className="w-full flex justify-center py-4 bg-slate-950/60 rounded-md overflow-x-auto">
      {/* A4 Printable Sheet Container */}
      <div
        className="w-[820px] min-w-[820px] bg-white text-black p-7 shadow-xl font-sans rounded text-[12px] leading-tight select-text border border-slate-300"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Copy Type Header (Top Right) */}
        <div className="flex justify-end pb-1">
          <input
            type="text"
            value={formData.copyType || 'Original Copy'}
            onChange={(e) => handleFieldChange('copyType', e.target.value)}
            className="text-right text-[11px] italic font-semibold text-slate-800 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-2 py-0.5 rounded border border-transparent focus:border-indigo-400 outline-none w-48"
            placeholder="Original Copy"
          />
        </div>

        {/* Outer Invoice Box with Solid Black Border */}
        <div className="border-2 border-black">
          
          {/* ========================================================================= */}
          {/* 1. HEADER SECTION (Logo + Title + Company Information) */}
          {/* ========================================================================= */}
          <div className="p-3 border-b-2 border-black relative">
            {/* Top Center Document Title */}
            <div className="text-center font-bold text-[14px] tracking-wide uppercase mb-1">
              TAX INVOICE
            </div>

            <div className="flex items-start justify-between">
              {/* Logo Area (Top Left) */}
              <div className="w-24 shrink-0 relative group">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-20 h-20 border border-slate-400 rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 hover:border-indigo-600 transition-colors shadow-sm"
                  title="Click to upload custom company logo"
                >
                  {formData.companyLogo ? (
                    <img
                      src={formData.companyLogo}
                      alt="Logo"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="text-center p-1">
                      <div className="w-16 h-16 rounded-full border border-black flex items-center justify-center">
                        <span className="font-extrabold text-[15px] tracking-tighter italic">DGR</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden Logo Input */}
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {/* Logo Action Tooltip / Reset */}
                <div className="mt-1 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="text-[9px] text-indigo-700 hover:underline font-semibold"
                  >
                    Change Logo
                  </button>
                  {formData.companyLogo && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('companyLogo', null)}
                      className="text-[9px] text-rose-600 hover:underline"
                    >
                      Reset Logo
                    </button>
                  )}
                </div>
              </div>

              {/* Company Info (Center) */}
              <div className="flex-1 text-center px-2 space-y-0.5">
                <input
                  type="text"
                  value={formData.companyName || 'DGR PACKAGING COMPANY'}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  className="w-full text-center font-bold text-[15px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 rounded px-1 outline-none border border-transparent focus:border-indigo-400"
                  placeholder="Company Name"
                />

                <input
                  type="text"
                  value={formData.companyAddress || 'SHOP NO.2, OPP. BLUE DART, NEAR, SAHAR CARGO COMPLEX, ANDHERI (E)'}
                  onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                  className="w-full text-center text-[10px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 rounded px-1 outline-none border border-transparent focus:border-indigo-400"
                  placeholder="Address Line"
                />

                <input
                  type="text"
                  value={formData.companyCityPin || 'MUMBAI - 400 099'}
                  onChange={(e) => handleFieldChange('companyCityPin', e.target.value)}
                  className="w-full text-center text-[10px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 rounded px-1 outline-none border border-transparent focus:border-indigo-400"
                  placeholder="City - Pincode"
                />

                <div className="flex items-center justify-center gap-4 text-[10.5px] pt-0.5">
                  <div className="flex items-center gap-1 font-bold">
                    <span>PAN :</span>
                    <input
                      type="text"
                      value={formData.companyPan || 'CBKPK7600K'}
                      onChange={(e) => handleFieldChange('companyPan', e.target.value)}
                      className="font-bold bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 rounded px-1 outline-none border border-transparent focus:border-indigo-400 w-28 uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 font-bold text-[11.5px]">
                  <span>GSTIN :</span>
                  <input
                    type="text"
                    value={formData.companyGstin || '27CBKPK7600K1ZE'}
                    onChange={(e) => handleFieldChange('companyGstin', e.target.value)}
                    className="font-bold bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 rounded px-1 outline-none border border-transparent focus:border-indigo-400 w-44 uppercase text-center"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] italic font-semibold text-slate-800">
                  <div className="flex items-center gap-1">
                    <span>Tel. :</span>
                    <input
                      type="text"
                      value={formData.companyTel || '022 - 26828108'}
                      onChange={(e) => handleFieldChange('companyTel', e.target.value)}
                      className="bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 rounded px-1 outline-none border border-transparent focus:border-indigo-400 w-32"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>email :</span>
                    <input
                      type="text"
                      value={formData.companyEmail || 'dgrpackaging@gmail.com'}
                      onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                      className="bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 rounded px-1 outline-none border border-transparent focus:border-indigo-400 w-48"
                    />
                  </div>
                </div>
              </div>

              {/* Right Spacer for Balance */}
              <div className="w-24 shrink-0" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. TWO-COLUMN METADATA SECTION (Taller & more spacious) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 border-b-2 border-black text-[11px]">
            {/* Left Column Metadata */}
            <div className="p-3.5 border-r-2 border-black space-y-2 min-h-[160px] flex flex-col justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 font-bold text-slate-800">Invoice No.</span>
                <span className="font-bold">:</span>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                  className="flex-1 min-w-0 font-bold text-black bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 text-slate-700">Dated</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.invoiceDate}
                  onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 text-slate-700">Place of Supply</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.placeOfSupply}
                  onChange={(e) => handleFieldChange('placeOfSupply', e.target.value)}
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 text-slate-700">Reverse Charge</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.reverseCharge}
                  onChange={(e) => handleFieldChange('reverseCharge', e.target.value)}
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 text-slate-700">Transport</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.transport}
                  onChange={(e) => handleFieldChange('transport', e.target.value)}
                  placeholder="e.g. BY ROAD"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 text-slate-700">E-Way Bill No.</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.ewayBillNo}
                  onChange={(e) => handleFieldChange('ewayBillNo', e.target.value)}
                  placeholder="e.g. 28109823901"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-28 shrink-0 font-bold text-slate-800">AIRWAY BILL NO</span>
                <span className="font-bold">:</span>
                <input
                  type="text"
                  value={formData.airwayBillNo}
                  onChange={(e) => handleFieldChange('airwayBillNo', e.target.value)}
                  placeholder="e.g. 176-6268 0251"
                  className="flex-1 min-w-0 font-bold bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Right Column Metadata */}
            <div className="p-3.5 space-y-2 min-h-[160px] flex flex-col justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-32 shrink-0 font-bold text-slate-800">P.O. NO. & DATE</span>
                <span className="font-bold">:</span>
                <input
                  type="text"
                  value={formData.poNumberAndDate}
                  onChange={(e) => handleFieldChange('poNumberAndDate', e.target.value)}
                  placeholder="e.g. PO-9821 DT. 15-JUN-2026"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-32 shrink-0 text-slate-700">NO OF PACKAGES</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.noOfPackages}
                  onChange={(e) => handleFieldChange('noOfPackages', e.target.value)}
                  placeholder="e.g. 02 (01 BOX DG, 01 NON DG)"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-32 shrink-0 text-slate-700">GROSS WEIGHT</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.grossWeight}
                  onChange={(e) => handleFieldChange('grossWeight', e.target.value)}
                  placeholder="e.g. 50.00 KG"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-32 shrink-0 text-slate-700">TRANSPORT NAME</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.transportName}
                  onChange={(e) => handleFieldChange('transportName', e.target.value)}
                  placeholder="e.g. Sai Warehouse & Transport"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-32 shrink-0 text-slate-700">PAID / TO-PAID</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.paidToPaid}
                  onChange={(e) => handleFieldChange('paidToPaid', e.target.value)}
                  placeholder="e.g. PAID / TO-PAY"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-32 shrink-0 text-slate-700">REFERENCE NAME</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => handleFieldChange('referenceName', e.target.value)}
                  placeholder="e.g. Contact Person"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-32 shrink-0 text-slate-700">CONTACT NUMBER</span>
                <span>:</span>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                  placeholder="e.g. +91 9326392294"
                  className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. BILLED TO & SHIPPED TO SECTION (Taller & more spacious) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 border-b-2 border-black text-[11px]">
            {/* Billed To (Buyer) */}
            <div className="p-3.5 border-r-2 border-black flex flex-col justify-between space-y-3 min-h-[175px]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[12px]">Billed to :</span>
                  {savedBuyers.length > 0 && (
                    <select
                      className="text-[9.5px] bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 outline-none"
                      onChange={(e) => {
                        handleSelectBuyer(e.target.value);
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>-- Pick Customer --</option>
                      {savedBuyers.map((b, idx) => (
                        <option key={idx} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.buyerName}
                  onChange={(e) => handleFieldChange('buyerName', e.target.value)}
                  placeholder="Buyer Company Name *"
                  className="w-full font-bold text-[12px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />

                <textarea
                  rows={4}
                  value={formData.buyerAddress}
                  onChange={(e) => handleFieldChange('buyerAddress', e.target.value)}
                  placeholder="Buyer Address"
                  className="w-full text-[10.5px] leading-relaxed bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 p-1.5 rounded outline-none border border-transparent focus:border-indigo-400 resize-none"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-24 shrink-0 text-slate-700 font-medium">State</span>
                  <span>:</span>
                  <input
                    type="text"
                    value={formData.buyerState}
                    onChange={(e) => handleFieldChange('buyerState', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-24 shrink-0 font-bold text-slate-800">GSTIN / UIN</span>
                  <span className="font-bold">:</span>
                  <input
                    type="text"
                    value={formData.buyerGstin}
                    onChange={(e) => handleFieldChange('buyerGstin', e.target.value)}
                    placeholder="27AAMCT0922D1Z1"
                    className="flex-1 min-w-0 font-bold text-indigo-900 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            {/* Shipped To (Delivery Destination) */}
            <div className="p-3.5 flex flex-col justify-between space-y-3 min-h-[175px]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[12px]">Shipped to :</span>
                  <div className="flex items-center gap-1.5">
                    {savedShippers.length > 0 && (
                      <select
                        className="text-[9.5px] bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 outline-none"
                        onChange={(e) => {
                          handleSelectShipper(e.target.value);
                          e.target.value = '';
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Pick Destination --</option>
                        {savedShippers.map((s, idx) => (
                          <option key={idx} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({
                          ...p,
                          consigneeName: p.buyerName,
                          consigneeAddress: p.buyerAddress,
                          consigneeState: p.buyerState,
                          consigneeGstin: p.buyerGstin,
                        }));
                      }}
                      className="text-[9.5px] text-indigo-700 hover:underline font-semibold"
                      title="Copy buyer details"
                    >
                      + Copy Buyer
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.consigneeName}
                  onChange={(e) => handleFieldChange('consigneeName', e.target.value)}
                  placeholder="Consignee / Destination Name"
                  className="w-full font-bold text-[12px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                />

                <textarea
                  rows={4}
                  value={formData.consigneeAddress}
                  onChange={(e) => handleFieldChange('consigneeAddress', e.target.value)}
                  placeholder="Delivery Destination Address"
                  className="w-full text-[10.5px] leading-relaxed bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 p-1.5 rounded outline-none border border-transparent focus:border-indigo-400 resize-none"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-24 shrink-0 text-slate-700 font-medium">State</span>
                  <span>:</span>
                  <input
                    type="text"
                    value={formData.consigneeState}
                    onChange={(e) => handleFieldChange('consigneeState', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-24 shrink-0 font-bold text-slate-800">GSTIN / UIN</span>
                  <span className="font-bold">:</span>
                  <input
                    type="text"
                    value={formData.consigneeGstin}
                    onChange={(e) => handleFieldChange('consigneeGstin', e.target.value)}
                    placeholder="27AAMCT0922D1Z1"
                    className="flex-1 min-w-0 font-bold text-indigo-900 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. GOODS & SERVICES LINE ITEMS TABLE */}
          {/* ========================================================================= */}
          <div className="border-b-2 border-black">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="border-b-2 border-black font-bold text-center bg-slate-50">
                  <th className="w-7 p-1 border-r border-black">S.N.</th>
                  <th className="p-1 border-r border-black text-left">Description of Goods & Service</th>
                  <th className="w-16 p-1 border-r border-black">HSN/SAC Code</th>
                  <th className="w-16 p-1 border-r border-black">Qty. Unit</th>
                  <th className="w-16 p-1 border-r border-black text-right">Price</th>
                  <th className="w-12 p-1 border-r border-black">CGST Rate</th>
                  <th className="w-14 p-1 border-r border-black text-right">CGST Amount</th>
                  <th className="w-12 p-1 border-r border-black">SGST Rate</th>
                  <th className="w-14 p-1 border-r border-black text-right">SGST Amount</th>
                  <th className="w-18 p-1 text-right">Amount(Rs.)</th>
                  <th className="w-6 p-1 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const qty = parseFloat(item.qty) || 0;
                  const price = parseFloat(item.price) || 0;
                  const taxable = qty * price;
                  const cgstR = parseFloat(item.cgstRate) || 0;
                  const sgstR = parseFloat(item.sgstRate) || 0;
                  const cgstAmt = (taxable * cgstR) / 100;
                  const sgstAmt = (taxable * sgstR) / 100;
                  const lineTotal = taxable + cgstAmt + sgstAmt;

                  return (
                    <tr key={idx} className="border-b border-slate-300 group hover:bg-indigo-50/30">
                      <td className="p-1 border-r border-black text-center font-semibold">{idx + 1}.</td>
                      
                      <td className="p-1 border-r border-black space-y-0.5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. UN APPROVED BOX X3"
                          className="w-full font-medium bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                        />
                        <input
                          type="text"
                          value={item.subText || ''}
                          onChange={(e) => handleItemChange(idx, 'subText', e.target.value)}
                          placeholder="+ Sub-text (e.g. UN 3465/6.1/III)"
                          className="w-full text-[9px] italic text-slate-600 bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                        />
                      </td>

                      <td className="p-1 border-r border-black text-center">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          className="w-full text-center bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                        />
                      </td>

                      <td className="p-1 border-r border-black">
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            className="w-10 text-center font-semibold bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                          />
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-7 text-center text-[9px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                          />
                        </div>
                      </td>

                      <td className="p-1 border-r border-black text-right">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          className="w-14 text-right font-semibold bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
                        />
                      </td>

                      <td className="p-1 border-r border-black text-center">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                          className="text-[9.5px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-0.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400 cursor-pointer"
                        >
                          <option value="0">0 %</option>
                          <option value="5">2.5 %</option>
                          <option value="12">6.0 %</option>
                          <option value="18">9.0 %</option>
                          <option value="28">14.0 %</option>
                        </select>
                      </td>

                      <td className="p-1 border-r border-black text-right font-mono text-[9.5px]">
                        {cgstAmt > 0 ? cgstAmt.toFixed(2) : '-'}
                      </td>

                      <td className="p-1 border-r border-black text-center">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                          className="text-[9.5px] bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-0.5 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400 cursor-pointer"
                        >
                          <option value="0">0 %</option>
                          <option value="5">2.5 %</option>
                          <option value="12">6.0 %</option>
                          <option value="18">9.0 %</option>
                          <option value="28">14.0 %</option>
                        </select>
                      </td>

                      <td className="p-1 border-r border-black text-right font-mono text-[9.5px]">
                        {sgstAmt > 0 ? sgstAmt.toFixed(2) : '-'}
                      </td>

                      <td className="p-1 text-right font-bold font-mono text-[10px]">
                        {lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="p-1 text-center no-print">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 text-xs font-bold transition-colors p-0.5"
                            title="Remove row"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Add Item Button Bar */}
            <div className="p-1.5 bg-slate-50 border-t border-slate-200 flex justify-start no-print">
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
              >
                <Plus size={11} />
                <span>Add Line Item</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. GRAND TOTAL ROW */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between p-2 border-b-2 border-black font-bold text-[11.5px] bg-slate-50/60">
            <div className="w-1/2 text-right pr-6">Grand Total</div>
            <div className="w-24 text-center font-bold">
              {totals.totalQty.toFixed(2)} {unitLabel}
            </div>
            <div className="flex-1 text-right pr-4 font-mono font-extrabold text-[12.5px]">
              <span className="text-slate-700 text-[10px] font-sans mr-2">Rs.</span>
              {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. TAX SUMMARY BREAKDOWN TABLE */}
          {/* ========================================================================= */}
          <div className="p-2 border-b-2 border-black text-[10px]">
            <table className="w-72 border-collapse text-center">
              <thead>
                <tr className="font-bold border-b border-slate-400">
                  <th className="text-left py-0.5">Tax Rate</th>
                  <th className="text-right py-0.5">Taxable Amt.</th>
                  <th className="text-right py-0.5">CGST Amt.</th>
                  <th className="text-right py-0.5">SGST Amt.</th>
                  <th className="text-right py-0.5">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(totals.taxSlabs).map((slab, sIdx) => (
                  <tr key={sIdx} className="font-mono text-[9.5px]">
                    <td className="text-left py-0.5 font-sans font-semibold">{slab.rate}%</td>
                    <td className="text-right py-0.5">{slab.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right py-0.5">{slab.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right py-0.5">{slab.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right py-0.5 font-bold">{slab.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* 7. AMOUNT IN WORDS */}
          {/* ========================================================================= */}
          <div className="p-2 border-b-2 border-black font-bold text-[11px] flex items-center gap-1">
            <input
              type="text"
              value={formData.amountInWords || totals.amountInWords}
              onChange={(e) => handleFieldChange('amountInWords', e.target.value)}
              className="w-full font-bold text-black bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400"
            />
          </div>

          {/* ========================================================================= */}
          {/* 8. BANK DETAILS */}
          {/* ========================================================================= */}
          <div className="p-2 border-b-2 border-black text-center space-y-1">
            <div className="font-bold text-[11px]">Bank Details</div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9.5px]">
              <div className="flex items-center gap-1 font-semibold">
                <span>Bank name :</span>
                <input
                  type="text"
                  value={formData.bankName || 'HDFC BANK LTD'}
                  onChange={(e) => handleFieldChange('bankName', e.target.value)}
                  className="bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400 w-28 uppercase font-bold"
                />
              </div>

              <div className="flex items-center gap-1">
                <span>A/c No:</span>
                <input
                  type="text"
                  value={formData.accountNumber || '06687630000070'}
                  onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                  className="bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400 w-36 font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-1">
                <span>RTGS / NEFT no:</span>
                <input
                  type="text"
                  value={formData.ifscCode || 'HDFC0003126'}
                  onChange={(e) => handleFieldChange('ifscCode', e.target.value)}
                  className="bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400 w-28 font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-1">
                <span>Swift code:</span>
                <input
                  type="text"
                  value={formData.swiftCode || 'HDFCINBBXXX'}
                  onChange={(e) => handleFieldChange('swiftCode', e.target.value)}
                  className="bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400 w-28 font-mono"
                />
              </div>

              <div className="flex items-center gap-1">
                <span>Branch :</span>
                <input
                  type="text"
                  value={formData.branchName || 'MAHAD-4'}
                  onChange={(e) => handleFieldChange('branchName', e.target.value)}
                  className="bg-transparent hover:bg-slate-100 focus:bg-indigo-50/70 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-400 w-28 uppercase"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 9. FOOTER (TERMS & CONDITIONS + SIGNATORY SEPARATION) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-12 min-h-[90px] text-[9px]">
            {/* Left: Terms & Conditions */}
            <div className="col-span-6 p-2 border-r-2 border-black space-y-1">
              <div className="font-bold text-[10px]">Terms & Conditions</div>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-800 leading-tight">
                <li>Goods once sold will not be taken back.</li>
                <li>Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.</li>
                <li>Discrepancy if any,in billed item must be Communicated within 7 Days.</li>
                <li>Subject to 'Maharashtra' Jurisdiction only.</li>
              </ol>
            </div>

            {/* Right: Signature Box with Separation Line */}
            <div className="col-span-6 flex flex-col justify-between">
              {/* Receiver's Signature Header */}
              <div className="p-2 border-b-2 border-black font-bold text-[9.5px]">
                Receiver's Signature :
              </div>

              {/* Company Authorised Signatory Footer */}
              <div className="p-3 text-right space-y-7">
                <div className="font-bold text-[10px]">
                  For {formData.companyName || 'DGR PACKAGING COMPANY'}
                </div>
                <div className="font-bold text-[10.5px]">
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
