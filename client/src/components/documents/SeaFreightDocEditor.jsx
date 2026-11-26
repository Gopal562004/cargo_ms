import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Save, RotateCcw, Ship, FileText, AlertTriangle, Scale } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { isSubscriptionExpired } from '../../utils/permissions';
import {
  VisualBillOfLadingSheet,
  VisualBolManifestSheet,
  VisualImoDgdSheet,
  VisualSolasVgmSheet,
} from './VisualSeaFreightSheets';
import Breadcrumbs from '../ui/Breadcrumbs';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const DEFAULT_BOL_CARGO = { containerSeal: '', packages: '', description: '', grossWeight: '', cbm: '' };
const DEFAULT_MANIFEST_ROW = { blNumber: '', containerSeal: '', shipper: '', consignee: '', packages: '', description: '', grossWeight: '', cbm: '', terms: 'PP' };
const DEFAULT_IMO_ROW = { unNumber: '', properShippingName: '', hazardClass: '', packingGroup: '', flashpoint: '', marinePollutant: 'NO', packages: '', mass: '', ems: '' };

const SEA_META = {
  BILL_OF_LADING: { title: 'Ocean Bill of Lading', icon: Ship, prefix: 'BL' },
  BOL_MANIFEST: { title: 'B/L Manifest', icon: FileText, prefix: 'BMF' },
  IMO_DGD: { title: 'IMO Dangerous Goods Declaration', icon: AlertTriangle, prefix: 'IMO' },
  SOLAS_VGM: { title: 'SOLAS Verified Gross Mass (VGM)', icon: Scale, prefix: 'VGM' },
};

export default function SeaFreightDocEditor({
  documentType,
  documentId = null,
  initialData = null,
  currentDocument = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createDocument, updateDocument } = useDocumentStore();
  const isExpired = isSubscriptionExpired(user);
  const isEdit = Boolean(documentId);
  const meta = SEA_META[documentType] || SEA_META.BILL_OF_LADING;
  const Icon = meta.icon;

  const getInitialForm = () => {
    const company = user?.company || '';
    const base = !isEdit && company
      ? { carrierName: company, shipperText: company }
      : {};
    return { ...base, ...(initialData || {}) };
  };

  const [formData, setFormData] = useState(getInitialForm);
  const [bolRows, setBolRows] = useState(() =>
    Array.isArray(initialData?.cargoRows) && initialData.cargoRows.length > 0
      ? initialData.cargoRows
      : [{ ...DEFAULT_BOL_CARGO }]
  );
  const [manifestRows, setManifestRows] = useState(() =>
    Array.isArray(initialData?.manifestRows) && initialData.manifestRows.length > 0
      ? initialData.manifestRows
      : [{ ...DEFAULT_MANIFEST_ROW }, { ...DEFAULT_MANIFEST_ROW }, { ...DEFAULT_MANIFEST_ROW }]
  );
  const [imoRows, setImoRows] = useState(() =>
    Array.isArray(initialData?.dgRows) && initialData.dgRows.length > 0
      ? initialData.dgRows
      : [{ ...DEFAULT_IMO_ROW }]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (Array.isArray(initialData.cargoRows) && initialData.cargoRows.length > 0) setBolRows(initialData.cargoRows);
      if (Array.isArray(initialData.manifestRows) && initialData.manifestRows.length > 0) setManifestRows(initialData.manifestRows);
      if (Array.isArray(initialData.dgRows) && initialData.dgRows.length > 0) setImoRows(initialData.dgRows);
    }
  }, [initialData]);

  const handleFieldChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const updateList = (setter) => (idx, field, val) =>
    setter((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));

  const handleReset = () => {
    setFormData({});
    setBolRows([{ ...DEFAULT_BOL_CARGO }]);
    setManifestRows([{ ...DEFAULT_MANIFEST_ROW }, { ...DEFAULT_MANIFEST_ROW }, { ...DEFAULT_MANIFEST_ROW }]);
    setImoRows([{ ...DEFAULT_IMO_ROW }]);
  };

  const handleSave = async () => {
    if (isExpired) {
      toast.error('Subscription expired. Saving documents is locked.');
      return;
    }
    setSaving(true);
    try {
      const docNumber =
        formData.blNumber?.trim() ||
        formData.manifestNumber?.trim() ||
        formData.bookingNumber?.trim() ||
        formData.containerNo?.trim() ||
        `${meta.prefix}-${Date.now().toString().slice(-6)}`;
      const title = `${meta.title} ${docNumber}`;

      const payloadData = {
        ...formData,
        ...(documentType === 'BILL_OF_LADING' ? { cargoRows: bolRows } : {}),
        ...(documentType === 'BOL_MANIFEST' ? { manifestRows } : {}),
        ...(documentType === 'IMO_DGD' ? { dgRows: imoRows } : {}),
      };

      if (isEdit) {
        await updateDocument(documentId, {
          title,
          documentNumber: docNumber,
          status: currentDocument?.status || 'ISSUED',
          data: payloadData,
        });
        toast.success(`${meta.title} updated!`);
      } else {
        const created = await createDocument({
          documentType,
          documentNumber: docNumber,
          title,
          data: payloadData,
        });
        toast.success(`${meta.title} saved!`);
        if (created?.id) {
          navigate(`/documents/${created.id}/edit`, { replace: true });
        }
      }
    } catch (err) {
      toast.error('Failed to save document: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 print:pb-0">
      <Breadcrumbs
        items={[
          { label: 'Documents', to: '/documents' },
          { label: documentType.replace(/_/g, ' '), to: `/documents?type=${documentType}` },
          { label: isEdit ? (formData.blNumber || formData.manifestNumber || formData.containerNo || 'Edit') : 'New' },
        ]}
      />

      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded p-3 sticky top-14 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/documents?type=${documentType}`)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Icon size={15} className="text-indigo-400" />
            <span className="text-sm font-bold text-slate-100">{meta.title}</span>
            <Badge variant="indigo">Direct Sheet Editor</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleReset} className="text-xs">
            <RotateCcw size={13} className="mr-1" /> Clear
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => window.print()} className="text-xs">
            <Printer size={13} className="mr-1" /> Print / PDF
          </Button>
          <Button type="button" variant="primary" size="sm" loading={saving} onClick={handleSave} className="text-xs">
            <Save size={13} className="mr-1" /> {isEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-950/60 print:bg-white rounded-md border border-slate-800 print:border-none">
        {documentType === 'BILL_OF_LADING' && (
          <VisualBillOfLadingSheet
            formData={formData}
            onFieldChange={handleFieldChange}
            cargoRows={bolRows}
            onRowChange={updateList(setBolRows)}
            onAddRow={() => setBolRows((p) => [...p, { ...DEFAULT_BOL_CARGO }])}
            onRemoveRow={(i) => setBolRows((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))}
          />
        )}
        {documentType === 'BOL_MANIFEST' && (
          <VisualBolManifestSheet
            formData={formData}
            onFieldChange={handleFieldChange}
            manifestRows={manifestRows}
            onRowChange={updateList(setManifestRows)}
            onAddRow={() => setManifestRows((p) => [...p, { ...DEFAULT_MANIFEST_ROW }])}
            onRemoveRow={(i) => setManifestRows((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))}
          />
        )}
        {documentType === 'IMO_DGD' && (
          <VisualImoDgdSheet
            formData={formData}
            onFieldChange={handleFieldChange}
            dgRows={imoRows}
            onDgRowChange={updateList(setImoRows)}
            onAddDgRow={() => setImoRows((p) => [...p, { ...DEFAULT_IMO_ROW }])}
            onRemoveDgRow={(i) => setImoRows((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))}
          />
        )}
        {documentType === 'SOLAS_VGM' && (
          <VisualSolasVgmSheet formData={formData} onFieldChange={handleFieldChange} />
        )}
      </div>
    </div>
  );
}
