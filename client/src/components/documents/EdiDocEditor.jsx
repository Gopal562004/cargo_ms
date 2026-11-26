import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Save, RotateCcw, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { isSubscriptionExpired } from '../../utils/permissions';
import { VisualEawbSheet, VisualFfrBookingSheet } from './VisualEdiSheets';
import Breadcrumbs from '../ui/Breadcrumbs';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const DEFAULT_HOUSE_ROW = {
  hawbNumber: '',
  pieces: '',
  weight: '',
  route: '',
  description: '',
  shc: '',
};

const EDI_LABELS = {
  FWB: 'FWB - Air Waybill (eAWB)',
  FHL: 'FHL - House Air Waybill',
  XFWB: 'XFWB - Master Air Waybill (XML)',
  XFZB: 'XFZB - House Air Waybill (XML)',
  FFR: 'FFR - Booking Request',
  HAWB_FHL: 'House AWB + FHL Hybrid',
};

export default function EdiDocEditor({
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
  const label = EDI_LABELS[documentType] || documentType;

  const getInitialForm = () => {
    const company = user?.company || '';
    const base = !isEdit && company ? { agentInfo: company, agentName: company, shipperText: company } : {};
    return { ...base, ...(initialData || {}) };
  };

  const [formData, setFormData] = useState(getInitialForm);
  const [houseRows, setHouseRows] = useState(() =>
    Array.isArray(initialData?.houseRows) && initialData.houseRows.length > 0
      ? initialData.houseRows
      : [{ ...DEFAULT_HOUSE_ROW }, { ...DEFAULT_HOUSE_ROW }]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (Array.isArray(initialData.houseRows) && initialData.houseRows.length > 0) {
        setHouseRows(initialData.houseRows);
      }
    }
  }, [initialData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHouseRowChange = (idx, field, value) => {
    setHouseRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleAddHouseRow = () => setHouseRows((prev) => [...prev, { ...DEFAULT_HOUSE_ROW }]);
  const handleRemoveHouseRow = (idx) =>
    setHouseRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const handleReset = () => {
    setFormData({});
    setHouseRows([{ ...DEFAULT_HOUSE_ROW }, { ...DEFAULT_HOUSE_ROW }]);
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
        formData.bookingRef?.trim() ||
        `${documentType}-${Date.now().toString().slice(-6)}`;
      const title = `${label} ${docNumber}`;
      const payloadData = { ...formData, houseRows };

      if (isEdit) {
        await updateDocument(documentId, {
          title,
          documentNumber: docNumber,
          status: currentDocument?.status || 'ISSUED',
          data: payloadData,
        });
        toast.success(`${documentType} updated!`);
      } else {
        const created = await createDocument({
          documentType,
          documentNumber: docNumber,
          title,
          data: payloadData,
        });
        toast.success(`${documentType} saved!`);
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
          { label: isEdit ? (formData.awbNumber || formData.bookingRef || 'Edit') : 'New' },
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
            <Zap size={15} className="text-indigo-400" />
            <span className="text-sm font-bold text-slate-100">{label}</span>
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
        {documentType === 'FFR' ? (
          <VisualFfrBookingSheet formData={formData} onFieldChange={handleFieldChange} />
        ) : (
          <VisualEawbSheet
            documentType={documentType}
            formData={formData}
            onFieldChange={handleFieldChange}
            houseRows={houseRows}
            onHouseRowChange={handleHouseRowChange}
            onAddHouseRow={handleAddHouseRow}
            onRemoveHouseRow={handleRemoveHouseRow}
          />
        )}
      </div>
    </div>
  );
}
