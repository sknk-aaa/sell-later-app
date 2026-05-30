import { create } from 'zustand';
import { ensureSettings, updateSettings } from '@/db/queries';
import { DEFAULT_FEE_RATE } from '@/utils/calculations';
import type { Setting } from '@/db/schema';
import type { PlatformId } from '@/constants/platforms';

type SettingsState = {
  isPro: boolean;
  theme: Setting['theme'];
  language: Setting['language'];
  currency: Setting['currency'];
  feeRate: number;
  defaultPlatform: PlatformId;
  onboardingDone: boolean;
  loaded: boolean;
  load: () => void;
  setFeeRate: (rate: number) => void;
  setTheme: (theme: Setting['theme']) => void;
  setLanguage: (language: Setting['language']) => void;
  setCurrency: (currency: Setting['currency']) => void;
  setDefaultPlatform: (platform: PlatformId) => void;
  setPro: (value: boolean) => void;
  completeOnboarding: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  isPro: false,
  theme: 'system',
  language: 'system',
  currency: 'auto',
  feeRate: DEFAULT_FEE_RATE,
  defaultPlatform: 'ebay',
  onboardingDone: false,
  loaded: false,
  load: () => {
    const s = ensureSettings();
    set({ isPro: s.isPro, theme: s.theme, language: s.language, currency: s.currency, feeRate: s.feeRate, defaultPlatform: s.defaultPlatform as PlatformId, onboardingDone: s.onboardingDone, loaded: true });
  },
  setFeeRate: (rate) => {
    updateSettings({ feeRate: rate });
    set({ feeRate: rate });
  },
  setDefaultPlatform: (platform) => {
    updateSettings({ defaultPlatform: platform });
    set({ defaultPlatform: platform });
  },
  setTheme: (theme) => {
    updateSettings({ theme });
    set({ theme });
  },
  setLanguage: (language) => {
    updateSettings({ language });
    set({ language });
  },
  setCurrency: (currency) => {
    updateSettings({ currency });
    set({ currency });
  },
  setPro: (value) => {
    updateSettings({ isPro: value });
    set({ isPro: value });
  },
  completeOnboarding: () => {
    updateSettings({ onboardingDone: true });
    set({ onboardingDone: true });
  },
}));
