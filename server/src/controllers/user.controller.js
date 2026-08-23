import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';
import { AppError } from '../middleware/error.middleware.js';

export const SYSTEM_SERVICES = [
  { id: 'AIR_FREIGHT', label: 'Air Freight & Air Waybills', category: 'Operations', description: 'Create and manage MAWB, HAWB, Manifests, DGD' },
  { id: 'EDI_CARGO', label: 'eAWB / EDI Messaging', category: 'Operations', description: 'Electronic FWB, FHL, FFR Cargo-IMP messages' },
  { id: 'SEA_FREIGHT', label: 'Ocean Freight & Shipping', category: 'Operations', description: 'Bills of Lading, Sea Manifests & IMO DGD' },
  { id: 'SALES_BILLING', label: 'Sales Invoices & Billing Hub', category: 'Billing & Accounting', description: 'Create tax invoices, WYSIWYG printable sheet, sales register' },
  { id: 'PURCHASE_BILLS', label: 'Purchase Bills & Expense Tracking', category: 'Billing & Accounting', description: 'Vendor invoices for DGD charges, packaging boxes, airline fees' },
  { id: 'BILLING_TEMPLATES', label: 'Billing Templates & Directory', category: 'Billing & Accounting', description: 'Saved invoice presets, Customer directory & Delivery sites' },
  { id: 'CONTACTS_DIRECTORY', label: 'Contacts & Directory', category: 'Management', description: 'Shippers, consignees, airline agents, and carriers' },
  { id: 'TEMPLATES_MANAGEMENT', label: 'Document Templates', category: 'Management', description: 'Standard cargo document templates' },
  { id: 'MASTER_ADMIN', label: 'Master Administration & Users', category: 'Administration', description: 'Manage system users, login credentials & service allocation' },
];

/**
 * GET /api/users
 * List all users with their allocated services
 */
export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        company: true,
        role: true,
        isActive: true,
        allowedServices: true,
        phone: true,
        department: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((u) => ({
      ...u,
      username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        availableServices: SYSTEM_SERVICES,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users
 * Create a new user with username, optional email, password and service allocation
 */
export async function createUser(req, res, next) {
  try {
    const { username, email, password, name, company, role, isActive, allowedServices, phone, department } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('Full name is required', 400);
    }

    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const cleanUsername = (username || email || name.replace(/\s+/g, '').toLowerCase()).toLowerCase().trim();
    if (!cleanUsername) {
      throw new AppError('Username is required for login credentials', 400);
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: cleanUsername } });
    if (existingUsername) {
      throw new AppError(`Username "${cleanUsername}" is already taken. Please choose another username.`, 409);
    }

    const cleanEmail = email && email.trim() ? email.toLowerCase().trim() : null;
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmail) {
        throw new AppError(`Email "${cleanEmail}" is already registered.`, 409);
      }
    }

    const passwordHash = await hashPassword(password);

    // Default services if empty: give general operations or full depending on role
    let services = Array.isArray(allowedServices) ? allowedServices : [];
    if (role === 'ADMIN' && services.length === 0) {
      services = SYSTEM_SERVICES.map((s) => s.id);
    }

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        company: company ? company.trim() : null,
        role: role || 'OPERATOR',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        allowedServices: services,
        phone: phone ? phone.trim() : null,
        department: department ? department.trim() : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        company: true,
        role: true,
        isActive: true,
        allowedServices: true,
        phone: true,
        department: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `User ${user.name} created successfully with Username: ${user.username}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/:id
 * Update user details and allocated services
 */
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { username, email, name, company, role, isActive, allowedServices, phone, department } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (company !== undefined) updateData.company = company ? company.trim() : null;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (allowedServices !== undefined) updateData.allowedServices = Array.isArray(allowedServices) ? allowedServices : [];
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (department !== undefined) updateData.department = department ? department.trim() : null;

    if (username !== undefined && username.trim()) {
      const cleanUsername = username.toLowerCase().trim();
      if (cleanUsername !== existing.username) {
        const usernameCheck = await prisma.user.findUnique({ where: { username: cleanUsername } });
        if (usernameCheck) throw new AppError(`Username "${cleanUsername}" is already taken`, 409);
        updateData.username = cleanUsername;
      }
    }

    if (email !== undefined) {
      const cleanEmail = email && email.trim() ? email.toLowerCase().trim() : null;
      if (cleanEmail && cleanEmail !== existing.email) {
        const emailCheck = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (emailCheck) throw new AppError(`Email "${cleanEmail}" is already in use`, 409);
      }
      updateData.email = cleanEmail;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        company: true,
        role: true,
        isActive: true,
        allowedServices: true,
        phone: true,
        department: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: `User ${user.name} updated successfully`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/:id/password
 * Reset or change user password
 */
export async function updateUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: `Password updated successfully for ${existing.name}`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/users/:id
 * Delete a user
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    // Soft delete: Deactivate user account
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: `User ${existing.name} soft-deleted (deactivated) successfully`,
    });
  } catch (error) {
    next(error);
  }
}
