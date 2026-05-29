import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
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
      </Stack>
    </SafeAreaProvider>
  );
}
