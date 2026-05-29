import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { StatusBadge } from '@/components/StatusBadge';
import { PhotoSlot } from '@/components/PhotoSlot';
import { Card, SectionHead } from '@/components/ui';
import { Donut } from '@/components/charts/Donut';
import { AdBanner } from '@/components/AdBanner';
import { LargeTitleHeader } from '@/components/headers';
import { useHomeSummary } from '@/stores/selectors';
import { colors, numFont, shadowCard, type StatusKind } from '@/theme/tokens';
import { yen } from '@/utils/format';

const STATUS_META: { kind: StatusKind; label: string; icon: IconName; color: string }[] = [
  { kind: 'stored', label: '保管中', icon: 'archive', color: '#9CA3AF' },
  { kind: 'prep', label: '出品準備中', icon: 'clock', color: colors.statusPrep },
  { kind: 'listed', label: '出品中', icon: 'tag', color: colors.statusListed },
  { kind: 'sold', label: '売却済み', icon: 'checkCircle', color: colors.statusSold },
  { kind: 'hold', label: '保留', icon: 'pause', color: colors.statusHold },
];

export default function HomeScreen() {
  const router = useRouter();
  const summary = useHomeSummary();
  const maxStatus = Math.max(1, ...STATUS_META.map((s) => summary.statusCounts[s.kind]));

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
            <SummaryStat icon="tag" iconBg={colors.primarySoft} iconColor={colors.primary} label="想定売上合計" value={yen(summary.expectedSalesTotal)} />
            <SummaryStat icon="chartLine" iconBg="rgba(16,185,129,0.12)" iconColor={colors.profit} label="想定利益合計" value={yen(summary.expectedProfitTotal)} profit />
          </View>
          <View style={styles.summaryDivider} />
          <SummaryStat
            icon="checkCircle"
            iconBg={colors.statusSoldBg}
            iconColor={colors.profit}
            label="売却済み利益"
            value={yen(summary.soldProfitTotal)}
            profit
          />
        </Card>

        {/* ステータス別 */}
        <SectionHead title="ステータス別" onSeeAll={() => router.push('/list')} />
        <Card style={{ paddingHorizontal: 12, paddingVertical: 18 }}>
          <View style={styles.statusRow}>
            {STATUS_META.map((s) => {
              const count = summary.statusCounts[s.kind];
              return (
                <View key={s.kind} style={styles.statusCol}>
                  <Icon name={s.icon} size={22} color={s.color} />
                  <Text style={styles.statusLabel}>{s.label}</Text>
                  <Text style={styles.statusCount}>
                    {count}
                    <Text style={styles.statusCountUnit}>件</Text>
                  </Text>
                  <View style={styles.statusTrack}>
                    <View style={[styles.statusFill, { width: `${(count / maxStatus) * 100}%`, backgroundColor: s.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* カテゴリ別 想定売上 */}
        <SectionHead title="カテゴリ別 想定売上" onSeeAll={() => router.push('/analytics')} />
        <Card>
          {summary.categoryBreakdown.length === 0 ? (
            <Text style={styles.emptyInline}>データがありません</Text>
          ) : (
            <View style={styles.donutRow}>
              <Donut data={summary.categoryBreakdown} size={150} thickness={26} centerLabel="合計" centerValue={yen(summary.expectedSalesTotal)} />
              <View style={styles.legend}>
                {summary.categoryBreakdown.map((c) => (
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

        {/* 最近追加した商品 */}
        <SectionHead title="最近追加した商品" onSeeAll={() => router.push('/list')} />
        {summary.recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>まだ商品がありません。「追加」から登録できます。</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {summary.recent.map((p) => (
              <Pressable key={p.id} style={styles.recentCard} onPress={() => router.push(`/item/${p.id}`)}>
                {p.imagePath ? (
                  <Image source={{ uri: p.imagePath }} style={styles.recentImage} />
                ) : (
                  <PhotoSlot label={p.name.split(' ')[0]} ratio={1} radius={0} />
                )}
                <View style={styles.recentBody}>
                  <Text style={styles.recentName} numberOfLines={2}>{p.name}</Text>
                  <Text style={styles.recentPrice}>{yen(p.expectedPrice)}</Text>
                  <StatusBadge kind={p.status} soft />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <AdBanner />
      </ScrollView>
    </View>
  );
}

function SummaryStat({ icon, iconBg, iconColor, label, value, profit }: { icon: IconName; iconBg: string; iconColor: string; label: string; value: string; profit?: boolean }) {
  return (
    <View style={styles.summaryStat}>
      <View style={[styles.summaryIcon, { backgroundColor: iconBg }]}><Icon name={icon} size={20} color={iconColor} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.summaryStatLabel} numberOfLines={1}>{label}</Text>
        <Text style={[styles.summaryStatValue, profit && { color: colors.profit }]} numberOfLines={1}>{value}</Text>
      </View>
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

  summaryStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryStatLabel: { fontSize: 11, color: colors.ink3, marginBottom: 2 },
  summaryStatValue: { fontSize: 22, fontWeight: '700', color: colors.ink1, ...numFont },

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

  emptyInline: { fontSize: 13, color: colors.ink3, textAlign: 'center', paddingVertical: 16 },
  emptyCard: { marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', ...shadowCard },
  emptyText: { fontSize: 13, color: colors.ink3, textAlign: 'center' },

  recentRow: { gap: 12, paddingHorizontal: 16, paddingBottom: 4 },
  recentCard: { width: 150, backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', ...shadowCard },
  recentImage: { width: '100%', aspectRatio: 1, backgroundColor: colors.bg2 },
  recentBody: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  recentName: { fontSize: 12, fontWeight: '500', color: colors.ink1, lineHeight: 16, height: 32 },
  recentPrice: { fontSize: 15, fontWeight: '700', color: colors.ink1, marginTop: 4, marginBottom: 6, ...numFont },
});
