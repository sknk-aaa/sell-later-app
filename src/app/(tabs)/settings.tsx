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
import { useTranslation } from '@/i18n';
import { colors, type StatusKind } from '@/theme/tokens';
import type { Setting } from '@/db/schema';

const STATUS_ORDER: StatusKind[] = ['stored', 'prep', 'listed', 'sold', 'hold'];

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const isPro = useSettingsStore((s) => s.isPro);
  const clearAllData = useItemStore((s) => s.clearAllData);
  const [themeOpen, setThemeOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  const themeLabel: Record<Setting['theme'], string> = {
    system: t('settings.themeSystem'),
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
  };
  const langLabel: Record<Setting['language'], string> = {
    system: t('language.system'),
    en: t('language.en'),
    ja: t('language.ja'),
  };

  const confirmClear = () => {
    Alert.alert(t('settings.deleteTitle'), t('settings.deleteMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => clearAllData() },
    ]);
  };

  const showStatuses = () => {
    Alert.alert(
      t('settings.statusFixedTitle'),
      STATUS_ORDER.map((k) => `・${t(`status.${k}`)}`).join('\n') + '\n\n' + t('settings.statusFixedNote'),
    );
  };

  const contact = () => {
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('common.appName'))}`;
    Linking.openURL(url).catch(() =>
      Alert.alert(t('settings.contact'), `${t('settings.contactFailMsg')}\n${CONTACT_EMAIL}`),
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader title={t('settings.title')} />

        {/* Pro card */}
        <Card style={styles.proCard}>
          <View style={styles.proIcon}><Icon name="crown" size={32} color={colors.star} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>{isPro ? t('settings.proTitleActive') : t('settings.proTitle')}</Text>
            <Text style={styles.proSub} numberOfLines={1}>
              {isPro ? t('settings.proSubPro') : t('settings.proSubFree')}
            </Text>
          </View>
          {!isPro && (
            <Pressable style={styles.proBtn} onPress={() => router.push('/paywall')}>
              <Text style={styles.proBtnText}>{t('settings.checkPlan')}</Text>
            </Pressable>
          )}
        </Card>

        <SectionTitle>{t('settings.sectionData')}</SectionTitle>
        <ListCard>
          <Row icon="trash" iconBg="rgba(255,107,107,0.12)" iconColor={colors.danger} label={t('settings.deleteData')} labelColor={colors.danger} onPress={confirmClear} isLast />
        </ListCard>

        <SectionTitle>{t('settings.sectionDisplay')}</SectionTitle>
        <ListCard>
          <Row icon="palette" label={t('settings.theme')} value={themeLabel[theme]} onPress={() => setThemeOpen(true)} />
          <Row icon="doc" label={t('language.title')} value={langLabel[language]} onPress={() => setLangOpen(true)} />
          <Row icon="percent" label={t('settings.profitMethod')} value={t('settings.profitMethodValue')} onPress={() => router.push('/settings/info/profit')} />
          <Row icon="sliders" label={t('settings.statusEdit')} value={t('settings.statusFixed')} onPress={showStatuses} />
          <Row icon="folder" label={t('settings.categoryEdit')} onPress={() => router.push('/settings/categories')} isLast />
        </ListCard>

        <SectionTitle>{t('settings.sectionSupport')}</SectionTitle>
        <ListCard>
          <Row icon="help" label={t('settings.faq')} onPress={() => router.push('/settings/info/faq')} />
          <Row icon="mail" label={t('settings.contact')} onPress={contact} />
          <Row icon="doc" label={t('settings.terms')} onPress={() => router.push('/settings/info/terms')} />
          <Row icon="shield" label={t('settings.privacy')} onPress={() => router.push('/settings/info/privacy')} />
          <Row icon="info" label={t('settings.about')} value={t('settings.version')} onPress={() => Alert.alert(t('common.appName'), t('settings.version'))} isLast />
        </ListCard>

        <View style={{ height: 24 }} />
      </ScrollView>

      <PickerSheet
        visible={themeOpen}
        title={t('settings.theme')}
        options={(['system', 'light', 'dark'] as Setting['theme'][]).map((k) => ({ key: k, label: themeLabel[k] }))}
        selectedKey={theme}
        onSelect={(k) => setTheme(k as Setting['theme'])}
        onClose={() => setThemeOpen(false)}
      />
      <PickerSheet
        visible={langOpen}
        title={t('language.title')}
        options={(['system', 'en', 'ja'] as Setting['language'][]).map((k) => ({ key: k, label: langLabel[k] }))}
        selectedKey={language}
        onSelect={(k) => setLanguage(k as Setting['language'])}
        onClose={() => setLangOpen(false)}
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
