import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STATUS } from '@/theme/status';
import { useTranslation } from '@/i18n';
import type { StatusKind } from '@/theme/tokens';

export function StatusBadge({ kind, soft = false }: { kind: StatusKind; soft?: boolean }) {
  const { t } = useTranslation();
  const meta = STATUS[kind];
  const bg = soft ? meta.softBg : meta.solidBg;
  const color = soft ? meta.softText : meta.solidText;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{t(`status.${kind}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
