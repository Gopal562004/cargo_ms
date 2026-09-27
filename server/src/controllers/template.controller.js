import { AppError } from '../middleware/error.middleware.js';
import prisma from '../config/database.js';
import { hydrateTemplate, hydrateTemplates, dehydrateDocumentData, parseJsonField } from '../utils/sqlite-helpers.js';

/**
 * POST /api/templates
 * Create a template from scratch or from an existing document.
 */
export async function createTemplate(req, res, next) {
  try {
    const { id, name, description, documentType = 'TAX_INVOICE', data, fromDocumentId, isDefault } = req.body;

    let templateData = data || {};

    // If creating from an existing document, copy its data
    if (fromDocumentId) {
      const doc = await prisma.document.findFirst({
        where: { id: fromDocumentId, createdById: req.user.id },
      });
      if (!doc) throw new AppError('Source document not found', 404);
      templateData = parseJsonField(doc.data, {});
    }

    // Check if updating existing template with same ID
    if (id) {
      const existing = await prisma.template.findFirst({
        where: { id, createdById: req.user.id },
      });
      if (existing) {
        const updated = await prisma.template.update({
          where: { id },
          data: {
            name: name || existing.name,
            description: description !== undefined ? description : existing.description,
            documentType: documentType || existing.documentType,
            data: dehydrateDocumentData(templateData),
            isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
          },
        });
        return res.json({ success: true, data: { template: hydrateTemplate(updated) } });
      }
    }

    const template = await prisma.template.create({
      data: {
        ...(id && { id }),
        name: name || 'Untitled Template',
        description,
        documentType: documentType || 'TAX_INVOICE',
        data: dehydrateDocumentData(templateData),
        isDefault: Boolean(isDefault),
        createdById: req.user.id,
      },
    });

    res.status(201).json({ success: true, data: { template: hydrateTemplate(template) } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/templates
 */
export async function getAllTemplates(req, res, next) {
  try {
    const { documentType } = req.query;

    const templates = await prisma.template.findMany({
      where: {
        createdById: req.user.id,
        ...(documentType && { documentType }),
      },
      orderBy: { name: 'asc' },
    });

    const hydratedTemplates = hydrateTemplates(templates);
    const activeTemplates = hydratedTemplates.filter((t) => !t.data?.isDeleted);
    res.json({ success: true, data: { templates: activeTemplates } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/templates/:id
 */
export async function getTemplateById(req, res, next) {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!template) throw new AppError('Template not found', 404);
    const hydrated = hydrateTemplate(template);
    if (hydrated.data?.isDeleted) throw new AppError('Template not found', 404);
    res.json({ success: true, data: { template: hydrated } });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/templates/:id
 */
export async function updateTemplate(req, res, next) {
  try {
    const existing = await prisma.template.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!existing) throw new AppError('Template not found', 404);
    const existingData = parseJsonField(existing.data, {});
    if (existingData?.isDeleted) throw new AppError('Template not found', 404);

    const updatePayload = { ...req.body };
    if (updatePayload.data !== undefined) {
      updatePayload.data = dehydrateDocumentData(updatePayload.data);
    }
    const template = await prisma.template.update({
      where: { id: req.params.id },
      data: updatePayload,
    });
    res.json({ success: true, data: { template: hydrateTemplate(template) } });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/templates/:id
 */
export async function deleteTemplate(req, res, next) {
  try {
    const existing = await prisma.template.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!existing) throw new AppError('Template not found', 404);

    // Soft delete: Store isDeleted and deletedAt in template data
    const currentData = parseJsonField(existing.data, {});
    await prisma.template.update({
      where: { id: req.params.id },
      data: {
        data: dehydrateDocumentData({
          ...currentData,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        }),
      },
    });

    res.json({ success: true, message: 'Template soft-deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/templates/:id/apply
 * Create a new document from a template.
 */
export async function applyTemplate(req, res, next) {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!template) throw new AppError('Template not found', 404);

    // Import document service to create from template
    const { createDocument } = await import('../services/document.service.js');

    const templateData = parseJsonField(template.data, {});
    const document = await createDocument({
      documentType: template.documentType,
      title: req.body.title || `From template: ${template.name}`,
      data: { ...templateData, ...(req.body.data || {}) },
      packages: req.body.packages || [],
    }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Document created from template',
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}
