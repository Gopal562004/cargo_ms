import {
  exportUserData,
  importUserData,
  directCloudMigrate,
} from '../services/migration.service.js';

/**
 * GET /api/migration/export
 * Export all user data as a JSON backup payload.
 */
export async function exportData(req, res, next) {
  try {
    const data = await exportUserData(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/migration/import
 * Import user data from a JSON backup payload.
 * Body: { documents, contacts, templates, clientData? }
 */
export async function importData(req, res, next) {
  try {
    const stats = await importUserData(req.user.id, req.body);
    res.json({
      success: true,
      message: `Imported ${stats.documents} documents, ${stats.contacts} contacts, ${stats.templates} templates. ${stats.skipped} items skipped (duplicates).`,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/migration/cloud-import
 * Pull data directly from a remote CargoMS Web Cloud API into local database.
 * Body: { cloudUrl?, email?, username?, password, licenseKey? }
 */
export async function cloudImport(req, res, next) {
  try {
    const { cloudUrl, email, username, password, licenseKey } = req.body;
    const stats = await directCloudMigrate({
      cloudUrl,
      email,
      username,
      password,
      licenseKey,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: `Cloud import complete: ${stats.documents} documents, ${stats.contacts} contacts, ${stats.templates} templates imported. ${stats.skipped} duplicates skipped.`,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
