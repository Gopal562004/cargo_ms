import { AppError } from '../middleware/error.middleware.js';
import prisma from '../config/database.js';

/**
 * POST /api/contacts
 */
export async function createContact(req, res, next) {
  try {
    const contact = await prisma.contact.create({
      data: {
        ...req.body,
        createdById: req.user.id,
      },
    });
    res.status(201).json({ success: true, data: { contact } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/contacts
 */
export async function getAllContacts(req, res, next) {
  try {
    const { search, type, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where = {
      createdById: req.user.id,
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/contacts/:id
 */
export async function getContactById(req, res, next) {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!contact) throw new AppError('Contact not found', 404);
    res.json({ success: true, data: { contact } });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/contacts/:id
 */
export async function updateContact(req, res, next) {
  try {
    const existing = await prisma.contact.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!existing) throw new AppError('Contact not found', 404);

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: { contact } });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/contacts/:id
 */
export async function deleteContact(req, res, next) {
  try {
    const existing = await prisma.contact.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!existing) throw new AppError('Contact not found', 404);

    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    next(error);
  }
}
