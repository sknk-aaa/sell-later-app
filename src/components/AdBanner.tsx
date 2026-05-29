import React from 'react';
import { isExpoGo } from '@/utils/env';
import { useSettingsStore } from '@/stores/useSettingsStore';

// 無料版のみ・実機ビルドのみ表示。Expo Goではネイティブを読み込まない（lazy require）。
export function AdBanner() {
  const isPro = useSettingsStore((s) => s.isPro);
  if (isExpoGo || isPro) return null;
  const { AdBannerNative } = require('@/ads/AdBannerNative') as typeof import('@/ads/AdBannerNative');
  return <AdBannerNative />;
}
