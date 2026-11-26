import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * VisualCargoManifestSheet - Industry-standard, directly editable IATA Air Cargo / Consolidation Manifest.
 * Uses generic masked placeholders (no real company/shipment data) and clean print-ready A4 styling.
 */
export default function VisualCargoManifestSheet({
  formData,
  onFieldChange,
  manifestRows,
  onRowChange,
  onAddRow,
  onRemoveRow,
}) {
  const inputCls =
    'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10px] leading-snug text-black font-sans px-1 py-0.5 border border-transparent focus:border-indigo-400 transition-colors';
  const textareaCls =
    'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10px] leading-snug text-black font-sans px-1 py-0.5 resize-none border border-transparent focus:border-indigo-400 transition-colors';
  const labelCls = 'text-[8px] uppercase tracking-wide text-slate-700 font-semibold select-none';

  const activeRowsCount = manifestRows.filter(
    (r) => r.awbNumber || r.pieces || r.grossWeight || r.natureOfGoods
  ).length;
  const totalPieces = manifestRows.reduce((sum, r) => sum + (Number(r.pieces) || 0), 0);
  const totalGrossWeight = manifestRows.reduce((sum, r) => sum + (Number(r.grossWeight) || 0), 0);

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      {/* A4 Printable Cargo Manifest Sheet */}
      <div
        id="manifest-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Top Manifest Title & Reference Bar */}
        <div className="flex items-end justify-between pb-2">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
              IATA STANDARD AIR CARGO FORM
            </div>
            <h1 className="text-lg font-extrabold tracking-wide uppercase text-black leading-none mt-0.5">
              CARGO MANIFEST
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <span className="text-slate-600">MANIFEST NO:</span>
              <input
                type="text"
                value={formData.manifestNumber || ''}
                onChange={(e) => onFieldChange('manifestNumber', e.target.value)}
                placeholder="MNF-XXXX-XXXX"
                className="w-28 bg-transparent border-b border-black font-bold outline-none px-1"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-600">PAGE:</span>
              <input
                type="text"
                value={formData.pageNumber || '1 of 1'}
                onChange={(e) => onFieldChange('pageNumber', e.target.value)}
                className="w-12 text-center bg-transparent border-b border-black font-bold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Outer Manifest Box */}
        <div className="border-[1.5px] border-black">
          {/* =============================================================== */}
          {/* ROW 1: Operator / Consolidator & Flight / MAWB Info             */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black">
            {/* Left: Owner / Operator / Consolidator */}
            <div className="col-span-6 border-r border-black p-1.5 flex flex-col justify-between min-h-[82px]">
              <div className={labelCls}>Owner or Operator / Issuing Agent &amp; Address</div>
              <textarea
                rows={4}
                value={formData.operatorName || ''}
                onChange={(e) => onFieldChange('operatorName', e.target.value)}
                placeholder="Enter Carrier / Consolidator Name, Address & Code..."
                className={`${textareaCls} flex-1 mt-0.5`}
              />
            </div>

            {/* Right: Flight, Nationality/Reg, Origin/Dest, MAWB */}
            <div className="col-span-6 flex flex-col">
              <div className="grid grid-cols-12 border-b border-black">
                <div className="col-span-5 p-1.5 border-r border-black">
                  <div className={labelCls}>Marks of Nationality &amp; Reg.</div>
                  <input
                    type="text"
                    value={formData.aircraftReg || ''}
                    onChange={(e) => onFieldChange('aircraftReg', e.target.value.toUpperCase())}
                    placeholder="XX-XXX"
                    className={`${inputCls} uppercase font-mono`}
                  />
                </div>
                <div className="col-span-4 p-1.5 border-r border-black">
                  <div className={labelCls}>Flight No.</div>
                  <input
                    type="text"
                    value={formData.flightNumber || ''}
                    onChange={(e) => onFieldChange('flightNumber', e.target.value.toUpperCase())}
                    placeholder="XX-XXX"
                    className={`${inputCls} uppercase font-bold font-mono`}
                  />
                </div>
                <div className="col-span-3 p-1.5">
                  <div className={labelCls}>Date</div>
                  <input
                    type="text"
                    value={formData.flightDate || ''}
                    onChange={(e) => onFieldChange('flightDate', e.target.value)}
                    placeholder="DD-MMM-YYYY"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 flex-1">
                <div className="col-span-4 p-1.5 border-r border-black">
                  <div className={labelCls}>Point of Lading (Origin)</div>
                  <input
                    type="text"
                    value={formData.originAirport || ''}
                    onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
                    placeholder="XXX"
                    className={`${inputCls} uppercase font-bold`}
                  />
                </div>
                <div className="col-span-4 p-1.5 border-r border-black">
                  <div className={labelCls}>Point of Unlading (Dest.)</div>
                  <input
                    type="text"
                    value={formData.destinationAirport || ''}
                    onChange={(e) => onFieldChange('destinationAirport', e.target.value.toUpperCase())}
                    placeholder="XXX"
                    className={`${inputCls} uppercase font-bold`}
                  />
                </div>
                <div className="col-span-4 p-1.5">
                  <div className={labelCls}>Master AWB No.</div>
                  <input
                    type="text"
                    value={formData.mawbNumber || ''}
                    onChange={(e) => onFieldChange('mawbNumber', e.target.value)}
                    placeholder="0XX-XXXX XXXX"
                    className={`${inputCls} font-mono font-bold`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 2: Aircraft Type, ULD/Container, ETD/ETA, Customs Ref       */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black bg-slate-50/80">
            <div className="col-span-3 p-1.5 border-r border-black">
              <div className={labelCls}>Aircraft Type</div>
              <input
                type="text"
                value={formData.aircraftType || ''}
                onChange={(e) => onFieldChange('aircraftType', e.target.value.toUpperCase())}
                placeholder="BXXX / AXXX"
                className={`${inputCls} uppercase font-mono`}
              />
            </div>
            <div className="col-span-4 p-1.5 border-r border-black">
              <div className={labelCls}>ULD / Container No(s).</div>
              <input
                type="text"
                value={formData.uldNumber || ''}
                onChange={(e) => onFieldChange('uldNumber', e.target.value.toUpperCase())}
                placeholder="AKE-XXXXX-XX / BULK"
                className={`${inputCls} uppercase font-mono`}
              />
            </div>
            <div className="col-span-2 p-1.5 border-r border-black">
              <div className={labelCls}>ETD / ETA (UTC)</div>
              <input
                type="text"
                value={formData.etdEta || ''}
                onChange={(e) => onFieldChange('etdEta', e.target.value)}
                placeholder="XX:XX / XX:XX"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div className="col-span-3 p-1.5">
              <div className={labelCls}>Customs / EGM Reference</div>
              <input
                type="text"
                value={formData.customsRef || ''}
                onChange={(e) => onFieldChange('customsRef', e.target.value)}
                placeholder="CUS-XXXX-XXXX"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 3: Consignment Manifest Table                               */}
          {/* =============================================================== */}
          <div className="border-b border-black">
            {/* Table Header */}
            <div className="grid grid-cols-[30px_112px_46px_64px_124px_124px_1fr_60px_54px] border-b border-black bg-slate-200/80 text-[8px] font-bold uppercase text-center leading-tight">
              <div className="p-1.5 border-r border-black flex items-center justify-center">No.</div>
              <div className="p-1.5 border-r border-black flex items-center justify-center">
                Air Waybill /<br />HAWB No.
              </div>
              <div className="p-1.5 border-r border-black flex items-center justify-center">
                No. of<br />Pcs
              </div>
              <div className="p-1.5 border-r border-black flex items-center justify-center">
                Gross Wt.<br />(kg)
              </div>
              <div className="p-1.5 border-r border-black flex items-center justify-center">
                Shipper&apos;s Name<br />&amp; Address
              </div>
              <div className="p-1.5 border-r border-black flex items-center justify-center">
                Consignee&apos;s Name<br />&amp; Address
              </div>
              <div className="p-1.5 border-r border-black flex items-center justify-center">
                Nature of Goods
              </div>
              <div className="p-1.5 border-r border-black flex items-center justify-center">
                Org /<br />Dest
              </div>
              <div className="p-1.5 flex items-center justify-center">
                SHC /<br />Code
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-black/40">
              {manifestRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[30px_112px_46px_64px_124px_124px_1fr_60px_54px] min-h-[54px] group relative"
                >
                  <div className="p-1 border-r border-black text-center font-mono text-[9.5px] text-slate-600 flex items-start justify-center pt-1.5">
                    {idx + 1}
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.awbNumber}
                      onChange={(e) => onRowChange(idx, 'awbNumber', e.target.value)}
                      placeholder="0XX-XXXX XXXX"
                      className={`${inputCls} font-mono font-semibold`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.pieces}
                      onChange={(e) => onRowChange(idx, 'pieces', e.target.value)}
                      placeholder="0"
                      className={`${inputCls} text-center font-mono`}
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
                    <textarea
                      rows={3}
                      value={row.shipper}
                      onChange={(e) => onRowChange(idx, 'shipper', e.target.value)}
                      placeholder="Shipper..."
                      className={textareaCls}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={3}
                      value={row.consignee}
                      onChange={(e) => onRowChange(idx, 'consignee', e.target.value)}
                      placeholder="Consignee..."
                      className={textareaCls}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={3}
                      value={row.natureOfGoods}
                      onChange={(e) => onRowChange(idx, 'natureOfGoods', e.target.value)}
                      placeholder="Description of goods..."
                      className={textareaCls}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.route}
                      onChange={(e) => onRowChange(idx, 'route', e.target.value.toUpperCase())}
                      placeholder="XXX/XXX"
                      className={`${inputCls} text-center font-mono uppercase`}
                    />
                  </div>
                  <div className="p-1 relative">
                    <input
                      type="text"
                      value={row.shc}
                      onChange={(e) => onRowChange(idx, 'shc', e.target.value.toUpperCase())}
                      placeholder="GEN"
                      className={`${inputCls} text-center font-mono uppercase`}
                    />
                    {manifestRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveRow(idx)}
                        className="print:hidden opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 p-0.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-opacity cursor-pointer"
                        title="Remove Line"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Row */}
            <div className="grid grid-cols-[30px_112px_46px_64px_124px_124px_1fr_60px_54px] border-t border-black bg-slate-100 text-[10px] font-mono font-bold">
              <div className="p-1.5 border-r border-black text-center">Σ</div>
              <div className="p-1.5 border-r border-black text-left text-[9px]">
                {activeRowsCount} AWB{activeRowsCount === 1 ? '' : 's'}
              </div>
              <div className="p-1.5 border-r border-black text-center">{totalPieces || '0'}</div>
              <div className="p-1.5 border-r border-black text-right">
                {totalGrossWeight ? totalGrossWeight.toFixed(1) : '0.0'}
              </div>
              <div className="col-span-5 p-1 flex items-center justify-between px-2 font-sans font-normal text-[9px] text-slate-600">
                <span>Total Pieces &amp; Gross Weight Auto-Calculated</span>
                <button
                  type="button"
                  onClick={onAddRow}
                  className="print:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold cursor-pointer"
                >
                  <Plus size={10} /> Add Consignment Row
                </button>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 4: Remarks / DG Summary + Totals Box                        */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-8 border-r border-black p-1.5 min-h-[68px] flex flex-col">
              <div className={labelCls}>
                Special Handling / Dangerous Goods / Security &amp; Transit Remarks
              </div>
              <textarea
                rows={3}
                value={formData.remarks || ''}
                onChange={(e) => onFieldChange('remarks', e.target.value)}
                placeholder="DG UN codes, temperature instructions, transit seal numbers, security status..."
                className={`${textareaCls} flex-1 mt-0.5`}
              />
            </div>

            <div className="col-span-4 p-2 bg-slate-50/70 flex flex-col justify-between text-[9.5px] font-mono">
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span className="text-slate-600">TOTAL CONSIGNMENTS:</span>
                <span className="font-bold">{activeRowsCount}</span>
              </div>
              <div className="flex justify-between border-b border-slate-300 py-1">
                <span className="text-slate-600">TOTAL PIECES:</span>
                <span className="font-bold">{totalPieces} PCS</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-600">TOTAL GROSS WT:</span>
                <span className="font-bold">{totalGrossWeight.toFixed(1)} KG</span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 5: Official Declaration & Signatures                        */}
          {/* =============================================================== */}
          <div className="p-2 space-y-4">
            <p className="text-[8.5px] leading-snug text-slate-800">
              I declare that all statements and particulars contained in this Manifest and in any attached lists are complete, exact and true to the best of my knowledge and belief.
            </p>

            <div className="grid grid-cols-12 gap-4 pt-2 items-end">
              <div className="col-span-4">
                <input
                  type="text"
                  value={formData.preparedBy || ''}
                  onChange={(e) => onFieldChange('preparedBy', e.target.value)}
                  placeholder="Name / Signatory"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">
                  Prepared By (Consolidator / Agent)
                </div>
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  value={formData.placeAndDate || ''}
                  onChange={(e) => onFieldChange('placeAndDate', e.target.value)}
                  placeholder="PLACE / DD-MMM-YYYY"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5 uppercase"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">
                  Place &amp; Date
                </div>
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={formData.authorizedSignature || ''}
                  onChange={(e) => onFieldChange('authorizedSignature', e.target.value)}
                  placeholder="Pilot-in-Command / Authorised Carrier Agent"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">
                  Signature of Pilot-in-Command or Authorised Agent
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
