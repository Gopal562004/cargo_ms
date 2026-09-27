import * as documentService from '../services/document.service.js';
import { generateCodes } from '../services/barcode.service.js';
import { DOCUMENT_TYPES, DOCUMENT_CATEGORIES } from '../utils/constants.js';

/**
 * GET /api/documents/types
 * List all available document types.
 */
export async function getDocumentTypes(req, res) {
  res.json({
    success: true,
    data: {
      types: DOCUMENT_TYPES,
      categories: DOCUMENT_CATEGORIES,
    },
  });
}

/**
 * POST /api/documents
 * Create a new document.
 */
export async function createDocument(req, res, next) {
  try {
    const document = await documentService.createDocument(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents
 * List all documents with pagination and filters.
 */
export async function getAllDocuments(req, res, next) {
  try {
    const result = await documentService.getAllDocuments(req.user.id, req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id
 * Get a single document.
 */
export async function getDocumentById(req, res, next) {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user.id);
    res.json({
      success: true,
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/documents/:id
 * Update a document.
 */
export async function updateDocument(req, res, next) {
  try {
    const document = await documentService.updateDocument(req.params.id, req.user.id, req.body);
    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/documents/:id
 * Delete a document.
 */
export async function deleteDocument(req, res, next) {
  try {
    const result = await documentService.deleteDocument(req.params.id, req.user.id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/documents/:id/duplicate
 * Duplicate a document.
 */
export async function duplicateDocument(req, res, next) {
  try {
    const document = await documentService.duplicateDocument(req.params.id, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Document duplicated successfully',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/documents/:id/status
 * Update document status.
 */
export async function updateStatus(req, res, next) {
  try {
    const document = await documentService.updateDocumentStatus(req.params.id, req.user.id, req.body);
    res.json({
      success: true,
      message: `Status updated to ${req.body.status}`,
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id/history
 * Get status history.
 */
export async function getHistory(req, res, next) {
  try {
    const history = await documentService.getDocumentHistory(req.params.id, req.user.id);
    res.json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id/pdf
 * Generate and stream PDF file.
 */
export async function downloadPDF(req, res, next) {
  try {
    const { generateDocumentPDF } = await import('../services/pdf.service.js');
    const document = await documentService.getDocumentById(req.params.id, req.user.id);
    const pdfBuffer = await generateDocumentPDF(document);

    // Auto-save locally in organized folders (non-blocking)
    import('../services/localStorage.service.js')
      .then(({ saveDocumentLocally }) => {
        const companyName = req.user?.companyName || req.user?.company || 'MyCompany';
        return saveDocumentLocally(document, pdfBuffer, companyName);
      })
      .catch((err) => {
        console.warn('[LocalStorage] Auto-save skipped/failed:', err.message);
      });

    const rawDocNumber = document.documentNumber || document.data?.invoiceNumber || document.id;
    // Replace forward slashes and invalid filename characters with '_' so browsers don't strip the filename
    const safeDocNumber = String(rawDocNumber).replace(/[/\\?%*:|"<>]/g, '_').trim();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${safeDocNumber}.pdf"; filename*=UTF-8''${encodeURIComponent(safeDocNumber)}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/documents/parse-invoice
 * Auto-extract invoice/purchase bill fields from uploaded document PDF or image.
 */
export async function parseInvoiceDocument(req, res, next) {
  try {
    const { parseInvoiceFile } = await import('../services/invoiceExtractor.service.js');
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'base64Data is required' });
    }
    const extractedData = await parseInvoiceFile(base64Data, fileName);
    res.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    next(error);
  }
}


