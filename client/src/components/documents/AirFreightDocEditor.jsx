import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Save, RotateCcw, AlertTriangle, Tag, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { isSubscriptionExpired } from '../../utils/permissions';
import {
  VisualDgdSheet,
  VisualCargoLabelSheet,
  VisualCargoPouchLabelSheet,
  VisualCsdSheet,
} from './VisualAirFreightSheets';
import Breadcrumbs from '../ui/Breadcrumbs';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const DEFAULT_DG_ROW = {
  unNumber: '',
  properShippingName: '',
  hazardClass: '',
  packingGroup: '',
  quantityPacking: '',
  packingInstruction: '',
  authorization: '',
};

const DOC_META = {
  DGD: { title: 'Dangerous Goods Declaration (DGD)', icon: AlertTriangle, prefix: 'DGD' },
  LABEL: { title: 'IATA Barcoded Cargo Label', icon: Tag, prefix: 'LBL' },
  CARGO_POUCH_LABEL: { title: 'Cargo Pouch Label', icon: Tag, prefix: 'PCH' },
  CSD: { title: 'Consignment Security Declaration (CSD)', icon: ShieldCheck, prefix: 'CSD' },
};

export default function AirFreightDocEditor({
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
  const meta = DOC_META[documentType] || DOC_META.DGD;
  const Icon = meta.icon;

  const getInitialForm = () => {
    const company = user?.company || '';
    const base = !isEdit && company
      ? {
          shipperText: company,
          carrierName: company,
          issuerName: company,
          regulatedAgent: company,
        }
      : {};
    return { ...base, ...(initialData || {}) };
  };

  const [formData, setFormData] = useState(getInitialForm);
  const [dgRows, setDgRows] = useState(() =>
    Array.isArray(initialData?.dgRows) && initialData.dgRows.length > 0
      ? initialData.dgRows
      : [{ ...DEFAULT_DG_ROW }]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (Array.isArray(initialData.dgRows) && initialData.dgRows.length > 0) {
        setDgRows(initialData.dgRows);
      }
    }
  }, [initialData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDgRowChange = (index, field, value) => {
    setDgRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handleAddDgRow = () => setDgRows((prev) => [...prev, { ...DEFAULT_DG_ROW }]);
  const handleRemoveDgRow = (index) =>
    setDgRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleReset = () => {
    setFormData({});
    setDgRows([{ ...DEFAULT_DG_ROW }]);
  };

  const handleSave = async () => {
    if (isExpired) {
      toast.error('Subscription expired. Saving documents is locked.');
      return;
    }
    setSaving(true);
    try {
      const docNumber =
        formData.awbNumber?.trim() ||
        formData.shipperRef?.trim() ||
        `${meta.prefix}-${Date.now().toString().slice(-6)}`;
      const title = `${meta.title} ${docNumber}`;
      const payloadData = documentType === 'DGD' ? { ...formData, dgRows } : { ...formData };

      if (isEdit) {
        await updateDocument(documentId, {
          title,
          documentNumber: docNumber,
          status: currentDocument?.status || 'ISSUED',
          data: payloadData,
        });
        toast.success(`${meta.prefix} updated!`);
      } else {
        const created = await createDocument({
          documentType,
          documentNumber: docNumber,
          title,
          data: payloadData,
        });
        toast.success(`${meta.prefix} saved!`);
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
          { label: documentType, to: `/documents?type=${documentType}` },
          { label: isEdit ? (formData.awbNumber || 'Edit') : 'New' },
        ]}
      />

      {/* Top Action Toolbar (Hidden when printing) */}
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

      {/* Directly Editable Sheet */}
      <div className="overflow-x-auto bg-slate-950/60 print:bg-white rounded-md border border-slate-800 print:border-none">
        {documentType === 'DGD' && (
          <VisualDgdSheet
            formData={formData}
            onFieldChange={handleFieldChange}
            dgRows={dgRows}
            onDgRowChange={handleDgRowChange}
            onAddDgRow={handleAddDgRow}
            onRemoveDgRow={handleRemoveDgRow}
          />
        )}
        {documentType === 'LABEL' && (
          <VisualCargoLabelSheet formData={formData} onFieldChange={handleFieldChange} />
        )}
        {documentType === 'CARGO_POUCH_LABEL' && (
          <VisualCargoPouchLabelSheet formData={formData} onFieldChange={handleFieldChange} />
        )}
        {documentType === 'CSD' && (
          <VisualCsdSheet formData={formData} onFieldChange={handleFieldChange} />
        )}
      </div>
    </div>
  );
}
