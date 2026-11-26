import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * VisualAirWaybillSheet - Pixel-faithful, WYSIWYG directly editable IATA Air Waybill sheet.
 * Matches the standard Air Waybill layout (Shipper, Consignee, Issuing Carrier, Routing,
 * Currency/Values, Handling/SCI, Cargo Rate Table with shaded columns, Prepaid/Collect
 * Charges summary, Other Charges, Shipper Certification, and Carrier Execution).
 */
export default function VisualAirWaybillSheet({
  formData,
  onFieldChange,
  cargoRows,
  onCargoRowChange,
  onAddCargoRow,
  onRemoveCargoRow,
}) {
  const inputCls =
    'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 rounded-none border border-transparent focus:border-indigo-400 transition-colors';
  const textareaCls =
    'w-full bg-transparent hover:bg-indigo-50/40 focus:bg-indigo-50/70 focus:outline-none text-[10.5px] leading-snug text-black font-sans px-1 py-0.5 resize-none rounded-none border border-transparent focus:border-indigo-400 transition-colors';
  const labelCls = 'text-[8.5px] leading-tight text-slate-800 font-sans select-none';

  const totalPieces = cargoRows.reduce((sum, r) => sum + (Number(r.pieces) || 0), 0);
  const totalGrossWeight = cargoRows.reduce((sum, r) => sum + (Number(r.grossWeight) || 0), 0);
  const totalCargoAmount = cargoRows.reduce((sum, r) => sum + (Number(r.total) || 0), 0);

  return (
    <div className="w-full flex flex-col items-center py-4 print:py-0 print:bg-white">
      {/* A4 Printable Air Waybill Sheet */}
      <div
        id="awb-printable-sheet"
        className="relative w-[820px] min-w-[820px] bg-white text-black p-6 print:p-2 shadow-xl print:shadow-none font-sans text-[10px] leading-tight select-text border border-slate-300 print:border-none overflow-hidden"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Top AWB Number Strip (Standard IATA top-left & top-right AWB #) */}
        <div className="flex items-center justify-between pb-1.5 text-[11px] font-mono font-bold">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={formData.awbPrefix || ''}
              onChange={(e) => onFieldChange('awbPrefix', e.target.value)}
              placeholder="0XX"
              maxLength={4}
              className="w-10 text-center bg-transparent hover:bg-indigo-50/60 focus:bg-indigo-50 border-b border-slate-300 focus:border-indigo-500 outline-none font-bold"
            />
            <span>|</span>
            <input
              type="text"
              value={formData.originAirport || ''}
              onChange={(e) => onFieldChange('originAirport', e.target.value.toUpperCase())}
              placeholder="XXX"
              maxLength={4}
              className="w-12 text-center bg-transparent hover:bg-indigo-50/60 focus:bg-indigo-50 border-b border-slate-300 focus:border-indigo-500 outline-none uppercase font-bold"
            />
            <span>|</span>
            <input
              type="text"
              value={formData.awbSerial || ''}
              onChange={(e) => onFieldChange('awbSerial', e.target.value)}
              placeholder="XXXX XXXX"
              className="w-28 bg-transparent hover:bg-indigo-50/60 focus:bg-indigo-50 border-b border-slate-300 focus:border-indigo-500 outline-none font-bold"
            />
          </div>
          <div className="flex items-center gap-1">
            <span>{formData.awbPrefix || '0XX'}</span>
            <span>-</span>
            <span>{formData.awbSerial || 'XXXX XXXX'}</span>
          </div>
        </div>

        {/* Outer Air Waybill Grid */}
        <div className="border-[1.5px] border-black">
          {/* =============================================================== */}
          {/* ROW 1: Shipper (Left 50%) + Not Negotiable / Issued By (Right 50%) */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black">
            {/* Shipper's Name and Address */}
            <div className="col-span-6 border-r border-black p-1.5 flex flex-col justify-between min-h-[86px]">
              <div className="flex items-start justify-between gap-2">
                <span className={labelCls}>Shipper&apos;s Name and Address</span>
                <input
                  type="text"
                  value={formData.shipperAccountNo || ''}
                  onChange={(e) => onFieldChange('shipperAccountNo', e.target.value)}
                  placeholder="Account No."
                  className="w-28 text-right text-[9px] bg-transparent hover:bg-indigo-50/50 focus:bg-indigo-50 border border-slate-200 focus:border-indigo-400 outline-none px-1 py-0.5"
                />
              </div>
              <textarea
                rows={4}
                value={formData.shipperText || ''}
                onChange={(e) => onFieldChange('shipperText', e.target.value)}
                placeholder="Enter Shipper Name, Address, City, Country & Contact..."
                className={`${textareaCls} flex-1 mt-0.5`}
              />
            </div>

            {/* Not Negotiable / Air Waybill / Issued By */}
            <div className="col-span-6 flex flex-col justify-between">
              <div className="p-1.5 flex-1 flex flex-col">
                <div className="text-[9px] leading-tight text-slate-900">
                  <div>Not Negotiable</div>
                  <div className="font-bold text-[11px]">Air Waybill</div>
                  <div>Issued By</div>
                </div>
                <textarea
                  rows={2}
                  value={formData.issuingCarrier || ''}
                  onChange={(e) => onFieldChange('issuingCarrier', e.target.value)}
                  placeholder="Issuing Carrier Name & Head Office Address..."
                  className={`${textareaCls} mt-0.5 flex-1 font-semibold`}
                />
              </div>
              <div className="border-t border-black px-1.5 py-1 text-[8.5px] text-slate-900">
                Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 2: Consignee (Left 50%) + Conditions of Contract (Right 50%) */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 border-r border-black p-1.5 flex flex-col min-h-[92px]">
              <div className="flex items-start justify-between gap-2">
                <span className={labelCls}>Consignee&apos;s Name and Address</span>
                <input
                  type="text"
                  value={formData.consigneeAccountNo || ''}
                  onChange={(e) => onFieldChange('consigneeAccountNo', e.target.value)}
                  placeholder="Account No."
                  className="w-28 text-right text-[9px] bg-transparent hover:bg-indigo-50/50 focus:bg-indigo-50 border border-slate-200 focus:border-indigo-400 outline-none px-1 py-0.5"
                />
              </div>
              <textarea
                rows={4}
                value={formData.consigneeText || ''}
                onChange={(e) => onFieldChange('consigneeText', e.target.value)}
                placeholder="Enter Consignee Name, Address, City, Country & Contact..."
                className={`${textareaCls} flex-1 mt-0.5`}
              />
            </div>

            <div className="col-span-6 p-1.5 text-[7.8px] leading-[1.28] text-slate-900 flex items-center">
              <p>
                It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER, AND SHIPPER AGREES THAT THE SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH THE CARRIER DEEMS APPROPRIATE. THE SHIPPER&apos;S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER&apos;S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.
              </p>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 3: Issuing Carrier's Agent (Left 50%) + Accounting Info (Right 50%) */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 border-r border-black flex flex-col">
              <div className="p-1.5 border-b border-black flex-1 min-h-[46px]">
                <div className={labelCls}>Issuing Carrier&apos;s Agent Name and City</div>
                <textarea
                  rows={2}
                  value={formData.agentName || ''}
                  onChange={(e) => onFieldChange('agentName', e.target.value)}
                  placeholder="Agent Company Name & City..."
                  className={textareaCls}
                />
              </div>
              <div className="grid grid-cols-2">
                <div className="p-1.5 border-r border-black">
                  <div className={labelCls}>Agent&apos;s IATA Code</div>
                  <input
                    type="text"
                    value={formData.agentIATACode || ''}
                    onChange={(e) => onFieldChange('agentIATACode', e.target.value)}
                    placeholder="XX-X-XXXX"
                    className={inputCls}
                  />
                </div>
                <div className="p-1.5">
                  <div className={labelCls}>Account No.</div>
                  <input
                    type="text"
                    value={formData.agentAccountNo || ''}
                    onChange={(e) => onFieldChange('agentAccountNo', e.target.value)}
                    placeholder="ACC-XXXX"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-6 p-1.5 flex flex-col">
              <div className={labelCls}>Accounting Information:</div>
              <textarea
                rows={4}
                value={formData.accountingInfo || ''}
                onChange={(e) => onFieldChange('accountingInfo', e.target.value)}
                placeholder="FREIGHT PREPAID / TAX ID (GSTIN / EORI / VAT): XXXXXXXXXXXXXXX"
                className={`${textareaCls} flex-1 mt-0.5`}
              />
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 4: Airport of Departure (Left 50%) + Reference / Optional (Right 50%) */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-6 border-r border-black p-1.5">
              <div className={labelCls}>Airport of Departure (Addr. of First Carrier) and Requested Routing</div>
              <input
                type="text"
                value={formData.departureRouting || ''}
                onChange={(e) => onFieldChange('departureRouting', e.target.value)}
                placeholder="Airport of Departure (XXX)"
                className={inputCls}
              />
            </div>

            <div className="col-span-6 grid grid-cols-2">
              <div className="p-1.5 border-r border-black">
                <div className={labelCls}>Reference Number</div>
                <input
                  type="text"
                  value={formData.referenceNumber || ''}
                  onChange={(e) => onFieldChange('referenceNumber', e.target.value)}
                  placeholder="Ref No."
                  className={inputCls}
                />
              </div>
              <div className="p-1.5">
                <div className={labelCls}>Optional Shipping Information</div>
                <input
                  type="text"
                  value={formData.optionalShippingInfo || ''}
                  onChange={(e) => onFieldChange('optionalShippingInfo', e.target.value)}
                  placeholder="Optional info..."
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 5: Routing & Flight (Left 50%) + Currency / Values / Insurance (Right 50%) */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12 border-b border-black">
            {/* Left 50%: Routing Sub-rows */}
            <div className="col-span-6 border-r border-black flex flex-col">
              {/* Sub-row 1: To | By First Carrier | to | by | to | by */}
              <div className="grid grid-cols-12 border-b border-black">
                <div className="col-span-2 p-1 border-r border-black">
                  <div className={labelCls}>To</div>
                  <input
                    type="text"
                    value={formData.routingTo1 || ''}
                    onChange={(e) => onFieldChange('routingTo1', e.target.value.toUpperCase())}
                    placeholder="XXX"
                    className={`${inputCls} uppercase font-semibold`}
                  />
                </div>
                <div className="col-span-4 p-1 border-r border-black">
                  <div className={labelCls}>By First Carrier</div>
                  <input
                    type="text"
                    value={formData.firstCarrier || ''}
                    onChange={(e) => onFieldChange('firstCarrier', e.target.value.toUpperCase())}
                    placeholder="XX"
                    className={`${inputCls} uppercase font-semibold`}
                  />
                </div>
                <div className="col-span-1 p-1 border-r border-black">
                  <div className={labelCls}>to</div>
                  <input
                    type="text"
                    value={formData.routingTo2 || ''}
                    onChange={(e) => onFieldChange('routingTo2', e.target.value.toUpperCase())}
                    className={`${inputCls} uppercase`}
                  />
                </div>
                <div className="col-span-2 p-1 border-r border-black">
                  <div className={labelCls}>by</div>
                  <input
                    type="text"
                    value={formData.routingBy2 || ''}
                    onChange={(e) => onFieldChange('routingBy2', e.target.value.toUpperCase())}
                    className={`${inputCls} uppercase`}
                  />
                </div>
                <div className="col-span-1 p-1 border-r border-black">
                  <div className={labelCls}>to</div>
                  <input
                    type="text"
                    value={formData.routingTo3 || ''}
                    onChange={(e) => onFieldChange('routingTo3', e.target.value.toUpperCase())}
                    className={`${inputCls} uppercase`}
                  />
                </div>
                <div className="col-span-2 p-1">
                  <div className={labelCls}>by</div>
                  <input
                    type="text"
                    value={formData.routingBy3 || ''}
                    onChange={(e) => onFieldChange('routingBy3', e.target.value.toUpperCase())}
                    className={`${inputCls} uppercase`}
                  />
                </div>
              </div>

              {/* Sub-row 2: Airport of Destination | Flight Date | For Carrier Use Only | Flight Date */}
              <div className="grid grid-cols-12 flex-1">
                <div className="col-span-5 p-1.5 border-r border-black">
                  <div className={labelCls}>Airport of Destination</div>
                  <input
                    type="text"
                    value={formData.destinationAirport || ''}
                    onChange={(e) => onFieldChange('destinationAirport', e.target.value)}
                    placeholder="Destination Airport (XXX)"
                    className={`${inputCls} font-semibold`}
                  />
                </div>
                <div className="col-span-2 p-1.5 border-r border-black">
                  <div className={labelCls}>Flight/Date</div>
                  <input
                    type="text"
                    value={formData.flightNumber || ''}
                    onChange={(e) => onFieldChange('flightNumber', e.target.value)}
                    placeholder="XX-XXX"
                    className={inputCls}
                  />
                </div>
                <div className="col-span-3 p-1 border-r border-black bg-slate-200/80 flex flex-col justify-start">
                  <div className="text-[7.5px] text-center text-slate-700 leading-tight">
                    For Carrier Use Only
                  </div>
                </div>
                <div className="col-span-2 p-1.5">
                  <div className={labelCls}>Flight Date</div>
                  <input
                    type="text"
                    value={formData.flightDate || ''}
                    onChange={(e) => onFieldChange('flightDate', e.target.value)}
                    placeholder="DD/MM/YY"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Right 50%: Currency, CHGS, WT/VAL, Other, Declared Values & Insurance */}
            <div className="col-span-6 flex flex-col">
              {/* Sub-row 1 */}
              <div className="grid grid-cols-12 border-b border-black">
                <div className="col-span-2 p-1 border-r border-black">
                  <div className={labelCls}>Currency</div>
                  <input
                    type="text"
                    value={formData.currency || ''}
                    onChange={(e) => onFieldChange('currency', e.target.value.toUpperCase())}
                    placeholder="INR/USD"
                    className={`${inputCls} uppercase font-semibold`}
                  />
                </div>
                <div className="col-span-1 p-1 border-r border-black">
                  <div className="text-[7.5px] leading-tight text-slate-800">CHGS Code</div>
                  <input
                    type="text"
                    value={formData.chgsCode || ''}
                    onChange={(e) => onFieldChange('chgsCode', e.target.value.toUpperCase())}
                    placeholder="PP"
                    className={`${inputCls} uppercase`}
                  />
                </div>
                <div className="col-span-2 border-r border-black flex flex-col">
                  <div className="text-[7.5px] text-center border-b border-black py-0.5">WT/VAL</div>
                  <div className="grid grid-cols-2 flex-1 text-[7.5px]">
                    <div className="border-r border-black flex flex-col items-center justify-center p-0.5">
                      <span>PPD</span>
                      <input
                        type="text"
                        value={formData.wtValPpd || ''}
                        onChange={(e) => onFieldChange('wtValPpd', e.target.value)}
                        placeholder="X"
                        className="w-full text-center bg-transparent outline-none font-bold text-[10px]"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center p-0.5">
                      <span>COLL</span>
                      <input
                        type="text"
                        value={formData.wtValColl || ''}
                        onChange={(e) => onFieldChange('wtValColl', e.target.value)}
                        className="w-full text-center bg-transparent outline-none font-bold text-[10px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-2 border-r border-black flex flex-col">
                  <div className="text-[7.5px] text-center border-b border-black py-0.5">Other</div>
                  <div className="grid grid-cols-2 flex-1 text-[7.5px]">
                    <div className="border-r border-black flex flex-col items-center justify-center p-0.5">
                      <span>PPD</span>
                      <input
                        type="text"
                        value={formData.otherPpd || ''}
                        onChange={(e) => onFieldChange('otherPpd', e.target.value)}
                        placeholder="X"
                        className="w-full text-center bg-transparent outline-none font-bold text-[10px]"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center p-0.5">
                      <span>COLL</span>
                      <input
                        type="text"
                        value={formData.otherColl || ''}
                        onChange={(e) => onFieldChange('otherColl', e.target.value)}
                        className="w-full text-center bg-transparent outline-none font-bold text-[10px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-3 p-1 border-r border-black">
                  <div className="text-[7.5px] leading-tight text-slate-800">Declared Value for Carriage</div>
                  <input
                    type="text"
                    value={formData.declaredValueCarriage || 'NVD'}
                    onChange={(e) => onFieldChange('declaredValueCarriage', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2 p-1">
                  <div className="text-[7.5px] leading-tight text-slate-800">Declared Value for Customs</div>
                  <input
                    type="text"
                    value={formData.declaredValueCustoms || 'NCV'}
                    onChange={(e) => onFieldChange('declaredValueCustoms', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Sub-row 2: Amount of Insurance + Insurance Clause */}
              <div className="grid grid-cols-12 flex-1">
                <div className="col-span-3 p-1 border-r border-black">
                  <div className={labelCls}>Amount of Insurance</div>
                  <input
                    type="text"
                    value={formData.insuranceAmount || 'NIL'}
                    onChange={(e) => onFieldChange('insuranceAmount', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="col-span-9 p-1.5 text-[7.8px] leading-tight text-slate-900 flex items-center">
                  INSURANCE - If carrier offers insurance, and such insurance is requested in accordance with the conditions thereof, indicate amount to be insured in figures in box marked &quot;Amount of Insurance.&quot;
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 6: Handling Information + SCI                               */}
          {/* =============================================================== */}
          <div className="border-b border-black relative">
            <div className="p-1.5 min-h-[54px] pr-28">
              <div className={labelCls}>Handling Information</div>
              <textarea
                rows={2}
                value={formData.remarks || ''}
                onChange={(e) => onFieldChange('remarks', e.target.value)}
                placeholder="Special handling instructions, DG declarations, emergency contact..."
                className={textareaCls}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-24 border-t border-l border-black px-1.5 py-0.5 bg-white">
              <div className="text-[7.5px] text-center text-slate-700">SCI</div>
              <input
                type="text"
                value={formData.sci || ''}
                onChange={(e) => onFieldChange('sci', e.target.value)}
                placeholder="—"
                className="w-full text-center text-[10px] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 7: Cargo Rate Table with Shaded Columns                     */}
          {/* =============================================================== */}
          <div className="border-b border-black">
            {/* Table Header */}
            <div className="grid grid-cols-[54px_70px_28px_10px_82px_10px_70px_10px_76px_10px_84px_10px_1fr] border-b border-black text-[8px] leading-tight text-center font-medium bg-white">
              <div className="p-1 border-r border-black flex items-center justify-center">
                No. of<br />Pieces<br />RCP
              </div>
              <div className="p-1 border-r border-black flex items-center justify-center">
                Gross Weight
              </div>
              <div className="p-1 border-r border-black flex items-center justify-center">
                kg<br />lb
              </div>
              <div className="border-r border-black bg-slate-200/90" />
              <div className="border-r border-black flex flex-col">
                <div className="p-0.5 border-b border-black">Rate Class</div>
                <div className="p-0.5 flex-1 flex items-center justify-center text-[7.5px]">
                  Commodity Item<br />No.
                </div>
              </div>
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 border-r border-black flex items-center justify-center">
                Chargeable<br />Weight
              </div>
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 border-r border-black flex items-center justify-center">
                Rate / Charge
              </div>
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 border-r border-black flex items-center justify-center">
                Total
              </div>
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 flex items-center justify-center">
                Nature and Quantity of Goods (inc. Dimensions or Volume)
              </div>
            </div>

            {/* Cargo Rows */}
            <div className="divide-y divide-slate-200">
              {cargoRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[54px_70px_28px_10px_82px_10px_70px_10px_76px_10px_84px_10px_1fr] min-h-[155px] group relative"
                >
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={6}
                      value={row.pieces}
                      onChange={(e) => onCargoRowChange(idx, 'pieces', e.target.value)}
                      placeholder="0"
                      className={`${textareaCls} text-center font-mono`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={6}
                      value={row.grossWeight}
                      onChange={(e) => onCargoRowChange(idx, 'grossWeight', e.target.value)}
                      placeholder="0.0"
                      className={`${textareaCls} text-right font-mono`}
                    />
                  </div>
                  <div className="p-1 border-r border-black">
                    <input
                      type="text"
                      value={row.weightUnit || 'K'}
                      onChange={(e) => onCargoRowChange(idx, 'weightUnit', e.target.value.toUpperCase())}
                      className={`${inputCls} text-center font-mono uppercase`}
                    />
                  </div>
                  <div className="border-r border-black bg-slate-200/90" />
                  <div className="p-1 border-r border-black flex flex-col gap-1">
                    <input
                      type="text"
                      value={row.rateClass || ''}
                      onChange={(e) => onCargoRowChange(idx, 'rateClass', e.target.value.toUpperCase())}
                      placeholder="X"
                      className={`${inputCls} text-center font-mono uppercase`}
                    />
                    <input
                      type="text"
                      value={row.commodityItemNo || ''}
                      onChange={(e) => onCargoRowChange(idx, 'commodityItemNo', e.target.value)}
                      placeholder="XXXX"
                      className={`${inputCls} text-center font-mono text-[9px] border-t border-slate-200`}
                    />
                  </div>
                  <div className="border-r border-black bg-slate-200/90" />
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={6}
                      value={row.chargeableWeight}
                      onChange={(e) => onCargoRowChange(idx, 'chargeableWeight', e.target.value)}
                      placeholder="0.0"
                      className={`${textareaCls} text-right font-mono`}
                    />
                  </div>
                  <div className="border-r border-black bg-slate-200/90" />
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={6}
                      value={row.rateCharge}
                      onChange={(e) => onCargoRowChange(idx, 'rateCharge', e.target.value)}
                      placeholder="0.00"
                      className={`${textareaCls} text-right font-mono`}
                    />
                  </div>
                  <div className="border-r border-black bg-slate-200/90" />
                  <div className="p-1 border-r border-black">
                    <textarea
                      rows={6}
                      value={row.total}
                      onChange={(e) => onCargoRowChange(idx, 'total', e.target.value)}
                      placeholder="0.00"
                      className={`${textareaCls} text-right font-mono font-semibold`}
                    />
                  </div>
                  <div className="border-r border-black bg-slate-200/90" />
                  <div className="p-1 relative">
                    <textarea
                      rows={7}
                      value={row.description}
                      onChange={(e) => onCargoRowChange(idx, 'description', e.target.value)}
                      placeholder="CONSOLIDATED CARGO / UN BOXES / DIMENSIONS (L x W x H cm) / VOLUME..."
                      className={textareaCls}
                    />
                    {cargoRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveCargoRow(idx)}
                        className="print:hidden opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-opacity cursor-pointer"
                        title="Remove Cargo Row"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cargo Totals Summary Row */}
            <div className="grid grid-cols-[54px_70px_28px_10px_82px_10px_70px_10px_76px_10px_84px_10px_1fr] border-t border-black text-[10px] font-mono font-bold bg-slate-50">
              <div className="p-1 border-r border-black text-center">{totalPieces || '—'}</div>
              <div className="p-1 border-r border-black text-right">{totalGrossWeight ? totalGrossWeight.toFixed(1) : '—'}</div>
              <div className="p-1 border-r border-black text-center">{cargoRows[0]?.weightUnit || 'K'}</div>
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 border-r border-black" />
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 border-r border-black" />
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 border-r border-black" />
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 border-r border-black text-right">{totalCargoAmount ? totalCargoAmount.toFixed(2) : '—'}</div>
              <div className="border-r border-black bg-slate-200/90" />
              <div className="p-1 flex items-center justify-between font-sans font-normal text-[9px] text-slate-600">
                <span>Totals Auto-Calculated</span>
                <button
                  type="button"
                  onClick={onAddCargoRow}
                  className="print:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold cursor-pointer"
                >
                  <Plus size={10} /> Add Row
                </button>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ROW 8: Bottom Charges Summary (Left 40%) + Signatures (Right 60%) */}
          {/* =============================================================== */}
          <div className="grid grid-cols-12">
            {/* LEFT 40% (5 cols): Prepaid / Collect Charges Grid */}
            <div className="col-span-5 border-r border-black flex flex-col text-[8.5px]">
              {/* Weight Charge */}
              <div className="grid grid-cols-3 border-b border-black">
                <div className="text-center border-r border-black py-0.5 font-medium">Prepaid</div>
                <div className="text-center border-r border-black py-0.5 font-medium">Weight Charge</div>
                <div className="text-center py-0.5 font-medium">Collect</div>
              </div>
              <div className="grid grid-cols-3 border-b border-black">
                <input
                  type="text"
                  value={formData.prepaidWeightCharge || ''}
                  onChange={(e) => onFieldChange('prepaidWeightCharge', e.target.value)}
                  className="border-r border-black p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
                <div className="border-r border-black bg-slate-200/80" />
                <input
                  type="text"
                  value={formData.collectWeightCharge || ''}
                  onChange={(e) => onFieldChange('collectWeightCharge', e.target.value)}
                  className="p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
              </div>

              {/* Valuation Charge */}
              <div className="grid grid-cols-3 border-b border-black">
                <div className="border-r border-black bg-slate-200/80" />
                <div className="text-center border-r border-black py-0.5">Valuation Charge</div>
                <div className="border-r-0 bg-slate-200/80" />
              </div>
              <div className="grid grid-cols-3 border-b border-black">
                <input
                  type="text"
                  value={formData.prepaidValuationCharge || ''}
                  onChange={(e) => onFieldChange('prepaidValuationCharge', e.target.value)}
                  className="border-r border-black p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
                <div className="border-r border-black bg-slate-200/80" />
                <input
                  type="text"
                  value={formData.collectValuationCharge || ''}
                  onChange={(e) => onFieldChange('collectValuationCharge', e.target.value)}
                  className="p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
              </div>

              {/* Tax */}
              <div className="grid grid-cols-3 border-b border-black">
                <div className="border-r border-black bg-slate-200/80" />
                <div className="text-center border-r border-black py-0.5">Tax</div>
                <div className="bg-slate-200/80" />
              </div>
              <div className="grid grid-cols-3 border-b border-black">
                <input
                  type="text"
                  value={formData.prepaidTax || ''}
                  onChange={(e) => onFieldChange('prepaidTax', e.target.value)}
                  className="border-r border-black p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
                <div className="border-r border-black bg-slate-200/80" />
                <input
                  type="text"
                  value={formData.collectTax || ''}
                  onChange={(e) => onFieldChange('collectTax', e.target.value)}
                  className="p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
              </div>

              {/* Total Other Charges Due Agent */}
              <div className="grid grid-cols-3 border-b border-black">
                <div className="border-r border-black bg-slate-200/80" />
                <div className="text-center border-r border-black py-0.5 leading-tight">
                  Total Other Charges Due Agent
                </div>
                <div className="bg-slate-200/80" />
              </div>
              <div className="grid grid-cols-3 border-b border-black">
                <input
                  type="text"
                  value={formData.prepaidOtherAgent || ''}
                  onChange={(e) => onFieldChange('prepaidOtherAgent', e.target.value)}
                  className="border-r border-black p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
                <div className="border-r border-black bg-slate-200/80" />
                <input
                  type="text"
                  value={formData.collectOtherAgent || ''}
                  onChange={(e) => onFieldChange('collectOtherAgent', e.target.value)}
                  className="p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
              </div>

              {/* Total Other Charges Due Carrier */}
              <div className="grid grid-cols-3 border-b border-black">
                <div className="border-r border-black bg-slate-200/80" />
                <div className="text-center border-r border-black py-0.5 leading-tight">
                  Total Other Charges Due Carrier
                </div>
                <div className="bg-slate-200/80" />
              </div>
              <div className="grid grid-cols-3 border-b border-black">
                <input
                  type="text"
                  value={formData.prepaidOtherCarrier || ''}
                  onChange={(e) => onFieldChange('prepaidOtherCarrier', e.target.value)}
                  className="border-r border-black p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
                <div className="border-r border-black bg-slate-200/80" />
                <input
                  type="text"
                  value={formData.collectOtherCarrier || ''}
                  onChange={(e) => onFieldChange('collectOtherCarrier', e.target.value)}
                  className="p-1 text-right font-mono text-[10px] bg-transparent outline-none"
                />
              </div>

              {/* Shaded Spacer Strip */}
              <div className="h-2.5 border-b border-black bg-slate-200/90" />

              {/* Total Prepaid | Total Collect */}
              <div className="grid grid-cols-2 border-b border-black">
                <div className="border-r border-black p-1">
                  <div className="text-center text-[8px]">Total Prepaid</div>
                  <input
                    type="text"
                    value={formData.totalPrepaid || ''}
                    onChange={(e) => onFieldChange('totalPrepaid', e.target.value)}
                    className="w-full text-right font-mono font-bold text-[10.5px] bg-transparent outline-none mt-0.5"
                  />
                </div>
                <div className="p-1">
                  <div className="text-center text-[8px]">Total Collect</div>
                  <input
                    type="text"
                    value={formData.totalCollect || ''}
                    onChange={(e) => onFieldChange('totalCollect', e.target.value)}
                    className="w-full text-right font-mono font-bold text-[10.5px] bg-transparent outline-none mt-0.5"
                  />
                </div>
              </div>

              {/* Currency Conversion Rates | CC Charges in Dest. Currency */}
              <div className="grid grid-cols-2 border-b border-black">
                <div className="border-r border-black p-1">
                  <div className="text-center text-[8px]">Currency Conversion Rates</div>
                  <input
                    type="text"
                    value={formData.currencyConversionRate || ''}
                    onChange={(e) => onFieldChange('currencyConversionRate', e.target.value)}
                    className="w-full text-center font-mono text-[10px] bg-transparent outline-none mt-0.5"
                  />
                </div>
                <div className="p-1">
                  <div className="text-center text-[8px]">CC Charges in Dest. Currency</div>
                  <input
                    type="text"
                    value={formData.ccChargesDestCurrency || ''}
                    onChange={(e) => onFieldChange('ccChargesDestCurrency', e.target.value)}
                    className="w-full text-right font-mono text-[10px] bg-transparent outline-none mt-0.5"
                  />
                </div>
              </div>

              {/* For Carrier's Use only at Destination | Charges at Destination */}
              <div className="grid grid-cols-2 flex-1">
                <div className="border-r border-black p-1 bg-slate-200/80">
                  <div className="text-center text-[8px] leading-tight">
                    For Carrier&apos;s Use only at Destination
                  </div>
                </div>
                <div className="p-1">
                  <div className="text-center text-[8px]">Charges at Destination</div>
                  <input
                    type="text"
                    value={formData.chargesAtDestination || ''}
                    onChange={(e) => onFieldChange('chargesAtDestination', e.target.value)}
                    className="w-full text-right font-mono text-[10px] bg-transparent outline-none mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT 60% (7 cols): Other Charges, Shipper Cert, Executed on */}
            <div className="col-span-7 flex flex-col">
              {/* Other Charges */}
              <div className="p-1.5 border-b border-black min-h-[104px] flex flex-col">
                <div className={labelCls}>Other Charges</div>
                <textarea
                  rows={4}
                  value={formData.otherChargesText || ''}
                  onChange={(e) => onFieldChange('otherChargesText', e.target.value)}
                  placeholder="XXX: 0.00  XXX: 0.00"
                  className={`${textareaCls} flex-1 mt-0.5 font-mono`}
                />
              </div>

              {/* Shipper Certification + Signature of Shipper */}
              <div className="p-1.5 border-b border-black flex flex-col justify-between min-h-[96px]">
                <p className="text-[8px] leading-[1.3] text-slate-900">
                  Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.
                </p>
                <div className="pt-3">
                  <input
                    type="text"
                    value={formData.shipperSignature || ''}
                    onChange={(e) => onFieldChange('shipperSignature', e.target.value)}
                    placeholder="Signature / Stamp of Shipper or Agent"
                    className="w-full text-center text-[10px] font-semibold bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                  />
                  <div className="text-center text-[8px] text-slate-800 pt-0.5">
                    Signature of Shipper or his Agent
                  </div>
                </div>
              </div>

              {/* Executed on (date) / at (place) / Signature of Issuing Carrier */}
              <div className="p-1.5 border-b border-black flex flex-col justify-end min-h-[54px]">
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <input
                      type="text"
                      value={formData.executedDate || ''}
                      onChange={(e) => onFieldChange('executedDate', e.target.value)}
                      placeholder="DD-MMM-YYYY"
                      className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                    />
                    <div className="text-center text-[8px] text-slate-800 pt-0.5">Executed on (date)</div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.executedPlace || ''}
                      onChange={(e) => onFieldChange('executedPlace', e.target.value)}
                      placeholder="PLACE"
                      className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5 uppercase"
                    />
                    <div className="text-center text-[8px] text-slate-800 pt-0.5">at (place)</div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.carrierSignature || ''}
                      onChange={(e) => onFieldChange('carrierSignature', e.target.value)}
                      placeholder="Authorised Signatory"
                      className="w-full text-center text-[10px] bg-transparent border-b border-dotted border-black outline-none pb-0.5"
                    />
                    <div className="text-center text-[8px] text-slate-800 pt-0.5">
                      Signature of Issuing Carrier or its Agent
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Collect Charges */}
              <div className="grid grid-cols-12 flex-1">
                <div className="col-span-5 border-r border-black p-1.5">
                  <div className="text-center text-[8px] text-slate-800">Total Collect Charges</div>
                  <input
                    type="text"
                    value={formData.totalCollectCharges || ''}
                    onChange={(e) => onFieldChange('totalCollectCharges', e.target.value)}
                    className="w-full text-right font-mono font-bold text-[10.5px] bg-transparent outline-none mt-0.5"
                  />
                </div>
                <div className="col-span-7 bg-slate-200/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
