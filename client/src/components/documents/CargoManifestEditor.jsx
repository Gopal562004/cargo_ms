import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Save, RotateCcw, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDocumentStore } from '../../store/documentStore';
import { useAuthStore } from '../../store/authStore';
import { isSubscriptionExpired } from '../../utils/permissions';
import VisualCargoManifestSheet from './VisualCargoManifestSheet';
import Breadcrumbs from '../ui/Breadcrumbs';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const DEFAULT_MANIFEST_ROW = {
  awbNumber: '',
  pieces: '',
  grossWeight: '',
  shipper: '',
  consignee: '',
  natureOfGoods: '',
  route: '',
  shc: '',
};

const getDefaultFormData = () => ({
  manifestNumber: '',
  pageNumber: '1 of 1',
  operatorName: '',
  aircraftReg: '',
  flightNumber: '',
  flightDate: '',
  originAirport: '',
  destinationAirport: '',
  mawbNumber: '',
  aircraftType: '',
  uldNumber: '',
  etdEta: '',
  customsRef: '',
  remarks: '',
  preparedBy: '',
  placeAndDate: '',
  authorizedSignature: '',
});

export default function CargoManifestEditor({
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
    ...(!isEdit && user?.company ? { operatorName: user.company } : {}),
    ...(initialData || {}),
  }));

  const [manifestRows, setManifestRows] = useState(() => {
    if (Array.isArray(initialData?.manifestRows) && initialData.manifestRows.length > 0) {
      return initialData.manifestRows;
    }
    return [
      { ...DEFAULT_MANIFEST_ROW },
      { ...DEFAULT_MANIFEST_ROW },
      { ...DEFAULT_MANIFEST_ROW },
      { ...DEFAULT_MANIFEST_ROW },
    ];
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      if (Array.isArray(initialData.manifestRows) && initialData.manifestRows.length > 0) {
        setManifestRows(initialData.manifestRows);
      }
    }
  }, [initialData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, value) => {
    setManifestRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setManifestRows((prev) => [...prev, { ...DEFAULT_MANIFEST_ROW }]);
  };

  const handleRemoveRow = (index) => {
    setManifestRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleReset = () => {
    setFormData(getDefaultFormData());
    setManifestRows([
      { ...DEFAULT_MANIFEST_ROW },
      { ...DEFAULT_MANIFEST_ROW },
      { ...DEFAULT_MANIFEST_ROW },
      { ...DEFAULT_MANIFEST_ROW },
    ]);
  };

  const handleSave = async () => {
    if (isExpired) {
      toast.error('Subscription expired. Saving documents is locked.');
      return;
    }
    setSaving(true);
    try {
      const totalAwbs = manifestRows.filter(
        (r) => r.awbNumber || r.pieces || r.grossWeight || r.natureOfGoods
      ).length;
      const totalPieces = manifestRows.reduce((s, r) => s + (Number(r.pieces) || 0), 0);
      const totalWeight = manifestRows.reduce((s, r) => s + (Number(r.grossWeight) || 0), 0);

      const docNumber =
        formData.manifestNumber?.trim() ||
        formData.mawbNumber?.trim() ||
        `MNF-${Date.now().toString().slice(-6)}`;
      const title = `Cargo Manifest ${docNumber}`;

      const payloadData = {
        ...formData,
        manifestRows,
        totalAwbs,
        totalPieces,
        totalWeight,
      };

      if (isEdit) {
        await updateDocument(documentId, {
          title,
          documentNumber: docNumber,
          status: currentDocument?.status || 'ISSUED',
          data: payloadData,
        });
        toast.success('Cargo Manifest updated!');
      } else {
        const created = await createDocument({
          documentType: 'MANIFEST',
          documentNumber: docNumber,
          title,
          data: payloadData,
        });
        toast.success('Cargo Manifest saved!');
        if (created?.id) {
          navigate(`/documents/${created.id}/edit`, { replace: true });
        }
      }
    } catch (err) {
      toast.error('Failed to save Cargo Manifest: ' + (err.message || 'Unknown error'));
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
          { label: 'MANIFEST', to: '/documents?type=MANIFEST' },
          { label: isEdit ? (formData.manifestNumber || 'Edit') : 'New' },
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
            <FileText size={15} className="text-indigo-400" />
            <span className="text-sm font-bold text-slate-100">Air Cargo Manifest</span>
            <Badge variant="indigo">Direct Sheet Editor</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <Save size={13} className="mr-1" /> {isEdit ? 'Update Manifest' : 'Save Manifest'}
          </Button>
        </div>
      </div>

      {/* Directly Editable IATA Cargo Manifest Sheet */}
      <div className="overflow-x-auto bg-slate-950/60 print:bg-white rounded-md border border-slate-800 print:border-none">
        <VisualCargoManifestSheet
          formData={formData}
          onFieldChange={handleFieldChange}
          manifestRows={manifestRows}
          onRowChange={handleRowChange}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
        />
      </div>
    </div>
  );
}
