import api from './api';
import {
  getSavedBillingProfiles,
  getSavedParties,
  getSavedItemPresets,
  saveBillingProfile,
  saveParty,
  saveItemPreset,
} from './billingProfileService';

/**
 * Export all server-side data (documents, contacts, templates) as JSON backup.
 */
export async function exportServerData() {
  const res = await api.get('/migration/export');
  return res.data || res;
}

/**
 * Import server-side data from a JSON backup payload.
 */
export async function importServerData(payload) {
  const res = await api.post('/migration/import', payload);
  return res.data || res;
}

/**
 * Direct cloud-to-desktop migration.
 */
export async function cloudImportData({ cloudUrl, email, username, password, licenseKey }) {
  const res = await api.post('/migration/cloud-import', {
    cloudUrl,
    email,
    username,
    password,
    licenseKey,
  });
  return res.data || res;
}

// ─── Client-Side localStorage Data ──────────────────────────

/**
 * Collect all client-side localStorage data for full backup.
 */
export function collectClientData() {
  return {
    billingProfiles: getSavedBillingProfiles(),
    parties: getSavedParties(),
    itemPresets: getSavedItemPresets(),
    financialYears: getFinancialYearsFromStorage(),
  };
}

/**
 * Restore client-side localStorage data from a backup.
 */
export function restoreClientData(clientData) {
  if (!clientData || typeof clientData !== 'object') return { restored: 0 };

  let restored = 0;

  // Restore billing profiles
  if (Array.isArray(clientData.billingProfiles)) {
    const existingProfiles = getSavedBillingProfiles();
    const existingIds = new Set(existingProfiles.map((p) => p.id));
    for (const profile of clientData.billingProfiles) {
      if (!existingIds.has(profile.id)) {
        saveBillingProfile(profile);
        restored++;
      }
    }
  }

  // Restore parties
  if (Array.isArray(clientData.parties)) {
    const existingParties = getSavedParties();
    const existingNames = new Set(existingParties.map((p) => (p.name || '').trim().toUpperCase()));
    for (const party of clientData.parties) {
      const key = (party.name || '').trim().toUpperCase();
      if (key && !existingNames.has(key)) {
        saveParty(party);
        restored++;
      }
    }
  }

  // Restore item presets
  if (Array.isArray(clientData.itemPresets)) {
    const existingPresets = getSavedItemPresets();
    const existingIds = new Set(existingPresets.map((p) => p.id));
    for (const preset of clientData.itemPresets) {
      if (!existingIds.has(preset.id)) {
        saveItemPreset(preset);
        restored++;
      }
    }
  }

  // Restore financial years
  if (Array.isArray(clientData.financialYears) && clientData.financialYears.length > 0) {
    setFinancialYearsToStorage(clientData.financialYears);
    restored++;
  }

  return { restored };
}

// ─── Financial Year localStorage helpers ────────────────────

function getFinancialYearsFromStorage() {
  try {
    const raw = localStorage.getItem('cargohub_financial_years');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFinancialYearsToStorage(years) {
  try {
    const existing = getFinancialYearsFromStorage();
    if (existing.length === 0) {
      localStorage.setItem('cargohub_financial_years', JSON.stringify(years));
    }
    // If user already has FY data, don't overwrite
  } catch {}
}

// ─── Full Backup Export (download as .json file) ────────────

/**
 * Generate and download a complete backup file.
 */
export async function downloadFullBackup() {
  const serverData = await exportServerData();
  const clientData = collectClientData();

  const backup = {
    _cargomsBackup: true,
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    server: serverData,
    client: clientData,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `CargoMS_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Read a backup file and import all data.
 * Returns combined stats.
 */
export async function importFromBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        if (!backup._cargomsBackup && !backup.documents && !backup.schemaVersion) {
          throw new Error('This does not appear to be a valid CargoMS backup file.');
        }

        // Server-side data (documents, contacts, templates)
        const serverPayload = backup.server || backup;
        const serverStats = await importServerData(serverPayload);

        // Client-side data (billing profiles, parties, item presets, FY)
        let clientStats = { restored: 0 };
        if (backup.client) {
          clientStats = restoreClientData(backup.client);
        }

        resolve({
          ...serverStats,
          clientItemsRestored: clientStats.restored,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}
