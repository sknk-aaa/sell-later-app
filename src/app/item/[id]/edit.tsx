import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalHeader } from '@/components/headers';
import { ProductForm } from '@/components/ProductForm';
import { Button } from '@/components/ui';
import { PRODUCTS } from '@/constants/demoData';
import { colors } from '@/theme/tokens';

export default function EditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = PRODUCTS.find((x) => x.id === id) ?? PRODUCTS[0];
  const close = () => router.back();

  return (
    <View style={styles.screen}>
      <ModalHeader title="商品を編集" onLeft={close} onRight={close} rightBold />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <ProductForm
          initial={{
            name: p.name,
            category: p.category,
            purchasePrice: 0,
            sellPrice: p.price,
            shipping: 1000,
            status: p.status,
            place: p.place,
            photos: p.photos,
          }}
        />
        <View style={styles.actions}>
          <Button label="保存" variant="primary" block onPress={close} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  actions: { paddingHorizontal: 16, paddingTop: 20 },
});
