import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DetailHeader } from '@/components/headers';
import { useTranslation } from '@/i18n';
import { getDoc } from '@/constants/docs';
import { colors } from '@/theme/tokens';

export default function InfoScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key: string }>();
  const doc = key ? getDoc(locale, key) : undefined;

  return (
    <View style={styles.screen}>
      <DetailHeader title={doc?.title ?? ''} onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
      >
        {doc ? (
          <>
            {doc.updated && <Text style={styles.updated}>{t('settings.docUpdated')}: {doc.updated}</Text>}
            {doc.intro && <Text style={styles.intro}>{doc.intro}</Text>}
            {doc.sections.map((s, i) => (
              <View key={i} style={styles.section}>
                {s.heading && <Text style={styles.heading}>{s.heading}</Text>}
                {s.body.map((p, j) => (
                  <Text key={j} style={styles.body}>{p}</Text>
                ))}
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.body}>{t('settings.docNotFound')}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  updated: { fontSize: 12, color: colors.ink3, marginBottom: 12 },
  intro: { fontSize: 14, color: colors.ink2, lineHeight: 22, marginBottom: 20 },
  section: { marginBottom: 20 },
  heading: { fontSize: 15, fontWeight: '700', color: colors.ink1, marginBottom: 6 },
  body: { fontSize: 14, color: colors.ink2, lineHeight: 22, marginBottom: 4 },
});
