import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { ImageField } from './ImageField';
import { PickerSheet } from './PickerSheet';
import { CONDITIONS } from '@/constants/conditions';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useTranslation } from '@/i18n';
import { STATUS } from '@/theme/status';
import { colors, numFont, type StatusKind } from '@/theme/tokens';
import type { ItemCondition } from '@/db/schema';
import type { ItemInput, PhotoValue } from '@/stores/useItemStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { expectedProfit, feeAmount, profitRate } from '@/utils/calculations';
import { photoLimit } from '@/utils/limits';
import { yen } from '@/utils/format';

export type ProductFormHandle = {
  getSubmission: () => { values: ItemInput; photos: PhotoValue[] } | null;
};

type Props = {
  initial?: Partial<ItemInput>;
  initialPhotos?: PhotoValue[];
  onValidityChange?: (valid: boolean) => void;
  onRequestPro?: () => void;
};

const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');
const toNum = (s: string) => Number(onlyDigits(s) || '0');

export const ProductForm = React.forwardRef<ProductFormHandle, Props>(function ProductForm(
  { initial, initialPhotos, onValidityChange, onRequestPro },
  ref,
) {
  const { t } = useTranslation();
  const feeRate = useSettingsStore((s) => s.feeRate);
  const isPro = useSettingsStore((s) => s.isPro);
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
  const [photos, setPhotos] = React.useState<PhotoValue[]>(initialPhotos ?? []);
  const [picker, setPicker] = React.useState<null | 'category' | 'condition' | 'status'>(null);

  const sellNum = toNum(sellPrice);
  const shipNum = toNum(shipping);
  const fee = feeAmount(sellNum, feeRate);
  const profit = expectedProfit(sellNum, feeRate, shipNum);
  const rate = profitRate(sellNum, profit);

  const valid = name.trim().length > 0 && sellNum > 0;

  React.useEffect(() => {
    onValidityChange?.(valid);
  }, [valid, onValidityChange]);

  React.useImperativeHandle(ref, () => ({
    getSubmission: () => {
      if (!valid) return null;
      const values: ItemInput = {
        name: name.trim(),
        category: category || t('form.selectCategory'),
        purchasePrice: purchasePrice.trim() ? toNum(purchasePrice) : null,
        expectedPrice: sellNum,
        shippingFee: shipNum,
        location: location.trim() || null,
        condition,
        status,
        memo: memo.trim() || null,
      };
      return { values, photos };
    },
  }));

  const feeRatePct = Math.round(feeRate * 100);

  return (
    <View>
      <ImageField
        photos={photos}
        onChange={setPhotos}
        maxPhotos={photoLimit(isPro)}
        isPro={isPro}
        onLocked={() => onRequestPro?.()}
      />

      {/* Item name */}
      <View style={styles.field}>
        <FieldLabel label={t('form.itemName')} required />
        <View style={styles.inputBox}>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={100}
            placeholder={t('form.itemNamePlaceholder')}
            placeholderTextColor={colors.ink4}
            style={styles.input}
          />
          <Text style={styles.counter}>{name.length}/100</Text>
        </View>
      </View>

      {/* Category */}
      <View style={styles.field}>
        <FieldLabel label={t('form.category')} />
        <Pressable style={styles.selectBox} onPress={() => setPicker('category')}>
          <View style={styles.selectIcon}><Icon name="tag" size={16} color={colors.primary} /></View>
          <Text style={[styles.selectText, !category && styles.placeholder]}>
            {category || t('form.selectCategory')}
          </Text>
          <Icon name="chevR" size={16} color={colors.ink4} />
        </Pressable>
      </View>

      {/* Pricing */}
      <View style={styles.fieldLg}>
        <Text style={styles.sectionTitle}>{t('form.pricing')}</Text>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <PriceInput label={t('form.purchasePrice')} help value={purchasePrice} onChange={setPurchasePrice} />
            <PriceInput label={t('form.sellPrice')} required value={sellPrice} onChange={setSellPrice} />
            <PriceInput label={t('form.shipping')} required value={shipping} onChange={setShipping} />
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <DerivedField label={t('form.fee', { rate: feeRatePct })} value={`-${yen(fee)}`} />
            <DerivedField label={t('form.estProfit')} help value={yen(profit)} profit />
            <DerivedField label={t('form.profitRate')} help value={`${rate.toFixed(1)}%`} />
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.fieldLg}>
        <Text style={styles.sectionTitle}>{t('form.details')}</Text>
        <View style={styles.listCard}>
          <Pressable style={[styles.detailRow, styles.detailRowBorder]} onPress={() => setPicker('condition')}>
            <View style={styles.detailIcon}><Icon name="star" size={15} color={colors.primary} /></View>
            <Text style={styles.detailLabel}>{t('form.condition')}</Text>
            <RequiredBadge small />
            <Text style={styles.rowValue}>{t(`condition.${condition}`)}</Text>
            <Icon name="chevR" size={14} color={colors.ink4} />
          </Pressable>

          <Pressable style={[styles.detailRow, styles.detailRowBorder]} onPress={() => setPicker('status')}>
            <View style={styles.detailIcon}><Icon name="flag" size={15} color={colors.primary} /></View>
            <Text style={styles.detailLabel}>{t('form.status')}</Text>
            <RequiredBadge small />
            <View style={styles.statusValue}>
              <View style={[styles.dot, { backgroundColor: STATUS[status].dotColor }]} />
              <Text style={styles.rowValue}>{t(`status.${status}`)}</Text>
            </View>
            <Icon name="chevR" size={14} color={colors.ink4} />
          </Pressable>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><Icon name="calendar" size={15} color={colors.primary} /></View>
            <Text style={styles.detailLabel}>{t('form.location')}</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder={t('common.optional')}
              placeholderTextColor={colors.ink4}
              style={styles.inlineInput}
            />
          </View>
        </View>
      </View>

      {/* Memo */}
      <View style={styles.fieldLg}>
        <FieldLabel label={t('form.memo')} />
        <View style={styles.memoBox}>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder={t('form.memoPlaceholder')}
            placeholderTextColor={colors.ink4}
            multiline
            style={styles.memoInput}
          />
        </View>
      </View>

      <PickerSheet
        visible={picker === 'category'}
        title={t('form.category')}
        options={categories.map((c) => ({ key: c.name, label: c.name }))}
        selectedKey={category}
        onSelect={(k) => setCategory(k)}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'condition'}
        title={t('form.condition')}
        options={CONDITIONS.map((c) => ({ key: c.key, label: t(`condition.${c.key}`) }))}
        selectedKey={condition}
        onSelect={(k) => setCondition(k as ItemCondition)}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'status'}
        title={t('form.status')}
        options={(['stored', 'prep', 'listed', 'sold', 'hold'] as StatusKind[]).map((k) => ({
          key: k,
          label: t(`status.${k}`),
        }))}
        selectedKey={status}
        onSelect={(k) => setStatus(k as StatusKind)}
        onClose={() => setPicker(null)}
      />
    </View>
  );
});

function RequiredBadge({ small }: { small?: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.reqBadge, small && styles.reqBadgeSm]}>
      <Text style={[styles.reqText, small && styles.reqTextSm]}>{t('common.required')}</Text>
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

function PriceInput({ label, value, onChange, required, help }: { label: string; value: string; onChange: (t: string) => void; required?: boolean; help?: boolean }) {
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
