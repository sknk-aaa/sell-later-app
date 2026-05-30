import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/Icon';
import { StatusBadge } from '@/components/StatusBadge';
import { PhotoSlot } from '@/components/PhotoSlot';
import { Button } from '@/components/ui';
import { DetailHeader } from '@/components/headers';
import { useTranslation } from '@/i18n';
import { useCurrency } from '@/utils/useCurrency';
import { useItemStore } from '@/stores/useItemStore';
import { useItemViewModel } from '@/stores/selectors';
import { STATUS } from '@/theme/status';
import { colors, numFont, shadowCard } from '@/theme/tokens';
import { feeAmountBps, profitRate } from '@/utils/calculations';
import { bpsToPercentLabel } from '@/constants/platforms';
import { formatDate } from '@/utils/format';

export default function DetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useItemViewModel(id);
  const toggleFavorite = useItemStore((s) => s.toggleFavorite);
  const deleteItem = useItemStore((s) => s.deleteItem);
  const [activePhoto, setActivePhoto] = React.useState(0);

  if (!vm) {
    return (
      <View style={styles.screen}>
        <DetailHeader title={t('item.title')} onBack={() => router.back()} />
        <View style={styles.empty}><Text style={styles.emptyText}>{t('item.notFound')}</Text></View>
      </View>
    );
  }

  const fee = feeAmountBps(vm.expectedPrice, vm.feeRateBps, vm.feeFixedCents);
  const profit = vm.expectedProfit;
  const rate = profitRate(vm.expectedPrice, profit);
  const isSold = vm.status === 'sold';
  const photos = vm.imagePaths;
  const active = Math.min(activePhoto, Math.max(0, photos.length - 1));
  const feeRatePct = bpsToPercentLabel(vm.feeRateBps);

  const onDelete = () => {
    Alert.alert(t('item.deleteTitle'), t('item.deleteMsg', { name: vm.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { deleteItem(vm.id); router.back(); } },
    ]);
  };

  return (
    <View style={styles.screen}>
      <DetailHeader
        title={t('item.title')}
        onBack={() => router.back()}
        right={
          <Pressable hitSlop={8} onPress={() => router.push(`/item/${vm.id}/edit`)}>
            <Text style={styles.editLink}>{t('item.edit')}</Text>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.photoBlock}>
          <View style={styles.mainPhotoWrap}>
            {photos.length > 0 ? (
              <Image source={{ uri: photos[active] }} style={styles.mainImage} />
            ) : (
              <PhotoSlot label={vm.name.split(' ')[0]} ratio={4 / 3} radius={12} />
            )}
            {photos.length > 1 && (
              <View style={styles.countPill}><Text style={styles.countPillText}>{active + 1} / {photos.length}</Text></View>
            )}
            <Pressable style={styles.starCircle} hitSlop={6} onPress={() => toggleFavorite(vm.id)}>
              <Icon name={vm.isFavorite ? 'starFill' : 'star'} size={18} color={vm.isFavorite ? undefined : colors.ink3} />
            </Pressable>
          </View>
          {photos.length > 1 && (
            <View style={styles.thumbRow}>
              {photos.map((p, i) => (
                <Pressable key={i} style={[styles.thumb, i === active && styles.thumbActive]} onPress={() => setActivePhoto(i)}>
                  <Image source={{ uri: p }} style={styles.thumbImg} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{vm.name}</Text>
          <View style={styles.metaRow}>
            <StatusBadge kind={vm.status} />
            {!!vm.location && (
              <View style={styles.metaItem}><Icon name="folder" size={13} color={colors.ink3} /><Text style={styles.metaText}>{vm.location}</Text></View>
            )}
            <View style={styles.metaItem}><Icon name="calendar" size={13} color={colors.ink3} /><Text style={styles.metaText}>{t('item.registeredAt')}: {formatDate(vm.createdAt)}</Text></View>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.listCard}>
            <View style={styles.priceColRow}>
              <PriceCol label={t('item.estSalePrice')} value={fmt(vm.expectedPrice)} />
              <PriceCol label={t('item.estProfit')} value={fmt(profit)} profit help />
              <PriceCol label={t('item.profitRate')} value={`${rate.toFixed(1)}%`} />
            </View>
            <View style={styles.hLine} />
            <View style={[styles.priceColRow, { paddingVertical: 14 }]}>
              <SmallCol label={t('item.purchasePrice')} value={fmt(vm.purchasePrice ?? 0)} />
              <SmallCol label={t('item.shipping')} value={fmt(vm.shippingFee)} />
              <SmallCol label={t('item.fee', { rate: feeRatePct })} value={`-${fmt(fee)}`} />
            </View>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.listCard}>
            <DetailListRow icon="tag" label={t('item.category')} value={vm.category} />
            <DetailListRow icon="star" label={t('item.condition')} value={t(`condition.${vm.condition}`)} />
            <DetailListRow
              icon="flag"
              label={t('item.status')}
              valueNode={
                <View style={styles.statusValue}>
                  <View style={[styles.dot, { backgroundColor: STATUS[vm.status].dotColor }]} />
                  <Text style={styles.rowValue}>{t(`status.${vm.status}`)}</Text>
                </View>
              }
            />
            <DetailListRow icon="calendar" label={t('item.location')} value={vm.location || '-'} />
            <DetailListRow icon="note" label={t('item.notes')} multi value={vm.memo || '-'} isLast />
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.listCard}>
            <View style={styles.saleHead}>
              <Text style={styles.saleHeadTitle}>{t('item.saleRecord')}</Text>
              {!isSold && (
                <Pressable style={styles.saleBtn} onPress={() => router.push(`/sale?itemId=${vm.id}`)}>
                  <Text style={styles.saleBtnText}>{t('item.markSold')}</Text>
                </Pressable>
              )}
            </View>
            <SaleRow label={t('item.actualPrice')} value={vm.sale ? fmt(vm.sale.actualPrice) : '-'} />
            <SaleRow label={t('item.actualShipping')} value={vm.sale ? fmt(vm.sale.actualShippingFee) : '-'} />
            <SaleRow label={t('item.actualProfit')} value={vm.sale ? fmt(vm.sale.actualProfit) : '-'} profit={!!vm.sale} />
            <SaleRow label={t('item.soldAt')} value={vm.sale ? formatDate(vm.sale.soldAt) : '-'} isLast />
          </View>
        </View>

        <View style={styles.footer}>
          <Button label={t('item.viewAnalytics')} variant="ghost" icon="chartLine" textColor={colors.primary} iconColor={colors.primary} style={{ flex: 1 }} onPress={() => router.push('/analytics')} />
          <Button label={t('item.delete')} variant="danger" icon="trash" iconColor="#fff" style={{ flex: 1 }} onPress={onDelete} />
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

function SmallCol({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.priceCol}>
      <Text style={styles.editableLabel}>{label}</Text>
      <Text style={styles.editableValue}>{value}</Text>
    </View>
  );
}

function DetailListRow({ icon, label, value, valueNode, isLast, multi }: { icon: IconName; label: string; value?: string; valueNode?: React.ReactNode; isLast?: boolean; multi?: boolean }) {
  return (
    <View style={[styles.dlRow, multi && styles.dlRowMulti, !isLast && styles.dlRowBorder]}>
      <View style={[styles.dlIcon, multi && { marginTop: 2 }]}><Icon name={icon} size={15} color={colors.primary} /></View>
      <Text style={[styles.dlLabel, multi && styles.dlLabelMulti]}>{label}</Text>
      {valueNode ?? <Text style={multi ? styles.dlValueMulti : styles.dlValue}>{value}</Text>}
    </View>
  );
}

function SaleRow({ label, value, isLast, profit }: { label: string; value: string; isLast?: boolean; profit?: boolean }) {
  return (
    <View style={[styles.saleRow, !isLast && styles.dlRowBorder]}>
      <Text style={styles.saleRowLabel}>{label}</Text>
      <Text style={[styles.saleRowValue, profit && { color: colors.profit, fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: colors.ink3 },
  editLink: { color: colors.primary, fontSize: 17, fontWeight: '600' },

  photoBlock: { paddingHorizontal: 16, paddingTop: 8 },
  mainPhotoWrap: { borderRadius: 12, overflow: 'hidden' },
  mainImage: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.bg2 },
  countPill: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99 },
  countPillText: { color: '#fff', fontSize: 12, fontWeight: '600', ...numFont },
  thumbRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  thumb: { flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden' },
  thumbActive: { borderWidth: 2.5, borderColor: colors.primary },
  thumbImg: { width: '100%', height: '100%', backgroundColor: colors.bg2 },
  starCircle: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 99, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2 },

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
  editableLabel: { fontSize: 11, color: colors.ink3, marginBottom: 4, textAlign: 'center' },
  editableValue: { fontSize: 15, fontWeight: '600', color: colors.ink1, ...numFont },

  dlRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  dlRowMulti: { alignItems: 'flex-start' },
  dlRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  dlIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  dlLabel: { flex: 1, fontSize: 15, color: colors.ink1 },
  dlLabelMulti: { flex: 0, width: 70 },
  dlValue: { fontSize: 14, color: colors.ink1, textAlign: 'right' },
  dlValueMulti: { flex: 1, fontSize: 13, color: colors.ink1, lineHeight: 21, textAlign: 'right' },
  statusValue: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 99, marginRight: 6 },
  rowValue: { fontSize: 14, color: colors.ink1 },

  saleHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.divider },
  saleHeadTitle: { fontSize: 15, fontWeight: '700', color: colors.ink1 },
  saleBtn: { backgroundColor: colors.statusSoldBg, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  saleBtnText: { color: colors.profit, fontSize: 12, fontWeight: '600' },
  saleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  saleRowLabel: { flex: 1, fontSize: 14, color: colors.ink1 },
  saleRowValue: { fontSize: 14, color: colors.ink1, ...numFont },

  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 20 },
});
