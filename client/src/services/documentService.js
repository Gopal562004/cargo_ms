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
  const blob = await api.get(`/documents/${id}/pdf`, {
    responseType: 'blob',
  });
  return window.URL.createObjectURL(blob);
}

export async function previewDocumentPDF(id, docNumber = '') {
  let resolvedNumber = docNumber;
  if (!resolvedNumber) {
    try {
      const res = await api.get(`/documents/${id}`);
      const d = res.data?.data?.document || res.data?.document || res.data;
      resolvedNumber = d?.documentNumber || d?.data?.invoiceNumber || '';
    } catch {}
  }

  const safeName = resolvedNumber ? String(resolvedNumber).replace(/[/\\?%*:|"<>]/g, '_').trim() : 'Document_Preview';
  const url = await fetchDocumentPDFBlobUrl(id);

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeName}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #525659; }
            iframe { border: none; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <iframe src="${url}"></iframe>
        </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    window.open(url, '_blank');
  }

  return url;
}

export async function printDocumentPDF(id, docNumber = '') {
  let resolvedNumber = docNumber;
  if (!resolvedNumber) {
    try {
      const res = await api.get(`/documents/${id}`);
      const d = res.data?.data?.document || res.data?.document || res.data;
      resolvedNumber = d?.documentNumber || d?.data?.invoiceNumber || '';
    } catch {}
  }

  const safeName = resolvedNumber ? String(resolvedNumber).replace(/[/\\?%*:|"<>]/g, '_').trim() : 'Tax_Invoice';
  const url = await fetchDocumentPDFBlobUrl(id);

  // Open titled window & trigger native print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeName}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #525659; }
            iframe { border: none; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <iframe id="pdfFrame" src="${url}"></iframe>
          <script>
            const frame = document.getElementById('pdfFrame');
            frame.onload = () => {
              setTimeout(() => {
                try {
                  frame.contentWindow.focus();
                  frame.contentWindow.print();
                } catch(e) {
                  window.focus();
                  window.print();
                }
              }, 350);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    // Fallback: Invisible iframe with temporary document title update
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = url;

    const originalTitle = document.title;
    if (safeName) {
      document.title = safeName;
    }

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          if (safeName && iframe.contentDocument) {
            iframe.contentDocument.title = safeName;
          }
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.warn('Iframe print fallback:', e);
        }
        setTimeout(() => {
          document.title = originalTitle;
          iframe.remove();
        }, 1500);
      }, 350);
    };
  }

  return url;
}

export async function downloadDocumentPDF(id, filename = 'document.pdf') {
  // Replace illegal filename characters such as '/' with '_'
  const safeFilename = String(filename).replace(/[/\\?%*:|"<>]/g, '_').trim();
  const url = await fetchDocumentPDFBlobUrl(id);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename.endsWith('.pdf') ? safeFilename : `${safeFilename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function parseInvoiceDocument(base64Data, fileName = '') {
  const res = await api.post('/documents/parse-invoice', { base64Data, fileName });
  return res.data?.data || res.data;
}

