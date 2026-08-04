import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { getDocumentSchema } from '../schemas/registry';
import { downloadDocumentPDF } from '../services/documentService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export default function DocumentEditorPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { createDocument, updateDocument, fetchDocument, currentDocument } = useDocumentStore();

  const isEdit = !!id;
  const documentType = type || currentDocument?.documentType;
  const schema = getDocumentSchema(documentType);

  const [formData, setFormData] = useState({});
  const [packages, setPackages] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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
          <button className="text-xs text-slate-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="text-xl font-bold text-slate-100">
            {isEdit ? 'Edit' : 'New'} {schema.name}
          </h1>
          {isEdit && currentDocument && <Badge status={currentDocument.status} />}
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button
              variant="secondary"
              icon="📥"
              loading={downloadingPdf}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={() => handleSave(true)}>
            {isEdit ? 'Save Changes' : 'Create Document'}
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
              <Button variant="secondary" size="sm" onClick={addPackage} icon="➕">Add Package</Button>
            </div>
            {packages.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-400">No packages added yet</p>
                <Button variant="secondary" onClick={addPackage}>Add First Package</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <div className="text-xs font-bold text-indigo-400 pb-3 shrink-0">#{pkg.pieceNumber}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
                      <Input label="Length" type="number" value={pkg.length} onChange={(e) => updatePackage(i, 'length', e.target.value)} />
                      <Input label="Width" type="number" value={pkg.width} onChange={(e) => updatePackage(i, 'width', e.target.value)} />
                      <Input label="Height" type="number" value={pkg.height} onChange={(e) => updatePackage(i, 'height', e.target.value)} />
                      <Input label="Weight" type="number" value={pkg.weight} onChange={(e) => updatePackage(i, 'weight', e.target.value)} required />
                      <Input label="Description" value={pkg.description} onChange={(e) => updatePackage(i, 'description', e.target.value)} />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-rose-400 transition-colors shrink-0" onClick={() => removePackage(i)} title="Remove">🗑️</button>
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
