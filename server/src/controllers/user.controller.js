import crypto from 'crypto';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { hydrateUser, hydrateUsers, hydrateActivityLogs, stringifyAllowedServices, stringifyJsonField } from '../utils/sqlite-helpers.js';

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

export const SUBSCRIPTION_PLANS = [
  { id: 'FREE_TRIAL', label: 'Free Trial', defaultDuration: '7_DAYS', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'STARTER', label: 'Starter Plan', defaultDuration: '1_MONTH', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'PROFESSIONAL', label: 'Professional Plan', defaultDuration: '1_YEAR', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'ENTERPRISE', label: 'Enterprise Plan', defaultDuration: '1_YEAR', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'CUSTOM', label: 'Custom Contract', defaultDuration: 'CUSTOM', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
];

/**
 * Generate standard unique cryptographically secure License Key
 * e.g. CRGO-2026-A9B2-9901-X8Z1
 */
export function generateLicenseKey(prefix = 'CRGO', year = '2026') {
  const seg1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${year}-${seg1}-${seg2}-${seg3}`;
}

/**
 * Helper to compute plan expiration date from duration preset
 */
export function calculateExpiryDate(durationPreset, startDate = new Date(), customDate = null) {
  if (durationPreset === 'CUSTOM' && customDate) {
    return new Date(customDate);
  }
  const date = new Date(startDate);
  switch (durationPreset) {
    case '7_DAYS':
      date.setDate(date.getDate() + 7);
      break;
    case '1_MONTH':
      date.setMonth(date.getMonth() + 1);
      break;
    case '3_MONTHS':
      date.setMonth(date.getMonth() + 3);
      break;
    case '6_MONTHS':
      date.setMonth(date.getMonth() + 6);
      break;
    case '1_YEAR':
    default:
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

/**
 * Helper to log an audit event for a user
 */
export async function logUserActivity(userId, action, description, performedBy = 'SYSTEM', metadata = null) {
  try {
    await prisma.userActivityLog.create({
      data: {
        userId,
        action,
        description,
        performedBy,
        metadata: metadata ? stringifyJsonField(metadata) : undefined,
      },
    });
  } catch (err) {
    console.error('Error logging user activity:', err.message);
  }
}

/**
 * GET /api/users
 * List all users with their allocated services, subscription info, and stats
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
        licenseKey: true,
        subscriptionPlan: true,
        subscriptionDuration: true,
        subscriptionStartDate: true,
        subscriptionExpiresAt: true,
        subscriptionStatus: true,
        maxSeats: true,
        notes: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { documents: true, activityLogs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Auto-backfill: Ensure every user has their own distinct, unique License Key & Expiry Date saved in DB
    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        const hydrated = hydrateUser(u);
        let currentKey = hydrated.licenseKey;
        let currentExpiresAt = hydrated.subscriptionExpiresAt;

        if (!currentKey || !currentExpiresAt) {
          currentKey = currentKey || generateLicenseKey();
          if (!currentExpiresAt) {
            const exp = new Date(hydrated.createdAt || now);
            exp.setFullYear(exp.getFullYear() + 1);
            currentExpiresAt = exp;
          }
          try {
            await prisma.user.update({
              where: { id: hydrated.id },
              data: {
                licenseKey: currentKey,
                subscriptionExpiresAt: currentExpiresAt,
                subscriptionPlan: hydrated.subscriptionPlan || 'STARTER',
                subscriptionStatus: hydrated.isActive ? 'ACTIVE' : 'INACTIVE',
              },
            });
          } catch (updateErr) {
            console.error('Error auto-backfilling user license:', updateErr.message);
          }
        }

        const expiresAt = currentExpiresAt ? new Date(currentExpiresAt) : null;
        let daysRemaining = null;
        let isExpired = false;

        if (expiresAt) {
          const diffMs = expiresAt.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          isExpired = daysRemaining <= 0;
        }

        return {
          ...hydrated,
          username: hydrated.username || (hydrated.email ? hydrated.email.split('@')[0] : 'user'),
          licenseKey: currentKey,
          subscriptionPlan: hydrated.subscriptionPlan || 'STARTER',
          subscriptionExpiresAt: currentExpiresAt,
          subscriptionStatus: !hydrated.isActive ? 'INACTIVE' : isExpired ? 'EXPIRED' : (hydrated.subscriptionStatus || 'ACTIVE'),
          daysRemaining,
          isExpired,
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        availableServices: SYSTEM_SERVICES,
        availablePlans: SUBSCRIPTION_PLANS,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users
 * Create a new user with auto license key, subscription plan, duration and service allocation
 */
export async function createUser(req, res, next) {
  try {
    const {
      username,
      email,
      password,
      name,
      company,
      role,
      isActive,
      allowedServices,
      phone,
      department,
      subscriptionPlan,
      subscriptionDuration,
      customExpiresAt,
      maxSeats,
      notes,
    } = req.body;

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

    // Default services if empty
    let services = Array.isArray(allowedServices) ? allowedServices : [];
    if (role === 'ADMIN' && services.length === 0) {
      services = SYSTEM_SERVICES.map((s) => s.id);
    }

    const plan = subscriptionPlan || 'STARTER';
    const duration = subscriptionDuration || '1_YEAR';
    const startDate = new Date();
    const expiresAt = calculateExpiryDate(duration, startDate, customExpiresAt);
    const licenseKey = generateLicenseKey();

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        company: company ? company.trim() : null,
        role: role || 'OPERATOR',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        allowedServices: stringifyAllowedServices(services),
        phone: phone ? phone.trim() : null,
        department: department ? department.trim() : null,
        licenseKey,
        subscriptionPlan: plan,
        subscriptionDuration: duration,
        subscriptionStartDate: startDate,
        subscriptionExpiresAt: expiresAt,
        subscriptionStatus: 'ACTIVE',
        maxSeats: maxSeats ? parseInt(maxSeats, 10) : 1,
        notes: notes ? notes.trim() : null,
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
        licenseKey: true,
        subscriptionPlan: true,
        subscriptionDuration: true,
        subscriptionStartDate: true,
        subscriptionExpiresAt: true,
        subscriptionStatus: true,
        maxSeats: true,
        notes: true,
        createdAt: true,
      },
    });

    // Record initial audit event
    const adminName = req.user?.name || req.user?.username || 'Super Admin';
    await logUserActivity(
      user.id,
      'USER_CREATED',
      `Account created by ${adminName} on ${plan} plan with validity until ${expiresAt.toLocaleDateString('en-IN')}`,
      adminName,
      { plan, duration, licenseKey }
    );

    res.status(201).json({
      success: true,
      message: `User ${user.name} created successfully with License Key: ${user.licenseKey}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/:id
 * Update user details, subscription plan, expiry, status, and allocated services
 */
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      name,
      company,
      role,
      isActive,
      allowedServices,
      phone,
      department,
      subscriptionPlan,
      subscriptionDuration,
      subscriptionExpiresAt,
      subscriptionStatus,
      maxSeats,
      notes,
    } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (company !== undefined) updateData.company = company ? company.trim() : null;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (allowedServices !== undefined) updateData.allowedServices = stringifyAllowedServices(Array.isArray(allowedServices) ? allowedServices : []);
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (department !== undefined) updateData.department = department ? department.trim() : null;
    const adminName = req.user?.name || req.user?.username || 'Super Admin';
    let isCancelling = false;
    let isAssigningNew = false;

    if (subscriptionDuration !== undefined) {
      updateData.subscriptionDuration = subscriptionDuration;
      if (subscriptionDuration === 'CANCELLED') {
        isCancelling = true;
        updateData.subscriptionPlan = 'NO_ACTIVE_PLAN';
        updateData.subscriptionExpiresAt = new Date(Date.now() - 1000);
        updateData.subscriptionStatus = 'CANCELLED';
      } else if (subscriptionDuration === 'CUSTOM' && (customExpiresAt || subscriptionExpiresAt)) {
        updateData.subscriptionExpiresAt = new Date(customExpiresAt || subscriptionExpiresAt);
        updateData.subscriptionStatus = 'ACTIVE';
        if (existing.subscriptionStatus === 'CANCELLED' || !existing.subscriptionExpiresAt || new Date(existing.subscriptionExpiresAt) < new Date()) {
          isAssigningNew = true;
        }
      } else if (subscriptionDuration !== 'CUSTOM') {
        updateData.subscriptionExpiresAt = calculateExpiryDate(subscriptionDuration, new Date());
        updateData.subscriptionStatus = 'ACTIVE';
        if (existing.subscriptionStatus === 'CANCELLED' || !existing.subscriptionExpiresAt || new Date(existing.subscriptionExpiresAt) < new Date()) {
          isAssigningNew = true;
        }
      }
    } else if (subscriptionExpiresAt !== undefined) {
      updateData.subscriptionExpiresAt = new Date(subscriptionExpiresAt);
    } else if (customExpiresAt) {
      updateData.subscriptionExpiresAt = new Date(customExpiresAt);
    }

    if (subscriptionPlan !== undefined && subscriptionDuration !== 'CANCELLED') {
      updateData.subscriptionPlan = subscriptionPlan;
      if (subscriptionPlan !== 'NO_ACTIVE_PLAN') {
        updateData.subscriptionStatus = 'ACTIVE';
      }
    }

    if (subscriptionDuration !== 'CANCELLED') {
      const finalExpiry = updateData.subscriptionExpiresAt || existing.subscriptionExpiresAt;
      if (finalExpiry && new Date(finalExpiry) > new Date()) {
        updateData.subscriptionStatus = 'ACTIVE';
      }
    } else {
      updateData.subscriptionStatus = 'CANCELLED';
    }

    if (maxSeats !== undefined) updateData.maxSeats = parseInt(maxSeats, 10) || 1;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

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
        licenseKey: true,
        subscriptionPlan: true,
        subscriptionDuration: true,
        subscriptionStartDate: true,
        subscriptionExpiresAt: true,
        subscriptionStatus: true,
        maxSeats: true,
        notes: true,
        updatedAt: true,
      },
    });

    // Detailed activity logging
    if (isCancelling) {
      await logUserActivity(
        id,
        'SUBSCRIPTION_CANCELLED',
        `Subscription plan (${existing.subscriptionPlan || 'Active Plan'}) was completely cancelled & revoked by ${adminName}.`,
        adminName,
        { previousPlan: existing.subscriptionPlan, previousExpiry: existing.subscriptionExpiresAt }
      );
    } else if (isAssigningNew) {
      await logUserActivity(
        id,
        'SUBSCRIPTION_ASSIGNED',
        `Assigned new subscription plan (${updateData.subscriptionPlan || existing.subscriptionPlan || 'STARTER'}) with duration ${subscriptionDuration} by ${adminName}.`,
        adminName,
        { newPlan: updateData.subscriptionPlan || existing.subscriptionPlan, newExpiry: updateData.subscriptionExpiresAt }
      );
    } else {
      await logUserActivity(
        id,
        'USER_UPDATED',
        `Profile / Subscription details updated by ${adminName}`,
        adminName,
        { changes: Object.keys(updateData) }
      );
    }

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
 * POST /api/users/:id/extend
 * 1-Click Extend user subscription validity (+1 Month, +3 Months, +6 Months, +1 Year, or Custom)
 */
export async function extendSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const { extensionType, customExpiresAt } = req.body; // '1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR', 'CUSTOM'

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    const baseDate = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()
      ? new Date(user.subscriptionExpiresAt)
      : new Date();

    const newExpiry = calculateExpiryDate(extensionType || '1_MONTH', baseDate, customExpiresAt);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        subscriptionExpiresAt: newExpiry,
        subscriptionStatus: 'ACTIVE',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        subscriptionExpiresAt: true,
        subscriptionStatus: true,
        isActive: true,
      },
    });

    const adminName = req.user?.name || req.user?.username || 'Super Admin';
    await logUserActivity(
      id,
      'PLAN_EXTENDED',
      `Subscription extended (${extensionType || 'Custom'}) to ${newExpiry.toLocaleDateString('en-IN')} by ${adminName}`,
      adminName,
      { extensionType, newExpiry }
    );

    res.json({
      success: true,
      message: `Subscription for ${user.name} extended until ${newExpiry.toLocaleDateString('en-IN')}!`,
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/:id/regenerate-license
 * Re-issue a new unique License Key
 */
export async function regenerateLicenseKey(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    const newLicenseKey = generateLicenseKey();

    const updated = await prisma.user.update({
      where: { id },
      data: { licenseKey: newLicenseKey },
      select: { id: true, name: true, licenseKey: true },
    });

    const adminName = req.user?.name || req.user?.username || 'Super Admin';
    await logUserActivity(
      id,
      'LICENSE_REGENERATED',
      `License Key re-issued: ${newLicenseKey} by ${adminName}`,
      adminName,
      { newLicenseKey }
    );

    res.json({
      success: true,
      message: `New License Key generated for ${user.name}: ${newLicenseKey}`,
      data: { licenseKey: newLicenseKey },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id/activity
 * Retrieve chronological activity and audit history for a user
 */
export async function getUserActivityLogs(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    const logs = await prisma.userActivityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: {
        userId: id,
        userName: user.name,
        logs,
      },
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

    const adminName = req.user?.name || req.user?.username || 'Super Admin';
    await logUserActivity(
      id,
      'PASSWORD_RESET',
      `Login password updated / reset by ${adminName}`,
      adminName
    );

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
 * Soft delete / deactivate user
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
      data: { isActive: false, subscriptionStatus: 'INACTIVE' },
    });

    const adminName = req.user?.name || req.user?.username || 'Super Admin';
    await logUserActivity(
      id,
      'STATUS_CHANGED',
      `Account suspended / deactivated by ${adminName}`,
      adminName
    );

    res.json({
      success: true,
      message: `User ${existing.name} deactivated successfully`,
    });
  } catch (error) {
    next(error);
  }
}
