import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/db/client';
import migrations from '../../drizzle/migrations';
import { useItemStore } from '@/stores/useItemStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { PurchaseProvider } from '@/purchases/PurchaseProvider';
import { initAds } from '@/ads/init';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  React.useEffect(() => {
    if (success) {
      useSettingsStore.getState().load();
      useCategoryStore.getState().load();
      useItemStore.getState().load();
      initAds();
    }
  }, [success]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {error ? (
        <Centered>
          <Text style={styles.errorTitle}>データベースの初期化に失敗しました</Text>
          <Text style={styles.errorMsg}>{error.message}</Text>
        </Centered>
      ) : !success ? (
        <Centered>
          <ActivityIndicator color={colors.primary} />
        </Centered>
      ) : (
        <PurchaseProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="item/[id]" />
            <Stack.Screen name="item/[id]/edit" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add" options={{ presentation: 'modal' }} />
            <Stack.Screen name="sale" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings/categories" />
            <Stack.Screen name="settings/info/[key]" />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          </Stack>
        </PurchaseProvider>
      )}
    </SafeAreaProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24, gap: 8 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.ink1, textAlign: 'center' },
  errorMsg: { fontSize: 13, color: colors.ink3, textAlign: 'center' },
});
