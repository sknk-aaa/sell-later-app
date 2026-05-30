import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CONTACT_EMAIL } from '@/constants/docs';
import { Icon, type IconName } from '@/components/Icon';
import { Card } from '@/components/ui';
import { PickerSheet } from '@/components/PickerSheet';
import { LargeTitleHeader } from '@/components/headers';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useItemStore } from '@/stores/useItemStore';
import { STATUS } from '@/theme/status';
import { colors, type StatusKind } from '@/theme/tokens';
import type { Setting } from '@/db/schema';

const THEME_LABEL: Record<Setting['theme'], string> = {
  system: 'システム設定に従う',
  light: 'ライト',
  dark: 'ダーク',
};
const STATUS_ORDER: StatusKind[] = ['stored', 'prep', 'listed', 'sold', 'hold'];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isPro = useSettingsStore((s) => s.isPro);
  const clearAllData = useItemStore((s) => s.clearAllData);
  const [themeOpen, setThemeOpen] = React.useState(false);

  const confirmClear = () => {
    Alert.alert('データの削除', 'すべての商品・写真・売却記録を削除します。この操作は取り消せません。', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => clearAllData() },
    ]);
  };

  const showStatuses = () => {
    Alert.alert('ステータス（固定）', STATUS_ORDER.map((k) => `・${STATUS[k].label}`).join('\n') + '\n\nステータスは売却記録などの動作に関わるため固定です。');
  };

  const contact = () => {
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('「売るもの管理」お問い合わせ')}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('お問い合わせ', `メールアプリを開けませんでした。\n${CONTACT_EMAIL} までご連絡ください。`),
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader title="設定" />

        {/* Pro card */}
        <Card style={styles.proCard}>
          <View style={styles.proIcon}><Icon name="crown" size={32} color={colors.star} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>{isPro ? 'Proプラン 利用中' : 'Proプラン'}</Text>
            <Text style={styles.proSub} numberOfLines={1}>
              {isPro ? '広告非表示・写真複数枚・分析が使えます' : '広告を非表示にして、より便利に使えます'}
            </Text>
          </View>
          {!isPro && (
            <Pressable style={styles.proBtn} onPress={() => router.push('/paywall')}>
              <Text style={styles.proBtnText}>プランを確認</Text>
            </Pressable>
          )}
        </Card>

        <SectionTitle>アカウント・データ</SectionTitle>
        <ListCard>
          <Row icon="trash" iconBg="rgba(255,107,107,0.12)" iconColor={colors.danger} label="データの削除" labelColor={colors.danger} onPress={confirmClear} isLast />
        </ListCard>

        <SectionTitle>表示・カスタマイズ</SectionTitle>
        <ListCard>
          <Row icon="palette" label="テーマカラー" value={THEME_LABEL[theme]} onPress={() => setThemeOpen(true)} />
          <Row icon="percent" label="利益の計算方法" value="送料・手数料を差し引く" onPress={() => router.push('/settings/info/profit')} />
          <Row icon="sliders" label="ステータスの編集" value="固定" onPress={showStatuses} />
          <Row icon="folder" label="カテゴリの編集" onPress={() => router.push('/settings/categories')} isLast />
        </ListCard>

        <SectionTitle>サポート・その他</SectionTitle>
        <ListCard>
          <Row icon="help" label="よくある質問" onPress={() => router.push('/settings/info/faq')} />
          <Row icon="mail" label="お問い合わせ" onPress={contact} />
          <Row icon="doc" label="利用規約" onPress={() => router.push('/settings/info/terms')} />
          <Row icon="shield" label="プライバシーポリシー" onPress={() => router.push('/settings/info/privacy')} />
          <Row icon="info" label="アプリについて" value="Version 1.0.0" onPress={() => Alert.alert('売るもの管理', 'Version 1.0.0')} isLast />
        </ListCard>

        <View style={{ height: 24 }} />
      </ScrollView>

      <PickerSheet
        visible={themeOpen}
        title="テーマカラー"
        options={(Object.keys(THEME_LABEL) as Setting['theme'][]).map((k) => ({ key: k, label: THEME_LABEL[k] }))}
        selectedKey={theme}
        onSelect={(k) => setTheme(k as Setting['theme'])}
        onClose={() => setThemeOpen(false)}
      />
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function ListCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.listCard}>{children}</View>;
}

function Row({
  icon, iconBg, iconColor, label, labelColor, value, isLast, onPress,
}: {
  icon: IconName; iconBg?: string; iconColor?: string; label: string; labelColor?: string; value?: string; isLast?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable style={[styles.row, !isLast && styles.rowBorder]} onPress={onPress}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg ?? colors.primarySoft }]}>
        <Icon name={icon} size={16} color={iconColor ?? colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: labelColor ?? colors.ink1 }]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Icon name="chevR" size={14} color={colors.ink4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },

  proCard: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  proIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  proTitle: { fontSize: 16, fontWeight: '700', color: colors.ink1 },
  proSub: { fontSize: 11, color: colors.ink3 },
  proBtn: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  proBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  sectionTitle: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10, fontSize: 13, fontWeight: '600', color: colors.ink2 },
  listCard: { marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 13, color: colors.ink3 },
});
