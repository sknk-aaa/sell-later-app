import { useMemo } from 'react';
import { useItemStore } from './useItemStore';
import { useSettingsStore } from './useSettingsStore';
import type { Item, SaleRecord } from '@/db/schema';
import { expectedProfit } from '@/utils/calculations';
import { colors, type StatusKind } from '@/theme/tokens';

export type ItemVM = Item & {
  imagePath: string | null;
  sale: SaleRecord | null;
  expectedProfit: number;
};

const CAT_COLORS = [
  colors.cat1,
  colors.cat2,
  colors.cat3,
  colors.cat4,
  colors.cat5,
  colors.cat6,
  colors.cat7,
];

export function useItemViewModels(): ItemVM[] {
  const items = useItemStore((s) => s.items);
  const images = useItemStore((s) => s.images);
  const sales = useItemStore((s) => s.sales);
  const feeRate = useSettingsStore((s) => s.feeRate);

  return useMemo(
    () =>
      items.map((it) => {
        const img = images
          .filter((i) => i.itemId === it.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)[0];
        const sale = sales.find((s) => s.itemId === it.id) ?? null;
        return {
          ...it,
          imagePath: img?.filePath ?? null,
          sale,
          expectedProfit: expectedProfit(it.expectedPrice, feeRate, it.shippingFee),
        };
      }),
    [items, images, sales, feeRate],
  );
}

export function useItemViewModel(id: string | undefined): ItemVM | undefined {
  const vms = useItemViewModels();
  return useMemo(() => vms.find((v) => v.id === id), [vms, id]);
}

export type HomeSummary = {
  expectedSalesTotal: number;
  expectedProfitTotal: number;
  listedCount: number;
  soldProfitTotal: number;
  totalCount: number;
  statusCounts: Record<StatusKind, number>;
  categoryBreakdown: { name: string; value: number; pct: number; color: string }[];
  recent: ItemVM[];
};

export function useHomeSummary(): HomeSummary {
  const vms = useItemViewModels();

  return useMemo(() => {
    const active = vms.filter((v) => v.status !== 'sold');
    const expectedSalesTotal = active.reduce((s, v) => s + v.expectedPrice, 0);
    const expectedProfitTotal = active.reduce((s, v) => s + v.expectedProfit, 0);
    const listedCount = vms.filter((v) => v.status === 'listed').length;
    const soldProfitTotal = vms.reduce((s, v) => s + (v.sale?.actualProfit ?? 0), 0);

    const statusCounts: Record<StatusKind, number> = {
      stored: 0,
      prep: 0,
      listed: 0,
      sold: 0,
      hold: 0,
    };
    for (const v of vms) statusCounts[v.status]++;

    const byCategory = new Map<string, number>();
    for (const v of active) byCategory.set(v.category, (byCategory.get(v.category) ?? 0) + v.expectedPrice);
    const categoryBreakdown = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        pct: expectedSalesTotal ? Math.round((value / expectedSalesTotal) * 1000) / 10 : 0,
        color: CAT_COLORS[i % CAT_COLORS.length],
      }));

    const recent = [...vms]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4);

    return {
      expectedSalesTotal,
      expectedProfitTotal,
      listedCount,
      soldProfitTotal,
      totalCount: vms.length,
      statusCounts,
      categoryBreakdown,
      recent,
    };
  }, [vms]);
}
