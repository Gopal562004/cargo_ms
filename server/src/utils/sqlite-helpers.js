/**
 * SQLite / PostgreSQL Dual-Mode Helpers
 * 
 * The server runs in TWO modes:
 *   1. WEB MODE (PostgreSQL) — Json fields are native objects, String[] is native array
 *   2. DESKTOP MODE (SQLite)  — Json fields are stored as text strings, arrays as JSON strings
 * 
 * These helpers auto-detect the current mode via ELECTRON_EMBEDDED env var
 * and only apply JSON parsing/stringifying when running in SQLite desktop mode.
 * 
 * In web/PostgreSQL mode, all functions are PASS-THROUGH (no transformation).
 */

/**
 * Check if we're running in Electron desktop mode (SQLite).
 */
export function isDesktopMode() {
  return process.env.ELECTRON_EMBEDDED === 'true';
}

// ─── READING FROM DB (hydrate) ───────────────────────

/**
 * Parse a JSON string field into a JS value. Returns fallback if parsing fails.
 * In PostgreSQL mode: passes through unchanged (already native).
 */
export function parseJsonField(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value; // Already native (PostgreSQL or already parsed)
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

/**
 * Parse the allowedServices field.
 * PostgreSQL: already a String[] array → pass through.
 * SQLite: stored as JSON string → parse.
 */
export function parseAllowedServices(value) {
  if (Array.isArray(value)) return value; // PostgreSQL native array
  const parsed = parseJsonField(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

// ─── WRITING TO DB (dehydrate) ────────────────────────

/**
 * Stringify a value for SQLite storage. In PostgreSQL mode, returns as-is.
 */
export function stringifyJsonField(value) {
  if (!isDesktopMode()) return value; // PostgreSQL: pass native objects/arrays
  if (typeof value === 'string') return value;
  return JSON.stringify(value ?? null);
}

/**
 * Prepare allowedServices for storage.
 * PostgreSQL: sends native array.
 * SQLite: sends JSON string.
 */
export function stringifyAllowedServices(services) {
  const arr = Array.isArray(services) ? services : [];
  if (!isDesktopMode()) return arr; // PostgreSQL: native array
  return JSON.stringify(arr); // SQLite: JSON string
}

/**
 * Prepare document data for Prisma create/update.
 * PostgreSQL: sends native object (Prisma handles Json type).
 * SQLite: sends JSON string.
 */
export function dehydrateDocumentData(data) {
  if (!isDesktopMode()) return data ?? {}; // PostgreSQL: native object
  if (typeof data === 'string') return data;
  return JSON.stringify(data ?? {});
}

// ─── MODEL HYDRATION (reading from DB → API response) ─

/**
 * Transform a User result — parse allowedServices from JSON string if in SQLite mode.
 */
export function hydrateUser(user) {
  if (!user) return user;
  return {
    ...user,
    allowedServices: parseAllowedServices(user.allowedServices),
  };
}

/**
 * Transform an array of users.
 */
export function hydrateUsers(users) {
  return users.map(hydrateUser);
}

/**
 * Transform a Document result — parse the data field if stored as JSON string.
 */
export function hydrateDocument(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    data: parseJsonField(doc.data, {}),
    createdBy: doc.createdBy ? hydrateUser(doc.createdBy) : doc.createdBy,
  };
}

/**
 * Transform an array of documents.
 */
export function hydrateDocuments(docs) {
  return docs.map(hydrateDocument);
}

/**
 * Transform a UserActivityLog — parse the metadata field.
 */
export function hydrateActivityLog(log) {
  if (!log) return log;
  return {
    ...log,
    metadata: parseJsonField(log.metadata, null),
  };
}

/**
 * Transform an array of activity logs.
 */
export function hydrateActivityLogs(logs) {
  return logs.map(hydrateActivityLog);
}

/**
 * Transform a Template result — parse the data field.
 */
export function hydrateTemplate(template) {
  if (!template) return template;
  return {
    ...template,
    data: parseJsonField(template.data, {}),
    createdBy: template.createdBy ? hydrateUser(template.createdBy) : template.createdBy,
  };
}

/**
 * Transform an array of templates.
 */
export function hydrateTemplates(templates) {
  return templates.map(hydrateTemplate);
}
