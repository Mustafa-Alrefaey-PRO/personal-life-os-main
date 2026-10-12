import { create } from 'zustand';

const STORAGE_KEY = 'theme';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

function readInitialTheme(): boolean {
  // Saved preference first, then the OS setting
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(isDarkMode: boolean) {
  document.documentElement.classList.toggle('dark', isDarkMode);
}

// Eagerly apply before React mounts (avoids flash-of-wrong-theme)
const initial = readInitialTheme();
applyTheme(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: initial,

  toggleTheme: () => {
    const next = !get().isDarkMode;
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    applyTheme(next);
    set({ isDarkMode: next });
  },
}));
