import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { Card, SectionHead, Button } from '@/components/ui';
import { Donut } from '@/components/charts/Donut';
import { LineChart } from '@/components/charts/LineChart';
import { PickerSheet } from '@/components/PickerSheet';
import { LargeTitleHeader } from '@/components/headers';
import { useAnalytics, type AnalyticsPeriod } from '@/stores/selectors';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { STATUS } from '@/theme/status';
import { colors, numFont, shadowCard, type StatusKind } from '@/theme/tokens';
import { yen } from '@/utils/format';

type Tab = 'summary' | 'expected' | 'sold';

const PERIOD_LABEL: Record<AnalyticsPeriod, string> = { month: '今月', year: '今年', all: 'すべて' };
const STATUS_ORDER: StatusKind[] = ['stored', 'prep', 'listed', 'sold', 'hold'];
const STATUS_DONUT_COLOR: Record<StatusKind, string> = {
  stored: '#C9CDD3',
  prep: colors.statusPrep,
  listed: colors.statusListed,
  sold: colors.statusSold,
  hold: colors.statusHold,
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const isPro = useSettingsStore((s) => s.isPro);
  const [tab, setTab] = React.useState<Tab>('summary');
  const [period, setPeriod] = React.useState<AnalyticsPeriod>('all');
  const [periodOpen, setPeriodOpen] = React.useState(false);
  const { width } = useWindowDimensions();
  const chartW = width - 32 - 12;
  const a = useAnalytics(period);

  if (!isPro) {
    return (
      <View style={styles.screen}>
        <LargeTitleHeader title="分析" />
        <View style={styles.lockWrap}>
          <View style={styles.lockIcon}><Icon name="chart" size={36} color={colors.primary} /></View>
          <Text style={styles.lockTitle}>分析はPro限定です</Text>
          <Text style={styles.lockText}>カテゴリ別の売上・利益、月別の推移、売却実績などをProで確認できます。</Text>
          <Button label="Proにアップグレード" variant="primary" icon="crown" iconColor="#fff" onPress={() => router.push('/paywall')} style={{ marginTop: 16, paddingHorizontal: 24 }} />
        </View>
      </View>
    );
  }

  const statusDonutData = STATUS_ORDER.map((k) => ({ value: a.statusCounts[k], color: STATUS_DONUT_COLOR[k] }));
  const monthlyMax = Math.max(...a.monthlyProfit.map((m) => m.value), 0);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader
          title="分析"
          right={
            <Pressable style={styles.periodBtn} onPress={() => setPeriodOpen(true)}>
              <Icon name="calendar" size={14} color={colors.ink3} />
              <Text style={styles.periodText}>{PERIOD_LABEL[period]}</Text>
              <Icon name="chevD" size={12} color={colors.ink3} />
            </Pressable>
          }
        />

        {/* Tabs */}
        <View style={styles.tabs}>
          {([
            { k: 'summary', l: 'サマリー' },
            { k: 'expected', l: '想定データ' },
            { k: 'sold', l: '売却済みデータ' },
          ] as const).map((t) => (
            <Pressable key={t.k} onPress={() => setTab(t.k)} style={[styles.tabBtn, tab === t.k && styles.tabBtnActive]}>
              <Text style={[styles.tabText, { color: tab === t.k ? colors.primary : colors.ink3 }]}>{t.l}</Text>
            </Pressable>
          ))}
        </View>

        {/* Summary tiles */}
        <Card style={{ padding: 14 }}>
          <View style={styles.tilesRow}>
            {(tab === 'sold'
              ? ([
                  { color: colors.statusHold, bg: colors.statusHoldBg, icon: 'bag', label: '売却済み利益', value: yen(a.soldProfitTotal), sub: thisMonth(a.thisMonthProfit, yen) },
                  { color: colors.statusPrep, bg: colors.statusPrepBg, icon: 'archive', label: '売却済み件数', value: `${a.soldCount}件`, sub: thisMonth(a.thisMonthCount, (n) => `${n}件`) },
                ] as TileDef[])
              : tab === 'expected'
                ? ([
                    { color: colors.primary, bg: colors.primarySoft, icon: 'tag', label: '想定売上合計', value: yen(a.expectedSalesTotal), sub: '—' },
                    { color: colors.profit, bg: 'rgba(16,185,129,0.12)', icon: 'chartLine', label: '想定利益合計', value: yen(a.expectedProfitTotal), sub: '—' },
                  ] as TileDef[])
                : ([
                    { color: colors.primary, bg: colors.primarySoft, icon: 'tag', label: '想定売上合計', value: yen(a.expectedSalesTotal), sub: '—' },
                    { color: colors.profit, bg: 'rgba(16,185,129,0.12)', icon: 'chartLine', label: '想定利益合計', value: yen(a.expectedProfitTotal), sub: '—' },
                    { color: colors.statusHold, bg: colors.statusHoldBg, icon: 'bag', label: '売却済み利益', value: yen(a.soldProfitTotal), sub: thisMonth(a.thisMonthProfit, yen) },
                    { color: colors.statusPrep, bg: colors.statusPrepBg, icon: 'archive', label: '売却済み件数', value: `${a.soldCount}件`, sub: thisMonth(a.thisMonthCount, (n) => `${n}件`) },
                  ] as TileDef[])
            ).map((t) => <BigTile key={t.label} {...t} />)}
          </View>
        </Card>

        {/* カテゴリ別 想定売上（summary / expected） */}
        {tab !== 'sold' && (
          <>
            <SectionHead title="カテゴリ別 想定売上" titleSize={15} />
            <Card>
              {a.categoryExpected.length === 0 ? (
                <Text style={styles.emptyInline}>データがありません</Text>
              ) : (
                <View style={styles.donutRow}>
                  <Donut data={a.categoryExpected} size={150} thickness={26} centerLabel="合計" centerValue={yen(a.expectedSalesTotal)} />
                  <View style={styles.legend}>
                    {a.categoryExpected.map((c) => (
                      <View key={c.name} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{c.name}</Text>
                        <Text style={styles.legendValue}>{yen(c.value)}</Text>
                        <Text style={styles.legendPct}>{c.pct}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </>
        )}

        {/* 月別 売却済み利益（summary / sold） */}
        {tab !== 'expected' && (
          <>
            <SectionHead title="月別 売却済み利益の推移" titleSize={15} />
            <Card style={{ paddingHorizontal: 6, paddingVertical: 14 }}>
              {monthlyMax === 0 ? (
                <Text style={styles.emptyInline}>売却データがありません</Text>
              ) : (
                <LineChart
                  data={a.monthlyProfit}
                  w={chartW}
                  h={200}
                  highlightIdx={11}
                  highlightLabel="今月"
                  highlightValue={yen(a.monthlyProfit[11].value)}
                />
              )}
            </Card>
          </>
        )}

        {/* ステータス別件数（summary / expected） */}
        {tab !== 'sold' && (
          <>
            <SectionHead title="ステータス別 件数" titleSize={15} />
            <Card>
              {a.statusTotal === 0 ? (
                <Text style={styles.emptyInline}>データがありません</Text>
              ) : (
                <View style={styles.donutRow}>
                  <Donut data={statusDonutData} size={130} thickness={22} centerLabel="合計" centerValue={`${a.statusTotal}件`} />
                  <View style={styles.legend}>
                    {STATUS_ORDER.map((k) => (
                      <View key={k} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: STATUS_DONUT_COLOR[k] }]} />
                        <Text style={styles.legendName}>{STATUS[k].label}</Text>
                        <Text style={styles.legendValue}>{a.statusCounts[k]}件</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </>
        )}

        {/* カテゴリ別 売却済み利益（sold） */}
        {tab === 'sold' && (
          <>
            <SectionHead title="カテゴリ別 売却済み利益" titleSize={15} />
            <Card>
              {a.categorySold.length === 0 ? (
                <Text style={styles.emptyInline}>売却データがありません</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {a.categorySold.map((b) => {
                    const max = a.categorySold[0].value || 1;
                    return (
                      <View key={b.name} style={styles.hbarRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.hbarName}>{b.name}</Text>
                          <View style={styles.hbarBottom}>
                            <View style={styles.hbarTrack}>
                              <View style={[styles.hbarFill, { width: `${(b.value / max) * 100}%`, backgroundColor: b.color }]} />
                            </View>
                            <Text style={styles.hbarValue}>{yen(b.value)}</Text>
                            <Text style={styles.hbarPct}>{b.pct}%</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </>
        )}

        {/* 月別 売却実績サマリー（summary / sold） */}
        {tab !== 'expected' && (
          <>
            <SectionHead title="月別 売却実績サマリー" titleSize={15} />
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {a.table.length === 0 ? (
                <Text style={[styles.emptyInline, { paddingVertical: 20 }]}>売却データがありません</Text>
              ) : (
                <>
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.th, styles.cMonth]}>月</Text>
                    <Text style={[styles.th, styles.cCount]}>件数</Text>
                    <Text style={[styles.th, styles.cFlex]}>売却額</Text>
                    <Text style={[styles.th, styles.cFlex]}>送料</Text>
                    <Text style={[styles.th, styles.cFlex]}>利益</Text>
                  </View>
                  {a.table.map((r, i) => (
                    <View key={r.label} style={[styles.tableRow, i !== a.table.length - 1 && styles.tableRowBorder]}>
                      <Text style={[styles.td, styles.cMonth]}>{r.label}</Text>
                      <Text style={[styles.td, styles.cCount]}>{r.count}件</Text>
                      <Text style={[styles.td, styles.cFlex, numFont]}>{yen(r.salesSum)}</Text>
                      <Text style={[styles.td, styles.cFlex, numFont]}>{yen(r.shipSum)}</Text>
                      <Text style={[styles.td, styles.cFlex, styles.tdProfit]}>{yen(r.profitSum)}</Text>
                    </View>
                  ))}
                </>
              )}
            </Card>
          </>
        )}
      </ScrollView>

      <PickerSheet
        visible={periodOpen}
        title="期間を選択"
        options={(Object.keys(PERIOD_LABEL) as AnalyticsPeriod[]).map((k) => ({ key: k, label: PERIOD_LABEL[k] }))}
        selectedKey={period}
        onSelect={(k) => setPeriod(k as AnalyticsPeriod)}
        onClose={() => setPeriodOpen(false)}
      />
    </View>
  );
}

const thisMonth = (n: number, fmt: (n: number) => string) => `今月 ${fmt(n)}`;

type TileDef = { color: string; bg: string; icon: IconName; label: string; value: string; sub: string };

function BigTile({ icon, color, bg, label, value, sub }: TileDef) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: bg }]}><Icon name={icon} size={17} color={color} /></View>
      <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.tileSub} numberOfLines={1}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 80 },
  lockIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  lockTitle: { fontSize: 18, fontWeight: '700', color: colors.ink1, marginBottom: 8 },
  lockText: { fontSize: 13, color: colors.ink3, textAlign: 'center', lineHeight: 20 },
  periodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10,
  },
  periodText: { fontSize: 13, fontWeight: '500', color: colors.ink1 },

  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 4, marginBottom: 14, padding: 4, backgroundColor: '#EEF0F4', borderRadius: 12 },
  tabBtn: { flex: 1, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: '600' },

  tilesRow: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1 },
  tileIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tileLabel: { fontSize: 10, color: colors.ink3, marginBottom: 2 },
  tileValue: { fontSize: 17, fontWeight: '700', color: colors.ink1, letterSpacing: -0.34, ...numFont },
  tileSub: { fontSize: 10, color: colors.ink3, marginTop: 2 },

  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 99 },
  legendName: { flex: 1, fontSize: 12, color: colors.ink1 },
  legendValue: { fontSize: 12, fontWeight: '600', color: colors.ink1, ...numFont },
  legendPct: { width: 38, fontSize: 12, color: colors.ink3, textAlign: 'right' },

  emptyInline: { fontSize: 13, color: colors.ink3, textAlign: 'center', paddingVertical: 16 },

  hbarRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  hbarName: { fontSize: 12, color: colors.ink1, marginBottom: 4 },
  hbarBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hbarTrack: { flex: 1, height: 6, backgroundColor: '#EEF0F4', borderRadius: 4, overflow: 'hidden' },
  hbarFill: { height: '100%', borderRadius: 4 },
  hbarValue: { width: 64, fontSize: 12, color: colors.profit, fontWeight: '600', textAlign: 'right', ...numFont },
  hbarPct: { width: 36, fontSize: 11, color: colors.ink3, textAlign: 'right' },

  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  tableHead: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  th: { fontSize: 11, color: colors.ink3 },
  td: { fontSize: 12, color: colors.ink1 },
  tdProfit: { fontSize: 13, color: colors.profit, fontWeight: '600', ...numFont },
  cMonth: { width: 84 },
  cCount: { width: 40 },
  cFlex: { flex: 1, textAlign: 'right' },
});
