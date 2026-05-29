import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { StatusBadge } from '@/components/StatusBadge';
import { PhotoSlot } from '@/components/PhotoSlot';
import { Button } from '@/components/ui';
import { DetailHeader } from '@/components/headers';
import { PRODUCTS } from '@/constants/demoData';
import { STATUS } from '@/theme/status';
import { colors, numFont, shadowCard } from '@/theme/tokens';
import { yen } from '@/utils/format';

export default function DetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = PRODUCTS.find((x) => x.id === id) ?? PRODUCTS[0];

  const fee = Math.round(p.price * 0.1);
  const ship = 1000;
  const profitRate = ((p.profit / p.price) * 100).toFixed(1);
  const photoCount = p.photos || 4;
  const [activePhoto, setActivePhoto] = React.useState(0);

  return (
    <View style={styles.screen}>
      <DetailHeader
        title="商品詳細"
        onBack={() => router.back()}
        right={
          <>
            <Pressable hitSlop={8} onPress={() => router.push(`/item/${p.id}/edit`)}>
              <Text style={styles.editLink}>編集</Text>
            </Pressable>
            <Pressable hitSlop={8}><Icon name="more" size={20} color={colors.ink3} /></Pressable>
          </>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Photo carousel */}
        <View style={styles.carousel}>
          <View style={styles.mainPhotoWrap}>
            <PhotoSlot label={`${p.name.split(' ')[0]} main`} ratio={4 / 3} radius={12} />
            <View style={styles.countPill}><Text style={styles.countPillText}>{activePhoto + 1} / {photoCount}</Text></View>
            <View style={styles.starCircle}><Icon name="starFill" size={18} /></View>
          </View>
          <View style={styles.thumbRow}>
            {Array.from({ length: photoCount }).map((_, i) => (
              <Pressable key={i} style={[styles.thumb, i === activePhoto && styles.thumbActive]} onPress={() => setActivePhoto(i)}>
                <PhotoSlot label={`#${i + 1}`} ratio={1} radius={0} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Title + meta */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{p.name}</Text>
          <View style={styles.metaRow}>
            <StatusBadge kind={p.status} />
            <View style={styles.metaItem}><Icon name="calendar" size={13} color={colors.ink3} /><Text style={styles.metaText}>{p.place}</Text></View>
            <View style={styles.metaItem}><Icon name="calendar" size={13} color={colors.ink3} /><Text style={styles.metaText}>登録日: {p.date}</Text></View>
          </View>
        </View>

        {/* Price block */}
        <View style={styles.block}>
          <View style={styles.listCard}>
            <View style={styles.priceColRow}>
              <PriceCol label="見込み売却価格" value={yen(p.price)} />
              <PriceCol label="見込み利益" value={yen(p.profit)} profit help />
              <PriceCol label="利益率" value={`${profitRate}%`} />
            </View>
            <View style={styles.hLine} />
            <View style={[styles.priceColRow, { paddingVertical: 14 }]}>
              <EditableCol label="購入価格" value="¥0" editable />
              <EditableCol label="送料" value={yen(ship)} editable />
              <EditableCol label="メルカリ手数料(10%)" value={`-${yen(fee)}`} />
            </View>
          </View>
        </View>

        {/* Detail rows */}
        <View style={styles.block}>
          <View style={styles.listCard}>
            <DetailListRow icon="tag" label="カテゴリ" value={p.category} />
            <DetailListRow icon="star" label="状態" value="新品未使用" />
            <DetailListRow
              icon="flag"
              label="ステータス"
              valueNode={
                <View style={styles.statusValue}>
                  <View style={[styles.dot, { backgroundColor: STATUS[p.status].dotColor }]} />
                  <Text style={styles.rowValue}>{STATUS[p.status].label}</Text>
                </View>
              }
            />
            <DetailListRow icon="calendar" label="保管場所" value={p.place} />
            <DetailListRow
              icon="note"
              label="メモ"
              multi
              value={'2024年3月にApple Storeで購入。\n開封しましたが、使用せず保管していました。\n付属品・箱すべてあり。'}
              isLast
            />
          </View>
        </View>

        {/* Sale record section */}
        <View style={styles.block}>
          <View style={styles.listCard}>
            <View style={styles.saleHead}>
              <Text style={styles.saleHeadTitle}>売却済みの場合の記録</Text>
              <Pressable style={styles.saleBtn} onPress={() => router.push('/sale')}>
                <Text style={styles.saleBtnText}>売却済みにする</Text>
              </Pressable>
            </View>
            <SaleRow label="実際の売却価格" />
            <SaleRow label="実送料" />
            <SaleRow label="実利益" />
            <SaleRow label="売却日" isLast />
          </View>
        </View>

        {/* Footer actions */}
        <View style={styles.footer}>
          <Button label="分析を見る" variant="ghost" icon="chartLine" textColor={colors.primary} iconColor={colors.primary} style={{ flex: 1 }} />
          <Button label="削除" variant="danger" icon="trash" iconColor="#fff" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function PriceCol({ label, value, profit, help }: { label: string; value: string; profit?: boolean; help?: boolean }) {
  return (
    <View style={styles.priceCol}>
      <View style={styles.priceColLabelRow}>
        <Text style={styles.priceColLabel}>{label}</Text>
        {help && <Icon name="helpCircle" size={11} color={colors.ink4} />}
      </View>
      <Text style={[styles.priceColValue, profit && { color: colors.profit }]}>{value}</Text>
    </View>
  );
}

function EditableCol({ label, value, editable }: { label: string; value: string; editable?: boolean }) {
  return (
    <View style={styles.priceCol}>
      <Text style={styles.editableLabel}>{label}</Text>
      <View style={styles.editableValueRow}>
        <Text style={styles.editableValue}>{value}</Text>
        {editable && <Icon name="pencil" size={13} color={colors.ink4} />}
      </View>
    </View>
  );
}

function DetailListRow({
  icon, label, value, valueNode, isLast, multi,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  isLast?: boolean;
  multi?: boolean;
}) {
  return (
    <View style={[styles.dlRow, multi && styles.dlRowMulti, !isLast && styles.dlRowBorder]}>
      <View style={[styles.dlIcon, multi && { marginTop: 2 }]}><Icon name={icon} size={15} color={colors.primary} /></View>
      <Text style={[styles.dlLabel, multi && styles.dlLabelMulti]}>{label}</Text>
      {valueNode ?? (
        <Text style={[multi ? styles.dlValueMulti : styles.dlValue]}>{value}</Text>
      )}
      <Icon name="chevR" size={14} color={colors.ink4} />
    </View>
  );
}

function SaleRow({ label, isLast }: { label: string; isLast?: boolean }) {
  return (
    <View style={[styles.saleRow, !isLast && styles.dlRowBorder]}>
      <Text style={styles.saleRowLabel}>{label}</Text>
      <Text style={styles.saleRowDash}>-</Text>
      <Icon name="chevR" size={14} color={colors.ink4} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  editLink: { color: colors.primary, fontSize: 17, fontWeight: '600' },

  carousel: { paddingHorizontal: 16, paddingTop: 8 },
  mainPhotoWrap: { borderRadius: 12, overflow: 'hidden' },
  countPill: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99 },
  countPillText: { color: '#fff', fontSize: 12, fontWeight: '600', ...numFont },
  starCircle: {
    position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 99, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2,
  },
  thumbRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  thumb: { flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden' },
  thumbActive: { borderWidth: 2.5, borderColor: colors.primary },

  titleBlock: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.22, color: colors.ink1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.ink3 },

  block: { paddingHorizontal: 16, paddingTop: 16 },
  listCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', ...shadowCard },

  priceColRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 8 },
  priceCol: { flex: 1, alignItems: 'center' },
  priceColLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 4 },
  priceColLabel: { fontSize: 11, color: colors.ink3 },
  priceColValue: { fontSize: 20, fontWeight: '700', color: colors.ink1, ...numFont },
  hLine: { height: 1, backgroundColor: colors.divider },

  editableLabel: { fontSize: 11, color: colors.ink3, marginBottom: 4 },
  editableValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editableValue: { fontSize: 15, fontWeight: '600', color: colors.ink1, ...numFont },

  dlRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  dlRowMulti: { alignItems: 'flex-start' },
  dlRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  dlIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  dlLabel: { flex: 1, fontSize: 15, color: colors.ink1 },
  dlLabelMulti: { flex: 0, width: 70 },
  dlValue: { fontSize: 14, color: colors.ink1, textAlign: 'right' },
  dlValueMulti: { flex: 1, fontSize: 13, color: colors.ink1, lineHeight: 21 },
  statusValue: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 99, marginRight: 6 },
  rowValue: { fontSize: 14, color: colors.ink1 },

  saleHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.divider },
  saleHeadTitle: { fontSize: 15, fontWeight: '700', color: colors.ink1 },
  saleBtn: { backgroundColor: colors.statusSoldBg, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  saleBtnText: { color: colors.profit, fontSize: 12, fontWeight: '600' },
  saleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  saleRowLabel: { flex: 1, fontSize: 14, color: colors.ink1 },
  saleRowDash: { fontSize: 14, color: colors.ink3, marginRight: 6 },

  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 20 },
});
