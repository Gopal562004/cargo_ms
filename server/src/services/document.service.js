import { AppError } from '../middleware/error.middleware.js';
import { DOCUMENT_TYPES, STATUS_TRANSITIONS } from '../utils/constants.js';
import {
  generateAWBNumber,
  generateHAWBNumber,
  generateBOLNumber,
  generateDocumentNumber,
} from '../utils/awbNumber.js';

/**
 * Get the document category from document type.
 */
function getCategoryFromType(documentType) {
  const meta = DOCUMENT_TYPES[documentType];
  return meta?.category || 'OTHER';
}

/**
 * Auto-generate document number based on document type.
 */
function autoGenerateNumber(documentType, data = {}) {
  switch (documentType) {
    case 'MAWB':
    case 'FWB':
    case 'XFWB':
      return generateAWBNumber(data.awbPrefix || '000');
    case 'HAWB':
    case 'FHL':
    case 'XFZB':
    case 'HAWB_FHL':
      return generateHAWBNumber(data.agentCode);
    case 'BILL_OF_LADING':
      return generateBOLNumber(data.carrierCode);
    default:
      return generateDocumentNumber(documentType.substring(0, 3));
  }
}

/**
 * Create a new document.
 */
export async function createDocument({ documentType, title, documentNumber, data, packages }, userId) {
  const category = getCategoryFromType(documentType);

  let docNumber = documentNumber || data?.invoiceNumber;
  if (!docNumber) {
    if (documentType === 'TAX_INVOICE') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const fullYear = now.getFullYear();
      const startYear = currentMonth >= 3 ? fullYear : fullYear - 1;
      const endYearShort = (startYear + 1).toString().slice(-2);
      const fyStr = `${startYear}-${endYearShort}`;

      const count = await prisma.document.count({
        where: { documentType: 'TAX_INVOICE', createdById: userId },
      });
      const seqStr = (count + 1).toString().padStart(3, '0');
      docNumber = `DGR/${seqStr}/${fyStr}`;
    } else {
      docNumber = autoGenerateNumber(documentType, data);
    }
  }

  const document = await prisma.document.create({
    data: {
      documentType,
      category,
      title: title || `${DOCUMENT_TYPES[documentType]?.name || documentType} - ${docNumber}`,
      documentNumber: docNumber,
      data: data || {},
      createdById: userId,
      statusHistory: {
        create: {
          status: 'DRAFT',
          note: 'Document created',
          changedBy: userId,
        },
      },
      ...(packages && packages.length > 0 && {
        packages: {
          create: packages,
        },
      }),
    },
    include: {
      packages: true,
      statusHistory: { orderBy: { changedAt: 'desc' } },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return document;
}

/**
 * Get all documents with pagination, filtering, and search.
 */
export async function getAllDocuments(userId, query = {}) {
  const pageNum = Number(query.page) || 1;
  const limitNum = Number(query.limit) || 20;
  const {
    search,
    documentType,
    category,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const where = {
    createdById: userId,
    ...(documentType && { documentType }),
    ...(category && { category }),
    ...(status ? { status } : { status: { not: 'CANCELLED' } }),
    ...(search && {
      OR: [
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        statusHistory: { orderBy: { changedAt: 'desc' } },
        _count: { select: { packages: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    documents,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Get a single document by ID.
 */
export async function getDocumentById(id, userId) {
  const document = await prisma.document.findFirst({
    where: { id, createdById: userId },
    include: {
      packages: { orderBy: { pieceNumber: 'asc' } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  return document;
}

/**
 * Update a document.
 */
export async function updateDocument(id, userId, updateData) {
  const existing = await prisma.document.findFirst({
    where: { id, createdById: userId },
  });

  if (!existing) {
    throw new AppError('Document not found', 404);
  }

  // Only allow editing DRAFT and VALIDATED documents for non-tax-invoices
  if (existing.documentType !== 'TAX_INVOICE' && !['DRAFT', 'VALIDATED'].includes(existing.status)) {
    throw new AppError(`Cannot edit document in ${existing.status} status`, 400);
  }

  const { packages, status, statusNote, ...docData } = updateData;

  // Build update query
  const updateQuery = {
    ...docData,
    version: { increment: 1 },
    ...(status && { status }),
    ...(docData.data && {
      data: { ...existing.data, ...docData.data },
    }),
    ...(status && {
      statusHistory: {
        create: {
          status,
          note: statusNote || `Status updated to ${status}`,
          changedBy: userId,
        },
      },
    }),
  };

  // Handle packages update — delete all and recreate
  if (packages !== undefined) {
    await prisma.package.deleteMany({ where: { documentId: id } });

    if (packages.length > 0) {
      updateQuery.packages = {
        create: packages.map(({ id: _pkgId, ...pkg }) => pkg),
      };
    }
  }

  const document = await prisma.document.update({
    where: { id },
    data: updateQuery,
    include: {
      packages: { orderBy: { pieceNumber: 'asc' } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return document;
}

/**
 * Delete a document (Soft delete — archives document and marks as CANCELLED).
 */
export async function deleteDocument(id, userId) {
  const existing = await prisma.document.findFirst({
    where: { id, createdById: userId },
  });

  if (!existing) {
    throw new AppError('Document not found', 404);
  }

  // Soft delete: Mark document as CANCELLED and preserve records in db
  const currentData = (typeof existing.data === 'object' && existing.data !== null) ? existing.data : {};
  await prisma.document.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      data: {
        ...currentData,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      },
      statusHistory: {
        create: {
          status: 'CANCELLED',
          note: 'Document soft-deleted (archived)',
          changedBy: userId,
        },
      },
    },
  });

  return { message: 'Document soft-deleted successfully' };
}

/**
 * Duplicate a document.
 */
export async function duplicateDocument(id, userId) {
  const original = await prisma.document.findFirst({
    where: { id, createdById: userId },
    include: { packages: true },
  });

  if (!original) {
    throw new AppError('Document not found', 404);
  }

  // Generate new document number
  const newNumber = autoGenerateNumber(original.documentType, original.data);

  const duplicate = await prisma.document.create({
    data: {
      documentType: original.documentType,
      category: original.category,
      title: `Copy of ${original.title}`,
      documentNumber: newNumber,
      data: original.data,
      status: 'DRAFT',
      createdById: userId,
      statusHistory: {
        create: {
          status: 'DRAFT',
          note: `Duplicated from ${original.documentNumber}`,
          changedBy: userId,
        },
      },
      ...(original.packages.length > 0 && {
        packages: {
          create: original.packages.map(({ id: _id, documentId: _docId, createdAt: _ca, ...pkg }) => pkg),
        },
      }),
    },
    include: {
      packages: true,
      statusHistory: { orderBy: { changedAt: 'desc' } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return duplicate;
}

/**
 * Update document status with transition validation.
 */
export async function updateDocumentStatus(id, userId, { status, note }) {
  const existing = await prisma.document.findFirst({
    where: { id, createdById: userId },
  });

  if (!existing) {
    throw new AppError('Document not found', 404);
  }

  // Validate status transition
  const allowedTransitions = STATUS_TRANSITIONS[existing.status] || [];
  if (!allowedTransitions.includes(status)) {
    throw new AppError(
      `Cannot transition from ${existing.status} to ${status}. Allowed: ${allowedTransitions.join(', ')}`,
      400
    );
  }

  const document = await prisma.document.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: {
          status,
          note,
          changedBy: userId,
        },
      },
    },
    include: {
      packages: { orderBy: { pieceNumber: 'asc' } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return document;
}

/**
 * Get status history for a document.
 */
export async function getDocumentHistory(id, userId) {
  const document = await prisma.document.findFirst({
    where: { id, createdById: userId },
    select: { id: true },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  const history = await prisma.statusHistory.findMany({
    where: { documentId: id },
    orderBy: { changedAt: 'desc' },
  });

  return history;
}
