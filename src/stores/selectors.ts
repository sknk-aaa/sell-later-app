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

export type AnalyticsPeriod = 'month' | 'year' | 'all';

export type Analytics = {
  expectedSalesTotal: number;
  expectedProfitTotal: number;
  soldProfitTotal: number;
  soldCount: number;
  thisMonthProfit: number;
  thisMonthCount: number;
  categoryExpected: { name: string; value: number; pct: number; color: string }[];
  statusCounts: Record<StatusKind, number>;
  statusTotal: number;
  monthlyProfit: { label: string; value: number }[];
  categorySold: { name: string; value: number; pct: number; color: string }[];
  table: { label: string; count: number; salesSum: number; shipSum: number; profitSum: number }[];
};

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

export function useAnalytics(period: AnalyticsPeriod): Analytics {
  const vms = useItemViewModels();

  return useMemo(() => {
    const now = new Date();
    const active = vms.filter((v) => v.status !== 'sold');
    const expectedSalesTotal = active.reduce((s, v) => s + v.expectedPrice, 0);
    const expectedProfitTotal = active.reduce((s, v) => s + v.expectedProfit, 0);

    const sold = vms.filter((v) => v.sale != null);
    const inPeriod = (d: Date) => {
      if (period === 'all') return true;
      if (period === 'year') return d.getFullYear() === now.getFullYear();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };
    const periodSold = sold.filter((v) => inPeriod(v.sale!.soldAt));
    const soldProfitTotal = periodSold.reduce((s, v) => s + v.sale!.actualProfit, 0);
    const soldCount = periodSold.length;

    const thisMonthSold = sold.filter(
      (v) => v.sale!.soldAt.getFullYear() === now.getFullYear() && v.sale!.soldAt.getMonth() === now.getMonth(),
    );
    const thisMonthProfit = thisMonthSold.reduce((s, v) => s + v.sale!.actualProfit, 0);
    const thisMonthCount = thisMonthSold.length;

    // カテゴリ別 想定売上
    const byCatExpected = new Map<string, number>();
    for (const v of active) byCatExpected.set(v.category, (byCatExpected.get(v.category) ?? 0) + v.expectedPrice);
    const categoryExpected = [...byCatExpected.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        pct: expectedSalesTotal ? Math.round((value / expectedSalesTotal) * 1000) / 10 : 0,
        color: CAT_COLORS[i % CAT_COLORS.length],
      }));

    // ステータス別件数
    const statusCounts: Record<StatusKind, number> = { stored: 0, prep: 0, listed: 0, sold: 0, hold: 0 };
    for (const v of vms) statusCounts[v.status]++;

    // 月別 売却済み利益（直近12ヶ月トレンド・期間非依存）
    const monthSum = new Map<string, number>();
    for (const v of sold) monthSum.set(monthKey(v.sale!.soldAt), (monthSum.get(monthKey(v.sale!.soldAt)) ?? 0) + v.sale!.actualProfit);
    const monthlyProfit = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { label: `${d.getMonth() + 1}月`, value: monthSum.get(monthKey(d)) ?? 0 };
    });

    // カテゴリ別 売却済み利益（期間適用）
    const byCatSold = new Map<string, number>();
    for (const v of periodSold) byCatSold.set(v.category, (byCatSold.get(v.category) ?? 0) + v.sale!.actualProfit);
    const categorySold = [...byCatSold.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        pct: soldProfitTotal ? Math.round((value / soldProfitTotal) * 1000) / 10 : 0,
        color: CAT_COLORS[i % CAT_COLORS.length],
      }));

    // 月別 売却実績テーブル（期間適用・降順）
    const tableMap = new Map<string, { d: Date; count: number; salesSum: number; shipSum: number; profitSum: number }>();
    for (const v of periodSold) {
      const s = v.sale!;
      const k = monthKey(s.soldAt);
      const e = tableMap.get(k) ?? { d: s.soldAt, count: 0, salesSum: 0, shipSum: 0, profitSum: 0 };
      e.count++;
      e.salesSum += s.actualPrice;
      e.shipSum += s.actualShippingFee;
      e.profitSum += s.actualProfit;
      tableMap.set(k, e);
    }
    const table = [...tableMap.values()]
      .sort((a, b) => b.d.getTime() - a.d.getTime())
      .map((e) => ({
        label: `${e.d.getFullYear()}年${e.d.getMonth() + 1}月`,
        count: e.count,
        salesSum: e.salesSum,
        shipSum: e.shipSum,
        profitSum: e.profitSum,
      }));

    return {
      expectedSalesTotal,
      expectedProfitTotal,
      soldProfitTotal,
      soldCount,
      thisMonthProfit,
      thisMonthCount,
      categoryExpected,
      statusCounts,
      statusTotal: vms.length,
      monthlyProfit,
      categorySold,
      table,
    };
  }, [vms, period]);
}
