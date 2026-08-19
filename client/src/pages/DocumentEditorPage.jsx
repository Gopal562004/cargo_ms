import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Plus, Trash2, Save, FileText, Lock, ShieldAlert } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { getDocumentSchema } from '../schemas/registry';
import { downloadDocumentPDF, previewDocumentPDF } from '../services/documentService';
import { isDocumentTypeAllowed } from '../utils/permissions';
import TaxInvoiceEditor from '../components/documents/TaxInvoiceEditor';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export default function DocumentEditorPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { createDocument, updateDocument, fetchDocument, currentDocument } = useDocumentStore();

  const isEdit = !!id;
  const documentType = type || currentDocument?.documentType;
  const schema = getDocumentSchema(documentType);

  const templateInitialData = location.state?.templateData;

  const [formData, setFormData] = useState(() => templateInitialData || {});
  const [packages, setPackages] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [previewingPdf, setPreviewingPdf] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (isEdit) {
      fetchDocument(id).then((doc) => {
        setFormData(doc.data || {});
        setPackages(doc.packages || []);
        setTitle(doc.title || '');
      });
    }
  }, [id]);

  // Check role & service authorization for this document type
  if (documentType && !isDocumentTypeAllowed(user, documentType)) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900/80 border border-red-500/30 rounded-xl text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center border border-red-500/20">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Access Restricted</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your account (<span className="text-indigo-300 font-medium">{user?.role}</span> •{' '}
          <span className="text-indigo-300 font-medium">{user?.department || 'General'}</span>) is not
          permitted to create or edit <strong className="text-white">{documentType}</strong> documents.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/')} className="text-xs">
            Return to Dashboard
          </Button>
          <Button variant="primary" onClick={() => navigate('/new')} className="text-xs">
            Choose Permitted Document
          </Button>
        </div>
      </div>
    );
  }

  if (documentType === 'TAX_INVOICE') {
    return (
      <TaxInvoiceEditor
        documentId={id}
        initialData={formData && Object.keys(formData).length > 0 ? formData : templateInitialData}
        currentDocument={currentDocument}
      />
    );
  }

  if (!schema) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Unknown document type: {documentType}</h2>
        <Button onClick={() => navigate('/new')}>Choose a document type</Button>
      </div>
    );
  }

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      {
        pieceNumber: prev.length + 1,
        length: '',
        width: '',
        height: '',
        dimensionUnit: 'CM',
        weight: '',
        weightUnit: 'KG',
        description: '',
      },
    ]);
  };

  const updatePackage = (index, field, value) => {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg))
    );
  };

  const removePackage = (index) => {
    setPackages((prev) => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, pieceNumber: i + 1 })));
  };

  const handlePreviewPDF = async () => {
    setPreviewingPdf(true);
    try {
      await previewDocumentPDF(id);
    } catch (err) {
      alert('Error previewing PDF: ' + err.message);
    } finally {
      setPreviewingPdf(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      await downloadDocumentPDF(id, `${currentDocument?.documentNumber || 'document'}.pdf`);
    } catch (err) {
      alert('Error downloading PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSave = async (asDraft = true) => {
    setLoading(true);
    try {
      const cleanPackages = packages
        .filter((p) => p.weight)
        .map(({ id: _id, ...p }) => ({
          ...p,
          weight: parseFloat(p.weight) || 0,
          length: p.length ? parseFloat(p.length) : null,
          width: p.width ? parseFloat(p.width) : null,
          height: p.height ? parseFloat(p.height) : null,
          pieceNumber: p.pieceNumber,
        }));

      if (isEdit) {
        await updateDocument(id, { title, data: formData, packages: cleanPackages });
      } else {
        const doc = await createDocument({
          documentType,
          title: title || `${schema.name} - New`,
          data: formData,
          packages: cleanPackages,
        });
        navigate(`/documents/${doc.id}`);
        return;
      }
      navigate(`/documents/${id}`);
    } catch (err) {
      setErrors({ _form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-xl font-bold text-slate-100">
            {isEdit ? 'Edit' : 'New'} {schema.name}
          </h1>
          {isEdit && currentDocument && <Badge status={currentDocument.status} />}
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <>
              <Button
                variant="secondary"
                loading={previewingPdf}
                onClick={handlePreviewPDF}
                className="rounded text-xs"
              >
                <Eye size={14} className="mr-1.5 inline" /> Preview PDF
              </Button>
              <Button
                variant="secondary"
                loading={downloadingPdf}
                onClick={handleDownloadPDF}
                className="rounded text-xs"
              >
                <Download size={14} className="mr-1.5 inline" /> Download PDF
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => navigate(-1)} className="rounded text-xs">Cancel</Button>
          <Button variant="primary" loading={loading} onClick={() => handleSave(true)} className="rounded text-xs font-semibold">
            <Save size={14} className="mr-1.5 inline" /> {isEdit ? 'Save Changes' : 'Create Document'}
          </Button>
        </div>
      </div>

      {errors._form && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
          {errors._form}
        </div>
      )}

      {/* Title */}
      <div>
        <Input
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-px">
        {schema.sections.map((section, i) => (
          <button
            key={section.id}
            className={`px-4 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSection === i
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveSection(i)}
          >
            {section.title}
          </button>
        ))}
        {schema.hasPackages && (
          <button
            className={`px-4 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSection === schema.sections.length
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveSection(schema.sections.length)}
          >
            Packages ({packages.length})
          </button>
        )}
      </div>

      {/* Active Section Form */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 shadow-xl">
        {activeSection < schema.sections.length ? (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-slate-200">{schema.sections[activeSection].title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schema.sections[activeSection].fields.map((field) => {
                const isFullWidth = field.width === 'full';
                const gridSpan = isFullWidth ? 'md:col-span-2 lg:col-span-3' : '';

                return (
                  <div key={field.name} className={gridSpan}>
                    {field.type === 'select' ? (
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs text-slate-400 font-medium">
                          {field.label}{field.required && <span className="text-rose-400 ml-0.5">*</span>}
                        </label>
                        <select
                          className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        >
                          <option value="" className="bg-slate-900">Select {field.label}...</option>
                          {(field.options || []).map((opt) => (
                            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value} className="bg-slate-900">
                              {typeof opt === 'string' ? opt : opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : field.type === 'textarea' ? (
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs text-slate-400 font-medium">
                          {field.label}{field.required && <span className="text-rose-400 ml-0.5">*</span>}
                        </label>
                        <textarea
                          className="w-full p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          rows={3}
                          placeholder={field.placeholder || ''}
                        />
                      </div>
                    ) : (
                      <Input
                        label={field.label}
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        error={errors[field.name]}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Packages Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">Packages</h2>
              <Button variant="secondary" size="sm" onClick={addPackage} className="rounded text-xs">
                <Plus size={13} className="mr-1 inline" /> Add Package
              </Button>
            </div>
            {packages.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-400">No packages added yet</p>
                <Button variant="secondary" onClick={addPackage} className="rounded text-xs">
                  <Plus size={13} className="mr-1 inline" /> Add First Package
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded">
                    <div className="text-xs font-bold text-indigo-400 pb-3 shrink-0 font-mono">#{pkg.pieceNumber}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
                      <Input label="Length" type="number" value={pkg.length} onChange={(e) => updatePackage(i, 'length', e.target.value)} />
                      <Input label="Width" type="number" value={pkg.width} onChange={(e) => updatePackage(i, 'width', e.target.value)} />
                      <Input label="Height" type="number" value={pkg.height} onChange={(e) => updatePackage(i, 'height', e.target.value)} />
                      <Input label="Weight" type="number" value={pkg.weight} onChange={(e) => updatePackage(i, 'weight', e.target.value)} required />
                      <Input label="Description" value={pkg.description} onChange={(e) => updatePackage(i, 'description', e.target.value)} />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-rose-400 transition-colors shrink-0" onClick={() => removePackage(i)} title="Remove">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
