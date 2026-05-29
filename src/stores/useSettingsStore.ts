import { create } from 'zustand';
import { ensureSettings, updateSettings } from '@/db/queries';
import { DEFAULT_FEE_RATE } from '@/utils/calculations';
import type { Setting } from '@/db/schema';

type SettingsState = {
  isPro: boolean;
  theme: Setting['theme'];
  feeRate: number;
  loaded: boolean;
  load: () => void;
  setFeeRate: (rate: number) => void;
  setTheme: (theme: Setting['theme']) => void;
  setPro: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  isPro: false,
  theme: 'system',
  feeRate: DEFAULT_FEE_RATE,
  loaded: false,
  load: () => {
    const s = ensureSettings();
    set({ isPro: s.isPro, theme: s.theme, feeRate: s.feeRate, loaded: true });
  },
  setFeeRate: (rate) => {
    updateSettings({ feeRate: rate });
    set({ feeRate: rate });
  },
  setTheme: (theme) => {
    updateSettings({ theme });
    set({ theme });
  },
  setPro: (value) => {
    updateSettings({ isPro: value });
    set({ isPro: value });
  },
}));
