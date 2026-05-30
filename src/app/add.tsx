import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalHeader } from '@/components/headers';
import { ProductForm, type ProductFormHandle } from '@/components/ProductForm';
import { Button } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useItemStore } from '@/stores/useItemStore';
import { colors } from '@/theme/tokens';

export default function AddScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const addItem = useItemStore((s) => s.addItem);
  const formRef = React.useRef<ProductFormHandle>(null);
  const [formKey, setFormKey] = React.useState(0);

  const save = async (keepOpen: boolean) => {
    const sub = formRef.current?.getSubmission();
    if (!sub) {
      Alert.alert(t('add.validationTitle'), t('add.validationMsg'));
      return;
    }
    await addItem(sub.values, sub.photos);
    if (keepOpen) {
      setFormKey((k) => k + 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.screen}>
      <ModalHeader title={t('add.title')} onLeft={() => router.back()} onRight={() => save(false)} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <ProductForm key={formKey} ref={formRef} onRequestPro={() => router.push('/paywall')} />
        <View style={styles.actions}>
          <Button label={t('common.save')} variant="primary" block onPress={() => save(false)} />
          <Button label={t('add.addAnother')} variant="ghost" block textColor={colors.primary} onPress={() => save(true)} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  actions: { paddingHorizontal: 16, paddingTop: 20 },
});
