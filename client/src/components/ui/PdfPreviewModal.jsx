import React, { useEffect, useState } from 'react';
import { fetchDocumentPDFBlobUrl, downloadDocumentPDF } from '../../services/documentService';
import Button from './Button';

/**
 * Reusable PDF Preview Modal Component
 * Renders live PDF preview in an embedded viewer with download and new tab options.
 */
export default function PdfPreviewModal({ isOpen, onClose, documentId, title = 'PDF Document Preview' }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let createdUrl = null;

    if (isOpen && documentId) {
      setLoading(true);
      setError(null);
      fetchDocumentPDFBlobUrl(documentId)
        .then((url) => {
          if (active) {
            createdUrl = url;
            setPdfUrl(url);
          }
        })
        .catch((err) => {
          if (active) setError(err.message || 'Failed to load PDF preview');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
      if (createdUrl) {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadDocumentPDF(documentId, `${title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Error downloading PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
              📄
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400">Live PDF Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfUrl && (
              <Button variant="secondary" size="sm" onClick={handleOpenNewTab} icon="↗️">
                Open in Tab
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              isLoading={downloading}
              icon="📥"
            >
              Download PDF
            </Button>
            <button
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="p-4 flex-1 bg-slate-950/40 flex items-center justify-center min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-20">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-300">Generating live PDF preview...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md space-y-3">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[76vh] rounded-xl border border-slate-800 bg-slate-900 shadow-inner"
              title="PDF Preview Viewer"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
