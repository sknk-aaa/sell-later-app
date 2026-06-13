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
import { useTranslation } from '@/i18n';
import { useCurrency } from '@/utils/useCurrency';
import { categoryLabel } from '@/constants/categories';
import { useHomeSummary } from '@/stores/selectors';
import { colors, numFont, shadowCard } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const summary = useHomeSummary();

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader title={t('tabs.home')} />

        {/* Asset summary card */}
        <Card style={{ paddingBottom: 20 }}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryTitle}>{t('home.summary')}</Text>
            <Text style={styles.summarySub}>{t('home.summarySubtitle')}</Text>
          </View>
          <View style={styles.row16}>
            <SummaryStat icon="checkCircle" iconBg={colors.statusSoldBg} iconColor={colors.profit} label={t('home.soldProfit')} value={fmt(summary.soldProfitTotal)} profit />
            <SummaryStat icon="chartLine" iconBg="rgba(16,185,129,0.12)" iconColor={colors.profit} label={t('home.totalProfit')} value={fmt(summary.expectedProfitTotal)} profit />
          </View>
          <View style={styles.summaryDivider} />
          <SummaryStat
            icon="tag"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            label={t('home.soldCount')}
            value={`${summary.statusCounts.sold}${t('home.soldCountUnit')}`}
          />
        </Card>

        {/* Category breakdown */}
        <SectionHead title={t('home.byCat')} onSeeAll={() => router.push('/analytics')} />
        <Card>
          {summary.categoryBreakdown.length === 0 ? (
            <Text style={styles.emptyInline}>{t('common.noData')}</Text>
          ) : (
            <View style={styles.donutRow}>
              <Donut data={summary.categoryBreakdown} size={150} thickness={26} centerLabel={t('common.total')} centerValue={fmt(summary.expectedSalesTotal)} />
              <View style={styles.legend}>
                {summary.categoryBreakdown.map((c) => (
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

        {/* Recently added */}
        <SectionHead title={t('home.recentItems')} onSeeAll={() => router.push('/list')} />
        {summary.recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('home.noItems')}</Text>
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
                  <Text style={styles.recentPrice}>{fmt(p.expectedPrice)}</Text>
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
        <Text style={[styles.summaryStatValue, profit && { color: colors.profit }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{value}</Text>
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
