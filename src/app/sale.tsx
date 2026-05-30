import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { ModalHeader } from '@/components/headers';
import { Button } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useCurrency } from '@/utils/useCurrency';
import { useItemStore } from '@/stores/useItemStore';
import { useItemViewModel } from '@/stores/selectors';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { actualProfit, feeAmount } from '@/utils/calculations';
import { colors, numFont } from '@/theme/tokens';
import { formatDate } from '@/utils/format';

export default function SaleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { fmt, symbol, sanitize, parse, toInput } = useCurrency();
  const insets = useSafeAreaInsets();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const vm = useItemViewModel(itemId);
  const feeRate = useSettingsStore((s) => s.feeRate);
  const recordSale = useItemStore((s) => s.recordSale);

  const [price, setPrice] = React.useState(vm ? toInput(vm.expectedPrice) : '');
  const [shipping, setShipping] = React.useState(vm ? toInput(vm.shippingFee) : '');
  const [soldAt, setSoldAt] = React.useState(() => new Date());
  const [showPicker, setShowPicker] = React.useState(false);

  const onChangeDate = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (e.type === 'set' && d) setSoldAt(d);
  };

  if (!vm) {
    return (
      <View style={styles.screen}>
        <ModalHeader title={t('sale.title')} rightLabel="" onLeft={() => router.back()} />
        <View style={styles.empty}><Text style={styles.emptyText}>{t('sale.notFound')}</Text></View>
      </View>
    );
  }

  const priceMinor = parse(price);
  const shipMinor = parse(shipping);
  const fee = feeAmount(priceMinor, feeRate);
  const profit = actualProfit(priceMinor, feeRate, shipMinor);
  const feeRatePct = Math.round(feeRate * 100);

  const save = () => {
    recordSale(vm.id, { actualPrice: priceMinor, actualShipping: shipMinor, soldAt }, feeRate);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ModalHeader title={t('sale.title')} onLeft={() => router.back()} onRight={save} rightBold />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
      >
        <Text style={styles.caption}>{t('sale.caption', { name: vm.name })}</Text>

        <View style={styles.card}>
          <MoneyField label={t('sale.actualPrice')} value={price} onChange={setPrice} required={t('common.required')} symbol={symbol} sanitize={sanitize} />
          <View style={styles.divider} />
          <MoneyField label={t('sale.actualShipping')} value={shipping} onChange={setShipping} required={t('common.required')} symbol={symbol} sanitize={sanitize} />
          <View style={styles.divider} />
          <Pressable style={styles.fieldRow} onPress={() => setShowPicker((v) => !v)}>
            <Text style={styles.fieldLabel}>{t('sale.date')}</Text>
            <View style={styles.dateValueRow}>
              <Text style={styles.dateValue}>{formatDate(soldAt)}</Text>
              <Icon name="calendar" size={16} color={colors.ink4} />
            </View>
          </Pressable>
          {showPicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={soldAt}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={new Date()}
                onChange={onChangeDate}
              />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.profitLabel}>{t('sale.fee', { rate: feeRatePct })}</Text>
            <Text style={styles.profitMinor}>-{fmt(fee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Text style={styles.profitLabelMain}>{t('sale.actualProfit')}</Text>
            <Text style={styles.profitValue}>{fmt(profit)}</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button label={t('sale.record')} variant="primary" block onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

function MoneyField({ label, value, onChange, required, symbol, sanitize }: { label: string; value: string; onChange: (t: string) => void; required: string; symbol: string; sanitize: (t: string) => string }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.reqBadge}><Text style={styles.reqText}>{required}</Text></View>
      </View>
      <View style={styles.moneyInputWrap}>
        <Text style={styles.yenMark}>{symbol}</Text>
        <TextInput
          value={value}
          onChangeText={(tx) => onChange(sanitize(tx))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.ink4}
          style={styles.moneyInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: colors.ink3 },
  caption: { fontSize: 13, color: colors.ink3, marginBottom: 14, lineHeight: 19 },

  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 16 },
  divider: { height: 1, backgroundColor: colors.divider },

  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel: { fontSize: 15, color: colors.ink1 },

  moneyInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 120, justifyContent: 'flex-end' },
  yenMark: { fontSize: 16, fontWeight: '600', color: colors.ink1, ...numFont },
  moneyInput: { fontSize: 17, fontWeight: '700', color: colors.ink1, textAlign: 'right', minWidth: 80, padding: 0, ...numFont },

  dateValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateValue: { fontSize: 16, color: colors.ink1, ...numFont },
  pickerWrap: { borderTopWidth: 1, borderTopColor: colors.divider, paddingHorizontal: 8 },

  profitLabel: { fontSize: 14, color: colors.ink2 },
  profitMinor: { fontSize: 15, fontWeight: '600', color: colors.ink2, ...numFont },
  profitLabelMain: { fontSize: 15, fontWeight: '700', color: colors.ink1 },
  profitValue: { fontSize: 22, fontWeight: '700', color: colors.profit, ...numFont },

  reqBadge: { height: 18, paddingHorizontal: 6, borderRadius: 4, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  reqText: { fontSize: 10, fontWeight: '600', color: '#fff' },
});
