import React from 'react';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { en } from './en';
import { ja } from './ja';

export type Language = 'system' | 'en' | 'ja';
export type AppLocale = 'en' | 'ja';

export const i18n = new I18n({ en, ja });
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function deviceLocale(): AppLocale {
  const code = Localization.getLocales()[0]?.languageCode;
  return code === 'ja' ? 'ja' : 'en';
}

export function resolveLocale(lang: Language): AppLocale {
  return lang === 'system' ? deviceLocale() : lang;
}

/** 言語設定の変更で再レンダリングされる翻訳フック */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const locale = resolveLocale(language);
  i18n.locale = locale;
  const t = React.useCallback(
    (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts),
    [locale],
  );
  return { t, locale, language };
}
