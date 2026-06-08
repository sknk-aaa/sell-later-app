import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { ModalHeader } from '@/components/headers';
import { Button } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { usePurchases } from '@/purchases/PurchaseProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { PRIVACY_URL, TERMS_URL } from '@/constants/docs';
import { colors } from '@/theme/tokens';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { available, loading, packages, buy, restore } = usePurchases();
  const isPro = useSettingsStore((s) => s.isPro);

  const benefits = [
    { icon: 'close' as const, text: t('paywall.noAds') },
    { icon: 'box' as const, text: t('paywall.moreItems') },
    { icon: 'star' as const, text: t('paywall.multiPhoto') },
    { icon: 'chart' as const, text: t('paywall.analytics') },
  ];

  return (
    <View style={styles.screen}>
      <ModalHeader title={t('paywall.title')} leftLabel={t('common.close')} rightLabel="" onLeft={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <View style={styles.hero}>
          <View style={styles.crown}><Icon name="crown" size={40} color={colors.star} /></View>
          <Text style={styles.title}>{t('paywall.appName')}</Text>
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
        </View>

        <View style={styles.card}>
          {benefits.map((b, i) => (
            <View key={i} style={[styles.benefit, i !== benefits.length - 1 && styles.benefitBorder]}>
              <View style={styles.benefitIcon}><Icon name={b.icon} size={16} color={colors.primary} /></View>
              <Text style={styles.benefitText}>{b.text}</Text>
              <Icon name="checkCircle" size={18} color={colors.profit} />
            </View>
          ))}
        </View>

        {isPro ? (
          <View style={styles.proNow}>
            <Icon name="checkCircle" size={20} color={colors.profit} />
            <Text style={styles.proNowText}>{t('paywall.proNow')}</Text>
          </View>
        ) : !available ? (
          <Text style={styles.notice}>{t('paywall.expoGo')}</Text>
        ) : packages.length === 0 ? (
          <Text style={styles.notice}>{t('paywall.loading')}</Text>
        ) : (
          <View style={{ marginTop: 20, gap: 12 }}>
            {packages.map((p) => {
              const isMonthly = p.packageType === 'MONTHLY';
              const planName = isMonthly ? t('paywall.monthlyName') : t('paywall.lifetimeName');
              const planDesc = isMonthly ? t('paywall.monthlyDesc') : t('paywall.lifetimeDesc');
              return (
                <Pressable key={p.id} style={styles.planCard} onPress={() => buy(p.pkg)}>
                  <View style={styles.planHead}>
                    <Text style={styles.planName}>{planName}</Text>
                    <Text style={styles.planPrice}>
                      {p.priceString}
                      {isMonthly && <Text style={styles.planPer}> {t('paywall.perMonth')}</Text>}
                    </Text>
                  </View>
                  <Text style={styles.planDesc}>{planDesc}</Text>
                  <View style={styles.planBuyBtn}>
                    <Text style={styles.planBuyText}>{t('common.upgrade')}</Text>
                  </View>
                </Pressable>
              );
            })}
            <Pressable style={styles.restore} onPress={restore} disabled={loading}>
              <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.subInfo}>{t('paywall.subInfo')}</Text>

        <View style={styles.links}>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={styles.link}>{t('paywall.terms')}</Text>
          </Pressable>
          <Text style={styles.linkSep}>·</Text>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.link}>{t('paywall.privacy')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingVertical: 16 },
  crown: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFF6E0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink1 },
  subtitle: { fontSize: 13, color: colors.ink3, marginTop: 4 },

  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 8 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  benefitBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  benefitIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, fontSize: 15, color: colors.ink1 },

  proNow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  proNowText: { fontSize: 15, fontWeight: '600', color: colors.profit },
  notice: { marginTop: 20, fontSize: 13, color: colors.ink3, textAlign: 'center', lineHeight: 19 },

  planCard: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary, padding: 16 },
  planHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 },
  planName: { fontSize: 16, fontWeight: '700', color: colors.ink1 },
  planPrice: { fontSize: 18, fontWeight: '700', color: colors.ink1 },
  planPer: { fontSize: 13, fontWeight: '500', color: colors.ink3 },
  planDesc: { fontSize: 12, color: colors.ink3, lineHeight: 18, marginBottom: 12 },
  planBuyBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  planBuyText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  restore: { alignItems: 'center', paddingVertical: 8 },
  restoreText: { fontSize: 14, color: colors.ink3 },

  subInfo: { marginTop: 24, fontSize: 11, color: colors.ink4, lineHeight: 16, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 14 },
  link: { fontSize: 12, color: colors.ink3, textDecorationLine: 'underline' },
  linkSep: { fontSize: 12, color: colors.ink3 },
});
