import { create } from 'zustand';

const STORAGE_KEY = 'theme';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  /** What the user chose; "system" follows the device setting live. */
  preference: ThemePreference;
  /** The theme actually shown. */
  isDarkMode: boolean;
  setPreference: (preference: ThemePreference) => void;
}

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function readPreference(): ThemePreference {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'light' || saved === 'dark' ? saved : 'system';
}

function resolve(preference: ThemePreference): boolean {
  return preference === 'system' ? systemDark.matches : preference === 'dark';
}

function applyTheme(isDarkMode: boolean) {
  document.documentElement.classList.toggle('dark', isDarkMode);
}

// Eagerly apply before React mounts (avoids flash-of-wrong-theme)
const initialPreference = readPreference();
applyTheme(resolve(initialPreference));

export const useThemeStore = create<ThemeState>((set) => ({
  preference: initialPreference,
  isDarkMode: resolve(initialPreference),

  setPreference: (preference) => {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
    const isDarkMode = resolve(preference);
    applyTheme(isDarkMode);
    set({ preference, isDarkMode });
  },
}));

// "System" follows the device when it switches (e.g. automatic dark mode at sunset)
systemDark.addEventListener('change', () => {
  if (useThemeStore.getState().preference !== 'system') return;
  applyTheme(systemDark.matches);
  useThemeStore.setState({ isDarkMode: systemDark.matches });
});
