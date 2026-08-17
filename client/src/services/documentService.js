import api from './api';

export function getAllDocuments(params = {}) {
  return api.get('/documents', { params });
}

export function getDocumentById(id) {
  return api.get(`/documents/${id}`);
}

export function createDocument(data) {
  return api.post('/documents', data);
}

export function updateDocument(id, data) {
  return api.put(`/documents/${id}`, data);
}

export function deleteDocument(id) {
  return api.delete(`/documents/${id}`);
}

export function duplicateDocument(id) {
  return api.post(`/documents/${id}/duplicate`);
}

export function updateStatus(id, data) {
  return api.patch(`/documents/${id}/status`, data);
}

export function getDocumentHistory(id) {
  return api.get(`/documents/${id}/history`);
}

export function getDocumentBarcode(id) {
  return api.get(`/documents/${id}/barcode`);
}

export function getDocumentTypes() {
  return api.get('/documents/types');
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchDocumentPDFBlobUrl(id) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/documents/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    let msg = 'Failed to generate PDF';
    try {
      const errJson = await response.json();
      if (errJson?.message) msg = errJson.message;
    } catch (_e) {}
    throw new Error(msg);
  }
  const blob = await response.blob();
  return window.URL.createObjectURL(blob);
}

export async function previewDocumentPDF(id) {
  const url = await fetchDocumentPDFBlobUrl(id);
  window.open(url, '_blank');
  return url;
}

export async function printDocumentPDF(id) {
  const url = await fetchDocumentPDFBlobUrl(id);

  // Open PDF blob in preview window & trigger native print
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (e) {
        console.warn('Auto print failed:', e);
      }
    });
  } else {
    // Fallback: Invisible iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = url;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.warn('Iframe print fallback:', e);
        }
        setTimeout(() => {
          iframe.remove();
        }, 30000);
      }, 300);
    };
  }

  return url;
}

export async function downloadDocumentPDF(id, filename = 'document.pdf') {
  const url = await fetchDocumentPDFBlobUrl(id);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function parseInvoiceDocument(base64Data, fileName = '') {
  const res = await api.post('/documents/parse-invoice', { base64Data, fileName });
  return res.data?.data || res.data;
}

