import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { ModalHeader } from '@/components/headers';
import { Button } from '@/components/ui';
import { useItemStore } from '@/stores/useItemStore';
import { useItemViewModel } from '@/stores/selectors';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { actualProfit, feeAmount } from '@/utils/calculations';
import { colors, numFont } from '@/theme/tokens';
import { formatDate, yen } from '@/utils/format';

const toNum = (s: string) => Number(s.replace(/[^0-9]/g, '') || '0');

export default function SaleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const vm = useItemViewModel(itemId);
  const feeRate = useSettingsStore((s) => s.feeRate);
  const recordSale = useItemStore((s) => s.recordSale);

  const [price, setPrice] = React.useState(vm ? String(vm.expectedPrice) : '');
  const [shipping, setShipping] = React.useState(vm ? String(vm.shippingFee) : '0');
  const [soldAt, setSoldAt] = React.useState(() => new Date());
  const [showPicker, setShowPicker] = React.useState(false);

  const onChangeDate = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (e.type === 'set' && d) setSoldAt(d);
  };

  if (!vm) {
    return (
      <View style={styles.screen}>
        <ModalHeader title="売却記録" onLeft={() => router.back()} rightLabel="" />
        <View style={styles.empty}><Text style={styles.emptyText}>商品が見つかりません</Text></View>
      </View>
    );
  }

  const priceNum = toNum(price);
  const shipNum = toNum(shipping);
  const fee = feeAmount(priceNum, feeRate);
  const profit = actualProfit(priceNum, feeRate, shipNum);

  const save = () => {
    recordSale(vm.id, { actualPrice: priceNum, actualShipping: shipNum, soldAt }, feeRate);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ModalHeader title="売却記録" onLeft={() => router.back()} onRight={save} rightBold />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
      >
        <Text style={styles.caption}>「{vm.name}」を売却済みとして記録します。</Text>

        <View style={styles.card}>
          <MoneyField label="実際の売却価格" value={price} onChange={setPrice} />
          <View style={styles.divider} />
          <MoneyField label="実送料" value={shipping} onChange={setShipping} />
          <View style={styles.divider} />
          <Pressable style={styles.fieldRow} onPress={() => setShowPicker((v) => !v)}>
            <Text style={styles.fieldLabel}>売却日</Text>
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

        {/* 実利益プレビュー */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.profitLabel}>メルカリ手数料 (10%)</Text>
            <Text style={styles.profitMinor}>-{yen(fee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Text style={styles.profitLabelMain}>実利益</Text>
            <Text style={styles.profitValue}>{yen(profit)}</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button label="売却を記録する" variant="primary" block onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (t: string) => void }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.reqBadge}><Text style={styles.reqText}>必須</Text></View>
      </View>
      <View style={styles.moneyInputWrap}>
        <Text style={styles.yenMark}>¥</Text>
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
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
