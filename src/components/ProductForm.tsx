import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { ImageField } from './ImageField';
import { PickerSheet } from './PickerSheet';
import { CONDITIONS } from '@/constants/conditions';
import { categoryLabel } from '@/constants/categories';
import { PLATFORMS, PLATFORM_BY_ID, type PlatformId } from '@/constants/platforms';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useTranslation } from '@/i18n';
import { useCurrency } from '@/utils/useCurrency';
import { STATUS } from '@/theme/status';
import { colors, numFont, type StatusKind } from '@/theme/tokens';
import type { ItemCondition } from '@/db/schema';
import type { ItemInput, PhotoValue } from '@/stores/useItemStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { feeAmountBps, profitBps, profitRate } from '@/utils/calculations';
import { photoLimit } from '@/utils/limits';

export type ProductFormHandle = {
  getSubmission: () => { values: ItemInput; photos: PhotoValue[] } | null;
};

type Props = {
  initial?: Partial<ItemInput>;
  initialPhotos?: PhotoValue[];
  onValidityChange?: (valid: boolean) => void;
  onRequestPro?: () => void;
};

// rateBps(1325) ↔ percent入力文字列("13.25")
const bpsToStr = (bps: number) => {
  const pct = bps / 100;
  return Number.isInteger(pct) ? String(pct) : String(pct);
};
const strToBps = (s: string) => Math.round((Number(s.replace(/[^0-9.]/g, '') || '0')) * 100);

export const ProductForm = React.forwardRef<ProductFormHandle, Props>(function ProductForm(
  { initial, initialPhotos, onValidityChange, onRequestPro },
  ref,
) {
  const { t } = useTranslation();
  const { fmt, symbol, sanitize, parse, toInput } = useCurrency();
  const isPro = useSettingsStore((s) => s.isPro);
  const defaultPlatform = useSettingsStore((s) => s.defaultPlatform);
  const categories = useCategoryStore((s) => s.categories);

  const initPlatform = (initial?.platform as PlatformId | undefined) ?? defaultPlatform;
  const initPreset = PLATFORM_BY_ID[initPlatform] ?? PLATFORM_BY_ID.ebay;

  const [name, setName] = React.useState(initial?.name ?? '');
  const [category, setCategory] = React.useState(initial?.category ?? '');
  const [purchasePrice, setPurchasePrice] = React.useState(
    initial?.purchasePrice != null ? toInput(initial.purchasePrice) : '',
  );
  const [sellPrice, setSellPrice] = React.useState(
    initial?.expectedPrice != null ? toInput(initial.expectedPrice) : '',
  );
  const [shipping, setShipping] = React.useState(
    initial?.shippingFee != null ? toInput(initial.shippingFee) : '',
  );
  const [platform, setPlatform] = React.useState<PlatformId>(initPlatform);
  const [feeRateStr, setFeeRateStr] = React.useState(
    bpsToStr(initial?.feeRateBps ?? initPreset.rateBps),
  );
  const [feeFixed, setFeeFixed] = React.useState(
    initial?.feeFixedCents != null ? toInput(initial.feeFixedCents) : (initPreset.fixedCents ? toInput(initPreset.fixedCents) : ''),
  );
  const [condition, setCondition] = React.useState<ItemCondition>(initial?.condition ?? 'new');
  const [status, setStatus] = React.useState<StatusKind>(initial?.status ?? 'stored');
  const [location, setLocation] = React.useState(initial?.location ?? '');
  const [memo, setMemo] = React.useState(initial?.memo ?? '');
  const [photos, setPhotos] = React.useState<PhotoValue[]>(initialPhotos ?? []);
  const [picker, setPicker] = React.useState<null | 'category' | 'condition' | 'status' | 'platform'>(null);

  const onSelectPlatform = (id: PlatformId) => {
    setPlatform(id);
    const preset = PLATFORM_BY_ID[id];
    if (id !== 'custom' && preset) {
      setFeeRateStr(bpsToStr(preset.rateBps));
      setFeeFixed(preset.fixedCents ? toInput(preset.fixedCents) : '');
    }
  };

  const sellMinor = parse(sellPrice);
  const shipMinor = parse(shipping);
  const rateBps = strToBps(feeRateStr);
  const fixedCents = parse(feeFixed);
  const fee = feeAmountBps(sellMinor, rateBps, fixedCents);
  const profit = profitBps(sellMinor, rateBps, fixedCents, shipMinor);
  const rate = profitRate(sellMinor, profit);
  const feeRatePct = bpsToStr(rateBps);
  const platformNoteKey = PLATFORM_BY_ID[platform]?.noteKey;

  const valid = name.trim().length > 0 && sellMinor > 0;

  React.useEffect(() => {
    onValidityChange?.(valid);
  }, [valid, onValidityChange]);

  React.useImperativeHandle(ref, () => ({
    getSubmission: () => {
      if (!valid) return null;
      const values: ItemInput = {
        name: name.trim(),
        category: category || t('form.selectCategory'),
        purchasePrice: purchasePrice.trim() ? parse(purchasePrice) : null,
        expectedPrice: sellMinor,
        shippingFee: shipMinor,
        platform,
        feeRateBps: rateBps,
        feeFixedCents: fixedCents,
        location: location.trim() || null,
        condition,
        status,
        memo: memo.trim() || null,
      };
      return { values, photos };
    },
  }));

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
            {category ? categoryLabel(category, t) : t('form.selectCategory')}
          </Text>
          <Icon name="chevR" size={16} color={colors.ink4} />
        </Pressable>
      </View>

      {/* Pricing */}
      <View style={styles.fieldLg}>
        <Text style={styles.sectionTitle}>{t('form.pricing')}</Text>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <PriceInput label={t('form.purchasePrice')} help value={purchasePrice} onChange={setPurchasePrice} symbol={symbol} sanitize={sanitize} />
            <PriceInput label={t('form.sellPrice')} required value={sellPrice} onChange={setSellPrice} symbol={symbol} sanitize={sanitize} />
            <PriceInput label={t('form.shipping')} value={shipping} onChange={setShipping} symbol={symbol} sanitize={sanitize} />
          </View>

          <View style={styles.priceDivider} />

          {/* Platform selector */}
          <Pressable style={styles.platformRow} onPress={() => setPicker('platform')}>
            <View style={styles.selectIcon}><Icon name="bag" size={16} color={colors.primary} /></View>
            <Text style={styles.platformLabel}>{t('form.platform')}</Text>
            <Text style={styles.platformValue}>{t(PLATFORM_BY_ID[platform].labelKey)}</Text>
            <Icon name="chevR" size={16} color={colors.ink4} />
          </Pressable>

          {/* Editable rate / fixed fee */}
          <View style={[styles.priceRow, { marginTop: 12 }]}>
            <RateInput label={t('platform.feeRate')} value={feeRateStr} onChange={(v) => { setFeeRateStr(v); setPlatform('custom'); }} />
            <PriceInput label={t('platform.fixedFee')} value={feeFixed} onChange={(v) => { setFeeFixed(v); setPlatform('custom'); }} symbol={symbol} sanitize={sanitize} />
          </View>

          {platformNoteKey && <Text style={styles.platformNote}>{t(platformNoteKey)}</Text>}

          <View style={styles.priceDivider} />

          <View style={styles.priceRow}>
            <DerivedField label={t('form.fee', { rate: feeRatePct })} value={`-${fmt(fee)}`} />
            <DerivedField label={t('form.estProfit')} help value={fmt(profit)} profit />
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
        options={categories.map((c) => ({ key: c.name, label: categoryLabel(c.name, t) }))}
        selectedKey={category}
        onSelect={(k) => setCategory(k)}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'platform'}
        title={t('platform.title')}
        options={PLATFORMS.map((p) => ({ key: p.id, label: t(p.labelKey) }))}
        selectedKey={platform}
        onSelect={(k) => onSelectPlatform(k as PlatformId)}
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

function PriceInput({ label, value, onChange, required, help, symbol, sanitize }: { label: string; value: string; onChange: (t: string) => void; required?: boolean; help?: boolean; symbol: string; sanitize: (t: string) => string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.priceLabelRow}>
        <Text style={styles.priceLabel} numberOfLines={1}>{label}</Text>
        {help && <Icon name="helpCircle" size={11} color={colors.ink4} />}
        {required && <RequiredBadge small />}
      </View>
      <View style={styles.priceValueBox}>
        <Text style={styles.yenMark}>{symbol}</Text>
        <TextInput
          value={value}
          onChangeText={(tx) => onChange(sanitize(tx))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.ink4}
          style={styles.priceInput}
        />
      </View>
    </View>
  );
}

function RateInput({ label, value, onChange }: { label: string; value: string; onChange: (t: string) => void }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.priceLabelRow}>
        <Text style={styles.priceLabel} numberOfLines={1}>{label}</Text>
      </View>
      <View style={styles.priceValueBox}>
        <TextInput
          value={value}
          onChangeText={(tx) => onChange(tx.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.ink4}
          style={styles.priceInput}
        />
        <Text style={styles.yenMark}>%</Text>
      </View>
    </View>
  );
}

function DerivedField({ label, value, profit, help }: { label: string; value: string; profit?: boolean; help?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.derivedLabelRow}>
        <Text style={styles.derivedLabel} numberOfLines={1}>{label}</Text>
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

  platformRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  platformLabel: { fontSize: 13, color: colors.ink2, fontWeight: '600' },
  platformValue: { flex: 1, fontSize: 14, color: colors.ink1, textAlign: 'right' },
  platformNote: { fontSize: 11, color: colors.ink3, lineHeight: 16, marginTop: 10 },

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
