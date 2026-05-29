import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { Card, SectionHead } from '@/components/ui';
import { Donut } from '@/components/charts/Donut';
import { LineChart } from '@/components/charts/LineChart';
import { LargeTitleHeader } from '@/components/headers';
import { CATEGORY_SALES } from '@/constants/demoData';
import { colors, numFont, shadowCard } from '@/theme/tokens';
import { yen } from '@/utils/format';

type AnalyticsTab = 'summary' | 'expected' | 'sold';

const MONTHLY = [
  { label: '1月', value: 7000 },
  { label: '2月', value: 15000 },
  { label: '3月', value: 9000 },
  { label: '4月', value: 8760 },
  { label: '5月', value: 9000 },
  { label: '6月', value: 17000 },
  { label: '8月', value: 30000 },
  { label: '9月', value: 12500 },
  { label: '10月', value: 12000 },
  { label: '11月', value: 7000 },
  { label: '12月', value: 10000 },
];

const SOLD_CATEGORY_BARS: { name: string; value: number; pct: number; color: string; iconBg: string; icon: IconName }[] = [
  { name: '家電', value: 12450, pct: 43.8, color: colors.cat1, iconBg: 'rgba(74,141,255,0.12)', icon: 'tag' },
  { name: 'スマホ・タブレット', value: 7200, pct: 25.3, color: colors.cat2, iconBg: 'rgba(255,154,46,0.12)', icon: 'star' },
  { name: 'ゲーム', value: 4600, pct: 16.2, color: colors.cat3, iconBg: 'rgba(52,199,122,0.12)', icon: 'archive' },
  { name: 'ファッション', value: 2800, pct: 9.9, color: colors.cat4, iconBg: 'rgba(242,201,76,0.18)', icon: 'bag' },
  { name: 'その他', value: 1400, pct: 4.8, color: '#C9CDD3', iconBg: '#EEF0F4', icon: 'box' },
];

const STATUS_DONUT = [
  { name: '保管中', value: 14, color: '#C9CDD3', dot: '#9CA3AF' },
  { name: '出品準備中', value: 8, color: colors.statusPrep, dot: colors.statusPrep },
  { name: '出品中', value: 6, color: colors.statusListed, dot: colors.statusListed },
  { name: '売却済み', value: 12, color: colors.statusSold, dot: colors.statusSold },
  { name: '保留', value: 2, color: colors.statusHold, dot: colors.statusHold },
];

const TABLE = [
  { m: '2024年5月', c: '3件', s: 21300, sh: 1050, p: 8760 },
  { m: '2024年4月', c: '2件', s: 12800, sh: 900, p: 5240 },
  { m: '2024年3月', c: '1件', s: 4500, sh: 750, p: 1950 },
];

export default function AnalyticsScreen() {
  const [tab, setTab] = React.useState<AnalyticsTab>('summary');
  const { width } = useWindowDimensions();
  const chartW = width - 32 - 12;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader
          title="分析"
          right={
            <Pressable style={styles.periodBtn}>
              <Icon name="calendar" size={14} color={colors.ink3} />
              <Text style={styles.periodText}>今月</Text>
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
            <BigTile color={colors.primary} bg={colors.primarySoft} icon="tag" label="想定売上合計" value="¥124,800" sub="—" />
            <BigTile color={colors.profit} bg="rgba(16,185,129,0.12)" icon="chartLine" label="想定利益合計" value="¥77,920" sub="—" />
            <BigTile color={colors.statusHold} bg={colors.statusHoldBg} icon="bag" label="売却済み利益" value="¥28,450" subNode={<Text style={styles.tileSub}>今月 <Text style={styles.tileSubProfit}>¥8,760</Text></Text>} />
            <BigTile color={colors.statusPrep} bg={colors.statusPrepBg} icon="archive" label="売却済み件数" value="12件" subNode={<Text style={styles.tileSub}>今月 <Text style={[styles.tileSubProfit, { color: colors.statusPrep }]}>3件</Text></Text>} />
          </View>
        </Card>

        {/* カテゴリ別 想定売上 */}
        <SectionHead title="カテゴリ別 想定売上" titleSize={15} onSeeAll={() => {}} />
        <Card>
          <View style={styles.donutRow}>
            <Donut data={CATEGORY_SALES} size={150} thickness={26} centerLabel="合計" centerValue="¥124,800" />
            <View style={styles.legend}>
              {CATEGORY_SALES.map((c) => (
                <View key={c.name} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.legendValue}>{yen(c.value)}</Text>
                  <Text style={styles.legendPct}>{c.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* 月別 売却済み利益の推移 */}
        <SectionHead title="月別 売却済み利益の推移" titleSize={15} onSeeAll={() => {}} />
        <Card style={{ paddingHorizontal: 6, paddingVertical: 14 }}>
          <LineChart data={MONTHLY} w={chartW} h={200} highlightIdx={3} highlightLabel="今月" highlightValue="¥8,760" />
        </Card>

        {/* Two-column */}
        <View style={styles.twoCol}>
          {/* HBars */}
          <View style={styles.colCard}>
            <View style={styles.colHead}>
              <Text style={styles.colTitle}>カテゴリ別 売却済み利益</Text>
            </View>
            <View style={{ gap: 12 }}>
              {SOLD_CATEGORY_BARS.map((b, i) => (
                <View key={i} style={styles.hbarRow}>
                  <View style={[styles.hbarIcon, { backgroundColor: b.iconBg }]}>
                    <Icon name={b.icon} size={11} color={b.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hbarName}>{b.name}</Text>
                    <View style={styles.hbarBottom}>
                      <View style={styles.hbarTrack}>
                        <View style={[styles.hbarFill, { width: `${(b.value / 12450) * 100}%`, backgroundColor: b.color }]} />
                      </View>
                      <Text style={styles.hbarValue}>{yen(b.value)}</Text>
                      <Text style={styles.hbarPct}>{b.pct}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Status donut */}
          <View style={styles.colCard}>
            <Text style={[styles.colTitle, { marginBottom: 12 }]}>ステータス別 件数</Text>
            <View style={{ alignItems: 'center', gap: 10 }}>
              <Donut data={STATUS_DONUT} size={110} thickness={20} centerLabel="合計" centerValue="28件" />
              <View style={{ width: '100%', gap: 6 }}>
                {STATUS_DONUT.map((s) => (
                  <View key={s.name} style={styles.sdRow}>
                    <View style={[styles.sdDot, { backgroundColor: s.dot }]} />
                    <Text style={styles.sdName}>{s.name}</Text>
                    <Text style={styles.sdValue}>{s.value}件</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Monthly table */}
        <SectionHead title="月別 売却実績サマリー" titleSize={15} onSeeAll={() => {}} />
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={[styles.tableRow, styles.tableHead]}>
            <Text style={[styles.th, styles.cMonth]}>月</Text>
            <Text style={[styles.th, styles.cCount]}>売却件数</Text>
            <Text style={[styles.th, styles.cFlex]}>売却価格合計</Text>
            <Text style={[styles.th, styles.cFlex]}>送料合計</Text>
            <Text style={[styles.th, styles.cFlex]}>利益合計</Text>
          </View>
          {TABLE.map((r, i) => (
            <View key={i} style={[styles.tableRow, i !== TABLE.length - 1 && styles.tableRowBorder]}>
              <Text style={[styles.td, styles.cMonth]}>{r.m}</Text>
              <Text style={[styles.td, styles.cCount]}>{r.c}</Text>
              <Text style={[styles.td, styles.cFlex, numFont]}>{yen(r.s)}</Text>
              <Text style={[styles.td, styles.cFlex, numFont]}>{yen(r.sh)}</Text>
              <Text style={[styles.td, styles.cFlex, styles.tdProfit]}>{yen(r.p)}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

function BigTile({
  icon, color, bg, label, value, sub, subNode,
}: {
  icon: IconName; color: string; bg: string; label: string; value: string; sub?: string; subNode?: React.ReactNode;
}) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: bg }]}><Icon name={icon} size={17} color={color} /></View>
      <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={1}>{value}</Text>
      {subNode ?? <Text style={styles.tileSub} numberOfLines={1}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
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
  tileSubProfit: { color: colors.profit, fontWeight: '600', ...numFont },

  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 99 },
  legendName: { flex: 1, fontSize: 12, color: colors.ink1 },
  legendValue: { fontSize: 12, fontWeight: '600', color: colors.ink1, ...numFont },
  legendPct: { width: 38, fontSize: 12, color: colors.ink3, textAlign: 'right' },

  twoCol: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  colCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 14, ...shadowCard },
  colHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  colTitle: { fontSize: 13, fontWeight: '700', color: colors.ink1 },

  hbarRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  hbarIcon: { width: 18, height: 18, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  hbarName: { fontSize: 11, color: colors.ink1, marginBottom: 4 },
  hbarBottom: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hbarTrack: { flex: 1, height: 6, backgroundColor: '#EEF0F4', borderRadius: 4, overflow: 'hidden' },
  hbarFill: { height: '100%', borderRadius: 4 },
  hbarValue: { width: 50, fontSize: 11, color: colors.profit, fontWeight: '600', textAlign: 'right', ...numFont },
  hbarPct: { width: 32, fontSize: 10, color: colors.ink3, textAlign: 'right' },

  sdRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sdDot: { width: 7, height: 7, borderRadius: 99 },
  sdName: { flex: 1, fontSize: 11, color: colors.ink1 },
  sdValue: { fontSize: 11, fontWeight: '700', color: colors.ink1, ...numFont },

  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  tableHead: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  th: { fontSize: 11, color: colors.ink3 },
  td: { fontSize: 12, color: colors.ink1 },
  tdProfit: { fontSize: 13, color: colors.profit, fontWeight: '600', ...numFont },
  cMonth: { width: 70 },
  cCount: { width: 50 },
  cFlex: { flex: 1 },
});
