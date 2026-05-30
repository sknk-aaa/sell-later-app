import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useItemStore } from '@/stores/useItemStore';
import { useTranslation } from '@/i18n';
import { canAddItem } from '@/utils/limits';
import { colors } from '@/theme/tokens';

const TAB_ICON: Record<string, IconName> = {
  home: 'homeBrand',
  list: 'list',
  analytics: 'chart',
  settings: 'settings',
};

const LEFT = ['home', 'list'];
const RIGHT = ['analytics', 'settings'];

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isPro = useSettingsStore((s) => s.isPro);
  const itemCount = useItemStore((s) => s.items.length);
  const onAdd = () => router.push(canAddItem(isPro, itemCount) ? '/add' : '/paywall');

  const currentName = state.routes[state.index]?.name;

  const tab = (name: string) => {
    const icon = TAB_ICON[name];
    if (!icon) return null;
    const active = currentName === name;
    return (
      <Pressable
        key={name}
        style={styles.tab}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes.find((r) => r.name === name)?.key ?? '',
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) navigation.navigate(name);
        }}
      >
        <Icon name={icon} size={24} color={active ? colors.primary : colors.ink3} />
        <Text style={[styles.label, active && styles.labelActive]}>{t(`tabs.${name}`)}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.tabbar, { height: 66 + insets.bottom, paddingBottom: insets.bottom }]}>
      {LEFT.map(tab)}
      <Pressable style={styles.addTab} onPress={onAdd}>
        <View style={styles.fab}>
          <Icon name="plus" size={26} color="#fff" />
        </View>
        <Text style={[styles.label, styles.addLabel]}>{t('tabs.add')}</Text>
      </Pressable>
      {RIGHT.map(tab)}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
  },
  addTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.ink3,
  },
  labelActive: { color: colors.primary },
  addLabel: { color: colors.primary, marginTop: 2 },
});
