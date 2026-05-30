// デフォルトカテゴリは安定キーでDB保存し、表示時に i18n(category.<key>) で翻訳する。
// ユーザー追加カテゴリはキーを持たないため、入力された名前をそのまま表示する。
export const CATEGORY_KEYS = [
  'fashion',
  'electronics',
  'mobile',
  'books',
  'games',
  'toys',
  'hobby',
  'baby',
  'interior',
  'sports',
  'other',
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const DEFAULT_CATEGORY: CategoryKey = 'other';

const KEY_SET = new Set<string>(CATEGORY_KEYS);

// デフォルトキーなら翻訳、そうでなければ（ユーザー追加分）そのまま返す
export function categoryLabel(name: string, t: (k: string) => string): string {
  return KEY_SET.has(name) ? t(`category.${name}`) : name;
}

// 旧・日本語seed名 → 新キー（マイグレーション参照用・コード内では未使用）
export const LEGACY_JA_TO_KEY: Record<string, CategoryKey> = {
  'ファッション': 'fashion',
  '家電': 'electronics',
  'スマホ・タブレット': 'mobile',
  '本・漫画': 'books',
  'ゲーム': 'games',
  'おもちゃ': 'toys',
  'ホビー': 'hobby',
  'ベビー・キッズ': 'baby',
  'インテリア': 'interior',
  'スポーツ': 'sports',
  'その他': 'other',
};
