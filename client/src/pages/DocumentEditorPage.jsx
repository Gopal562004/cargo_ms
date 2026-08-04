import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { getDocumentSchema } from '../schemas/registry';
import { downloadDocumentPDF } from '../services/documentService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import './DocumentEditorPage.css';

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

  // Load document for editing
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
      <div className="editor-page">
        <div className="editor-page__error">
          <h2>Unknown document type: {documentType}</h2>
          <Button onClick={() => navigate('/new')}>Choose a document type</Button>
        </div>
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
    <div className="editor-page">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="editor-toolbar__left">
          <button className="editor-toolbar__back" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="editor-toolbar__title">
            {isEdit ? 'Edit' : 'New'} {schema.name}
          </h1>
          {isEdit && currentDocument && <Badge status={currentDocument.status} />}
        </div>
        <div className="editor-toolbar__right">
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
        <div className="editor-error">{errors._form}</div>
      )}

      {/* Title */}
      <div className="editor-title-row">
        <Input
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="editor-title-input"
        />
      </div>

      {/* Section tabs */}
      <div className="editor-sections-nav">
        {schema.sections.map((section, i) => (
          <button
            key={section.id}
            className={`editor-section-tab ${activeSection === i ? 'editor-section-tab--active' : ''}`}
            onClick={() => setActiveSection(i)}
          >
            {section.title}
          </button>
        ))}
        {schema.hasPackages && (
          <button
            className={`editor-section-tab ${activeSection === schema.sections.length ? 'editor-section-tab--active' : ''}`}
            onClick={() => setActiveSection(schema.sections.length)}
          >
            Packages ({packages.length})
          </button>
        )}
      </div>

      {/* Active Section Form */}
      <div className="editor-form animate-fade-in">
        {activeSection < schema.sections.length ? (
          <div className="editor-section">
            <h2 className="editor-section__title">{schema.sections[activeSection].title}</h2>
            <div className="editor-section__grid">
              {schema.sections[activeSection].fields.map((field) => (
                <div key={field.name} className={`editor-field editor-field--${field.width || 'full'}`}>
                  {field.type === 'select' ? (
                    <div className="input-group">
                      <label className="editor-field__label">{field.label}{field.required && <span className="input-required">*</span>}</label>
                      <select
                        className="filter-select editor-select"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      >
                        <option value="">Select {field.label}...</option>
                        {(field.options || []).map((opt) => (
                          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                            {typeof opt === 'string' ? opt : opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : field.type === 'textarea' ? (
                    <div className="input-group">
                      <label className="editor-field__label">{field.label}{field.required && <span className="input-required">*</span>}</label>
                      <textarea
                        className="editor-textarea"
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
              ))}
            </div>
          </div>
        ) : (
          /* Packages Tab */
          <div className="editor-section">
            <div className="editor-section__header">
              <h2 className="editor-section__title">Packages</h2>
              <Button variant="secondary" size="sm" onClick={addPackage} icon="➕">Add Package</Button>
            </div>
            {packages.length === 0 ? (
              <div className="editor-packages__empty">
                <p>No packages added yet</p>
                <Button variant="secondary" onClick={addPackage}>Add First Package</Button>
              </div>
            ) : (
              <div className="editor-packages">
                {packages.map((pkg, i) => (
                  <div key={i} className="package-row">
                    <div className="package-row__number">#{pkg.pieceNumber}</div>
                    <Input label="Length" type="number" value={pkg.length} onChange={(e) => updatePackage(i, 'length', e.target.value)} />
                    <Input label="Width" type="number" value={pkg.width} onChange={(e) => updatePackage(i, 'width', e.target.value)} />
                    <Input label="Height" type="number" value={pkg.height} onChange={(e) => updatePackage(i, 'height', e.target.value)} />
                    <Input label="Weight" type="number" value={pkg.weight} onChange={(e) => updatePackage(i, 'weight', e.target.value)} required />
                    <Input label="Description" value={pkg.description} onChange={(e) => updatePackage(i, 'description', e.target.value)} />
                    <button className="package-row__delete" onClick={() => removePackage(i)} title="Remove">🗑️</button>
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
