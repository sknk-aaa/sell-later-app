import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { DOCS } from '@/constants/docs';
import { colors } from '@/theme/tokens';

export default function InfoScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const doc = key ? DOCS[key] : undefined;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: doc?.title ?? '', headerBackTitle: '設定' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {doc ? (
          <>
            {doc.updated && <Text style={styles.updated}>最終更新日: {doc.updated}</Text>}
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
          <Text style={styles.body}>内容が見つかりませんでした。</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  updated: { fontSize: 12, color: colors.ink3, marginBottom: 12 },
  intro: { fontSize: 14, color: colors.ink2, lineHeight: 22, marginBottom: 20 },
  section: { marginBottom: 20 },
  heading: { fontSize: 15, fontWeight: '700', color: colors.ink1, marginBottom: 6 },
  body: { fontSize: 14, color: colors.ink2, lineHeight: 22, marginBottom: 4 },
});
