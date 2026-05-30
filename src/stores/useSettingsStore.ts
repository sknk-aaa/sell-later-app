import { create } from 'zustand';
import { ensureSettings, updateSettings } from '@/db/queries';
import { DEFAULT_FEE_RATE } from '@/utils/calculations';
import type { Setting } from '@/db/schema';

type SettingsState = {
  isPro: boolean;
  theme: Setting['theme'];
  language: Setting['language'];
  feeRate: number;
  loaded: boolean;
  load: () => void;
  setFeeRate: (rate: number) => void;
  setTheme: (theme: Setting['theme']) => void;
  setLanguage: (language: Setting['language']) => void;
  setPro: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  isPro: false,
  theme: 'system',
  language: 'system',
  feeRate: DEFAULT_FEE_RATE,
  loaded: false,
  load: () => {
    const s = ensureSettings();
    set({ isPro: s.isPro, theme: s.theme, language: s.language, feeRate: s.feeRate, loaded: true });
  },
  setFeeRate: (rate) => {
    updateSettings({ feeRate: rate });
    set({ feeRate: rate });
  },
  setTheme: (theme) => {
    updateSettings({ theme });
    set({ theme });
  },
  setLanguage: (language) => {
    updateSettings({ language });
    set({ language });
  },
  setPro: (value) => {
    updateSettings({ isPro: value });
    set({ isPro: value });
  },
}));
