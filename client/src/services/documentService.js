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

export async function fetchDocumentPDFBlobUrl(id) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`http://localhost:5000/api/documents/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to generate PDF');
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

  // Method 1: Invisible iframe for seamless direct print dialog
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
        console.warn('Iframe print fallback to window.open:', e);
        window.open(url, '_blank');
      }
      setTimeout(() => {
        iframe.remove();
      }, 60000);
    }, 300);
  };

  return url;
}

export async function downloadDocumentPDF(id, filename = 'document.pdf') {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`http://localhost:5000/api/documents/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to generate PDF');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
