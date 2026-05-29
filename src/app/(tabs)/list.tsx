import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, type IconName } from '@/components/Icon';
import { StatusBadge } from '@/components/StatusBadge';
import { PhotoSlot } from '@/components/PhotoSlot';
import { LargeTitleHeader } from '@/components/headers';
import { useItemStore } from '@/stores/useItemStore';
import { useItemViewModels, type ItemVM } from '@/stores/selectors';
import { colors, numFont, shadowCard } from '@/theme/tokens';
import { formatDate, yen } from '@/utils/format';

type View2 = 'grid' | 'list';

export default function ListScreen() {
  const router = useRouter();
  const items = useItemViewModels();
  const toggleFavorite = useItemStore((s) => s.toggleFavorite);
  const [view, setView] = React.useState<View2>('grid');
  const open = (id: string) => router.push(`/item/${id}`);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LargeTitleHeader
          title="一覧"
          right={
            <>
              <Pressable hitSlop={8}><Icon name="search" size={22} color={colors.ink1} /></Pressable>
              <Pressable hitSlop={8} style={styles.filterBtn}>
                <Icon name="sliders" size={20} color={colors.ink1} />
                <Text style={styles.filterBtnText}>絞り込み</Text>
              </Pressable>
              <Pressable hitSlop={8}><Icon name="more" size={22} color={colors.ink3} /></Pressable>
            </>
          }
        />

        {/* View toggle */}
        <View style={styles.toggle}>
          <ToggleBtn active={view === 'grid'} onPress={() => setView('grid')} icon="grid" label="グリッド" />
          <ToggleBtn active={view === 'list'} onPress={() => setView('list')} icon="rows" label="リスト" />
        </View>

        {/* Filter selects (STEP3で機能化) */}
        <View style={styles.selects}>
          <Select label="並び替え" value="登録日が新しい順" />
          <Select label="カテゴリ" value="すべて" />
          <Select label="保管場所" value="すべて" />
          <Select label="ステータス" value="すべて" />
        </View>

        {/* Count row */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>全 {items.length} 件</Text>
          <Text style={styles.multiSelect}>長押しで複数選択</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>まだ商品がありません。{'\n'}下の「追加」から登録できます。</Text>
          </View>
        ) : view === 'grid' ? (
          <View style={styles.grid}>
            {items.map((p) => (
              <GridCard key={p.id} p={p} onStar={() => toggleFavorite(p.id)} onPress={() => open(p.id)} />
            ))}
          </View>
        ) : (
          <View style={styles.listCard}>
            {items.map((p, i) => (
              <ListRowCard key={p.id} p={p} onStar={() => toggleFavorite(p.id)} onPress={() => open(p.id)} isLast={i === items.length - 1} />
            ))}
          </View>
        )}

        {/* Floating add button */}
        <Pressable style={styles.fabWrap} onPress={() => router.push('/add')}>
          <View style={styles.fab}><Icon name="plus" size={28} color="#fff" /></View>
          <Text style={styles.fabLabel}>商品を追加</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ToggleBtn({ active, onPress, icon, label }: { active: boolean; onPress: () => void; icon: IconName; label: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleBtn, active && styles.toggleBtnActive]}>
      <Icon name={icon} size={16} color={active ? colors.primary : colors.ink3} />
      <Text style={[styles.toggleText, { color: active ? colors.primary : colors.ink3 }]}>{label}</Text>
    </Pressable>
  );
}

function Select({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.select}>
      <Text style={styles.selectLabel}>{label}</Text>
      <View style={styles.selectValueRow}>
        <Text style={styles.selectValue} numberOfLines={1}>{value}</Text>
        <Icon name="chevD" size={12} color={colors.ink3} />
      </View>
    </View>
  );
}

function GridCard({ p, onStar, onPress }: { p: ItemVM; onStar: () => void; onPress: () => void }) {
  return (
    <Pressable style={styles.gridCard} onPress={onPress}>
      <View>
        {p.imagePath ? (
          <Image source={{ uri: p.imagePath }} style={styles.gridImage} />
        ) : (
          <PhotoSlot label={p.name.split(' ')[0]} ratio={1} radius={0} />
        )}
        <View style={styles.gridBadge}><StatusBadge kind={p.status} /></View>
        <Pressable style={styles.starBtn} onPress={onStar} hitSlop={6}>
          <Icon name={p.isFavorite ? 'starFill' : 'star'} size={16} color={p.isFavorite ? undefined : colors.ink3} />
        </Pressable>
      </View>
      <View style={styles.gridBody}>
        <Text style={styles.gridName} numberOfLines={2}>{p.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.gridPrice}>{yen(p.expectedPrice)}</Text>
          <Text style={styles.profitInline}>利益 <Text style={styles.profitInlineNum}>{yen(p.expectedProfit)}</Text></Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><Icon name="folder" size={12} color={colors.ink3} /><Text style={styles.metaText} numberOfLines={1}>{p.location || '-'}</Text></View>
          <View style={styles.metaItem}><Icon name="calendar" size={12} color={colors.ink3} /><Text style={styles.metaText}>{formatDate(p.createdAt)}</Text></View>
        </View>
      </View>
    </Pressable>
  );
}

function ListRowCard({ p, onStar, onPress, isLast }: { p: ItemVM; onStar: () => void; onPress: () => void; isLast: boolean }) {
  return (
    <Pressable style={[styles.listRow, !isLast && styles.listRowBorder]} onPress={onPress}>
      {p.imagePath ? (
        <Image source={{ uri: p.imagePath }} style={styles.listPhoto} />
      ) : (
        <PhotoSlot label={p.name.split(' ')[0]} radius={10} style={styles.listPhoto} />
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.listTop}>
          <StatusBadge kind={p.status} />
          <Pressable onPress={onStar} hitSlop={6}>
            <Icon name={p.isFavorite ? 'starFill' : 'star'} size={18} color={p.isFavorite ? undefined : colors.ink4} />
          </Pressable>
        </View>
        <Text style={styles.listName} numberOfLines={1}>{p.name}</Text>
        <View style={[styles.priceRow, { marginTop: 2 }]}>
          <Text style={styles.listPrice}>{yen(p.expectedPrice)}</Text>
          <Text style={styles.profitInline}>利益 <Text style={styles.profitInlineNum}>{yen(p.expectedProfit)}</Text></Text>
        </View>
        <View style={[styles.metaRow, { marginTop: 4 }]}>
          <View style={styles.metaItem}><Icon name="folder" size={12} color={colors.ink3} /><Text style={styles.metaText} numberOfLines={1}>{p.location || '-'}</Text></View>
          <View style={styles.metaItem}><Icon name="calendar" size={12} color={colors.ink3} /><Text style={styles.metaText}>{formatDate(p.createdAt)}</Text></View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterBtnText: { fontSize: 14, fontWeight: '500', color: colors.ink1 },

  toggle: { flexDirection: 'row', marginHorizontal: 16, marginTop: 4, marginBottom: 14, padding: 4, backgroundColor: '#EEF0F4', borderRadius: 12 },
  toggleBtn: { flex: 1, height: 36, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  toggleText: { fontSize: 14, fontWeight: '600' },

  selects: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  select: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, gap: 2 },
  selectLabel: { fontSize: 9, color: colors.ink3 },
  selectValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  selectValue: { flex: 1, fontSize: 12, color: colors.ink1, fontWeight: '600' },

  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 12 },
  countText: { fontSize: 13, color: colors.ink3 },
  multiSelect: { fontSize: 13, fontWeight: '500', color: colors.primary },

  emptyCard: { marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 28, alignItems: 'center', ...shadowCard },
  emptyText: { fontSize: 13, color: colors.ink3, textAlign: 'center', lineHeight: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 14 },
  gridCard: { width: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', ...shadowCard },
  gridImage: { width: '100%', aspectRatio: 1, backgroundColor: colors.bg2 },
  gridBadge: { position: 'absolute', top: 8, left: 8 },
  starBtn: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 99, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2,
  },
  gridBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 },
  gridName: { fontSize: 13, fontWeight: '500', color: colors.ink1, lineHeight: 18, minHeight: 36 },
  gridPrice: { fontSize: 16, fontWeight: '700', color: colors.ink1, ...numFont },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 },
  profitInline: { fontSize: 11, color: colors.ink3 },
  profitInlineNum: { fontSize: 12, color: colors.profit, fontWeight: '600', ...numFont },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 },
  metaText: { fontSize: 11, color: colors.ink3 },

  listCard: { marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', ...shadowCard },
  listRow: { flexDirection: 'row', gap: 12, padding: 12 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  listPhoto: { width: 82, height: 82, borderRadius: 10, backgroundColor: colors.bg2 },
  listTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  listName: { fontSize: 14, fontWeight: '600', color: colors.ink1, marginTop: 6, lineHeight: 19 },
  listPrice: { fontSize: 15, fontWeight: '700', color: colors.ink1, ...numFont },

  fabWrap: { alignItems: 'center', paddingTop: 20, gap: 4 },
  fab: {
    width: 56, height: 56, borderRadius: 99, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6,
  },
  fabLabel: { fontSize: 12, color: colors.ink3 },
});
