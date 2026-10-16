import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';
export type AccentName = 'indigo' | 'cyan' | 'violet' | 'rose' | 'amber' | 'emerald';
export type TextScale = 'sm' | 'md' | 'lg';

interface UiState {
  theme: ThemeMode;
  accent: AccentName;
  textScale: TextScale;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentName) => void;
  setTextScale: (textScale: TextScale) => void;
}

const STORAGE_KEY = 'dataflow-ui-preferences';
const defaults = { theme: 'dark' as ThemeMode, accent: 'indigo' as AccentName, textScale: 'md' as TextScale };

function readPreferences(): Pick<UiState, 'theme' | 'accent' | 'textScale'> {
  if (typeof localStorage === 'undefined') return defaults;
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<typeof defaults>;
    return {
      theme: value.theme === 'light' ? 'light' : defaults.theme,
      accent: ['indigo', 'cyan', 'violet', 'rose', 'amber', 'emerald'].includes(value.accent || '') ? value.accent as AccentName : defaults.accent,
      textScale: ['sm', 'md', 'lg'].includes(value.textScale || '') ? value.textScale as TextScale : defaults.textScale,
    };
  } catch {
    return defaults;
  }
}

function persist(state: Pick<UiState, 'theme' | 'accent' | 'textScale'>) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useUiStore = create<UiState>((set, get) => ({
  ...readPreferences(),
  setTheme: (theme) => { set({ theme }); persist({ ...get(), theme }); },
  setAccent: (accent) => { set({ accent }); persist({ ...get(), accent }); },
  setTextScale: (textScale) => { set({ textScale }); persist({ ...get(), textScale }); },
}));
