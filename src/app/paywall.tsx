import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { ModalHeader } from '@/components/headers';
import { Button } from '@/components/ui';
import { usePurchases } from '@/purchases/PurchaseProvider';
import { SKU_LIFETIME, SKU_MONTHLY } from '@/purchases/products';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors } from '@/theme/tokens';

const BENEFITS = [
  { icon: 'close' as const, text: '広告を非表示' },
  { icon: 'box' as const, text: '商品を21件以上登録' },
  { icon: 'star' as const, text: '1商品に写真を複数枚' },
  { icon: 'chart' as const, text: '分析機能をすべて利用' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { available, loading, lifetime, monthly, buy, restore } = usePurchases();
  const isPro = useSettingsStore((s) => s.isPro);

  return (
    <View style={styles.screen}>
      <ModalHeader title="Proにアップグレード" leftLabel="閉じる" rightLabel="" onLeft={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <View style={styles.hero}>
          <View style={styles.crown}><Icon name="crown" size={40} color={colors.star} /></View>
          <Text style={styles.title}>売るもの管理 Pro</Text>
          <Text style={styles.subtitle}>広告なしで、もっと便利に。</Text>
        </View>

        <View style={styles.card}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={[styles.benefit, i !== BENEFITS.length - 1 && styles.benefitBorder]}>
              <View style={styles.benefitIcon}><Icon name={b.icon} size={16} color={colors.primary} /></View>
              <Text style={styles.benefitText}>{b.text}</Text>
              <Icon name="checkCircle" size={18} color={colors.profit} />
            </View>
          ))}
        </View>

        {isPro ? (
          <View style={styles.proNow}>
            <Icon name="checkCircle" size={20} color={colors.profit} />
            <Text style={styles.proNowText}>Proをご利用中です</Text>
          </View>
        ) : !available ? (
          <Text style={styles.notice}>購入は実機ビルド（TestFlight等）でご利用いただけます。Expo Goでは購入できません。</Text>
        ) : (
          <View style={{ marginTop: 20, gap: 10 }}>
            <Button
              label={`買い切り ${lifetime?.displayPrice ?? '¥1,500'}`}
              variant="primary"
              block
              onPress={() => buy(SKU_LIFETIME)}
            />
            <Button
              label={`月額 ${monthly?.displayPrice ?? '¥500'}`}
              variant="outline"
              block
              textColor={colors.primary}
              onPress={() => buy(SKU_MONTHLY)}
            />
            <Pressable style={styles.restore} onPress={restore} disabled={loading}>
              <Text style={styles.restoreText}>購入を復元</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.links}>
          <Pressable onPress={() => Alert.alert('利用規約', 'v1.0では準備中です。')}>
            <Text style={styles.link}>利用規約</Text>
          </Pressable>
          <Text style={styles.linkSep}>・</Text>
          <Pressable onPress={() => Alert.alert('プライバシーポリシー', 'v1.0では準備中です。')}>
            <Text style={styles.link}>プライバシーポリシー</Text>
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
  proNowText: { fontSize: 15, fontWeight: '700', color: colors.profit },
  notice: { fontSize: 13, color: colors.ink3, textAlign: 'center', marginTop: 20, lineHeight: 20 },

  restore: { alignSelf: 'center', paddingVertical: 10, marginTop: 4 },
  restoreText: { fontSize: 14, color: colors.primary, fontWeight: '500' },

  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 },
  link: { fontSize: 12, color: colors.ink3 },
  linkSep: { fontSize: 12, color: colors.ink4 },
});
