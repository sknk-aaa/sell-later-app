import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { FormScrollView } from '@/components/FormScrollView';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalHeader } from '@/components/headers';
import { ProductForm, type ProductFormHandle } from '@/components/ProductForm';
import { Button } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useItemStore } from '@/stores/useItemStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors } from '@/theme/tokens';

export default function AddScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isOnboarding = from === 'onboarding';
  const addItem = useItemStore((s) => s.addItem);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const formRef = React.useRef<ProductFormHandle>(null);
  const [formKey, setFormKey] = React.useState(0);

  const save = async (keepOpen: boolean) => {
    const sub = formRef.current?.getSubmission();
    if (!sub) {
      Alert.alert(t('add.validationTitle'), t('add.validationMsg'));
      return;
    }
    await addItem(sub.values, sub.photos);
    if (isOnboarding) {
      completeOnboarding();
      router.replace('/home');
      return;
    }
    if (keepOpen) {
      setFormKey((k) => k + 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.screen}>
      <ModalHeader
        title={t('add.title')}
        onLeft={() => {
          if (isOnboarding) { completeOnboarding(); router.replace('/home'); }
          else router.back();
        }}
        onRight={() => save(false)}
      />
      {isOnboarding && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>✦ {t('onboarding.hint')}</Text>
        </View>
      )}
      <FormScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <ProductForm key={formKey} ref={formRef} onRequestPro={() => router.push('/paywall')} />
        <View style={styles.actions}>
          <Button label={t('common.save')} variant="primary" block onPress={() => save(false)} />
          {!isOnboarding && (
            <Button label={t('add.addAnother')} variant="ghost" block textColor={colors.primary} onPress={() => save(true)} style={{ marginTop: 10 }} />
          )}
        </View>
      </FormScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hint: { backgroundColor: colors.primarySoft, paddingHorizontal: 16, paddingVertical: 10 },
  hintText: { fontSize: 13, color: colors.primary, fontWeight: '600', textAlign: 'center' },
  actions: { paddingHorizontal: 16, paddingTop: 20 },
});
