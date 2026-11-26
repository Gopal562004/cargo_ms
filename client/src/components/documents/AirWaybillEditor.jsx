import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Save, RotateCcw, Plane } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { isSubscriptionExpired } from '../../utils/permissions';
import VisualAirWaybillSheet from './VisualAirWaybillSheet';
import Breadcrumbs from '../ui/Breadcrumbs';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const DEFAULT_CARGO_ROW = {
  pieces: '',
  grossWeight: '',
  weightUnit: 'K',
  rateClass: '',
  commodityItemNo: '',
  chargeableWeight: '',
  rateCharge: '',
  total: '',
  description: '',
};

const getDefaultFormData = () => ({
  awbPrefix: '',
  awbSerial: '',
  originAirport: '',
  destinationAirport: '',
  issuingCarrier: '',
  shipperAccountNo: '',
  shipperText: '',
  consigneeAccountNo: '',
  consigneeText: '',
  agentName: '',
  agentIATACode: '',
  agentAccountNo: '',
  accountingInfo: '',
  departureRouting: '',
  referenceNumber: '',
  optionalShippingInfo: '',
  routingTo1: '',
  firstCarrier: '',
  routingTo2: '',
  routingBy2: '',
  routingTo3: '',
  routingBy3: '',
  flightNumber: '',
  flightDate: '',
  currency: 'INR',
  chgsCode: '',
  wtValPpd: 'X',
  wtValColl: '',
  otherPpd: 'X',
  otherColl: '',
  declaredValueCarriage: 'NVD',
  declaredValueCustoms: 'NCV',
  insuranceAmount: 'NIL',
  remarks: '',
  sci: '',
  prepaidWeightCharge: '',
  collectWeightCharge: '',
  prepaidValuationCharge: '',
  collectValuationCharge: '',
  prepaidTax: '',
  collectTax: '',
  prepaidOtherAgent: '',
  collectOtherAgent: '',
  prepaidOtherCarrier: '',
  collectOtherCarrier: '',
  totalPrepaid: '',
  totalCollect: '',
  currencyConversionRate: '',
  ccChargesDestCurrency: '',
  chargesAtDestination: '',
  otherChargesText: '',
  shipperSignature: '',
  executedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
  executedPlace: '',
  carrierSignature: '',
  totalCollectCharges: '',
});

export default function AirWaybillEditor({
  documentType = 'MAWB',
  documentId = null,
  initialData = null,
  currentDocument = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createDocument, updateDocument } = useDocumentStore();
  const isExpired = isSubscriptionExpired(user);
  const isEdit = Boolean(documentId);

  const [formData, setFormData] = useState(() => ({
    ...getDefaultFormData(),
    ...(!isEdit && user?.company ? { issuingCarrier: user.company } : {}),
    ...(initialData || {}),
  }));

  const [cargoRows, setCargoRows] = useState(() => {
    if (Array.isArray(initialData?.cargoRows) && initialData.cargoRows.length > 0) {
      return initialData.cargoRows;
    }
    if (initialData?.totalPieces || initialData?.grossWeight || initialData?.commodityDescription) {
      return [
        {
          ...DEFAULT_CARGO_ROW,
          pieces: initialData.totalPieces ?? '',
          grossWeight: initialData.grossWeight ?? '',
          weightUnit: initialData.weightUnit || 'K',
          rateClass: initialData.rateClass || '',
          chargeableWeight: initialData.chargeableWeight ?? '',
          rateCharge: initialData.rateCharge ?? '',
          total: initialData.weightCharge ?? '',
          description: initialData.commodityDescription || '',
        },
      ];
    }
    return [{ ...DEFAULT_CARGO_ROW }];
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (Array.isArray(initialData.cargoRows) && initialData.cargoRows.length > 0) {
        setCargoRows(initialData.cargoRows);
      }
    }
  }, [initialData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCargoRowChange = (index, field, value) => {
    setCargoRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        const next = { ...row, [field]: value };
        if (field === 'chargeableWeight' || field === 'rateCharge') {
          const cw = parseFloat(field === 'chargeableWeight' ? value : next.chargeableWeight);
          const rc = parseFloat(field === 'rateCharge' ? value : next.rateCharge);
          if (!Number.isNaN(cw) && !Number.isNaN(rc)) {
            next.total = (cw * rc).toFixed(2);
          }
        }
        return next;
      })
    );
  };

  const handleAddCargoRow = () => {
    setCargoRows((prev) => [...prev, { ...DEFAULT_CARGO_ROW }]);
  };

  const handleRemoveCargoRow = (index) => {
    setCargoRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleReset = () => {
    setFormData(getDefaultFormData());
    setCargoRows([{ ...DEFAULT_CARGO_ROW }]);
  };

  const buildPayload = () => {
    const firstRow = cargoRows[0] || {};
    const totalPieces = cargoRows.reduce((s, r) => s + (Number(r.pieces) || 0), 0);
    const grossWeight = cargoRows.reduce((s, r) => s + (Number(r.grossWeight) || 0), 0);
    const awbNumber = [formData.awbPrefix, formData.awbSerial].filter(Boolean).join('-').trim();

    return {
      awbNumber,
      payloadData: {
        ...formData,
        cargoRows,
        totalPieces: totalPieces || firstRow.pieces || '',
        grossWeight: grossWeight || firstRow.grossWeight || '',
        commodityDescription: cargoRows.map((r) => r.description).filter(Boolean).join('\n'),
      },
    };
  };

  const handleSave = async () => {
    if (isExpired) {
      toast.error('Subscription expired. Saving documents is locked.');
      return;
    }
    setSaving(true);
    try {
      const { awbNumber, payloadData } = buildPayload();
      const docNumber = awbNumber || `${documentType}-${Date.now().toString().slice(-6)}`;
      const title = `${documentType === 'HAWB' ? 'House Air Waybill' : 'Air Waybill'} ${docNumber}`;

      if (isEdit) {
        await updateDocument(documentId, {
          title,
          documentNumber: docNumber,
          status: currentDocument?.status || 'ISSUED',
          data: payloadData,
        });
        toast.success('Air Waybill updated!');
      } else {
        const created = await createDocument({
          documentType,
          documentNumber: docNumber,
          title,
          data: payloadData,
        });
        toast.success('Air Waybill saved!');
        if (created?.id) {
          navigate(`/documents/${created.id}/edit`, { replace: true });
        }
      }
    } catch (err) {
      toast.error('Failed to save Air Waybill: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12 print:pb-0">
      <Breadcrumbs
        items={[
          { label: 'Documents', to: '/documents' },
          { label: documentType, to: `/documents?type=${documentType}` },
          { label: isEdit ? (formData.awbSerial || 'Edit') : 'New' },
        ]}
      />
      {/* Top Action Toolbar (Hidden when printing) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded p-3 sticky top-14 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Plane size={15} className="text-indigo-400" />
            <span className="text-sm font-bold text-slate-100">
              {documentType === 'HAWB' ? 'House Air Waybill (HAWB)' : 'Air Waybill (MAWB)'}
            </span>
            <Badge variant="indigo">Direct Sheet Editor</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <RotateCcw size={13} className="mr-1" /> Clear
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="text-xs"
          >
            <Printer size={13} className="mr-1" /> Print / PDF
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSave}
            className="text-xs"
          >
            <Save size={13} className="mr-1" /> {isEdit ? 'Update AWB' : 'Save AWB'}
          </Button>
        </div>
      </div>

      {/* Directly Editable IATA Air Waybill Sheet */}
      <div className="overflow-x-auto bg-slate-950/60 print:bg-white rounded-md border border-slate-800 print:border-none">
        <VisualAirWaybillSheet
          formData={formData}
          onFieldChange={handleFieldChange}
          cargoRows={cargoRows}
          onCargoRowChange={handleCargoRowChange}
          onAddCargoRow={handleAddCargoRow}
          onRemoveCargoRow={handleRemoveCargoRow}
        />
      </div>
    </div>
  );
}
