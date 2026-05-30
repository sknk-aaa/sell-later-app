import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { Card, SectionHead, Button } from '@/components/ui';
import { Donut } from '@/components/charts/Donut';
import { LineChart } from '@/components/charts/LineChart';
import { PickerSheet } from '@/components/PickerSheet';
import { LargeTitleHeader } from '@/components/headers';
import { AdBanner } from '@/components/AdBanner';
import { useTranslation } from '@/i18n';
import { useCurrency } from '@/utils/useCurrency';
import { categoryLabel } from '@/constants/categories';
import { useAnalytics, type AnalyticsPeriod } from '@/stores/selectors';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { STATUS } from '@/theme/status';
import { colors, numFont, shadowCard, type StatusKind } from '@/theme/tokens';

type Tab = 'summary' | 'expected' | 'sold';

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
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const isPro = useSettingsStore((s) => s.isPro);
  const [tab, setTab] = React.useState<Tab>('summary');
  const [period, setPeriod] = React.useState<AnalyticsPeriod>('all');
  const [periodOpen, setPeriodOpen] = React.useState(false);
  const { width } = useWindowDimensions();
  const chartW = width - 32 - 12;
  const a = useAnalytics(period);

  const periodLabel: Record<AnalyticsPeriod, string> = {
    month: t('analytics.periodMonth'),
    year: t('analytics.periodYear'),
    all: t('analytics.periodAll'),
  };

  if (!isPro) {
    const statusDonutDataFree = STATUS_ORDER.map((k) => ({ value: a.statusCounts[k], color: STATUS_DONUT_COLOR[k] }));
    const tiles: TileDef[] = [
      { color: colors.primary, bg: colors.primarySoft, icon: 'tag', label: t('home.totalSales'), value: fmt(a.expectedSalesTotal), sub: '—' },
      { color: colors.profit, bg: 'rgba(16,185,129,0.12)', icon: 'chartLine', label: t('home.totalProfit'), value: fmt(a.expectedProfitTotal), sub: '—' },
      { color: colors.statusHold, bg: colors.statusHoldBg, icon: 'bag', label: t('analytics.soldProfit'), value: fmt(a.soldProfitTotal), sub: t('analytics.thisMonth', { val: fmt(a.thisMonthProfit) }) },
      { color: colors.statusPrep, bg: colors.statusPrepBg, icon: 'archive', label: t('analytics.soldCount'), value: `${a.soldCount}`, sub: t('analytics.thisMonth', { val: String(a.thisMonthCount) }) },
    ];
    return (
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <LargeTitleHeader title={t('analytics.title')} />

          <Card style={{ padding: 14 }}>
            <View style={styles.tilesRow}>{tiles.map((tl) => <BigTile key={tl.label} {...tl} />)}</View>
          </Card>

          <SectionHead title={t('analytics.byCatExpected')} titleSize={15} />
          <Card>
            {a.categoryExpected.length === 0 ? (
              <Text style={styles.emptyInline}>{t('analytics.noData')}</Text>
            ) : (
              <View style={styles.donutRow}>
                <Donut data={a.categoryExpected} size={150} thickness={26} centerLabel={t('common.total')} centerValue={fmt(a.expectedSalesTotal)} />
                <View style={styles.legend}>
                  {a.categoryExpected.map((c) => (
                    <View key={c.name} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                      <Text style={styles.legendName} numberOfLines={1}>{categoryLabel(c.name, t)}</Text>
                      <Text style={styles.legendValue}>{fmt(c.value)}</Text>
                      <Text style={styles.legendPct}>{c.pct}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>

          <View style={styles.lockedPreview}>
            <View style={styles.lockedFade} pointerEvents="none">
              <SectionHead title={t('analytics.byStatus')} titleSize={15} />
              <Card>
                <View style={styles.donutRow}>
                  <Donut data={statusDonutDataFree} size={130} thickness={22} centerLabel={t('common.total')} centerValue={`${a.statusTotal}`} />
                  <View style={styles.legend}>
                    {STATUS_ORDER.map((k) => (
                      <View key={k} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: STATUS_DONUT_COLOR[k] }]} />
                        <Text style={styles.legendName}>{t(`status.${k}`)}</Text>
                        <Text style={styles.legendValue}>{a.statusCounts[k]}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Card>
              <SectionHead title={t('analytics.monthlySummary')} titleSize={15} />
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <View style={[styles.tableRow, styles.tableHead]}>
                  <Text style={[styles.th, styles.cMonth]}>—</Text>
                  <Text style={[styles.th, styles.cCount]}>—</Text>
                  <Text style={[styles.th, styles.cFlex]}>—</Text>
                  <Text style={[styles.th, styles.cFlex]}>—</Text>
                </View>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.tableRow, i !== 2 && styles.tableRowBorder]}>
                    <Text style={[styles.td, styles.cMonth]}>—</Text>
                    <Text style={[styles.td, styles.cCount]}>—</Text>
                    <Text style={[styles.td, styles.cFlex, numFont]}>—</Text>
                    <Text style={[styles.td, styles.cFlex, styles.tdProfit]}>—</Text>
                  </View>
                ))}
              </Card>
            </View>
            <View style={styles.lockedOverlay} pointerEvents="box-none">
              <View style={styles.lockedScrim} pointerEvents="none" />
              <View style={styles.lockedCard}>
                <View style={styles.lockIcon}><Icon name="chart" size={30} color={colors.primary} /></View>
                <Text style={styles.lockTitle}>{t('analytics.proMore')}</Text>
                <Text style={styles.lockText}>{t('analytics.proDesc')}</Text>
                <Button label={t('common.upgrade')} variant="primary" icon="crown" iconColor="#fff" onPress={() => router.push('/paywall')} style={{ marginTop: 16, paddingHorizontal: 24 }} />
              </View>
            </View>
          </View>

          <AdBanner />
        </ScrollView>
      </View>
    );
  }

  const statusDonutData = STATUS_ORDER.map((k) => ({ value: a.statusCounts[k], color: STATUS_DONUT_COLOR[k] }));
  const monthlyMax = Math.max(...a.monthlyProfit.map((m) => m.value), 0);

  const tabDefs: { k: Tab; l: string }[] = [
    { k: 'summary', l: t('analytics.tabSummary') },
    { k: 'expected', l: t('analytics.tabExpected') },
    { k: 'sold', l: t('analytics.tabSold') },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader
          title={t('analytics.title')}
          right={
            <Pressable style={styles.periodBtn} onPress={() => setPeriodOpen(true)}>
              <Icon name="calendar" size={14} color={colors.ink3} />
              <Text style={styles.periodText}>{periodLabel[period]}</Text>
              <Icon name="chevD" size={12} color={colors.ink3} />
            </Pressable>
          }
        />

        <View style={styles.tabs}>
          {tabDefs.map((td) => (
            <Pressable key={td.k} onPress={() => setTab(td.k)} style={[styles.tabBtn, tab === td.k && styles.tabBtnActive]}>
              <Text style={[styles.tabText, { color: tab === td.k ? colors.primary : colors.ink3 }]}>{td.l}</Text>
            </Pressable>
          ))}
        </View>

        <Card style={{ padding: 14 }}>
          <View style={styles.tilesRow}>
            {(tab === 'sold'
              ? ([
                  { color: colors.statusHold, bg: colors.statusHoldBg, icon: 'bag', label: t('analytics.soldProfit'), value: fmt(a.soldProfitTotal), sub: t('analytics.thisMonth', { val: fmt(a.thisMonthProfit) }) },
                  { color: colors.statusPrep, bg: colors.statusPrepBg, icon: 'archive', label: t('analytics.soldCount'), value: `${a.soldCount}`, sub: t('analytics.thisMonth', { val: String(a.thisMonthCount) }) },
                ] as TileDef[])
              : tab === 'expected'
                ? ([
                    { color: colors.primary, bg: colors.primarySoft, icon: 'tag', label: t('home.totalSales'), value: fmt(a.expectedSalesTotal), sub: '—' },
                    { color: colors.profit, bg: 'rgba(16,185,129,0.12)', icon: 'chartLine', label: t('home.totalProfit'), value: fmt(a.expectedProfitTotal), sub: '—' },
                  ] as TileDef[])
                : ([
                    { color: colors.primary, bg: colors.primarySoft, icon: 'tag', label: t('home.totalSales'), value: fmt(a.expectedSalesTotal), sub: '—' },
                    { color: colors.profit, bg: 'rgba(16,185,129,0.12)', icon: 'chartLine', label: t('home.totalProfit'), value: fmt(a.expectedProfitTotal), sub: '—' },
                    { color: colors.statusHold, bg: colors.statusHoldBg, icon: 'bag', label: t('analytics.soldProfit'), value: fmt(a.soldProfitTotal), sub: t('analytics.thisMonth', { val: fmt(a.thisMonthProfit) }) },
                    { color: colors.statusPrep, bg: colors.statusPrepBg, icon: 'archive', label: t('analytics.soldCount'), value: `${a.soldCount}`, sub: t('analytics.thisMonth', { val: String(a.thisMonthCount) }) },
                  ] as TileDef[])
            ).map((tl) => <BigTile key={tl.label} {...tl} />)}
          </View>
        </Card>

        {tab !== 'sold' && (
          <>
            <SectionHead title={t('analytics.byCatExpected')} titleSize={15} />
            <Card>
              {a.categoryExpected.length === 0 ? (
                <Text style={styles.emptyInline}>{t('analytics.noData')}</Text>
              ) : (
                <View style={styles.donutRow}>
                  <Donut data={a.categoryExpected} size={150} thickness={26} centerLabel={t('common.total')} centerValue={fmt(a.expectedSalesTotal)} />
                  <View style={styles.legend}>
                    {a.categoryExpected.map((c) => (
                      <View key={c.name} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{categoryLabel(c.name, t)}</Text>
                        <Text style={styles.legendValue}>{fmt(c.value)}</Text>
                        <Text style={styles.legendPct}>{c.pct}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </>
        )}

        {tab !== 'expected' && (
          <>
            <SectionHead title={t('analytics.monthly')} titleSize={15} />
            <Card style={{ paddingHorizontal: 6, paddingVertical: 14 }}>
              {monthlyMax === 0 ? (
                <Text style={styles.emptyInline}>{t('analytics.noSalesData')}</Text>
              ) : (
                <LineChart
                  data={a.monthlyProfit}
                  w={chartW}
                  h={200}
                  highlightIdx={11}
                  highlightLabel={t('analytics.periodMonth')}
                  highlightValue={fmt(a.monthlyProfit[11].value)}
                />
              )}
            </Card>
          </>
        )}

        {tab !== 'sold' && (
          <>
            <SectionHead title={t('analytics.byStatus')} titleSize={15} />
            <Card>
              {a.statusTotal === 0 ? (
                <Text style={styles.emptyInline}>{t('analytics.noData')}</Text>
              ) : (
                <View style={styles.donutRow}>
                  <Donut data={statusDonutData} size={130} thickness={22} centerLabel={t('common.total')} centerValue={`${a.statusTotal}`} />
                  <View style={styles.legend}>
                    {STATUS_ORDER.map((k) => (
                      <View key={k} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: STATUS_DONUT_COLOR[k] }]} />
                        <Text style={styles.legendName}>{t(`status.${k}`)}</Text>
                        <Text style={styles.legendValue}>{a.statusCounts[k]}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </>
        )}

        {tab === 'sold' && (
          <>
            <SectionHead title={t('analytics.byCatSold')} titleSize={15} />
            <Card>
              {a.categorySold.length === 0 ? (
                <Text style={styles.emptyInline}>{t('analytics.noSalesData')}</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {a.categorySold.map((b) => {
                    const max = a.categorySold[0].value || 1;
                    return (
                      <View key={b.name} style={styles.hbarRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.hbarName}>{categoryLabel(b.name, t)}</Text>
                          <View style={styles.hbarBottom}>
                            <View style={styles.hbarTrack}>
                              <View style={[styles.hbarFill, { width: `${(b.value / max) * 100}%`, backgroundColor: b.color }]} />
                            </View>
                            <Text style={styles.hbarValue}>{fmt(b.value)}</Text>
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

        {tab !== 'expected' && (
          <>
            <SectionHead title={t('analytics.monthlySummary')} titleSize={15} />
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {a.table.length === 0 ? (
                <Text style={[styles.emptyInline, { paddingVertical: 20 }]}>{t('analytics.noSalesData')}</Text>
              ) : (
                <>
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.th, styles.cMonth]}>Month</Text>
                    <Text style={[styles.th, styles.cCount]}>#</Text>
                    <Text style={[styles.th, styles.cFlex]}>Sales</Text>
                    <Text style={[styles.th, styles.cFlex]}>Ship</Text>
                    <Text style={[styles.th, styles.cFlex]}>Profit</Text>
                  </View>
                  {a.table.map((r, i) => (
                    <View key={r.label} style={[styles.tableRow, i !== a.table.length - 1 && styles.tableRowBorder]}>
                      <Text style={[styles.td, styles.cMonth]}>{r.label}</Text>
                      <Text style={[styles.td, styles.cCount]}>{r.count}</Text>
                      <Text style={[styles.td, styles.cFlex, numFont]}>{fmt(r.salesSum)}</Text>
                      <Text style={[styles.td, styles.cFlex, numFont]}>{fmt(r.shipSum)}</Text>
                      <Text style={[styles.td, styles.cFlex, styles.tdProfit]}>{fmt(r.profitSum)}</Text>
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
        title={t('analytics.periodAll')}
        options={(Object.keys(periodLabel) as AnalyticsPeriod[]).map((k) => ({ key: k, label: periodLabel[k] }))}
        selectedKey={period}
        onSelect={(k) => setPeriod(k as AnalyticsPeriod)}
        onClose={() => setPeriodOpen(false)}
      />
    </View>
  );
}

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
  lockIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  lockTitle: { fontSize: 16, fontWeight: '700', color: colors.ink1, marginBottom: 8 },
  lockText: { fontSize: 13, color: colors.ink3, textAlign: 'center', lineHeight: 20, marginBottom: 0 },

  lockedPreview: { position: 'relative' },
  lockedFade: { opacity: 0.3 },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  lockedScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(247,248,250,0.55)' },
  lockedCard: { backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 24, paddingHorizontal: 22, alignItems: 'center', ...shadowCard },

  periodBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
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
