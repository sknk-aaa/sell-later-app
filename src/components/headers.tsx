import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { colors } from '@/theme/tokens';

// styles.css .nav-large を移植（大見出しヘッダー）
export function LargeTitleHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.navLarge, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>{title}</Text>
      {right ? <View style={styles.actions}>{right}</View> : null}
    </View>
  );
}

// styles.css .nav-modal を移植（キャンセル / タイトル / 保存）
export function ModalHeader({
  title,
  leftLabel = 'キャンセル',
  rightLabel = '保存',
  rightBold,
  onLeft,
  onRight,
}: {
  title: string;
  leftLabel?: string;
  rightLabel?: string;
  rightBold?: boolean;
  onLeft?: () => void;
  onRight?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.navModal, { paddingTop: Math.max(insets.top, 14) }]}>
      <View style={styles.modalSide}>
        <Pressable onPress={onLeft} hitSlop={8}>
          <Text style={styles.navLink}>{leftLabel}</Text>
        </Pressable>
      </View>
      <Text style={styles.modalTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.modalSide, styles.modalRight]}>
        <Pressable onPress={onRight} hitSlop={8}>
          <Text style={[styles.navLink, rightBold && styles.navLinkBold]}>{rightLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// styles.css .nav-detail を移植（戻る / タイトル / 右アクション）
export function DetailHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.navDetail, { paddingTop: Math.max(insets.top, 14) }]}>
      <View style={styles.modalSide}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <Icon name="chevL" size={20} color={colors.primary} />
          <Text style={styles.navLink}>戻る</Text>
        </Pressable>
      </View>
      <Text style={styles.modalTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.modalSide, styles.modalRight, styles.detailRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  navModal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  navDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalSide: { flex: 1, alignItems: 'flex-start' },
  modalRight: { alignItems: 'flex-end' },
  detailRight: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  modalTitle: { fontSize: 17, fontWeight: '600', color: colors.ink1 },
  navLink: { color: colors.primary, fontSize: 17 },
  navLinkBold: { fontWeight: '600' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  navLarge: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.64,
    color: colors.ink1,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    paddingBottom: 4,
  },
});
