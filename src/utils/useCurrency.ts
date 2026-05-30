import React from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { deviceLocale } from '@/i18n';
import { formatMoney, sanitizeMoneyInput, parseMoney, minorToInput, symbolOf, type CurrencyCode } from './money';

// 'auto' を端末ロケールで解決（日本語=JPY、他=USD）
function resolveCurrency(setting: string): CurrencyCode {
  if (setting === 'auto') return deviceLocale() === 'ja' ? 'JPY' : 'USD';
  return setting as CurrencyCode;
}

// 通貨設定を購読し、表示/入力ヘルパを返す。設定変更で再レンダリングされる。
export function useCurrency() {
  const setting = useSettingsStore((s) => s.currency);
  const currency = resolveCurrency(setting);
  return React.useMemo(
    () => ({
      currency,
      fmt: (minor: number) => formatMoney(minor, currency),
      symbol: symbolOf(currency),
      sanitize: (text: string) => sanitizeMoneyInput(text, currency),
      parse: (text: string) => parseMoney(text, currency),
      toInput: (minor: number) => minorToInput(minor, currency),
    }),
    [currency],
  );
}
