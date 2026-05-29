import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { colors, numFont, type StatusKind } from '@/theme/tokens';
import { STATUS } from '@/theme/status';
import { yen } from '@/utils/format';

// Add.jsx のフォームを移植。Add / Edit 画面で共用。
export type ProductFormValues = {
  name: string;
  category: string;
  purchasePrice: number;
  sellPrice: number;
  shipping: number;
  condition: string;
  status: StatusKind;
  place: string;
  photos: number;
};

const DEFAULTS: ProductFormValues = {
  name: 'AirPods Pro 第2世代',
  category: '家電',
  purchasePrice: 0,
  sellPrice: 24800,
  shipping: 1000,
  condition: '新品未使用',
  status: 'prep',
  place: 'リビング棚',
  photos: 3,
};

export function ProductForm({ initial }: { initial?: Partial<ProductFormValues> }) {
  const v = { ...DEFAULTS, ...initial };
  const [name, setName] = React.useState(v.name);

  const fee = Math.round(v.sellPrice * 0.1);
  const profit = v.sellPrice - fee - v.shipping;
  const profitRate = ((profit / v.sellPrice) * 100).toFixed(1);

  return (
    <View>
      {/* 写真 */}
      <View style={styles.photoSection}>
        <View style={styles.photoHead}>
          <View style={styles.photoHeadLeft}>
            <Text style={styles.sectionLabel}>写真</Text>
            <Text style={styles.hintInline}>(最大10枚)</Text>
            <RequiredBadge />
          </View>
          <Pressable hitSlop={8}><Text style={styles.linkSm}>並び替え</Text></Pressable>
        </View>
        <View style={styles.photoGrid}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.photoCell}>
              <PhotoSlot label={`photo${i}`} ratio={1} radius={10} />
              <View style={styles.photoClose}>
                <Icon name="closeCircle" size={22} />
              </View>
            </View>
          ))}
          <Pressable style={styles.addPhoto}>
            <View style={styles.addPhotoCircle}><Icon name="plus" size={18} color="#fff" /></View>
            <Text style={styles.addPhotoText}>追加</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>長押しで並び替えができます</Text>
      </View>

      {/* 商品名 */}
      <View style={styles.field}>
        <FieldLabel label="商品名" required />
        <View style={styles.inputBox}>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
          <Text style={styles.counter}>{name.length}/100</Text>
        </View>
      </View>

      {/* カテゴリ */}
      <View style={styles.field}>
        <FieldLabel label="カテゴリ" required />
        <Pressable style={styles.selectBox}>
          <View style={styles.selectIcon}><Icon name="tag" size={16} color={colors.primary} /></View>
          <Text style={styles.selectText}>{v.category}</Text>
          <Icon name="chevR" size={16} color={colors.ink4} />
        </Pressable>
      </View>

      {/* 価格情報 */}
      <View style={styles.fieldLg}>
        <Text style={styles.sectionTitle}>価格情報</Text>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <PriceField label="購入価格" help value={yen(v.purchasePrice)} />
            <PriceField label="見込み売却価格" required value={yen(v.sellPrice)} />
            <PriceField label="送料" required value={yen(v.shipping)} />
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <DerivedField label="メルカリ手数料 (10%)" value={`-${yen(fee)}`} />
            <DerivedField label="見込み利益" help value={yen(profit)} profit />
            <DerivedField label="利益率" help value={`${profitRate}%`} />
          </View>
        </View>
      </View>

      {/* 商品の詳細 */}
      <View style={styles.fieldLg}>
        <Text style={styles.sectionTitle}>商品の詳細</Text>
        <View style={styles.listCard}>
          <DetailRow icon="star" label="状態" required value={<Text style={styles.rowValue}>{v.condition}</Text>} />
          <DetailRow
            icon="flag"
            label="ステータス"
            required
            value={
              <View style={styles.statusValue}>
                <View style={[styles.dot, { backgroundColor: STATUS[v.status].dotColor }]} />
                <Text style={styles.rowValue}>{STATUS[v.status].label}</Text>
              </View>
            }
          />
          <DetailRow icon="calendar" label="保管場所" value={<Text style={styles.rowValue}>{v.place}</Text>} />
          <DetailRow icon="note" label="メモ" value={<Text style={styles.placeholder}>任意（自由に入力できます）</Text>} isLast />
        </View>
      </View>
    </View>
  );
}

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

function PriceField({ label, value, required, help }: { label: string; value: string; required?: boolean; help?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.priceLabelRow}>
        <Text style={styles.priceLabel} numberOfLines={1}>{label}</Text>
        {help && <Icon name="helpCircle" size={11} color={colors.ink4} />}
        {required && <RequiredBadge small />}
      </View>
      <View style={styles.priceValueBox}>
        <Text style={styles.priceValue}>{value}</Text>
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

function DetailRow({ icon, label, value, required, isLast }: { icon: IconName; label: string; value: React.ReactNode; required?: boolean; isLast?: boolean }) {
  return (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
      <View style={styles.detailIcon}><Icon name={icon} size={15} color={colors.primary} /></View>
      <Text style={styles.detailLabel}>{label}</Text>
      {required && <RequiredBadge small />}
      {value}
      <Icon name="chevR" size={14} color={colors.ink4} />
    </View>
  );
}

const styles = StyleSheet.create({
  photoSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  photoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  photoHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.ink1 },
  hintInline: { fontSize: 12, color: colors.ink3 },
  linkSm: { fontSize: 13, color: colors.primary },
  photoGrid: { flexDirection: 'row', gap: 10 },
  photoCell: { flex: 1, position: 'relative' },
  photoClose: { position: 'absolute', top: 4, right: 4, width: 22, height: 22 },
  addPhoto: { flex: 1, aspectRatio: 1, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addPhotoCircle: { width: 28, height: 28, borderRadius: 99, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addPhotoText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  hint: { fontSize: 11, color: colors.ink3, marginTop: 6 },

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

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink1, marginBottom: 10 },
  priceBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  priceRow: { flexDirection: 'row', gap: 10 },
  priceDivider: { height: 1, backgroundColor: colors.divider, marginVertical: 14, marginHorizontal: -14 },
  priceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  priceLabel: { flex: 1, fontSize: 10, color: colors.ink3 },
  priceValueBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 },
  priceValue: { fontSize: 15, fontWeight: '600', color: colors.ink1, ...numFont },

  derivedLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 },
  derivedLabel: { fontSize: 11, color: colors.ink3 },
  derivedValue: { textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.ink1, ...numFont },

  listCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { flex: 1, fontSize: 15, color: colors.ink1 },
  rowValue: { fontSize: 14, color: colors.ink1 },
  placeholder: { fontSize: 14, color: colors.ink3 },
  statusValue: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 99, marginRight: 6 },

  reqBadge: { height: 18, paddingHorizontal: 6, borderRadius: 4, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  reqBadgeSm: { height: 16 },
  reqText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  reqTextSm: { fontSize: 9 },
});
