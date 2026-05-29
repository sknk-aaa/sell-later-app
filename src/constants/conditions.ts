import type { ItemCondition } from '@/db/schema';

// condition のキー＋日本語ラベル
export const CONDITIONS: { key: ItemCondition; label: string }[] = [
  { key: 'new', label: '新品、未使用' },
  { key: 'good', label: '目立った傷や汚れなし' },
  { key: 'normal', label: 'やや傷や汚れあり' },
  { key: 'damaged', label: '傷や汚れあり' },
];

export const CONDITION_LABEL: Record<ItemCondition, string> = Object.fromEntries(
  CONDITIONS.map((c) => [c.key, c.label]),
) as Record<ItemCondition, string>;
