import { create } from 'zustand';
import { useAuthStore } from './authStore';

function getUserScopedKey(baseKey) {
  try {
    const user = useAuthStore.getState().user;
    const userKey = user?.id || user?.username || 'shared';
    return `${baseKey}_${userKey}`;
  } catch {
    return `${baseKey}_default`;
  }
}

const FY_LIST_STORAGE_KEY_BASE = 'cargohub_financial_years_list';
const ACTIVE_FY_STORAGE_KEY_BASE = 'cargohub_active_financial_year';

export const DEFAULT_FINANCIAL_YEARS = [
  {
    code: '2026-27',
    label: 'FY 2026-27',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    prefix: 'DGR/',
    startSequence: 1,
    paddingDigits: 3,
    suffix: '',
    isDefault: true,
    isLocked: false,
    description: 'Current Indian Financial Year (01-Apr-2026 to 31-Mar-2027)',
  },
  {
    code: '2025-26',
    label: 'FY 2025-26',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    prefix: 'DGR/',
    startSequence: 1,
    paddingDigits: 3,
    suffix: '',
    isDefault: false,
    isLocked: false,
    description: 'Previous Indian Financial Year (01-Apr-2025 to 31-Mar-2026)',
  },
  {
    code: '2027-28',
    label: 'FY 2027-28',
    startDate: '2027-04-01',
    endDate: '2028-03-31',
    prefix: 'DGR/',
    startSequence: 1,
    paddingDigits: 3,
    suffix: '',
    isDefault: false,
    isLocked: false,
    description: 'Upcoming Indian Financial Year (01-Apr-2027 to 31-Mar-2028)',
  },
];

function loadSavedFYList() {
  const key = getUserScopedKey(FY_LIST_STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_FINANCIAL_YEARS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FINANCIAL_YEARS;
  } catch {
    return DEFAULT_FINANCIAL_YEARS;
  }
}

function loadSavedActiveFY() {
  const key = getUserScopedKey(ACTIVE_FY_STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return raw;
  } catch {
    // fallback
  }

  // Auto detect current FY
  const now = new Date();
  const currentMonth = now.getMonth();
  const fullYear = now.getFullYear();
  const startYear = currentMonth >= 3 ? fullYear : fullYear - 1;
  const endYearShort = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYearShort}`;
}

export const useFinancialYearStore = create((set, get) => ({
  activeFY: loadSavedActiveFY(),
  financialYears: loadSavedFYList(),

  setActiveFY: (fyCode) => {
    const key = getUserScopedKey(ACTIVE_FY_STORAGE_KEY_BASE);
    localStorage.setItem(key, fyCode);
    set({ activeFY: fyCode });
  },

  getActiveFYProfile: () => {
    const { activeFY, financialYears } = get();
    return financialYears.find((f) => f.code === activeFY) || financialYears[0] || DEFAULT_FINANCIAL_YEARS[0];
  },

  addFinancialYear: (fyData) => {
    const key = getUserScopedKey(FY_LIST_STORAGE_KEY_BASE);
    const { financialYears } = get();
    const cleanCode = fyData.code.trim();

    const existingIndex = financialYears.findIndex((f) => f.code === cleanCode);
    let updated;
    if (existingIndex >= 0) {
      updated = financialYears.map((f, idx) => (idx === existingIndex ? { ...f, ...fyData } : f));
    } else {
      updated = [
        ...financialYears,
        {
          code: cleanCode,
          label: fyData.label || `FY ${cleanCode}`,
          startDate: fyData.startDate || `${cleanCode.split('-')[0]}-04-01`,
          endDate: fyData.endDate || `20${cleanCode.split('-')[1] || '27'}-03-31`,
          prefix: fyData.prefix || 'DGR/',
          startSequence: parseInt(fyData.startSequence, 10) || 1,
          paddingDigits: parseInt(fyData.paddingDigits, 10) || 3,
          suffix: fyData.suffix || '',
          isDefault: false,
          isLocked: Boolean(fyData.isLocked),
          description: fyData.description || `Indian Financial Year ${cleanCode}`,
        },
      ];
    }

    localStorage.setItem(key, JSON.stringify(updated));
    set({ financialYears: updated });
    return cleanCode;
  },

  updateFinancialYear: (fyCode, updatedData) => {
    const key = getUserScopedKey(FY_LIST_STORAGE_KEY_BASE);
    const { financialYears } = get();
    const updated = financialYears.map((f) => (f.code === fyCode ? { ...f, ...updatedData } : f));
    localStorage.setItem(key, JSON.stringify(updated));
    set({ financialYears: updated });
  },

  deleteFinancialYear: (fyCode) => {
    const key = getUserScopedKey(FY_LIST_STORAGE_KEY_BASE);
    const { financialYears, activeFY } = get();
    if (financialYears.length <= 1) {
      throw new Error('At least one Financial Year must remain configured in the system.');
    }
    const filtered = financialYears.filter((f) => f.code !== fyCode);
    localStorage.setItem(key, JSON.stringify(filtered));

    let nextActive = activeFY;
    if (activeFY === fyCode) {
      nextActive = filtered[0].code;
      const activeKey = getUserScopedKey(ACTIVE_FY_STORAGE_KEY_BASE);
      localStorage.setItem(activeKey, nextActive);
    }

    set({ financialYears: filtered, activeFY: nextActive });
  },

  resetFinancialYearsToDefault: () => {
    const key = getUserScopedKey(FY_LIST_STORAGE_KEY_BASE);
    const activeKey = getUserScopedKey(ACTIVE_FY_STORAGE_KEY_BASE);
    localStorage.setItem(key, JSON.stringify(DEFAULT_FINANCIAL_YEARS));
    localStorage.setItem(activeKey, '2026-27');
    set({ financialYears: DEFAULT_FINANCIAL_YEARS, activeFY: '2026-27' });
  },
}));

/**
 * Filter documents by the currently selected Financial Year
 */
export function filterDocumentsByFY(documents = [], activeFY) {
  if (!activeFY || activeFY === 'ALL') return documents;

  return documents.filter((doc) => {
    const d = doc.data || {};
    const invNo = doc.documentNumber || d.invoiceNumber || '';
    const dateStr = d.invoiceDate || d.billDate || doc.createdAt;

    // 1. Direct match in invoice number e.g. DGR/001/2026-27 or 26-27
    const shortFY = activeFY.split('-')[0].slice(-2) + '-' + activeFY.split('-')[1];
    if (invNo.includes(activeFY) || (shortFY.length >= 5 && invNo.includes(shortFY))) {
      return true;
    }

    // 2. Match by Date against FY range (01-Apr to 31-Mar)
    if (dateStr) {
      try {
        let dateObj;
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // DD/MM/YYYY
            dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        } else {
          dateObj = new Date(dateStr);
        }

        if (dateObj && !isNaN(dateObj.getTime())) {
          const startYear = parseInt(activeFY.split('-')[0], 10);
          const startDate = new Date(startYear, 3, 1); // 1st April of startYear
          const endDate = new Date(startYear + 1, 2, 31, 23, 59, 59); // 31st March of next year
          if (dateObj >= startDate && dateObj <= endDate) {
            return true;
          }
        }
      } catch {
        // ignore parse error
      }
    }

    return false;
  });
}
