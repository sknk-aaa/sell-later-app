import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalHeader } from '@/components/headers';
import { ProductForm, type ProductFormHandle } from '@/components/ProductForm';
import { Button } from '@/components/ui';
import { useItemStore } from '@/stores/useItemStore';
import { colors } from '@/theme/tokens';

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addItem = useItemStore((s) => s.addItem);
  const formRef = React.useRef<ProductFormHandle>(null);
  const [formKey, setFormKey] = React.useState(0);

  const save = async (keepOpen: boolean) => {
    const sub = formRef.current?.getSubmission();
    if (!sub) {
      Alert.alert('入力が不足しています', '商品名・カテゴリ・見込み売却価格は必須です。');
      return;
    }
    await addItem(sub.values, sub.photo);
    if (keepOpen) {
      setFormKey((k) => k + 1); // フォームを初期化して続けて追加
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.screen}>
      <ModalHeader title="商品を追加" onLeft={() => router.back()} onRight={() => save(false)} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <ProductForm key={formKey} ref={formRef} />
        <View style={styles.actions}>
          <Button label="保存" variant="primary" block onPress={() => save(false)} />
          <Button label="続けてもう1つ追加" variant="ghost" block textColor={colors.primary} onPress={() => save(true)} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  actions: { paddingHorizontal: 16, paddingTop: 20 },
});
