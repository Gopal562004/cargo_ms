import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const inputCls =
  'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 border border-transparent focus:border-indigo-400 transition-colors';
const textareaCls =
  'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 resize-none border border-transparent focus:border-indigo-400 transition-colors';
const labelCls = 'text-[8.5px] uppercase tracking-wide text-slate-700 font-semibold select-none';

/**
 * 1. IATA Shipper's Declaration for Dangerous Goods (DGD)
 */
export function VisualDgdSheet({ formData, onFieldChange, dgRows, onDgRowChange, onAddDgRow, onRemoveDgRow }) {
  const stripeStyle = {
    backgroundImage:
      'repeating-linear-gradient(135deg, #dc2626 0px, #dc2626 8px, #ffffff 8px, #ffffff 16px)',
  };

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      <div
        id="dgd-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none flex"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Left Mandatory Red Hatched Border */}
        <div className="w-3 shrink-0" style={stripeStyle} />

        {/* Inner DGD Form */}
        <div className="flex-1 p-5 print:p-2">
          <div className="text-center pb-2">
            <h1 className="text-base font-extrabold tracking-wide uppercase">
              SHIPPER&apos;S DECLARATION FOR DANGEROUS GOODS
            </h1>
          </div>

          <div className="border-[1.5px] border-black">
            {/* Row 1: Shipper + AWB / Page / Ref */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-6 border-r border-black p-1.5 min-h-[82px] flex flex-col">
                <div className={labelCls}>Shipper</div>
                <textarea
                  rows={4}
                  value={formData.shipperText || ''}
                  onChange={(e) => onFieldChange('shipperText', e.target.value)}
                  placeholder="Shipper Name, Address & Contact..."
                  className={`${textareaCls} flex-1 mt-0.5`}
                />
              </div>
              <div className="col-span-6 flex flex-col">
                <div className="p-1.5 border-b border-black">
                  <div className={labelCls}>Air Waybill No.</div>
                  <input
                    type="text"
                    value={formData.awbNumber || ''}
                    onChange={(e) => onFieldChange('awbNumber', e.target.value)}
                    placeholder="0XX-XXXX XXXX"
                    className={`${inputCls} font-mono font-bold`}
                  />
                </div>
                <div className="grid grid-cols-2 border-b border-black">
                  <div className="p-1.5 border-r border-black">
                    <div className={labelCls}>Page of Pages</div>
                    <input
                      type="text"
                      value={formData.pageOfPages || '1 of 1'}
                      onChange={(e) => onFieldChange('pageOfPages', e.target.value)}
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                  <div className="p-1.5">
                    <div className={labelCls}>Shipper&apos;s Reference Number</div>
                    <input
                      type="text"
                      value={formData.shipperRef || ''}
                      onChange={(e) => onFieldChange('shipperRef', e.target.value)}
                      placeholder="REF-XXXX"
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                </div>
                <div className="p-1.5 text-[8px] text-slate-700 leading-tight">
                  (Optional) Two completed and signed copies of this Declaration must be handed to the operator.
                </div>
              </div>
            </div>

            {/* Row 2: Consignee + Warning Box */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-6 border-r border-black p-1.5 min-h-[80px] flex flex-col">
                <div className={labelCls}>Consignee</div>
                <textarea
                  rows={4}
                  value={formData.consigneeText || ''}
                  onChange={(e) => onFieldChange('consigneeText', e.target.value)}
                  placeholder="Consignee Name, Address & Contact..."
                  className={`${textareaCls} flex-1 mt-0.5`}
                />
              </div>
              <div className="col-span-6 p-2 flex flex-col justify-center">
                <div className="text-[9.5px] font-bold uppercase text-rose-700 mb-1">WARNING</div>
                <p className="text-[8.5px] leading-snug text-slate-900">
                  Failure to comply in all respects with the applicable Dangerous Goods Regulations may be in breach of the applicable law, subject to legal penalties.
                </p>
              </div>
            </div>

            {/* Row 3: Transport Details */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-6 border-r border-black flex flex-col">
                <div className="p-1.5 border-b border-black text-[8px] font-semibold uppercase text-slate-700">
                  TRANSPORT DETAILS
                </div>
                <div className="grid grid-cols-2 flex-1">
                  <div className="p-1.5 border-r border-black flex flex-col justify-between">
                    <span className={labelCls}>This shipment is within the limitations prescribed for:</span>
                    <div className="flex gap-2 mt-1 text-[9px] font-bold">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="aircraftLimitation"
                          checked={(formData.aircraftLimitation || 'PASSENGER') === 'PASSENGER'}
                          onChange={() => onFieldChange('aircraftLimitation', 'PASSENGER')}
                        />
                        <span>PASSENGER &amp; CARGO</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="aircraftLimitation"
                          checked={formData.aircraftLimitation === 'CARGO_ONLY'}
                          onChange={() => onFieldChange('aircraftLimitation', 'CARGO_ONLY')}
                        />
                        <span>CARGO ONLY</span>
                      </label>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <div className={labelCls}>Airport of Departure</div>
                    <input
                      type="text"
                      value={formData.originAirport || ''}
                      onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
                      placeholder="XXX"
                      className={`${inputCls} uppercase font-bold mt-1`}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-6 flex flex-col">
                <div className="p-1.5 border-b border-black">
                  <div className={labelCls}>Airport of Destination</div>
                  <input
                    type="text"
                    value={formData.destinationAirport || ''}
                    onChange={(e) => onFieldChange('destinationAirport', e.target.value.toUpperCase())}
                    placeholder="XXX"
                    className={`${inputCls} uppercase font-bold`}
                  />
                </div>
                <div className="p-1.5 flex items-center justify-between text-[9px] font-bold">
                  <span className={labelCls}>Shipment Type:</span>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="shipmentType"
                        checked={(formData.shipmentType || 'NON_RADIOACTIVE') === 'NON_RADIOACTIVE'}
                        onChange={() => onFieldChange('shipmentType', 'NON_RADIOACTIVE')}
                      />
                      <span>NON-RADIOACTIVE</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="shipmentType"
                        checked={formData.shipmentType === 'RADIOACTIVE'}
                        onChange={() => onFieldChange('shipmentType', 'RADIOACTIVE')}
                      />
                      <span>RADIOACTIVE</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Nature and Quantity of Dangerous Goods Table */}
            <div className="border-b border-black">
              <div className="px-1.5 py-1 border-b border-black text-[8.5px] font-bold uppercase bg-slate-100">
                NATURE AND QUANTITY OF DANGEROUS GOODS
              </div>
              <div className="grid grid-cols-[66px_1fr_56px_44px_130px_58px_82px] border-b border-black text-[8px] font-bold text-center bg-slate-50">
                <div className="p-1 border-r border-black">UN or ID No.</div>
                <div className="p-1 border-r border-black">Proper Shipping Name</div>
                <div className="p-1 border-r border-black">Class / Div.</div>
                <div className="p-1 border-r border-black">Packing Group</div>
                <div className="p-1 border-r border-black">Quantity &amp; Type of Packing</div>
                <div className="p-1 border-r border-black">Packing Inst.</div>
                <div className="p-1">Authorization</div>
              </div>

              <div className="divide-y divide-slate-300">
                {dgRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[66px_1fr_56px_44px_130px_58px_82px] min-h-[56px] group relative"
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
                        rows={3}
                        value={row.properShippingName}
                        onChange={(e) => onDgRowChange(idx, 'properShippingName', e.target.value)}
                        placeholder="Proper shipping name & technical name..."
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
                      <textarea
                        rows={3}
                        value={row.quantityPacking}
                        onChange={(e) => onDgRowChange(idx, 'quantityPacking', e.target.value)}
                        placeholder="X Fibreboard Box(es) x X.X kg"
                        className={textareaCls}
                      />
                    </div>
                    <div className="p-1 border-r border-black">
                      <input
                        type="text"
                        value={row.packingInstruction}
                        onChange={(e) => onDgRowChange(idx, 'packingInstruction', e.target.value)}
                        placeholder="XXX"
                        className={`${inputCls} text-center font-mono`}
                      />
                    </div>
                    <div className="p-1 relative">
                      <input
                        type="text"
                        value={row.authorization}
                        onChange={(e) => onDgRowChange(idx, 'authorization', e.target.value)}
                        placeholder="—"
                        className={`${inputCls} text-center`}
                      />
                      {dgRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveDgRow(idx)}
                          className="print:hidden opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 p-0.5 rounded bg-rose-50 text-rose-600 cursor-pointer"
                          title="Remove Row"
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[9.5px] font-semibold cursor-pointer"
                >
                  <Plus size={10} /> Add Dangerous Goods Line
                </button>
              </div>
            </div>

            {/* Row 5: Additional Handling & 24hr Emergency Contact */}
            <div className="p-1.5 border-b border-black">
              <div className="flex items-center justify-between gap-2">
                <span className={labelCls}>Additional Handling Information</span>
                <div className="flex items-center gap-1.5 text-[9px] font-mono">
                  <span className="font-bold text-rose-700">24-HR EMERGENCY TEL:</span>
                  <input
                    type="text"
                    value={formData.emergencyPhone || ''}
                    onChange={(e) => onFieldChange('emergencyPhone', e.target.value)}
                    placeholder="+XX-XXXX-XXXXXX"
                    className="w-32 bg-transparent border-b border-slate-400 font-bold outline-none px-1"
                  />
                </div>
              </div>
              <textarea
                rows={2}
                value={formData.handlingInfo || ''}
                onChange={(e) => onFieldChange('handlingInfo', e.target.value)}
                placeholder="Special handling instructions, overpack details..."
                className={`${textareaCls} mt-0.5`}
              />
            </div>

            {/* Row 6: Declaration & Signatory */}
            <div className="grid grid-cols-12">
              <div className="col-span-7 border-r border-black p-2 text-[8.3px] leading-snug text-slate-900">
                I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packaged, marked and labelled/placarded, and are in all respects in proper condition for transport according to applicable international and national governmental regulations. I declare that all of the applicable air transport requirements have been met.
              </div>
              <div className="col-span-5 p-2 space-y-2">
                <div>
                  <div className={labelCls}>Name / Title of Signatory</div>
                  <input
                    type="text"
                    value={formData.signatoryName || ''}
                    onChange={(e) => onFieldChange('signatoryName', e.target.value)}
                    placeholder="Authorised Shipper Signatory"
                    className={`${inputCls} border-b border-dotted border-black`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className={labelCls}>Place and Date</div>
                    <input
                      type="text"
                      value={formData.placeAndDate || ''}
                      onChange={(e) => onFieldChange('placeAndDate', e.target.value)}
                      placeholder="PLACE / DD-MMM-YYYY"
                      className={`${inputCls} border-b border-dotted border-black`}
                    />
                  </div>
                  <div>
                    <div className={labelCls}>Signature</div>
                    <input
                      type="text"
                      value={formData.signature || ''}
                      onChange={(e) => onFieldChange('signature', e.target.value)}
                      placeholder="Signature"
                      className={`${inputCls} border-b border-dotted border-black`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Mandatory Red Hatched Border */}
        <div className="w-3 shrink-0" style={stripeStyle} />
      </div>
    </div>
  );
}

const CODE39_TABLE = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
  'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn',
};

function buildCode39Bars(rawValue) {
  const clean = (rawValue || '0XX-XXXX XXXX').toUpperCase().replace(/[^A-Z0-9\-. $/+]/g, '') || '00000000';
  const full = `*${clean}*`;
  const bars = [];
  let x = 10; // left quiet zone
  const narrow = 2;
  const wide = 5;

  for (let c = 0; c < full.length; c++) {
    const pattern = CODE39_TABLE[full[c]] || CODE39_TABLE[' '];
    for (let i = 0; i < pattern.length; i++) {
      const width = pattern[i] === 'w' ? wide : narrow;
      if (i % 2 === 0) {
        bars.push({ x, width });
      }
      x += width;
    }
    x += narrow; // inter-character gap
  }
  return { bars, totalWidth: x + 10, displayText: clean };
}

/**
 * 2. IATA Resolution 606 Barcoded Air Cargo Label
 */
export function VisualCargoLabelSheet({ formData, onFieldChange }) {
  const { bars, totalWidth, displayText } = buildCode39Bars(formData.awbNumber);

  return (
    <div className="w-full flex flex-col items-center py-6 print:py-0 print:bg-white">
      <div
        id="label-printable-sheet"
        className="w-[460px] max-w-full bg-white text-black p-5 print:p-2 shadow-xl print:shadow-none font-sans border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="border-2 border-black">
          {/* Carrier Header */}
          <div className="p-2.5 border-b-2 border-black text-center">
            <input
              type="text"
              value={formData.carrierName || ''}
              onChange={(e) => onFieldChange('carrierName', e.target.value.toUpperCase())}
              placeholder="CARRIER / ISSUING COMPANY"
              className="w-full text-center text-base font-extrabold uppercase tracking-wider bg-transparent outline-none"
            />
          </div>

          {/* Live Dynamic Code-39 SVG Barcode Block */}
          <div className="p-3 border-b-2 border-black flex flex-col items-center justify-center space-y-1.5 bg-white">
            <svg
              viewBox={`0 0 ${totalWidth} 56`}
              className="w-full max-w-[380px] h-14"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Barcode for ${displayText}`}
            >
              <rect x="0" y="0" width={totalWidth} height="56" fill="#ffffff" />
              {bars.map((b, idx) => (
                <rect key={idx} x={b.x} y="2" width={b.width} height="52" fill="#000000" />
              ))}
            </svg>
            <div className="text-xs font-mono font-bold tracking-[0.22em]">
              {displayText}
            </div>
          </div>

          {/* Air Waybill No. */}
          <div className="p-2 border-b-2 border-black">
            <div className={labelCls}>Air Waybill No.</div>
            <input
              type="text"
              value={formData.awbNumber || ''}
              onChange={(e) => onFieldChange('awbNumber', e.target.value)}
              placeholder="0XX - XXXX XXXX"
              className="w-full text-xl font-mono font-extrabold bg-transparent outline-none tracking-wider"
            />
          </div>

          {/* Destination + Total Pieces */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-7 p-2 border-r-2 border-black">
              <div className={labelCls}>Destination</div>
              <input
                type="text"
                value={formData.destinationAirport || ''}
                onChange={(e) => onFieldChange('destinationAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                maxLength={4}
                className="w-full text-3xl font-extrabold font-mono uppercase bg-transparent outline-none tracking-widest"
              />
            </div>
            <div className="col-span-5 p-2">
              <div className={labelCls}>Total No. of Pieces</div>
              <input
                type="text"
                value={formData.totalPieces || ''}
                onChange={(e) => onFieldChange('totalPieces', e.target.value)}
                placeholder="1 / X"
                className="w-full text-2xl font-extrabold font-mono text-center bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Origin + Weight */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-6 p-2 border-r-2 border-black">
              <div className={labelCls}>Origin</div>
              <input
                type="text"
                value={formData.originAirport || ''}
                onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                maxLength={4}
                className="w-full text-lg font-bold font-mono uppercase bg-transparent outline-none"
              />
            </div>
            <div className="col-span-6 p-2">
              <div className={labelCls}>Weight (KG)</div>
              <input
                type="text"
                value={formData.weight || ''}
                onChange={(e) => onFieldChange('weight', e.target.value)}
                placeholder="0.0 KG"
                className="w-full text-lg font-bold font-mono bg-transparent outline-none"
              />
            </div>
          </div>

          {/* House AWB + Transfer */}
          <div className="grid grid-cols-12 border-b-2 border-black">
            <div className="col-span-6 p-2 border-r-2 border-black">
              <div className={labelCls}>House AWB No.</div>
              <input
                type="text"
                value={formData.hawbNumber || ''}
                onChange={(e) => onFieldChange('hawbNumber', e.target.value)}
                placeholder="HAWB-XXXX"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
            <div className="col-span-6 p-2">
              <div className={labelCls}>Transfer / Transit</div>
              <input
                type="text"
                value={formData.transferStation || ''}
                onChange={(e) => onFieldChange('transferStation', e.target.value.toUpperCase())}
                placeholder="XXX"
                className={`${inputCls} font-mono font-bold uppercase`}
              />
            </div>
          </div>

          {/* Optional Handling Information */}
          <div className="p-2">
            <div className={labelCls}>Optional / Handling Information</div>
            <input
              type="text"
              value={formData.handlingInfo || ''}
              onChange={(e) => onFieldChange('handlingInfo', e.target.value)}
              placeholder="GENERAL CARGO / FRAGILE / THIS WAY UP"
              className={`${inputCls} font-semibold uppercase`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Air Cargo Document Pouch Label
 */
export function VisualCargoPouchLabelSheet({ formData, onFieldChange }) {
  const enclosedDocs = formData.enclosedDocs || {
    awbOriginal: true,
    commercialInvoice: true,
    packingList: true,
    dgd: false,
    coo: false,
    other: false,
  };

  const toggleDoc = (key) => {
    onFieldChange('enclosedDocs', { ...enclosedDocs, [key]: !enclosedDocs[key] });
  };

  return (
    <div className="w-full flex flex-col items-center py-6 print:py-0 print:bg-white">
      <div
        id="pouch-printable-sheet"
        className="w-[540px] max-w-full bg-white text-black p-5 print:p-2 shadow-xl print:shadow-none font-sans border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="border-2 border-black">
          <div className="bg-black text-white p-2.5 text-center">
            <div className="text-sm font-extrabold tracking-[0.2em] uppercase">
              DOCUMENTS ENCLOSED — CARGO POUCH
            </div>
            <div className="text-[9px] font-mono tracking-widest opacity-80">
              DO NOT DETACH FROM CONSIGNMENT
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-7 p-2 border-r border-black">
              <div className={labelCls}>Issuing Agent / Carrier</div>
              <input
                type="text"
                value={formData.issuerName || ''}
                onChange={(e) => onFieldChange('issuerName', e.target.value)}
                placeholder="Company / Agent Name"
                className={`${inputCls} font-bold`}
              />
            </div>
            <div className="col-span-5 p-2">
              <div className={labelCls}>Flight No. &amp; Date</div>
              <input
                type="text"
                value={formData.flightInfo || ''}
                onChange={(e) => onFieldChange('flightInfo', e.target.value)}
                placeholder="XX-XXX / DD-MMM"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-2 border-r border-black">
              <div className={labelCls}>Master AWB No.</div>
              <input
                type="text"
                value={formData.awbNumber || ''}
                onChange={(e) => onFieldChange('awbNumber', e.target.value)}
                placeholder="0XX-XXXX XXXX"
                className="w-full text-base font-mono font-extrabold bg-transparent outline-none"
              />
            </div>
            <div className="col-span-6 p-2">
              <div className={labelCls}>House AWB No.</div>
              <input
                type="text"
                value={formData.hawbNumber || ''}
                onChange={(e) => onFieldChange('hawbNumber', e.target.value)}
                placeholder="HAWB-XXXX"
                className="w-full text-base font-mono font-bold bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-4 p-2 border-r border-black">
              <div className={labelCls}>Origin</div>
              <input
                type="text"
                value={formData.originAirport || ''}
                onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                className="w-full text-base font-mono font-bold uppercase bg-transparent outline-none"
              />
            </div>
            <div className="col-span-4 p-2 border-r border-black">
              <div className={labelCls}>Destination</div>
              <input
                type="text"
                value={formData.destinationAirport || ''}
                onChange={(e) => onFieldChange('destinationAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                className="w-full text-base font-mono font-bold uppercase bg-transparent outline-none"
              />
            </div>
            <div className="col-span-4 p-2">
              <div className={labelCls}>Pcs / Gross Wt.</div>
              <input
                type="text"
                value={formData.piecesWeight || ''}
                onChange={(e) => onFieldChange('piecesWeight', e.target.value)}
                placeholder="0 PCS / 0.0 KG"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
          </div>

          <div className="p-2.5 border-b border-black">
            <div className={`${labelCls} mb-1.5`}>Enclosed Shipping Documents</div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium">
              {[
                ['awbOriginal', 'Air Waybill (Original / Copy)'],
                ['commercialInvoice', 'Commercial / Tax Invoice'],
                ['packingList', 'Packing List'],
                ['dgd', 'Dangerous Goods Declaration'],
                ['coo', 'Certificate of Origin'],
                ['other', 'Customs / Other Docs'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(enclosedDocs[key])}
                    onChange={() => toggleDoc(key)}
                    className="accent-black"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-2">
            <div className={labelCls}>Pouch Dispatch Notes</div>
            <textarea
              rows={2}
              value={formData.remarks || ''}
              onChange={(e) => onFieldChange('remarks', e.target.value)}
              placeholder="Customs broker / ground handler attention..."
              className={textareaCls}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. ICAO / IATA Consignment Security Declaration (CSD)
 */
export function VisualCsdSheet({ formData, onFieldChange }) {
  const screening = formData.screeningMethods || {
    XRY: true,
    EDS: false,
    ETD: false,
    VCK: false,
    PHS: false,
    EDD: false,
  };

  const toggleMethod = (code) => {
    onFieldChange('screeningMethods', { ...screening, [code]: !screening[code] });
  };

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      <div
        id="csd-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="text-center pb-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
            ICAO ANNEX 17 / IATA CARGO SECURITY STANDARD
          </div>
          <h1 className="text-base font-extrabold tracking-wide uppercase mt-0.5">
            CONSIGNMENT SECURITY DECLARATION (CSD)
          </h1>
        </div>

        <div className="border-[1.5px] border-black">
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-2 border-r border-black">
              <div className={labelCls}>Regulated Agent / Issuing Entity</div>
              <textarea
                rows={3}
                value={formData.regulatedAgent || ''}
                onChange={(e) => onFieldChange('regulatedAgent', e.target.value)}
                placeholder="Company / Regulated Agent Name, Address & RA Code..."
                className={textareaCls}
              />
            </div>
            <div className="col-span-6 flex flex-col">
              <div className="p-2 border-b border-black">
                <div className={labelCls}>RA / KC / AC Approval ID</div>
                <input
                  type="text"
                  value={formData.approvalId || ''}
                  onChange={(e) => onFieldChange('approvalId', e.target.value)}
                  placeholder="RA-XXXX-XXXX"
                  className={`${inputCls} font-mono font-bold`}
                />
              </div>
              <div className="p-2">
                <div className={labelCls}>Unique Consignment Identifier (AWB / HAWB No.)</div>
                <input
                  type="text"
                  value={formData.awbNumber || ''}
                  onChange={(e) => onFieldChange('awbNumber', e.target.value)}
                  placeholder="0XX-XXXX XXXX"
                  className={`${inputCls} font-mono font-bold text-xs`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-3 p-2 border-r border-black">
              <div className={labelCls}>Origin</div>
              <input
                type="text"
                value={formData.originAirport || ''}
                onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                className={`${inputCls} font-mono font-bold uppercase`}
              />
            </div>
            <div className="col-span-3 p-2 border-r border-black">
              <div className={labelCls}>Destination</div>
              <input
                type="text"
                value={formData.destinationAirport || ''}
                onChange={(e) => onFieldChange('destinationAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                className={`${inputCls} font-mono font-bold uppercase`}
              />
            </div>
            <div className="col-span-3 p-2 border-r border-black">
              <div className={labelCls}>Transfer / Transit</div>
              <input
                type="text"
                value={formData.transferStation || ''}
                onChange={(e) => onFieldChange('transferStation', e.target.value.toUpperCase())}
                placeholder="XXX"
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
            <div className="col-span-3 p-2">
              <div className={labelCls}>Pieces / Gross Weight</div>
              <input
                type="text"
                value={formData.piecesWeight || ''}
                onChange={(e) => onFieldChange('piecesWeight', e.target.value)}
                placeholder="0 PCS / 0.0 KG"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-5 p-2 border-r border-black">
              <div className={`${labelCls} mb-1.5`}>Security Status</div>
              <div className="space-y-1 text-[10px]">
                {[
                  ['SPX', 'SPX — Secure for Passenger, All-Cargo & All-Mail'],
                  ['SCO', 'SCO — Secure for All-Cargo Aircraft Only'],
                  ['SHR', 'SHR — Secure for High-Risk Cargo'],
                ].map(([code, desc]) => (
                  <label key={code} className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="securityStatus"
                      checked={(formData.securityStatus || 'SPX') === code}
                      onChange={() => onFieldChange('securityStatus', code)}
                    />
                    <span>{desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-7 p-2">
              <div className={`${labelCls} mb-1.5`}>Screening Method(s) Applied</div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {[
                  ['XRY', 'XRY — X-Ray Equipment'],
                  ['EDS', 'EDS — Explosive Detection System'],
                  ['ETD', 'ETD — Explosive Trace Detection'],
                  ['VCK', 'VCK — Visual Check'],
                  ['PHS', 'PHS — Physical Search'],
                  ['EDD', 'EDD — Explosive Detection Dogs'],
                ].map(([code, desc]) => (
                  <label key={code} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(screening[code])}
                      onChange={() => toggleMethod(code)}
                      className="accent-black"
                    />
                    <span>{desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2 border-b border-black">
            <div className={labelCls}>Grounds for Exemption / Received From / Additional Security Remarks</div>
            <textarea
              rows={2}
              value={formData.securityRemarks || ''}
              onChange={(e) => onFieldChange('securityRemarks', e.target.value)}
              placeholder="Consignment contents, chain of custody, or exemption codes (e.g. SMUS, BIOM, DIPL)..."
              className={textareaCls}
            />
          </div>

          <div className="p-2 space-y-3">
            <p className="text-[8.5px] leading-snug text-slate-800">
              I, the undersigned, declare that the consignment described above has been subjected to the security controls indicated and has been protected from unauthorized interference from the time of screening / acceptance until handover.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2 items-end">
              <div>
                <input
                  type="text"
                  value={formData.issuedBy || ''}
                  onChange={(e) => onFieldChange('issuedBy', e.target.value)}
                  placeholder="Name of Security Officer"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">Issued By (Name)</div>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.issuedDateTime || ''}
                  onChange={(e) => onFieldChange('issuedDateTime', e.target.value)}
                  placeholder="DD-MMM-YYYY / HH:MM UTC"
                  className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                />
                <div className="text-center text-[8px] text-slate-700 pt-0.5">Date &amp; Time</div>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.signature || ''}
                  onChange={(e) => onFieldChange('signature', e.target.value)}
                  placeholder="Authorised Signature / Stamp"
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
