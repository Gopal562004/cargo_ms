import React, { useState } from 'react';
import { Code, Plus, Trash2 } from 'lucide-react';

const inputCls =
  'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 border border-transparent focus:border-indigo-400 transition-colors';
const textareaCls =
  'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 resize-none border border-transparent focus:border-indigo-400 transition-colors';
const labelCls = 'text-[8.5px] uppercase tracking-wide text-slate-700 font-semibold select-none';

const EDI_HEADERS = {
  FWB: { title: 'ELECTRONIC AIR WAYBILL (FWB)', spec: 'IATA CARGO-IMP FWB/16' },
  FHL: { title: 'ELECTRONIC HOUSE WAYBILL LIST (FHL)', spec: 'IATA CARGO-IMP FHL/4' },
  XFWB: { title: 'XML MASTER AIR WAYBILL (XFWB)', spec: 'IATA CARGO-XML XFWB v3.0' },
  XFZB: { title: 'XML HOUSE WAYBILL (XFZB)', spec: 'IATA CARGO-XML XFZB v3.0' },
  HAWB_FHL: { title: 'HYBRID HOUSE AWB + FHL CONSIGNMENT', spec: 'CARGO-IMP FHL + HAWB HYBRID' },
};

/**
 * Shared Industry Sheet for FWB, FHL, XFWB, XFZB, HAWB_FHL
 */
export function VisualEawbSheet({
  documentType = 'FWB',
  formData,
  onFieldChange,
  houseRows = [],
  onHouseRowChange,
  onAddHouseRow,
  onRemoveHouseRow,
}) {
  const [showRawEdi, setShowRawEdi] = useState(false);
  const meta = EDI_HEADERS[documentType] || EDI_HEADERS.FWB;
  const isHouse = documentType === 'FHL' || documentType === 'XFZB' || documentType === 'HAWB_FHL';
  const isXml = documentType === 'XFWB' || documentType === 'XFZB';

  const totalPcs = houseRows.reduce((s, r) => s + (Number(r.pieces) || 0), 0);
  const totalWt = houseRows.reduce((s, r) => s + (Number(r.weight) || 0), 0);

  const rawEdiPreview = isXml
    ? `<${documentType}>\n  <MessageHeaderDocument><ID>${formData.awbNumber || '0XX-XXXXXXXX'}</ID></MessageHeaderDocument>\n  <Origin>${formData.originAirport || 'XXX'}</Origin>\n  <Destination>${formData.destinationAirport || 'XXX'}</Destination>\n  <Flight>${formData.flightNumber || 'XX-XXX'} / ${formData.flightDate || 'DD-MMM-YYYY'}</Flight>\n  <Pieces>${totalPcs || formData.pieces || 0}</Pieces>\n  <GrossWeight unit="KGM">${totalWt || formData.grossWeight || '0.0'}</GrossWeight>\n</${documentType}>`
    : `${documentType}/16\nAWB/${formData.awbNumber || '0XX-XXXXXXXX'}${formData.originAirport || 'XXX'}${formData.destinationAirport || 'XXX'}/T${totalPcs || formData.pieces || 0}K${totalWt || formData.grossWeight || '0.0'}\nFLT/${formData.flightNumber || 'XX-XXX'}/${formData.flightDate || 'DDMMM'}\nSHP/${(formData.shipperText || 'SHIPPER').split('\n')[0]}\nCNE/${(formData.consigneeText || 'CONSIGNEE').split('\n')[0]}\nSHC/${formData.shc || 'GEN'}`;

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white space-y-3">
      <div
        id="edi-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-end justify-between pb-2">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{meta.spec}</div>
            <h1 className="text-base font-extrabold tracking-wide uppercase text-black mt-0.5">{meta.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div>
              <span className="text-slate-600">AWB NO: </span>
              <input
                type="text"
                value={formData.awbNumber || ''}
                onChange={(e) => onFieldChange('awbNumber', e.target.value)}
                placeholder="0XX-XXXX XXXX"
                className="w-28 border-b border-black font-bold bg-transparent outline-none px-1"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowRawEdi((p) => !p)}
              className="print:hidden px-2 py-0.5 rounded border border-indigo-300 bg-indigo-50 text-indigo-700 text-[9.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Code size={11} /> {showRawEdi ? 'Hide EDI' : 'View EDI'}
            </button>
          </div>
        </div>

        <div className="border-[1.5px] border-black">
          {/* SITA / EDI Addressing */}
          <div className="grid grid-cols-12 border-b border-black bg-slate-50">
            <div className="col-span-4 p-1.5 border-r border-black">
              <div className={labelCls}>Sender EDI / SITA Address</div>
              <input
                type="text"
                value={formData.senderAddress || ''}
                onChange={(e) => onFieldChange('senderAddress', e.target.value.toUpperCase())}
                placeholder="XXXXXXX"
                className={`${inputCls} font-mono uppercase font-bold`}
              />
            </div>
            <div className="col-span-4 p-1.5 border-r border-black">
              <div className={labelCls}>Recipient Airline / Carrier Address</div>
              <input
                type="text"
                value={formData.recipientAddress || ''}
                onChange={(e) => onFieldChange('recipientAddress', e.target.value.toUpperCase())}
                placeholder="XXXXXXX"
                className={`${inputCls} font-mono uppercase font-bold`}
              />
            </div>
            <div className="col-span-4 p-1.5">
              <div className={labelCls}>Message Ref / Timestamp (UTC)</div>
              <input
                type="text"
                value={formData.messageRef || ''}
                onChange={(e) => onFieldChange('messageRef', e.target.value)}
                placeholder="MSG-XXXX-XXXX"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          {/* Shipper / Consignee */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-1.5 border-r border-black min-h-[78px] flex flex-col">
              <div className={labelCls}>Shipper (SHP) Name, Address &amp; Account</div>
              <textarea
                rows={3}
                value={formData.shipperText || ''}
                onChange={(e) => onFieldChange('shipperText', e.target.value)}
                placeholder="Shipper Name, Address, City, Country..."
                className={`${textareaCls} flex-1 mt-0.5`}
              />
            </div>
            <div className="col-span-6 p-1.5 min-h-[78px] flex flex-col">
              <div className={labelCls}>Consignee (CNE) Name, Address &amp; Account</div>
              <textarea
                rows={3}
                value={formData.consigneeText || ''}
                onChange={(e) => onFieldChange('consigneeText', e.target.value)}
                placeholder="Consignee Name, Address, City, Country..."
                className={`${textareaCls} flex-1 mt-0.5`}
              />
            </div>
          </div>

          {/* Agent & Routing */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-4 p-1.5 border-r border-black">
              <div className={labelCls}>Issuing Agent (AGT) &amp; IATA Code</div>
              <input
                type="text"
                value={formData.agentInfo || ''}
                onChange={(e) => onFieldChange('agentInfo', e.target.value)}
                placeholder="Agent Name / XX-X-XXXX"
                className={inputCls}
              />
            </div>
            <div className="col-span-2 p-1.5 border-r border-black">
              <div className={labelCls}>Origin (ORG)</div>
              <input
                type="text"
                value={formData.originAirport || ''}
                onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                className={`${inputCls} font-mono font-bold uppercase`}
              />
            </div>
            <div className="col-span-2 p-1.5 border-r border-black">
              <div className={labelCls}>Dest (DST)</div>
              <input
                type="text"
                value={formData.destinationAirport || ''}
                onChange={(e) => onFieldChange('destinationAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                className={`${inputCls} font-mono font-bold uppercase`}
              />
            </div>
            <div className="col-span-2 p-1.5 border-r border-black">
              <div className={labelCls}>Flight (FLT)</div>
              <input
                type="text"
                value={formData.flightNumber || ''}
                onChange={(e) => onFieldChange('flightNumber', e.target.value.toUpperCase())}
                placeholder="XX-XXX"
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
            <div className="col-span-2 p-1.5">
              <div className={labelCls}>Flight Date</div>
              <input
                type="text"
                value={formData.flightDate || ''}
                onChange={(e) => onFieldChange('flightDate', e.target.value)}
                placeholder="DD-MMM-YY"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          {/* Cargo / House Table */}
          {isHouse ? (
            <div className="border-b border-black">
              <div className="grid grid-cols-[120px_54px_68px_56px_1fr_64px] border-b border-black bg-slate-200/80 text-[8px] font-bold uppercase text-center">
                <div className="p-1.5 border-r border-black">HAWB No.</div>
                <div className="p-1.5 border-r border-black">Pieces</div>
                <div className="p-1.5 border-r border-black">Weight (kg)</div>
                <div className="p-1.5 border-r border-black">Org/Dst</div>
                <div className="p-1.5 border-r border-black">Nature of Goods (HTS / Manifest Desc.)</div>
                <div className="p-1.5">SHC</div>
              </div>
              <div className="divide-y divide-slate-300">
                {houseRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[120px_54px_68px_56px_1fr_64px] min-h-[44px] group relative"
                  >
                    <div className="p-1 border-r border-black">
                      <input
                        type="text"
                        value={row.hawbNumber}
                        onChange={(e) => onHouseRowChange(idx, 'hawbNumber', e.target.value)}
                        placeholder="HAWB-XXXX"
                        className={`${inputCls} font-mono font-bold`}
                      />
                    </div>
                    <div className="p-1 border-r border-black">
                      <input
                        type="text"
                        value={row.pieces}
                        onChange={(e) => onHouseRowChange(idx, 'pieces', e.target.value)}
                        placeholder="0"
                        className={`${inputCls} text-center font-mono`}
                      />
                    </div>
                    <div className="p-1 border-r border-black">
                      <input
                        type="text"
                        value={row.weight}
                        onChange={(e) => onHouseRowChange(idx, 'weight', e.target.value)}
                        placeholder="0.0"
                        className={`${inputCls} text-right font-mono`}
                      />
                    </div>
                    <div className="p-1 border-r border-black">
                      <input
                        type="text"
                        value={row.route}
                        onChange={(e) => onHouseRowChange(idx, 'route', e.target.value.toUpperCase())}
                        placeholder="XXX/XXX"
                        className={`${inputCls} text-center font-mono uppercase`}
                      />
                    </div>
                    <div className="p-1 border-r border-black">
                      <textarea
                        rows={2}
                        value={row.description}
                        onChange={(e) => onHouseRowChange(idx, 'description', e.target.value)}
                        placeholder="Goods description..."
                        className={textareaCls}
                      />
                    </div>
                    <div className="p-1 relative">
                      <input
                        type="text"
                        value={row.shc}
                        onChange={(e) => onHouseRowChange(idx, 'shc', e.target.value.toUpperCase())}
                        placeholder="GEN"
                        className={`${inputCls} text-center font-mono uppercase`}
                      />
                      {houseRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveHouseRow(idx)}
                          className="print:hidden opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 p-0.5 rounded bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-2 py-1 bg-slate-100 border-t border-black flex items-center justify-between text-[9.5px] font-mono font-bold">
                <span>
                  TOTAL: {houseRows.length} HAWB(s) · {totalPcs} PCS · {totalWt.toFixed(1)} KG
                </span>
                <button
                  type="button"
                  onClick={onAddHouseRow}
                  className="print:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans cursor-pointer"
                >
                  <Plus size={10} /> Add HAWB Row
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-2 p-1.5 border-r border-black">
                <div className={labelCls}>Pieces (PCS)</div>
                <input
                  type="text"
                  value={formData.pieces || ''}
                  onChange={(e) => onFieldChange('pieces', e.target.value)}
                  placeholder="0"
                  className={`${inputCls} font-mono font-bold`}
                />
              </div>
              <div className="col-span-2 p-1.5 border-r border-black">
                <div className={labelCls}>Gross Wt (KG)</div>
                <input
                  type="text"
                  value={formData.grossWeight || ''}
                  onChange={(e) => onFieldChange('grossWeight', e.target.value)}
                  placeholder="0.0"
                  className={`${inputCls} font-mono font-bold`}
                />
              </div>
              <div className="col-span-2 p-1.5 border-r border-black">
                <div className={labelCls}>Chg. Wt (KG)</div>
                <input
                  type="text"
                  value={formData.chargeableWeight || ''}
                  onChange={(e) => onFieldChange('chargeableWeight', e.target.value)}
                  placeholder="0.0"
                  className={`${inputCls} font-mono font-bold`}
                />
              </div>
              <div className="col-span-2 p-1.5 border-r border-black">
                <div className={labelCls}>Rate / Charge</div>
                <input
                  type="text"
                  value={formData.rateCharge || ''}
                  onChange={(e) => onFieldChange('rateCharge', e.target.value)}
                  placeholder="0.00"
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div className="col-span-2 p-1.5 border-r border-black">
                <div className={labelCls}>Currency / PP-CC</div>
                <input
                  type="text"
                  value={formData.currencyTerms || ''}
                  onChange={(e) => onFieldChange('currencyTerms', e.target.value.toUpperCase())}
                  placeholder="USD/INR PP"
                  className={`${inputCls} font-mono uppercase`}
                />
              </div>
              <div className="col-span-2 p-1.5">
                <div className={labelCls}>SHC</div>
                <input
                  type="text"
                  value={formData.shc || ''}
                  onChange={(e) => onFieldChange('shc', e.target.value.toUpperCase())}
                  placeholder="GEN"
                  className={`${inputCls} font-mono uppercase`}
                />
              </div>
              <div className="col-span-12 p-1.5 border-t border-black">
                <div className={labelCls}>Goods Description (NG) &amp; Dimensions</div>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => onFieldChange('description', e.target.value)}
                  placeholder="Nature and quantity of goods, dimensions, volume..."
                  className={textareaCls}
                />
              </div>
            </div>
          )}

          {/* OSI / SSR & Certification */}
          <div className="grid grid-cols-12">
            <div className="col-span-7 p-1.5 border-r border-black">
              <div className={labelCls}>Other Service Information (OSI) / Special Service Request (SSR)</div>
              <textarea
                rows={2}
                value={formData.osiSsr || ''}
                onChange={(e) => onFieldChange('osiSsr', e.target.value)}
                placeholder="OSI / SSR / Security status (SPX) / Customs remarks..."
                className={textareaCls}
              />
            </div>
            <div className="col-span-5 p-1.5 flex flex-col justify-between">
              <div className={labelCls}>Authorised Electronic Signatory &amp; Date</div>
              <input
                type="text"
                value={formData.signatory || ''}
                onChange={(e) => onFieldChange('signatory', e.target.value)}
                placeholder="Authorised Agent / DD-MMM-YYYY"
                className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5 mt-3"
              />
            </div>
          </div>
        </div>

        {showRawEdi && (
          <pre className="mt-3 p-2.5 bg-slate-950 text-emerald-400 font-mono text-[9.5px] rounded border border-slate-700 overflow-x-auto">
            {rawEdiPreview}
          </pre>
        )}
      </div>
    </div>
  );
}

/**
 * Dedicated Sheet for FFR - AWB Space Allocation / Booking Request
 */
export function VisualFfrBookingSheet({ formData, onFieldChange }) {
  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      <div
        id="ffr-printable-sheet"
        className="w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <div className="flex items-end justify-between pb-2">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
              IATA CARGO-IMP FFR/8 STANDARD
            </div>
            <h1 className="text-base font-extrabold tracking-wide uppercase mt-0.5">
              AIR CARGO BOOKING &amp; SPACE ALLOCATION REQUEST (FFR)
            </h1>
          </div>
          <div className="text-[10px] font-mono">
            <span className="text-slate-600">BOOKING REF: </span>
            <input
              type="text"
              value={formData.bookingRef || ''}
              onChange={(e) => onFieldChange('bookingRef', e.target.value)}
              placeholder="FFR-XXXX-XXXX"
              className="w-28 border-b border-black font-bold bg-transparent outline-none px-1"
            />
          </div>
        </div>

        <div className="border-[1.5px] border-black">
          <div className="grid grid-cols-12 border-b border-black bg-slate-50">
            <div className="col-span-6 p-2 border-r border-black">
              <div className={labelCls}>Requesting Agent / Forwarder</div>
              <textarea
                rows={2}
                value={formData.agentName || ''}
                onChange={(e) => onFieldChange('agentName', e.target.value)}
                placeholder="Forwarder Name, IATA Code & SITA Address..."
                className={textareaCls}
              />
            </div>
            <div className="col-span-6 p-2">
              <div className={labelCls}>Carrier / Airline Reservations Desk</div>
              <textarea
                rows={2}
                value={formData.carrierDesk || ''}
                onChange={(e) => onFieldChange('carrierDesk', e.target.value)}
                placeholder="Carrier Name, Station & SITA Address..."
                className={textareaCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-3 p-2 border-r border-black">
              <div className={labelCls}>MAWB No.</div>
              <input
                type="text"
                value={formData.awbNumber || ''}
                onChange={(e) => onFieldChange('awbNumber', e.target.value)}
                placeholder="0XX-XXXX XXXX"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
            <div className="col-span-2 p-2 border-r border-black">
              <div className={labelCls}>Origin</div>
              <input
                type="text"
                value={formData.originAirport || ''}
                onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
                placeholder="XXX"
                className={`${inputCls} font-mono font-bold uppercase`}
              />
            </div>
            <div className="col-span-2 p-2 border-r border-black">
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
              <div className={labelCls}>Requested Flight &amp; Date</div>
              <input
                type="text"
                value={formData.flightInfo || ''}
                onChange={(e) => onFieldChange('flightInfo', e.target.value.toUpperCase())}
                placeholder="XX-XXX / DD-MMM-YY"
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
            <div className="col-span-2 p-2">
              <div className={labelCls}>Allotment / Priority</div>
              <input
                type="text"
                value={formData.priorityCode || ''}
                onChange={(e) => onFieldChange('priorityCode', e.target.value.toUpperCase())}
                placeholder="STANDARD / EXP"
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-2 p-2 border-r border-black">
              <div className={labelCls}>Pieces</div>
              <input
                type="text"
                value={formData.pieces || ''}
                onChange={(e) => onFieldChange('pieces', e.target.value)}
                placeholder="0"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
            <div className="col-span-2 p-2 border-r border-black">
              <div className={labelCls}>Gross Wt (KG)</div>
              <input
                type="text"
                value={formData.grossWeight || ''}
                onChange={(e) => onFieldChange('grossWeight', e.target.value)}
                placeholder="0.0"
                className={`${inputCls} font-mono font-bold`}
              />
            </div>
            <div className="col-span-2 p-2 border-r border-black">
              <div className={labelCls}>Volume (CBM)</div>
              <input
                type="text"
                value={formData.volume || ''}
                onChange={(e) => onFieldChange('volume', e.target.value)}
                placeholder="0.00"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div className="col-span-3 p-2 border-r border-black">
              <div className={labelCls}>ULD Type / Count</div>
              <input
                type="text"
                value={formData.uldSpec || ''}
                onChange={(e) => onFieldChange('uldSpec', e.target.value.toUpperCase())}
                placeholder="AKE x 0 / LOOSE"
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
            <div className="col-span-3 p-2">
              <div className={labelCls}>Special Handling Codes (SHC)</div>
              <input
                type="text"
                value={formData.shc || ''}
                onChange={(e) => onFieldChange('shc', e.target.value.toUpperCase())}
                placeholder="GEN / PER / DGR"
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 p-2 border-r border-black">
              <div className={labelCls}>Dimensions (L x W x H cm) &amp; Commodity</div>
              <textarea
                rows={3}
                value={formData.dimensionsCommodity || ''}
                onChange={(e) => onFieldChange('dimensionsCommodity', e.target.value)}
                placeholder="e.g. 0 x 0 x 0 cm — Commodity description..."
                className={textareaCls}
              />
            </div>
            <div className="col-span-6 p-2">
              <div className={labelCls}>Special Service Request (SSR) / Remarks</div>
              <textarea
                rows={3}
                value={formData.ssrRemarks || ''}
                onChange={(e) => onFieldChange('ssrRemarks', e.target.value)}
                placeholder="Temperature range, DG UN #, priority uplift notes..."
                className={textareaCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 p-2 gap-6 items-end">
            <div>
              <input
                type="text"
                value={formData.requestedBy || ''}
                onChange={(e) => onFieldChange('requestedBy', e.target.value)}
                placeholder="Requested By / Date"
                className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5 mt-3"
              />
              <div className="text-center text-[8px] text-slate-700 pt-0.5">Agent Representative</div>
            </div>
            <div>
              <input
                type="text"
                value={formData.confirmedBy || ''}
                onChange={(e) => onFieldChange('confirmedBy', e.target.value)}
                placeholder="Carrier Confirmation / Allotment ID"
                className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5 mt-3"
              />
              <div className="text-center text-[8px] text-slate-700 pt-0.5">Airline Space Confirmation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
