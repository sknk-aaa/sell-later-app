import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalHeader } from '@/components/headers';
import { ProductForm, type ProductFormHandle } from '@/components/ProductForm';
import { Button } from '@/components/ui';
import { useItemStore, type PhotoValue } from '@/stores/useItemStore';
import { useItemViewModel } from '@/stores/selectors';
import { colors } from '@/theme/tokens';

export default function EditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useItemViewModel(id);
  const updateItem = useItemStore((s) => s.updateItem);
  const formRef = React.useRef<ProductFormHandle>(null);

  if (!vm) {
    return (
      <View style={styles.screen}>
        <ModalHeader title="商品を編集" onLeft={() => router.back()} rightLabel="" />
        <View style={styles.empty}><Text style={styles.emptyText}>商品が見つかりません</Text></View>
      </View>
    );
  }

  const initialPhotos: PhotoValue[] = vm.imagePaths.map((path) => ({ kind: 'existing', path }));

  const save = async () => {
    const sub = formRef.current?.getSubmission();
    if (!sub) {
      Alert.alert('入力が不足しています', '商品名・カテゴリ・見込み売却価格は必須です。');
      return;
    }
    await updateItem(vm.id, sub.values, sub.photos);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ModalHeader title="商品を編集" onLeft={() => router.back()} onRight={save} rightBold />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <ProductForm
          ref={formRef}
          initial={{
            name: vm.name,
            category: vm.category,
            purchasePrice: vm.purchasePrice,
            expectedPrice: vm.expectedPrice,
            shippingFee: vm.shippingFee,
            location: vm.location,
            condition: vm.condition,
            status: vm.status,
            memo: vm.memo,
          }}
          initialPhotos={initialPhotos}
          onRequestPro={() => router.push('/paywall')}
        />
        <View style={styles.actions}>
          <Button label="保存" variant="primary" block onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  actions: { paddingHorizontal: 16, paddingTop: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: colors.ink3 },
});
