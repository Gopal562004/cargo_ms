import { z } from 'zod';

/**
 * Zod schema for creating a new document.
 */
export const createDocumentSchema = z.object({
  documentType: z.enum([
    'MAWB', 'HAWB', 'MANIFEST', 'DGD', 'LABEL', 'CARGO_POUCH_LABEL', 'CSD',
    'FWB', 'FHL', 'XFWB', 'XFZB', 'FFR', 'HAWB_FHL',
    'BILL_OF_LADING', 'BOL_MANIFEST', 'IMO_DGD', 'SOLAS_VGM',
    'BOOKING', 'PROFORMA_INVOICE', 'WAREHOUSE_RECEIPT', 'DOCK_RECEIPT',
    'CERTIFICATE_OF_ORIGIN', 'DELIVERY_ORDER', 'DELIVERY_NOTE',
    'FCR', 'CMR', 'ARRIVAL_NOTICE', 'SECURITY_DECLARATION', 'LETTER',
  ]),
  title: z.string().max(200).optional().nullable(),
  documentNumber: z.string().max(50).optional().nullable(),
  data: z.record(z.any()).default({}),
  packages: z.array(z.object({
    pieceNumber: z.number().int().min(1),
    length: z.number().positive().optional().nullable(),
    width: z.number().positive().optional().nullable(),
    height: z.number().positive().optional().nullable(),
    dimensionUnit: z.enum(['CM', 'IN']).default('CM'),
    weight: z.number().positive(),
    weightUnit: z.enum(['KG', 'LB']).default('KG'),
    description: z.string().optional().nullable(),
    marks: z.string().optional().nullable(),
    hazClass: z.string().optional().nullable(),
    unNumber: z.string().optional().nullable(),
  })).optional().default([]),
});

/**
 * Zod schema for updating a document.
 */
export const updateDocumentSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  documentNumber: z.string().max(50).optional().nullable(),
  data: z.record(z.any()).optional(),
  packages: z.array(z.object({
    id: z.string().optional(),
    pieceNumber: z.number().int().min(1),
    length: z.number().positive().optional().nullable(),
    width: z.number().positive().optional().nullable(),
    height: z.number().positive().optional().nullable(),
    dimensionUnit: z.enum(['CM', 'IN']).default('CM'),
    weight: z.number().positive(),
    weightUnit: z.enum(['KG', 'LB']).default('KG'),
    description: z.string().optional().nullable(),
    marks: z.string().optional().nullable(),
    hazClass: z.string().optional().nullable(),
    unNumber: z.string().optional().nullable(),
  })).optional(),
});

/**
 * Zod schema for updating document status.
 */
export const updateStatusSchema = z.object({
  status: z.enum([
    'DRAFT', 'VALIDATED', 'ISSUED', 'BOOKED', 'DEPARTED',
    'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED', 'COMPLETED',
  ]),
  note: z.string().max(500).optional().nullable(),
});

/**
 * Zod schema for list query parameters.
 */
export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().transform((val) => val === '' ? undefined : val),
  documentType: z.string().optional().transform((val) => val === '' ? undefined : val),
  category: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(['AIR_FREIGHT', 'SEA_FREIGHT', 'EDI', 'OTHER']).optional()
  ),
  status: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
  ),
  sortBy: z.enum(['createdAt', 'updatedAt', 'documentNumber', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
