import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { SectionHead, Card } from '@/components/ui';
import { Donut } from '@/components/charts/Donut';
import { LineChart } from '@/components/charts/LineChart';
import { LargeTitleHeader } from '@/components/headers';
import { AdBanner } from '@/components/AdBanner';
import { useAnalytics, type AnalyticsPeriod, type Analytics } from '@/stores/selectors';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors, numFont, shadowCard } from '@/theme/tokens';
import { yen } from '@/utils/format';

const PERIODS: { key: AnalyticsPeriod; label: string }[] = [
  { key: 'month', label: '今月' },
  { key: 'year', label: '今年' },
  { key: 'all', label: '全期間' },
];

export default function AnalyticsScreen() {
  const router = useRouter();
  const isPro = useSettingsStore((s) => s.isPro);
  const [period, setPeriod] = React.useState<AnalyticsPeriod>('month');
  const a = useAnalytics(period);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader title="分析" />

        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <PeriodTab key={p.key} label={p.label} active={period === p.key} onPress={() => setPeriod(p.key)} />
          ))}
        </View>

        {/* サマリー2枚（無料でも表示） */}
        <View style={styles.kpiRow}>
          <KpiCard label="売却済み利益" value={yen(a.soldProfitTotal)} accent={colors.profit} />
          <KpiCard label="売却数" value={`${a.soldCount}件`} accent={colors.primary} />
        </View>

        {/* カテゴリ別 想定売上（無料でも表示＝味見） */}
        <SectionCategoryExpected a={a} />

        {isPro ? (
          <>
            <SectionMonthly a={a} />
            <SectionCategorySold a={a} />
            <SectionTable a={a} />
          </>
        ) : (
          <View style={styles.lockedPreview}>
            {/* 残りの分析を薄く見せる（モザイク風） */}
            <View style={styles.lockedFade} pointerEvents="none">
              <SectionMonthly a={a} />
              <SectionCategorySold a={a} />
              <SectionTable a={a} />
            </View>
            <View style={styles.lockedOverlay} pointerEvents="box-none">
              <View style={styles.lockedScrim} pointerEvents="none" />
              <View style={styles.lockedCard}>
                <View style={styles.lockedIcon}><Icon name="lock" size={24} color={colors.primary} /></View>
                <Text style={styles.lockedTitle}>Proで全ての分析を見る</Text>
                <Text style={styles.lockedDesc}>月別の利益推移・カテゴリ別の売却利益・{'\n'}月別の売却実績がすべて見られます。</Text>
                <Text style={styles.lockedCta} onPress={() => router.push('/paywall')}>Proにアップグレード</Text>
              </View>
            </View>
          </View>
        )}

        <AdBanner />
      </ScrollView>
    </View>
  );
}

function SectionCategoryExpected({ a }: { a: Analytics }) {
  return (
    <>
      <SectionHead title="カテゴリ別 想定売上" />
      <Card>
        {a.categoryExpected.length === 0 ? (
          <Empty />
        ) : (
          <View style={styles.donutRow}>
            <Donut data={a.categoryExpected} size={140} thickness={24} centerLabel="合計" centerValue={yen(a.expectedSalesTotal)} />
            <View style={styles.legend}>
              {a.categoryExpected.map((c) => (
                <LegendRow key={c.name} c={c} />
              ))}
            </View>
          </View>
        )}
      </Card>
    </>
  );
}

function SectionMonthly({ a }: { a: Analytics }) {
  return (
    <>
      <SectionHead title="月別 売却利益の推移" />
      <Card>
        <LineChart data={a.monthlyProfit} />
      </Card>
    </>
  );
}

function SectionCategorySold({ a }: { a: Analytics }) {
  return (
    <>
      <SectionHead title="カテゴリ別 売却利益" />
      <Card>
        {a.categorySold.length === 0 ? (
          <Empty />
        ) : (
          <View style={styles.legend}>
            {a.categorySold.map((c) => (
              <LegendRow key={c.name} c={c} />
            ))}
          </View>
        )}
      </Card>
    </>
  );
}

function SectionTable({ a }: { a: Analytics }) {
  return (
    <>
      <SectionHead title="月別 売却実績" />
      <Card>
        {a.table.length === 0 ? (
          <Empty />
        ) : (
          <View>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1.4 }]}>月</Text>
              <Text style={styles.th}>件数</Text>
              <Text style={styles.th}>売上</Text>
              <Text style={styles.th}>利益</Text>
            </View>
            {a.table.map((r) => (
              <View key={r.label} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1.4 }]}>{r.label}</Text>
                <Text style={styles.td}>{r.count}</Text>
                <Text style={styles.td}>{yen(r.salesSum)}</Text>
                <Text style={[styles.td, { color: colors.profit }]}>{yen(r.profitSum)}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </>
  );
}

function PeriodTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Text onPress={onPress} style={[styles.periodTab, active && styles.periodTabActive]}>
      {label}
    </Text>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function LegendRow({ c }: { c: { name: string; value: number; pct: number; color: string } }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: c.color }]} />
      <Text style={styles.legendName} numberOfLines={1}>{c.name}</Text>
      <Text style={styles.legendValue}>{yen(c.value)}</Text>
      <Text style={styles.legendPct}>{c.pct}%</Text>
    </View>
  );
}

function Empty() {
  return <Text style={styles.empty}>データがありません</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  lockedPreview: { position: 'relative' },
  lockedFade: { opacity: 0.28 },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  lockedScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(247,248,250,0.55)' },
  lockedCard: { backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 26, paddingHorizontal: 24, alignItems: 'center', ...shadowCard },
  lockedIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  lockedTitle: { fontSize: 16, fontWeight: '700', color: colors.ink1, marginBottom: 8 },
  lockedDesc: { fontSize: 13, color: colors.ink3, textAlign: 'center', lineHeight: 20, marginBottom: 18 },
  lockedCta: { fontSize: 14, fontWeight: '700', color: '#fff', backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, overflow: 'hidden' },

  periodRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  periodTab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 99, fontSize: 13, color: colors.ink3, backgroundColor: colors.surface, overflow: 'hidden' },
  periodTabActive: { backgroundColor: colors.primary, color: '#fff', fontWeight: '600' },

  kpiRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  kpiCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  kpiLabel: { fontSize: 12, color: colors.ink3, marginBottom: 6 },
  kpiValue: { fontSize: 20, fontWeight: '700', ...numFont },

  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 99 },
  legendName: { flex: 1, fontSize: 13, color: colors.ink1 },
  legendValue: { fontSize: 13, fontWeight: '600', color: colors.ink1, ...numFont },
  legendPct: { width: 40, fontSize: 12, color: colors.ink3, textAlign: 'right' },

  empty: { fontSize: 13, color: colors.ink3, textAlign: 'center', paddingVertical: 24 },

  tableHead: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  th: { flex: 1, fontSize: 12, color: colors.ink3, fontWeight: '600' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  td: { flex: 1, fontSize: 13, color: colors.ink1 },
});
