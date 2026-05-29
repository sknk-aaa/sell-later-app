import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { StatusBadge } from '@/components/StatusBadge';
import { PhotoSlot } from '@/components/PhotoSlot';
import { Card, SectionHead } from '@/components/ui';
import { Donut } from '@/components/charts/Donut';
import { LargeTitleHeader } from '@/components/headers';
import { CATEGORY_SALES, PRODUCTS } from '@/constants/demoData';
import { colors, numFont, shadowCard, type StatusKind } from '@/theme/tokens';
import { yen } from '@/utils/format';

type StatusBar = { kind: StatusKind; label: string; count: number; icon: IconName; pct: number };

const STATUS_BARS: StatusBar[] = [
  { kind: 'stored', label: '保管中', count: 14, icon: 'archive', pct: 28 },
  { kind: 'prep', label: '出品準備中', count: 8, icon: 'clock', pct: 60 },
  { kind: 'listed', label: '出品中', count: 6, icon: 'tag', pct: 44 },
  { kind: 'sold', label: '売却済み', count: 12, icon: 'checkCircle', pct: 88 },
  { kind: 'hold', label: '保留', count: 2, icon: 'pause', pct: 22 },
];

const STATUS_COLOR: Record<StatusKind, string> = {
  stored: '#9CA3AF',
  prep: colors.statusPrep,
  listed: colors.statusListed,
  sold: colors.statusSold,
  hold: colors.statusHold,
};

const RECENT = [PRODUCTS[1], PRODUCTS[0], PRODUCTS[2], PRODUCTS[3]];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader
          title="ホーム"
          right={
            <Pressable hitSlop={8}>
              <Icon name="more" size={22} color={colors.ink3} />
            </Pressable>
          }
        />

        {/* 資産サマリーカード */}
        <Card style={{ paddingBottom: 20 }}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryTitle}>資産サマリー</Text>
            <Text style={styles.summarySub}>すべて売却した場合の想定</Text>
          </View>
          <View style={styles.row16}>
            <SummaryStat icon="tag" iconBg={colors.primarySoft} iconColor={colors.primary} label="想定売上合計" value="¥124,800" />
            <SummaryStat icon="chartLine" iconBg="rgba(16,185,129,0.12)" iconColor={colors.profit} label="想定利益合計" value="¥77,920" profit />
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.row10}>
            <MiniStat icon="bag" color={colors.statusListed} bg={colors.statusListedBg} label="出品中" value="6件" />
            <MiniStat icon="clock" color={colors.statusPrep} bg={colors.statusPrepBg} label="出品準備中" value="8件" />
            <MiniStat icon="archive" color={colors.ink3} bg="#EEF0F4" label="保管中" value="14件" />
            <MiniStat icon="checkCircle" color={colors.profit} bg={colors.statusSoldBg} label="売却済み利益" value="¥28,450" small />
          </View>
        </Card>

        {/* ステータス別 */}
        <SectionHead title="ステータス別" onSeeAll={() => router.push('/list')} />
        <Card style={{ paddingHorizontal: 12, paddingVertical: 18 }}>
          <View style={styles.statusRow}>
            {STATUS_BARS.map((s) => (
              <View key={s.kind} style={styles.statusCol}>
                <Icon name={s.icon} size={22} color={STATUS_COLOR[s.kind]} />
                <Text style={styles.statusLabel}>{s.label}</Text>
                <Text style={styles.statusCount}>
                  {s.count}
                  <Text style={styles.statusCountUnit}>件</Text>
                </Text>
                <View style={styles.statusTrack}>
                  <View style={[styles.statusFill, { width: `${s.pct}%`, backgroundColor: STATUS_COLOR[s.kind] }]} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* カテゴリ別 想定売上 */}
        <SectionHead title="カテゴリ別 想定売上" onSeeAll={() => router.push('/analytics')} />
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

        {/* 最近追加した商品 */}
        <SectionHead title="最近追加した商品" onSeeAll={() => router.push('/list')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentRow}
        >
          {RECENT.map((p) => (
            <Pressable key={p.id} style={styles.recentCard} onPress={() => router.push(`/item/${p.id}`)}>
              <PhotoSlot label={p.name.split(' ')[0]} ratio={1} radius={0} />
              <View style={styles.recentBody}>
                <Text style={styles.recentName} numberOfLines={2}>{p.name}</Text>
                <Text style={styles.recentPrice}>{yen(p.price)}</Text>
                <StatusBadge kind={p.status} soft />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

function SummaryStat({
  icon, iconBg, iconColor, label, value, profit,
}: {
  icon: IconName; iconBg: string; iconColor: string; label: string; value: string; profit?: boolean;
}) {
  return (
    <View style={styles.summaryStat}>
      <View style={[styles.summaryIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.summaryStatLabel} numberOfLines={1}>{label}</Text>
        <Text style={[styles.summaryStatValue, profit && { color: colors.profit }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function MiniStat({
  icon, color, bg, label, value, small,
}: {
  icon: IconName; color: string; bg: string; label: string; value: string; small?: boolean;
}) {
  return (
    <View style={styles.miniStat}>
      <View style={[styles.miniIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={styles.miniLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.miniValue, { fontSize: small ? 13 : 15 }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  summaryHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  summaryTitle: { fontSize: 17, fontWeight: '700', color: colors.ink1 },
  summarySub: { fontSize: 11, color: colors.ink3 },
  row16: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  summaryDivider: { height: 1, backgroundColor: colors.divider, marginTop: 4, marginBottom: 14 },
  row10: { flexDirection: 'row', gap: 10 },

  summaryStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryStatLabel: { fontSize: 11, color: colors.ink3, marginBottom: 2 },
  summaryStatValue: { fontSize: 22, fontWeight: '700', color: colors.ink1, ...numFont },

  miniStat: { flex: 1, alignItems: 'center', gap: 4 },
  miniIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  miniLabel: { fontSize: 11, color: colors.ink3 },
  miniValue: { fontWeight: '700', color: colors.ink1, ...numFont },

  statusRow: { flexDirection: 'row', gap: 6 },
  statusCol: { flex: 1, alignItems: 'center', gap: 6 },
  statusLabel: { fontSize: 12, color: colors.ink2 },
  statusCount: { fontSize: 16, fontWeight: '700', color: colors.ink1, ...numFont },
  statusCountUnit: { fontSize: 11, fontWeight: '500', color: colors.ink2 },
  statusTrack: { width: '70%', height: 4, backgroundColor: '#EEF0F4', borderRadius: 99, overflow: 'hidden' },
  statusFill: { height: '100%', borderRadius: 99 },

  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 99 },
  legendName: { flex: 1, fontSize: 12, color: colors.ink1 },
  legendValue: { fontSize: 12, fontWeight: '600', color: colors.ink1, ...numFont },
  legendPct: { width: 38, fontSize: 12, color: colors.ink3, textAlign: 'right' },

  recentRow: { gap: 12, paddingHorizontal: 16, paddingBottom: 4 },
  recentCard: { width: 150, backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', ...shadowCard },
  recentBody: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  recentName: { fontSize: 12, fontWeight: '500', color: colors.ink1, lineHeight: 16, height: 32 },
  recentPrice: { fontSize: 15, fontWeight: '700', color: colors.ink1, marginTop: 4, marginBottom: 6, ...numFont },
});
