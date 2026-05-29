import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalHeader } from '@/components/headers';
import { ProductForm } from '@/components/ProductForm';
import { Button } from '@/components/ui';
import { colors } from '@/theme/tokens';

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const close = () => router.back();

  return (
    <View style={styles.screen}>
      <ModalHeader title="商品を追加" onLeft={close} onRight={close} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <ProductForm />
        <View style={styles.actions}>
          <Button label="保存" variant="primary" block onPress={close} />
          <Button label="続けてもう1つ追加" variant="ghost" block textColor={colors.primary} onPress={close} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  actions: { paddingHorizontal: 16, paddingTop: 20 },
});
