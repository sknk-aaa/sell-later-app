import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { Card } from '@/components/ui';
import { LargeTitleHeader } from '@/components/headers';
import { colors } from '@/theme/tokens';

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader title="設定" />

        {/* Pro card */}
        <Card style={styles.proCard}>
          <View style={styles.proIcon}>
            <Icon name="crown" size={32} color={colors.star} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>Proプラン</Text>
            <Text style={styles.proSub} numberOfLines={1}>広告を非表示にして、より便利に使えます</Text>
          </View>
          <Pressable style={styles.proBtn}>
            <Text style={styles.proBtnText}>プランを確認</Text>
          </Pressable>
        </Card>

        <SectionTitle>アカウント・データ</SectionTitle>
        <ListCard>
          <Row icon="trash" iconBg="rgba(255,107,107,0.12)" iconColor={colors.danger} label="データの削除" labelColor={colors.danger} isLast />
        </ListCard>

        <SectionTitle>表示・カスタマイズ</SectionTitle>
        <ListCard>
          <Row icon="palette" label="テーマカラー" value="システム設定に従う" />
          <Row icon="percent" label="利益の計算方法" value="送料・手数料を差し引く" />
          <Row icon="sliders" label="ステータスの編集" />
          <Row icon="folder" label="カテゴリの編集" isLast />
        </ListCard>

        <SectionTitle>サポート・その他</SectionTitle>
        <ListCard>
          <Row icon="help" label="よくある質問" />
          <Row icon="mail" label="お問い合わせ" />
          <Row icon="doc" label="利用規約" />
          <Row icon="shield" label="プライバシーポリシー" />
          <Row icon="info" label="アプリについて" value="Version 1.0.0" isLast />
        </ListCard>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  icon, iconBg, iconColor, label, labelColor, value, isLast,
}: {
  icon: IconName; iconBg?: string; iconColor?: string; label: string; labelColor?: string; value?: string; isLast?: boolean;
}) {
  return (
    <Pressable style={[styles.row, !isLast && styles.rowBorder]}>
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
