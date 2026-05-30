// 販売プラットフォームの手数料プリセット。
// rateBps = basis points（1325 = 13.25%）、fixedCents = 固定費（マイナー単位、USD基準の目安）。
// 値は「編集可能な初期値」。地域差・改定があるため目安として扱う。

export type PlatformId =
  | 'ebay'
  | 'poshmark'
  | 'mercari'
  | 'vinted'
  | 'depop'
  | 'facebook'
  | 'custom';

export type PlatformPreset = {
  id: PlatformId;
  labelKey: string; // i18n: platform.<id>
  rateBps: number;
  fixedCents: number;
  noteKey?: string; // i18n: platform.<id>Note
};

export const PLATFORMS: PlatformPreset[] = [
  { id: 'ebay', labelKey: 'platform.ebay', rateBps: 1325, fixedCents: 40, noteKey: 'platform.ebayNote' },
  { id: 'poshmark', labelKey: 'platform.poshmark', rateBps: 2000, fixedCents: 0, noteKey: 'platform.poshmarkNote' },
  { id: 'mercari', labelKey: 'platform.mercari', rateBps: 1000, fixedCents: 0, noteKey: 'platform.mercariNote' },
  { id: 'vinted', labelKey: 'platform.vinted', rateBps: 0, fixedCents: 0, noteKey: 'platform.vintedNote' },
  { id: 'depop', labelKey: 'platform.depop', rateBps: 1000, fixedCents: 0, noteKey: 'platform.depopNote' },
  { id: 'facebook', labelKey: 'platform.facebook', rateBps: 500, fixedCents: 0 },
  { id: 'custom', labelKey: 'platform.custom', rateBps: 1000, fixedCents: 0 },
];

export const PLATFORM_BY_ID: Record<PlatformId, PlatformPreset> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p]),
) as Record<PlatformId, PlatformPreset>;

export const DEFAULT_PLATFORM_ID: PlatformId = 'ebay';

// bps → 表示用パーセント文字列（例 1325 → "13.25", 1000 → "10"）
export function bpsToPercentLabel(bps: number): string {
  const pct = bps / 100;
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(2).replace(/\.?0+$/, '');
}
