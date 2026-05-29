import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { ModalHeader } from '@/components/headers';
import { Button } from '@/components/ui';
import { colors, numFont } from '@/theme/tokens';
import { yen } from '@/utils/format';

export default function SaleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const close = () => router.back();

  const [price, setPrice] = React.useState('24800');
  const [shipping, setShipping] = React.useState('1000');
  const [date] = React.useState('2024/05/28');

  const priceNum = Number(price) || 0;
  const shippingNum = Number(shipping) || 0;
  const fee = Math.round(priceNum * 0.1);
  const profit = priceNum - fee - shippingNum;

  return (
    <View style={styles.screen}>
      <ModalHeader title="売却記録" onLeft={close} onRight={close} rightBold />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <Text style={styles.caption}>実際に売れた金額を入力すると、実利益を計算します。</Text>

        <View style={styles.card}>
          <MoneyField label="実際の売却価格" required value={price} onChange={setPrice} />
          <View style={styles.divider} />
          <MoneyField label="実送料" required value={shipping} onChange={setShipping} />
          <View style={styles.divider} />
          <DateField label="売却日" value={date} />
        </View>

        {/* 実利益プレビュー */}
        <View style={styles.profitCard}>
          <View style={styles.profitRow}>
            <Text style={styles.profitLabel}>メルカリ手数料 (10%)</Text>
            <Text style={styles.profitMinor}>-{yen(fee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.profitRow}>
            <Text style={styles.profitLabelMain}>実利益</Text>
            <Text style={styles.profitValue}>{yen(profit)}</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button label="売却を記録する" variant="primary" block onPress={close} />
        </View>
      </ScrollView>
    </View>
  );
}

function MoneyField({ label, value, onChange, required }: { label: string; value: string; onChange: (t: string) => void; required?: boolean }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && (
          <View style={styles.reqBadge}><Text style={styles.reqText}>必須</Text></View>
        )}
      </View>
      <View style={styles.moneyInputWrap}>
        <Text style={styles.yenMark}>¥</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          style={styles.moneyInput}
        />
      </View>
    </View>
  );
}

function DateField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.reqBadge}><Text style={styles.reqText}>必須</Text></View>
      </View>
      <View style={styles.dateValueRow}>
        <Text style={styles.dateValue}>{value}</Text>
        <Icon name="calendar" size={16} color={colors.ink4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  caption: { fontSize: 13, color: colors.ink3, marginBottom: 14, lineHeight: 19 },

  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.divider },

  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel: { fontSize: 15, color: colors.ink1 },

  moneyInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 120, justifyContent: 'flex-end' },
  yenMark: { fontSize: 16, fontWeight: '600', color: colors.ink1, ...numFont },
  moneyInput: { fontSize: 17, fontWeight: '700', color: colors.ink1, textAlign: 'right', minWidth: 80, padding: 0, ...numFont },

  dateValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateValue: { fontSize: 16, color: colors.ink1, ...numFont },

  profitCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 16 },
  profitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  profitLabel: { fontSize: 14, color: colors.ink2 },
  profitMinor: { fontSize: 15, fontWeight: '600', color: colors.ink2, ...numFont },
  profitLabelMain: { fontSize: 15, fontWeight: '700', color: colors.ink1 },
  profitValue: { fontSize: 22, fontWeight: '700', color: colors.profit, ...numFont },

  reqBadge: { height: 18, paddingHorizontal: 6, borderRadius: 4, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  reqText: { fontSize: 10, fontWeight: '600', color: '#fff' },
});
