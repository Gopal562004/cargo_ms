import React, { useEffect, useState } from 'react';
import { FileText, ExternalLink, Download, X } from 'lucide-react';
import { fetchDocumentPDFBlobUrl, downloadDocumentPDF } from '../../services/documentService';
import Button from './Button';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

/**
 * Reusable PDF Preview Modal Component
 * Renders live PDF preview in an embedded viewer with download and new tab options.
 */
export default function PdfPreviewModal({ isOpen, onClose, documentId, title = 'PDF Document Preview' }) {
  useBodyScrollLock(Boolean(isOpen && documentId));

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
              <FileText size={15} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
              <p className="text-[11px] text-slate-400">Live PDF Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfUrl && (
              <Button variant="secondary" size="sm" onClick={handleOpenNewTab} className="rounded text-xs">
                <ExternalLink size={13} className="mr-1 inline" /> Open in Tab
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              isLoading={downloading}
              className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Download size={13} className="mr-1 inline" /> Download PDF
            </Button>
            <button
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-1"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="p-3.5 flex-1 bg-slate-950/40 flex items-center justify-center min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-20">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-slate-300">Generating live PDF preview...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-md max-w-md space-y-3">
              <p className="text-red-400 text-xs font-medium">{error}</p>
              <Button size="sm" variant="secondary" onClick={onClose} className="rounded">Close</Button>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[76vh] rounded border border-slate-800 bg-slate-900 shadow-inner"
              title="PDF Preview Viewer"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
