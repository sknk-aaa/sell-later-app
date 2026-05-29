import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { ImageField } from './ImageField';
import { PickerSheet } from './PickerSheet';
import { CONDITIONS, CONDITION_LABEL } from '@/constants/conditions';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { STATUS } from '@/theme/status';
import { colors, numFont, type StatusKind } from '@/theme/tokens';
import type { ItemCondition } from '@/db/schema';
import type { ItemInput, PhotoValue } from '@/stores/useItemStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { expectedProfit, feeAmount, profitRate } from '@/utils/calculations';
import { yen } from '@/utils/format';

export type ProductFormHandle = {
  getSubmission: () => { values: ItemInput; photo: PhotoValue } | null;
};

type Props = {
  initial?: Partial<ItemInput>;
  initialPhoto?: PhotoValue;
  onValidityChange?: (valid: boolean) => void;
};

const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');
const toNum = (s: string) => Number(onlyDigits(s) || '0');

export const ProductForm = React.forwardRef<ProductFormHandle, Props>(function ProductForm(
  { initial, initialPhoto, onValidityChange },
  ref,
) {
  const feeRate = useSettingsStore((s) => s.feeRate);
  const categories = useCategoryStore((s) => s.categories);

  const [name, setName] = React.useState(initial?.name ?? '');
  const [category, setCategory] = React.useState(initial?.category ?? '');
  const [purchasePrice, setPurchasePrice] = React.useState(
    initial?.purchasePrice != null ? String(initial.purchasePrice) : '',
  );
  const [sellPrice, setSellPrice] = React.useState(
    initial?.expectedPrice != null ? String(initial.expectedPrice) : '',
  );
  const [shipping, setShipping] = React.useState(
    initial?.shippingFee != null ? String(initial.shippingFee) : '0',
  );
  const [condition, setCondition] = React.useState<ItemCondition>(initial?.condition ?? 'new');
  const [status, setStatus] = React.useState<StatusKind>(initial?.status ?? 'stored');
  const [location, setLocation] = React.useState(initial?.location ?? '');
  const [memo, setMemo] = React.useState(initial?.memo ?? '');
  const [photo, setPhoto] = React.useState<PhotoValue>(initialPhoto ?? { kind: 'none' });
  const [picker, setPicker] = React.useState<null | 'category' | 'condition' | 'status'>(null);

  const sellNum = toNum(sellPrice);
  const shipNum = toNum(shipping);
  const fee = feeAmount(sellNum, feeRate);
  const profit = expectedProfit(sellNum, feeRate, shipNum);
  const rate = profitRate(sellNum, profit);

  const valid = name.trim().length > 0 && category.length > 0 && sellNum > 0;

  React.useEffect(() => {
    onValidityChange?.(valid);
  }, [valid, onValidityChange]);

  React.useImperativeHandle(ref, () => ({
    getSubmission: () => {
      if (!valid) return null;
      const values: ItemInput = {
        name: name.trim(),
        category,
        purchasePrice: purchasePrice.trim() ? toNum(purchasePrice) : null,
        expectedPrice: sellNum,
        shippingFee: shipNum,
        location: location.trim() || null,
        condition,
        status,
        memo: memo.trim() || null,
      };
      return { values, photo };
    },
  }));

  return (
    <View>
      <ImageField photo={photo} onChange={setPhoto} />

      {/* 商品名 */}
      <View style={styles.field}>
        <FieldLabel label="商品名" required />
        <View style={styles.inputBox}>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={100}
            placeholder="商品名を入力"
            placeholderTextColor={colors.ink4}
            style={styles.input}
          />
          <Text style={styles.counter}>{name.length}/100</Text>
        </View>
      </View>

      {/* カテゴリ */}
      <View style={styles.field}>
        <FieldLabel label="カテゴリ" required />
        <Pressable style={styles.selectBox} onPress={() => setPicker('category')}>
          <View style={styles.selectIcon}><Icon name="tag" size={16} color={colors.primary} /></View>
          <Text style={[styles.selectText, !category && styles.placeholder]}>
            {category || '選択してください'}
          </Text>
          <Icon name="chevR" size={16} color={colors.ink4} />
        </Pressable>
      </View>

      {/* 価格情報 */}
      <View style={styles.fieldLg}>
        <Text style={styles.sectionTitle}>価格情報</Text>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <PriceInput label="購入価格" help value={purchasePrice} onChange={setPurchasePrice} />
            <PriceInput label="見込み売却価格" required value={sellPrice} onChange={setSellPrice} />
            <PriceInput label="送料" required value={shipping} onChange={setShipping} />
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <DerivedField label="メルカリ手数料 (10%)" value={`-${yen(fee)}`} />
            <DerivedField label="見込み利益" help value={yen(profit)} profit />
            <DerivedField label="利益率" help value={`${rate.toFixed(1)}%`} />
          </View>
        </View>
      </View>

      {/* 商品の詳細 */}
      <View style={styles.fieldLg}>
        <Text style={styles.sectionTitle}>商品の詳細</Text>
        <View style={styles.listCard}>
          <Pressable style={[styles.detailRow, styles.detailRowBorder]} onPress={() => setPicker('condition')}>
            <View style={styles.detailIcon}><Icon name="star" size={15} color={colors.primary} /></View>
            <Text style={styles.detailLabel}>状態</Text>
            <RequiredBadge small />
            <Text style={styles.rowValue}>{CONDITION_LABEL[condition]}</Text>
            <Icon name="chevR" size={14} color={colors.ink4} />
          </Pressable>

          <Pressable style={[styles.detailRow, styles.detailRowBorder]} onPress={() => setPicker('status')}>
            <View style={styles.detailIcon}><Icon name="flag" size={15} color={colors.primary} /></View>
            <Text style={styles.detailLabel}>ステータス</Text>
            <RequiredBadge small />
            <View style={styles.statusValue}>
              <View style={[styles.dot, { backgroundColor: STATUS[status].dotColor }]} />
              <Text style={styles.rowValue}>{STATUS[status].label}</Text>
            </View>
            <Icon name="chevR" size={14} color={colors.ink4} />
          </Pressable>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><Icon name="calendar" size={15} color={colors.primary} /></View>
            <Text style={styles.detailLabel}>保管場所</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="任意"
              placeholderTextColor={colors.ink4}
              style={styles.inlineInput}
            />
          </View>
        </View>
      </View>

      {/* メモ */}
      <View style={styles.fieldLg}>
        <FieldLabel label="メモ" />
        <View style={styles.memoBox}>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="任意（自由に入力できます）"
            placeholderTextColor={colors.ink4}
            multiline
            style={styles.memoInput}
          />
        </View>
      </View>

      <PickerSheet
        visible={picker === 'category'}
        title="カテゴリを選択"
        options={categories.map((c) => ({ key: c.name, label: c.name }))}
        selectedKey={category}
        onSelect={(k) => setCategory(k)}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'condition'}
        title="状態を選択"
        options={CONDITIONS.map((c) => ({ key: c.key, label: c.label }))}
        selectedKey={condition}
        onSelect={(k) => setCondition(k as ItemCondition)}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'status'}
        title="ステータスを選択"
        options={(['stored', 'prep', 'listed', 'sold', 'hold'] as StatusKind[]).map((k) => ({
          key: k,
          label: STATUS[k].label,
        }))}
        selectedKey={status}
        onSelect={(k) => setStatus(k as StatusKind)}
        onClose={() => setPicker(null)}
      />
    </View>
  );
});

function RequiredBadge({ small }: { small?: boolean }) {
  return (
    <View style={[styles.reqBadge, small && styles.reqBadgeSm]}>
      <Text style={[styles.reqText, small && styles.reqTextSm]}>必須</Text>
    </View>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {required && <RequiredBadge />}
    </View>
  );
}

function PriceInput({
  label, value, onChange, required, help,
}: {
  label: string; value: string; onChange: (t: string) => void; required?: boolean; help?: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.priceLabelRow}>
        <Text style={styles.priceLabel} numberOfLines={1}>{label}</Text>
        {help && <Icon name="helpCircle" size={11} color={colors.ink4} />}
        {required && <RequiredBadge small />}
      </View>
      <View style={styles.priceValueBox}>
        <Text style={styles.yenMark}>¥</Text>
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.ink4}
          style={styles.priceInput}
        />
      </View>
    </View>
  );
}

function DerivedField({ label, value, profit, help }: { label: string; value: string; profit?: boolean; help?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.derivedLabelRow}>
        <Text style={styles.derivedLabel}>{label}</Text>
        {help && <Icon name="helpCircle" size={11} color={colors.ink4} />}
      </View>
      <Text style={[styles.derivedValue, profit && { color: colors.profit }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { paddingHorizontal: 16, paddingTop: 14 },
  fieldLg: { paddingHorizontal: 16, paddingTop: 20 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: colors.ink1 },

  inputBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, fontSize: 15, color: colors.ink1, padding: 0 },
  counter: { fontSize: 11, color: colors.ink3 },

  selectBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  selectText: { flex: 1, fontSize: 15, color: colors.ink1 },
  placeholder: { color: colors.ink4 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink1, marginBottom: 10 },
  priceBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  priceRow: { flexDirection: 'row', gap: 10 },
  priceDivider: { height: 1, backgroundColor: colors.divider, marginVertical: 14, marginHorizontal: -14 },
  priceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  priceLabel: { flex: 1, fontSize: 10, color: colors.ink3 },
  priceValueBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 2 },
  yenMark: { fontSize: 14, fontWeight: '600', color: colors.ink1, ...numFont },
  priceInput: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink1, padding: 0, ...numFont },

  derivedLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 },
  derivedLabel: { fontSize: 11, color: colors.ink3 },
  derivedValue: { textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.ink1, ...numFont },

  listCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { flex: 1, fontSize: 15, color: colors.ink1 },
  rowValue: { fontSize: 14, color: colors.ink1 },
  inlineInput: { fontSize: 14, color: colors.ink1, textAlign: 'right', minWidth: 120, padding: 0 },
  statusValue: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 99, marginRight: 6 },

  memoBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  memoInput: { fontSize: 15, color: colors.ink1, minHeight: 72, padding: 0, textAlignVertical: 'top' },

  reqBadge: { height: 18, paddingHorizontal: 6, borderRadius: 4, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  reqBadgeSm: { height: 16 },
  reqText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  reqTextSm: { fontSize: 9 },
});
