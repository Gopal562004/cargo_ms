import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const inputCls =
  'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 border border-transparent focus:border-indigo-400 transition-colors';
const textareaCls =
  'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 resize-none border border-transparent focus:border-indigo-400 transition-colors';
const labelCls = 'text-[8.5px] uppercase tracking-wide text-slate-700 font-semibold select-none';

/**
 * 1. Ocean Bill of Lading (BILL_OF_LADING) — Port to port or combined transport
 * Supports both Indian (IEC/GSTIN/INR) & International (EORI/USD/EUR) shipments.
 */
export function VisualBillOfLadingSheet({
  formData,
  onFieldChange,
  cargoRows,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  const totalPackages = cargoRows.reduce((s, r) => s + (parseFloat(r.packages) || 0), 0);
  const totalGrossWeight = cargoRows.reduce((s, r) => s + (parseFloat(r.grossWeight) || 0), 0);
  const totalMeasurement = cargoRows.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0);

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      <div
        id="bol-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="border-[1.5px] border-black">
          {/* Top Section: Shipper / Consignee / Notify Party (Left) + B/L Header / Carrier / Originals (Right) */}
          <div className="grid grid-cols-12 border-b border-black">
            {/* Left 50% */}
            <div className="col-span-6 border-r border-black flex flex-col">
              <div className="p-1.5 border-b border-black min-h-[76px] flex flex-col">
                <div className={labelCls}>SHIPPER</div>
                <textarea
                  rows={3}
                  value={formData.shipperText || ''}
                  onChange={(e) => onFieldChange('shipperText', e.target.value)}
                  placeholder="Shipper Name, Address, Country & Tax ID (IEC/GSTIN/EORI)..."
                  className={`${textareaCls} flex-1 mt-0.5`}
                />
              </div>
              <div className="p-1.5 border-b border-black min-h-[76px] flex flex-col">
                <div className={labelCls}>CONSIGNEE</div>
                <textarea
                  rows={3}
                  value={formData.consigneeText || ''}
                  onChange={(e) => onFieldChange('consigneeText', e.target.value)}
                  placeholder="Consignee Name / TO ORDER OF..."
                  className={`${textareaCls} flex-1 mt-0.5`}
                />
              </div>
              <div className="p-1.5 min-h-[68px] flex flex-col">
                <div className={labelCls}>NOTIFY PARTY</div>
                <textarea
                  rows={3}
                  value={formData.notifyParty || ''}
                  onChange={(e) => onFieldChange('notifyParty', e.target.value)}
                  placeholder="Notify Party Name, Address & Contact..."
                  className={`${textareaCls} flex-1 mt-0.5`}
                />
              </div>
            </div>

            {/* Right 50% */}
            <div className="col-span-6 flex flex-col">
              {/* BILL OF LADING Title + B/L No, Booking No, Export References */}
              <div className="p-2 border-b border-black">
                <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-black/40">
                  <div>
                    <h1 className="text-base font-extrabold tracking-wide uppercase leading-none">
                      BILL OF LADING
                    </h1>
                    <div className="text-[8.5px] text-slate-700 mt-0.5">
                      For port to port or combined transport
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={labelCls}>B/L NO.</div>
                    <input
                      type="text"
                      value={formData.blNumber || ''}
                      onChange={(e) => onFieldChange('blNumber', e.target.value)}
                      placeholder="BL-XXXX-XXXX"
                      className="w-32 text-right font-mono font-bold text-xs bg-transparent border-b border-black outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <div>
                    <div className={labelCls}>BOOKING NO.</div>
                    <input
                      type="text"
                      value={formData.bookingNumber || ''}
                      onChange={(e) => onFieldChange('bookingNumber', e.target.value)}
                      placeholder="BKG-XXXX"
                      className={`${inputCls} font-mono font-semibold`}
                    />
                  </div>
                  <div>
                    <div className={labelCls}>EXPORT REFERENCES</div>
                    <input
                      type="text"
                      value={formData.exportRef || ''}
                      onChange={(e) => onFieldChange('exportRef', e.target.value)}
                      placeholder="REF-XXXX / SB NO."
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                </div>
              </div>

              {/* CARRIER */}
              <div className="p-1.5 border-b border-black flex-1 min-h-[68px] flex flex-col">
                <div className={labelCls}>CARRIER</div>
                <textarea
                  rows={3}
                  value={formData.carrierName || ''}
                  onChange={(e) => onFieldChange('carrierName', e.target.value)}
                  placeholder="Shipping Line / NVOCC Carrier Name & Address..."
                  className={`${textareaCls} font-semibold flex-1 mt-0.5`}
                />
              </div>

              {/* NUMBER OF ORIGINAL B/LS | PLACE AND DATE OF ISSUE */}
              <div className="grid grid-cols-2">
                <div className="p-1.5 border-r border-black">
                  <div className={labelCls}>NUMBER OF ORIGINAL B/LS</div>
                  <input
                    type="text"
                    value={formData.originalCount || 'THREE (3)'}
                    onChange={(e) => onFieldChange('originalCount', e.target.value.toUpperCase())}
                    className={`${inputCls} font-mono font-bold uppercase`}
                  />
                </div>
                <div className="p-1.5">
                  <div className={labelCls}>PLACE AND DATE OF ISSUE</div>
                  <input
                    type="text"
                    value={formData.placeAndDate || ''}
                    onChange={(e) => onFieldChange('placeAndDate', e.target.value)}
                    placeholder="PLACE / DD-MMM-YYYY"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Routing Row 1: PRE-CARRIAGE BY | PLACE OF RECEIPT | OCEAN VESSEL AND VOYAGE NO. | PORT OF LOADING */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>PRE-CARRIAGE BY</div>
              <input
                type="text"
                value={formData.preCarriage || ''}
                onChange={(e) => onFieldChange('preCarriage', e.target.value)}
                placeholder="—"
                className={inputCls}
              />
            </div>
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>PLACE OF RECEIPT</div>
              <input
                type="text"
                value={formData.placeOfReceipt || ''}
                onChange={(e) => onFieldChange('placeOfReceipt', e.target.value)}
                placeholder="City / ICD / CFS"
                className={inputCls}
              />
            </div>
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>OCEAN VESSEL AND VOYAGE NO.</div>
              <input
                type="text"
                value={formData.vesselVoyage || ''}
                onChange={(e) => onFieldChange('vesselVoyage', e.target.value)}
                placeholder="VESSEL / V.XXX"
                className={`${inputCls} font-semibold`}
              />
            </div>
            <div className="col-span-3 p-1.5">
              <div className={labelCls}>PORT OF LOADING</div>
              <input
                type="text"
                value={formData.portOfLoading || ''}
                onChange={(e) => onFieldChange('portOfLoading', e.target.value)}
                placeholder="Port of Loading"
                className={`${inputCls} font-semibold`}
              />
            </div>
          </div>

          {/* Routing Row 2: PORT OF DISCHARGE | PLACE OF DELIVERY | FREIGHT AND CHARGES | FREIGHT PAYABLE AT */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>PORT OF DISCHARGE</div>
              <input
                type="text"
                value={formData.portOfDischarge || ''}
                onChange={(e) => onFieldChange('portOfDischarge', e.target.value)}
                placeholder="Port of Discharge"
                className={`${inputCls} font-semibold`}
              />
            </div>
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>PLACE OF DELIVERY</div>
              <input
                type="text"
                value={formData.placeOfDelivery || ''}
                onChange={(e) => onFieldChange('placeOfDelivery', e.target.value)}
                placeholder="Final Destination"
                className={inputCls}
              />
            </div>
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>FREIGHT AND CHARGES</div>
              <input
                type="text"
                value={formData.freightTerms || 'FREIGHT PREPAID'}
                onChange={(e) => onFieldChange('freightTerms', e.target.value.toUpperCase())}
                placeholder="PREPAID / COLLECT (USD/INR)"
                className={`${inputCls} font-mono uppercase font-bold`}
              />
            </div>
            <div className="col-span-3 p-1.5">
              <div className={labelCls}>FREIGHT PAYABLE AT</div>
              <input
                type="text"
                value={formData.freightPayableAt || ''}
                onChange={(e) => onFieldChange('freightPayableAt', e.target.value)}
                placeholder="ORIGIN / DESTINATION"
                className={`${inputCls} uppercase`}
              />
            </div>
          </div>

          {/* Cargo Table */}
          <div className="border-b border-black">
            <div className="grid grid-cols-[160px_90px_1fr_92px_92px] border-b border-black bg-slate-100 text-[8px] font-bold uppercase text-center">
              <div className="p-1.5 border-r border-black">
                MARKS AND NUMBERS, CONTAINER AND SEAL NO.
              </div>
              <div className="p-1.5 border-r border-black">NUMBER AND KIND OF PACKAGES</div>
              <div className="p-1.5 border-r border-black">DESCRIPTION OF GOODS</div>
              <div className="p-1.5 border-r border-black">GROSS WEIGHT (KG)</div>
              <div className="p-1.5">MEASUREMENT (M³)</div>
            </div>

            <div className="divide-y divide-slate-300">
              {cargoRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[160px_90px_1fr_92px_92px] min-h-[110px] group relative"
                >
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={5}
                      value={row.containerSeal}
                      onChange={(e) => onRowChange(idx, 'containerSeal', e.target.value)}
                      placeholder="MARKS: N/M&#10;CNTR: XXXX0000000&#10;SEAL: XXXXXX"
                      className={`${textareaCls} font-mono`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={5}
                      value={row.packages}
                      onChange={(e) => onRowChange(idx, 'packages', e.target.value)}
                      placeholder="0 PKGS / CTNS"
                      className={`${textareaCls} text-center font-mono`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={5}
                      value={row.description}
                      onChange={(e) => onRowChange(idx, 'description', e.target.value)}
                      placeholder="SHIPPER'S LOAD, STOW & COUNT — Description of goods, HS Code..."
                      className={textareaCls}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={5}
                      value={row.grossWeight}
                      onChange={(e) => onRowChange(idx, 'grossWeight', e.target.value)}
                      placeholder="0.00"
                      className={`${textareaCls} text-right font-mono`}
                    />
                  </div>
                  <div className="p-1 relative">
                    <textarea
                      rows={5}
                      value={row.cbm}
                      onChange={(e) => onRowChange(idx, 'cbm', e.target.value)}
                      placeholder="0.000"
                      className={`${textareaCls} text-right font-mono`}
                    />
                    {cargoRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveRow(idx)}
                        className="print:hidden opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-0.5 rounded bg-rose-50 text-rose-600 cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Row */}
            <div className="grid grid-cols-[160px_90px_1fr_92px_92px] border-t border-black bg-slate-50 font-mono text-[10px] font-bold">
              <div className="p-1.5 border-r border-black font-sans">Totals</div>
              <div className="p-1.5 border-r border-black text-center">
                {totalPackages || '0'}
              </div>
              <div className="p-1.5 border-r border-black flex items-center justify-end">
                <button
                  type="button"
                  onClick={onAddRow}
                  className="print:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9.5px] font-sans font-semibold cursor-pointer"
                >
                  <Plus size={10} /> Add Cargo Row
                </button>
              </div>
              <div className="p-1.5 border-r border-black text-right">
                {totalGrossWeight ? totalGrossWeight.toFixed(2) : '0.00'}
              </div>
              <div className="p-1.5 text-right">
                {totalMeasurement ? totalMeasurement.toFixed(3) : '0.000'}
              </div>
            </div>
          </div>

          {/* TOTAL NUMBER OF CONTAINERS OR PACKAGES (IN WORDS) | SHIPPED ON BOARD DATE */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-8 p-1.5 border-r border-black">
              <div className={labelCls}>TOTAL NUMBER OF CONTAINERS OR PACKAGES (IN WORDS)</div>
              <input
                type="text"
                value={formData.totalPackagesInWords || ''}
                onChange={(e) => onFieldChange('totalPackagesInWords', e.target.value)}
                placeholder="SAY TOTAL ... CONTAINERS / PACKAGES ONLY"
                className={`${inputCls} uppercase font-semibold`}
              />
            </div>
            <div className="col-span-4 p-1.5">
              <div className={labelCls}>SHIPPED ON BOARD DATE</div>
              <input
                type="text"
                value={formData.shippedOnBoardDate || ''}
                onChange={(e) => onFieldChange('shippedOnBoardDate', e.target.value)}
                placeholder="DD-MMM-YYYY"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
          </div>

          {/* TERMS (Left) + SIGNED FOR THE CARRIER / AUTHORISED SIGNATURE (Right) */}
          <div className="grid grid-cols-12">
            <div className="col-span-7 p-2 border-r border-black">
              <div className={`${labelCls} mb-1`}>TERMS</div>
              <p className="text-[7.8px] leading-[1.3] text-slate-900">
                Received by the carrier from the shipper in apparent good order and condition, unless otherwise stated, the goods, or the containers or packages said to contain the goods, described above, to be carried from the place of receipt or port of loading to the port of discharge or place of delivery, subject to the terms and conditions of the carrier&apos;s bill of lading. One original bill of lading, duly endorsed, must be surrendered in exchange for the goods or a delivery order. In witness whereof, the number of original bills of lading stated on this document have been signed, one of which being accomplished, the others to stand void.
              </p>
            </div>
            <div className="col-span-5 p-2 flex flex-col justify-between">
              <div className={labelCls}>
                SIGNED FOR THE CARRIER, AS CARRIER OR AS AGENT FOR THE CARRIER
              </div>
              <div className="pt-6">
                <input
                  type="text"
                  value={formData.carrierSignature || ''}
                  onChange={(e) => onFieldChange('carrierSignature', e.target.value)}
                  placeholder="Authorised Signatory & Stamp"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                />
                <div className="text-center text-[8px] font-semibold text-slate-700 pt-0.5 uppercase">
                  AUTHORISED SIGNATURE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Sea Freight B/L Manifest (BOL_MANIFEST)
 */
export function VisualBolManifestSheet({
  formData,
  onFieldChange,
  manifestRows,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  const totalPkgs = manifestRows.reduce((s, r) => s + (Number(r.packages) || 0), 0);
  const totalWt = manifestRows.reduce((s, r) => s + (Number(r.grossWeight) || 0), 0);
  const totalCbm = manifestRows.reduce((s, r) => s + (Number(r.cbm) || 0), 0);

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      <div
        id="bol-manifest-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="flex items-end justify-between pb-2">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
              MARITIME CARGO CONSOLIDATION
            </div>
            <h1 className="text-base font-extrabold tracking-wide uppercase mt-0.5">
              OCEAN BILL OF LADING MANIFEST
            </h1>
          </div>
          <div className="text-[10px] font-mono">
            <span className="text-slate-600">MANIFEST NO: </span>
            <input
              type="text"
              value={formData.manifestNumber || ''}
              onChange={(e) => onFieldChange('manifestNumber', e.target.value)}
              placeholder="OCN-MNF-XXXX"
              className="w-28 border-b border-black font-bold bg-transparent outline-none px-1"
            />
          </div>
        </div>

        <div className="border-[1.5px] border-black">
          <div className="grid grid-cols-12 border-b border-black bg-slate-50">
            <div className="col-span-4 p-1.5 border-r border-black">
              <div className={labelCls}>Carrier / Consolidator</div>
              <input
                type="text"
                value={formData.carrierName || ''}
                onChange={(e) => onFieldChange('carrierName', e.target.value)}
                placeholder="Shipping Line / Agent"
                className={`${inputCls} font-bold`}
              />
            </div>
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>Vessel / Voyage No.</div>
              <input
                type="text"
                value={formData.vesselVoyage || ''}
                onChange={(e) => onFieldChange('vesselVoyage', e.target.value)}
                placeholder="VESSEL / V.XXX"
                className={`${inputCls} font-semibold`}
              />
            </div>
            <div className="col-span-2 p-1.5 border-r border-black">
              <div className={labelCls}>Port of Loading</div>
              <input
                type="text"
                value={formData.portOfLoading || ''}
                onChange={(e) => onFieldChange('portOfLoading', e.target.value)}
                placeholder="POL"
                className={inputCls}
              />
            </div>
            <div className="col-span-3 p-1.5">
              <div className={labelCls}>Port of Discharge &amp; Sailing Date</div>
              <input
                type="text"
                value={formData.podAndDate || ''}
                onChange={(e) => onFieldChange('podAndDate', e.target.value)}
                placeholder="POD / DD-MMM-YYYY"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-[28px_98px_108px_112px_112px_48px_1fr_64px_56px_44px] border-b border-black bg-slate-200/80 text-[8px] font-bold uppercase text-center">
            <div className="p-1 border-r border-black">#</div>
            <div className="p-1 border-r border-black">B/L No.</div>
            <div className="p-1 border-r border-black">Container / Seal</div>
            <div className="p-1 border-r border-black">Shipper</div>
            <div className="p-1 border-r border-black">Consignee</div>
            <div className="p-1 border-r border-black">Pkgs</div>
            <div className="p-1 border-r border-black">Description of Goods</div>
            <div className="p-1 border-r border-black">Gross (KG)</div>
            <div className="p-1 border-r border-black">CBM</div>
            <div className="p-1">Terms</div>
          </div>

          <div className="divide-y divide-black/40">
            {manifestRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[28px_98px_108px_112px_112px_48px_1fr_64px_56px_44px] min-h-[48px] group relative"
              >
                <div className="p-1 border-r border-black text-center font-mono text-[9px] pt-1.5">
                  {idx + 1}
                </div>
                <div className="p-1 border-r border-black">
                  <input
                    type="text"
                    value={row.blNumber}
                    onChange={(e) => onRowChange(idx, 'blNumber', e.target.value)}
                    placeholder="BL-XXXX"
                    className={`${inputCls} font-mono font-bold`}
                  />
                </div>
                <div className="p-1 border-r border-black">
                  <textarea
                    rows={2}
                    value={row.containerSeal}
                    onChange={(e) => onRowChange(idx, 'containerSeal', e.target.value)}
                    placeholder="CNTR / SEAL"
                    className={`${textareaCls} font-mono`}
                  />
                </div>
                <div className="p-1 border-r border-black">
                  <textarea
                    rows={2}
                    value={row.shipper}
                    onChange={(e) => onRowChange(idx, 'shipper', e.target.value)}
                    placeholder="Shipper..."
                    className={textareaCls}
                  />
                </div>
                <div className="p-1 border-r border-black">
                  <textarea
                    rows={2}
                    value={row.consignee}
                    onChange={(e) => onRowChange(idx, 'consignee', e.target.value)}
                    placeholder="Consignee..."
                    className={textareaCls}
                  />
                </div>
                <div className="p-1 border-r border-black">
                  <input
                    type="text"
                    value={row.packages}
                    onChange={(e) => onRowChange(idx, 'packages', e.target.value)}
                    placeholder="0"
                    className={`${inputCls} text-center font-mono`}
                  />
                </div>
                <div className="p-1 border-r border-black">
                  <textarea
                    rows={2}
                    value={row.description}
                    onChange={(e) => onRowChange(idx, 'description', e.target.value)}
                    placeholder="Goods description..."
                    className={textareaCls}
                  />
                </div>
                <div className="p-1 border-r border-black">
                  <input
                    type="text"
                    value={row.grossWeight}
                    onChange={(e) => onRowChange(idx, 'grossWeight', e.target.value)}
                    placeholder="0.0"
                    className={`${inputCls} text-right font-mono`}
                  />
                </div>
                <div className="p-1 border-r border-black">
                  <input
                    type="text"
                    value={row.cbm}
                    onChange={(e) => onRowChange(idx, 'cbm', e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} text-right font-mono`}
                  />
                </div>
                <div className="p-1 relative">
                  <input
                    type="text"
                    value={row.terms}
                    onChange={(e) => onRowChange(idx, 'terms', e.target.value.toUpperCase())}
                    placeholder="PP"
                    className={`${inputCls} text-center font-mono uppercase`}
                  />
                  {manifestRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveRow(idx)}
                      className="print:hidden opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 p-0.5 rounded bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-2 py-1.5 border-t border-black bg-slate-100 flex items-center justify-between text-[9.5px] font-mono font-bold">
            <span>
              TOTALS: {manifestRows.length} B/L(s) · {totalPkgs} PKGS · {totalWt.toFixed(1)} KG · {totalCbm.toFixed(3)} CBM
            </span>
            <button
              type="button"
              onClick={onAddRow}
              className="print:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans cursor-pointer"
            >
              <Plus size={10} /> Add B/L Row
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. IMO Dangerous Goods Declaration (IMO_DGD)
 */
export function VisualImoDgdSheet({ formData, onFieldChange, dgRows, onDgRowChange, onAddDgRow, onRemoveDgRow }) {
  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      <div
        id="imodgd-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="text-center pb-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
            IMDG CODE · MULTIMODAL DANGEROUS GOODS FORM
          </div>
          <h1 className="text-base font-extrabold tracking-wide uppercase mt-0.5">
            IMO DANGEROUS GOODS DECLARATION
          </h1>
        </div>

        <div className="border-[1.5px] border-black">
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-1.5 border-r border-black min-h-[76px]">
              <div className={labelCls}>1. Shipper / Consignor / Sender</div>
              <textarea
                rows={3}
                value={formData.shipperText || ''}
                onChange={(e) => onFieldChange('shipperText', e.target.value)}
                placeholder="Shipper Name & Address..."
                className={textareaCls}
              />
            </div>
            <div className="col-span-6 flex flex-col">
              <div className="grid grid-cols-2 border-b border-black">
                <div className="p-1.5 border-r border-black">
                  <div className={labelCls}>2. Transport Document / B/L No.</div>
                  <input
                    type="text"
                    value={formData.blNumber || ''}
                    onChange={(e) => onFieldChange('blNumber', e.target.value)}
                    placeholder="BL-XXXX-XXXX"
                    className={`${inputCls} font-mono font-bold`}
                  />
                </div>
                <div className="p-1.5">
                  <div className={labelCls}>3. Page of Pages / Ref</div>
                  <input
                    type="text"
                    value={formData.pageRef || '1 of 1'}
                    onChange={(e) => onFieldChange('pageRef', e.target.value)}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>
              <div className="p-1.5">
                <div className={labelCls}>4. Shipper&apos;s Reference / Booking No.</div>
                <input
                  type="text"
                  value={formData.bookingRef || ''}
                  onChange={(e) => onFieldChange('bookingRef', e.target.value)}
                  placeholder="REF-XXXX"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-1.5 border-r border-black min-h-[72px]">
              <div className={labelCls}>5. Consignee</div>
              <textarea
                rows={3}
                value={formData.consigneeText || ''}
                onChange={(e) => onFieldChange('consigneeText', e.target.value)}
                placeholder="Consignee Name & Address..."
                className={textareaCls}
              />
            </div>
            <div className="col-span-6 grid grid-cols-2">
              <div className="p-1.5 border-r border-black border-b">
                <div className={labelCls}>6. Vessel / Voyage No.</div>
                <input
                  type="text"
                  value={formData.vesselVoyage || ''}
                  onChange={(e) => onFieldChange('vesselVoyage', e.target.value)}
                  placeholder="VESSEL / V.XXX"
                  className={inputCls}
                />
              </div>
              <div className="p-1.5 border-b border-black">
                <div className={labelCls}>7. Port of Loading</div>
                <input
                  type="text"
                  value={formData.portOfLoading || ''}
                  onChange={(e) => onFieldChange('portOfLoading', e.target.value)}
                  placeholder="POL"
                  className={inputCls}
                />
              </div>
              <div className="p-1.5 border-r border-black">
                <div className={labelCls}>8. Port of Discharge</div>
                <input
                  type="text"
                  value={formData.portOfDischarge || ''}
                  onChange={(e) => onFieldChange('portOfDischarge', e.target.value)}
                  placeholder="POD"
                  className={inputCls}
                />
              </div>
              <div className="p-1.5">
                <div className={labelCls}>9. Container / Vehicle No.</div>
                <input
                  type="text"
                  value={formData.containerNo || ''}
                  onChange={(e) => onFieldChange('containerNo', e.target.value.toUpperCase())}
                  placeholder="XXXX0000000"
                  className={`${inputCls} font-mono uppercase font-bold`}
                />
              </div>
            </div>
          </div>

          {/* IMDG Table */}
          <div className="border-b border-black">
            <div className="grid grid-cols-[62px_1fr_54px_40px_60px_54px_118px_68px_54px] border-b border-black bg-slate-100 text-[8px] font-bold text-center">
              <div className="p-1 border-r border-black">UN No.</div>
              <div className="p-1 border-r border-black">Proper Shipping Name</div>
              <div className="p-1 border-r border-black">Class</div>
              <div className="p-1 border-r border-black">PG</div>
              <div className="p-1 border-r border-black">Flashpt</div>
              <div className="p-1 border-r border-black">Marine Pol.</div>
              <div className="p-1 border-r border-black">No. &amp; Kind of Pkgs</div>
              <div className="p-1 border-r border-black">Mass (kg)</div>
              <div className="p-1">EmS</div>
            </div>

            <div className="divide-y divide-slate-300">
              {dgRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[62px_1fr_54px_40px_60px_54px_118px_68px_54px] min-h-[50px] group relative"
                >
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.unNumber}
                      onChange={(e) => onDgRowChange(idx, 'unNumber', e.target.value.toUpperCase())}
                      placeholder="UN XXXX"
                      className={`${inputCls} font-mono font-bold text-center uppercase`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={2}
                      value={row.properShippingName}
                      onChange={(e) => onDgRowChange(idx, 'properShippingName', e.target.value)}
                      placeholder="Proper shipping name..."
                      className={textareaCls}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.hazardClass}
                      onChange={(e) => onDgRowChange(idx, 'hazardClass', e.target.value)}
                      placeholder="X"
                      className={`${inputCls} text-center font-mono`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.packingGroup}
                      onChange={(e) => onDgRowChange(idx, 'packingGroup', e.target.value.toUpperCase())}
                      placeholder="II"
                      className={`${inputCls} text-center font-mono uppercase`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.flashpoint}
                      onChange={(e) => onDgRowChange(idx, 'flashpoint', e.target.value)}
                      placeholder="— °C"
                      className={`${inputCls} text-center font-mono`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.marinePollutant}
                      onChange={(e) => onDgRowChange(idx, 'marinePollutant', e.target.value.toUpperCase())}
                      placeholder="NO"
                      className={`${inputCls} text-center font-mono uppercase`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={2}
                      value={row.packages}
                      onChange={(e) => onDgRowChange(idx, 'packages', e.target.value)}
                      placeholder="X Drums / Boxes"
                      className={textareaCls}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.mass}
                      onChange={(e) => onDgRowChange(idx, 'mass', e.target.value)}
                      placeholder="0.0"
                      className={`${inputCls} text-right font-mono`}
                    />
                  </div>
                  <div className="p-1 relative">
                    <input
                      type="text"
                      value={row.ems}
                      onChange={(e) => onDgRowChange(idx, 'ems', e.target.value.toUpperCase())}
                      placeholder="F-X, S-X"
                      className={`${inputCls} text-center font-mono uppercase`}
                    />
                    {dgRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveDgRow(idx)}
                        className="print:hidden opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 p-0.5 rounded bg-rose-50 text-rose-600 cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="print:hidden px-2 py-1 border-t border-slate-300 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={onAddDgRow}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9.5px] font-semibold cursor-pointer"
              >
                <Plus size={10} /> Add IMDG Line
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12">
            <div className="col-span-6 p-2 border-r border-black text-[8.3px] leading-snug">
              <div className="font-bold uppercase mb-1">Container / Vehicle Packing Certificate &amp; Declaration</div>
              I hereby declare that the contents of this consignment are fully and accurately described above by the Proper Shipping Name, and are classified, packaged, marked and labelled/placarded, and are in all respects in proper condition for transport by sea in accordance with the IMDG Code.
            </div>
            <div className="col-span-6 p-2 space-y-2">
              <div className="flex items-center justify-between gap-2 text-[9px] font-mono">
                <span className="font-bold text-rose-700">24-HR EMERGENCY:</span>
                <input
                  type="text"
                  value={formData.emergencyPhone || ''}
                  onChange={(e) => onFieldChange('emergencyPhone', e.target.value)}
                  placeholder="+XX-XXXX-XXXXXX"
                  className="w-36 bg-transparent border-b border-slate-400 font-bold outline-none px-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <input
                    type="text"
                    value={formData.placeAndDate || ''}
                    onChange={(e) => onFieldChange('placeAndDate', e.target.value)}
                    placeholder="PLACE / DD-MMM-YYYY"
                    className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                  />
                  <div className="text-center text-[8px] text-slate-700 pt-0.5">Place &amp; Date</div>
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.signature || ''}
                    onChange={(e) => onFieldChange('signature', e.target.value)}
                    placeholder="Authorised Signatory"
                    className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                  />
                  <div className="text-center text-[8px] text-slate-700 pt-0.5">Signature of Declarant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. SOLAS Verified Gross Mass Declaration (SOLAS_VGM)
 */
export function VisualSolasVgmSheet({ formData, onFieldChange }) {
  const method = formData.vgmMethod || 'METHOD_1';
  const autoVgm =
    method === 'METHOD_2' && (formData.cargoWeight || formData.tareWeight)
      ? (Number(formData.cargoWeight || 0) + Number(formData.tareWeight || 0)).toFixed(1)
      : formData.vgmWeight || '';

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      <div
        id="vgm-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="text-center pb-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
            SOLAS CHAPTER VI, REGULATION 2 · CONTAINER WEIGHT VERIFICATION
          </div>
          <h1 className="text-base font-extrabold tracking-wide uppercase mt-0.5">
            VERIFIED GROSS MASS (VGM) DECLARATION
          </h1>
        </div>

        <div className="border-[1.5px] border-black">
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-2 border-r border-black">
              <div className={labelCls}>Shipper / Authorised Representative</div>
              <textarea
                rows={3}
                value={formData.shipperText || ''}
                onChange={(e) => onFieldChange('shipperText', e.target.value)}
                placeholder="Shipper Company Name, Address & Contact..."
                className={textareaCls}
              />
            </div>
            <div className="col-span-6 grid grid-cols-2">
              <div className="p-2 border-r border-black border-b">
                <div className={labelCls}>Booking / B/L No.</div>
                <input
                  type="text"
                  value={formData.bookingNumber || ''}
                  onChange={(e) => onFieldChange('bookingNumber', e.target.value)}
                  placeholder="BKG-XXXX-XXXX"
                  className={`${inputCls} font-mono font-bold`}
                />
              </div>
              <div className="p-2 border-b border-black">
                <div className={labelCls}>VGM Reference No.</div>
                <input
                  type="text"
                  value={formData.vgmRef || ''}
                  onChange={(e) => onFieldChange('vgmRef', e.target.value)}
                  placeholder="VGM-XXXX"
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div className="p-2 border-r border-black">
                <div className={labelCls}>Vessel / Voyage No.</div>
                <input
                  type="text"
                  value={formData.vesselVoyage || ''}
                  onChange={(e) => onFieldChange('vesselVoyage', e.target.value)}
                  placeholder="VESSEL / V.XXX"
                  className={inputCls}
                />
              </div>
              <div className="p-2">
                <div className={labelCls}>Port of Loading</div>
                <input
                  type="text"
                  value={formData.portOfLoading || ''}
                  onChange={(e) => onFieldChange('portOfLoading', e.target.value)}
                  placeholder="Port of Loading"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black bg-slate-50">
            <div className="col-span-4 p-2 border-r border-black">
              <div className={labelCls}>Container Number</div>
              <input
                type="text"
                value={formData.containerNo || ''}
                onChange={(e) => onFieldChange('containerNo', e.target.value.toUpperCase())}
                placeholder="XXXX0000000"
                className="w-full text-sm font-mono font-extrabold uppercase bg-transparent outline-none"
              />
            </div>
            <div className="col-span-4 p-2 border-r border-black">
              <div className={labelCls}>ISO Container Size / Type</div>
              <input
                type="text"
                value={formData.containerSize || ''}
                onChange={(e) => onFieldChange('containerSize', e.target.value.toUpperCase())}
                placeholder="40HC / 20GP"
                className={`${inputCls} font-mono uppercase font-bold`}
              />
            </div>
            <div className="col-span-4 p-2">
              <div className={labelCls}>Weighbridge / Scale Cert. No.</div>
              <input
                type="text"
                value={formData.scaleCertNo || ''}
                onChange={(e) => onFieldChange('scaleCertNo', e.target.value)}
                placeholder="CERT-XXXX"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          <div className="p-2.5 border-b border-black space-y-2">
            <div className={labelCls}>VGM Determination Method (Select One)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
              <label className="flex items-start gap-2 p-2 border border-black/30 rounded-xs cursor-pointer">
                <input
                  type="radio"
                  name="vgmMethod"
                  checked={method === 'METHOD_1'}
                  onChange={() => onFieldChange('vgmMethod', 'METHOD_1')}
                  className="mt-0.5"
                />
                <span>
                  <strong>Method 1:</strong> Weighing the packed and sealed container using calibrated and certified equipment.
                </span>
              </label>
              <label className="flex items-start gap-2 p-2 border border-black/30 rounded-xs cursor-pointer">
                <input
                  type="radio"
                  name="vgmMethod"
                  checked={method === 'METHOD_2'}
                  onChange={() => onFieldChange('vgmMethod', 'METHOD_2')}
                  className="mt-0.5"
                />
                <span>
                  <strong>Method 2:</strong> Weighing all packages, cargo items, dunnage &amp; securing material, and adding container tare weight.
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-4 p-2 border-r border-black">
              <div className={labelCls}>Cargo + Dunnage Weight (KG)</div>
              <input
                type="text"
                value={formData.cargoWeight || ''}
                onChange={(e) => onFieldChange('cargoWeight', e.target.value)}
                placeholder="0.0"
                className={`${inputCls} font-mono font-bold text-sm`}
              />
            </div>
            <div className="col-span-4 p-2 border-r border-black">
              <div className={labelCls}>Container Tare Weight (KG)</div>
              <input
                type="text"
                value={formData.tareWeight || ''}
                onChange={(e) => onFieldChange('tareWeight', e.target.value)}
                placeholder="0.0"
                className={`${inputCls} font-mono font-bold text-sm`}
              />
            </div>
            <div className="col-span-4 p-2 bg-slate-100">
              <div className={labelCls}>Verified Gross Mass (VGM) (KG)</div>
              <input
                type="text"
                value={autoVgm}
                onChange={(e) => onFieldChange('vgmWeight', e.target.value)}
                placeholder="0.0"
                className="w-full text-base font-mono font-extrabold bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 space-y-3">
            <p className="text-[8.5px] leading-snug text-slate-800">
              In accordance with the International Convention for the Safety of Life at Sea (SOLAS) Chapter VI, Regulation 2, the undersigned Shipper hereby certifies that the Verified Gross Mass (VGM) declared above is accurate and obtained using a calibrated method compliant with national regulations.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2 items-end">
              <div>
                <input
                  type="text"
                  value={formData.authorisedPerson || ''}
                  onChange={(e) => onFieldChange('authorisedPerson', e.target.value)}
                  placeholder="Authorised Person Name (CAPS)"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5 uppercase"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">Authorised Person</div>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.declarationDate || ''}
                  onChange={(e) => onFieldChange('declarationDate', e.target.value)}
                  placeholder="DD-MMM-YYYY"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">Date</div>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.signature || ''}
                  onChange={(e) => onFieldChange('signature', e.target.value)}
                  placeholder="Signature & Company Stamp"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">Signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
