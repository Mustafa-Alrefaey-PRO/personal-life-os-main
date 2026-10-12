import { create } from 'zustand';

const STORAGE_KEY = 'ramadan-enabled';

/** True when today falls in Ramadan (month 9) of the Umm al-Qura Islamic calendar. */
function isRamadanToday(): boolean {
  try {
    const month = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(new Date());
    return parseInt(month, 10) === 9;
  } catch {
    return false; // Calendar not supported by this browser
  }
}

function defaultEnabled(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  // Auto-enable during Ramadan if the user has never set a preference
  return isRamadanToday();
}

interface RamadanState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

// Eagerly apply attribute before React mounts (avoids flash-of-wrong-theme)
const initial = defaultEnabled();
document.documentElement.setAttribute('data-ramadan', initial ? 'true' : 'false');

export const useRamadanStore = create<RamadanState>((set) => ({
  enabled: initial,
  setEnabled: (v) => {
    localStorage.setItem(STORAGE_KEY, String(v));
    document.documentElement.setAttribute('data-ramadan', v ? 'true' : 'false');
    set({ enabled: v });
  },
}));
