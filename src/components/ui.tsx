import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Icon, type IconName } from './Icon';
import { useTranslation } from '@/i18n';
import { colors, radii, shadowCard } from '@/theme/tokens';

// styles.css の .card / .list-card / .section-head / .btn-* / .divider を移植

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ListCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.listCard, style]}>{children}</View>;
}

export function SectionHead({
  title,
  titleSize = 17,
  onSeeAll,
  seeAllLabel,
}: {
  title: string;
  titleSize?: number;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { fontSize: titleSize }]}>{title}</Text>
      {onSeeAll && (
        <Pressable style={styles.seeAll} onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAllText}>{seeAllLabel ?? t('common.seeAll')}</Text>
          <Icon name="chevR" size={12} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

export function Button({
  label,
  variant = 'primary',
  onPress,
  icon,
  iconColor,
  block,
  small,
  textColor,
  style,
}: {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  icon?: IconName;
  iconColor?: string;
  block?: boolean;
  small?: boolean;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = variantStyles[variant];
  const color = textColor ?? v.color;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSm,
        block && styles.btnBlock,
        v.container,
        variant === 'primary' && pressed && { backgroundColor: colors.primaryPressed },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={small ? 16 : 18} color={iconColor ?? color} />}
      <Text style={[styles.btnText, small && styles.btnTextSm, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; color: string }> = {
  primary: { container: { backgroundColor: colors.primary }, color: '#fff' },
  outline: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    color: colors.primary,
  },
  ghost: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    color: colors.ink1,
  },
  danger: { container: { backgroundColor: '#FF6B6B' }, color: '#fff' },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginHorizontal: 16,
    padding: 18,
    ...shadowCard,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginHorizontal: 16,
    overflow: 'hidden',
    ...shadowCard,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.17,
    color: colors.ink1,
  },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { color: colors.primary, fontSize: 13, fontWeight: '500' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  btnSm: { height: 36, paddingHorizontal: 14 },
  btnBlock: { alignSelf: 'stretch' },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnTextSm: { fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.divider },
});
