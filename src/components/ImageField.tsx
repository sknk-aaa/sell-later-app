import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { useTranslation } from '@/i18n';
import type { PhotoValue } from '@/stores/useItemStore';
import { pickImage } from '@/utils/images';
import { colors } from '@/theme/tokens';

export function ImageField({
  photos,
  onChange,
  maxPhotos,
  isPro,
  onLocked,
}: {
  photos: PhotoValue[];
  onChange: (p: PhotoValue[]) => void;
  maxPhotos: number;
  isPro: boolean;
  onLocked: () => void;
}) {
  const { t } = useTranslation();
  const uriOf = (p: PhotoValue) => (p.kind === 'existing' ? p.path : p.kind === 'new' ? p.uri : null);

  const pick = async () => {
    const picked = await pickImage();
    if (picked) onChange([...photos, { kind: 'new', uri: picked }]);
  };

  const removeAt = (i: number) => onChange(photos.filter((_, idx) => idx !== i));
  const confirmRemove = (i: number) =>
    Alert.alert(t('image.deleteTitle'), t('image.deleteMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeAt(i) },
    ]);

  const canAdd = photos.length < maxPhotos;
  const showLocked = !canAdd && !isPro;

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={styles.label}>{t('image.photos')}</Text>
        <Text style={styles.count}>{photos.length}/{maxPhotos}</Text>
        <View style={styles.req}><Text style={styles.reqText}>{t('common.required')}</Text></View>
      </View>

      <View style={styles.grid}>
        {photos.map((p, i) => {
          const uri = uriOf(p);
          return (
            <View key={i} style={styles.cell}>
              {uri && <Image source={{ uri }} style={styles.image} />}
              <Pressable style={styles.remove} hitSlop={6} onPress={() => confirmRemove(i)}>
                <Icon name="closeCircle" size={24} />
              </Pressable>
            </View>
          );
        })}

        {canAdd && (
          <Pressable style={styles.add} onPress={pick}>
            <View style={styles.addCircle}><Icon name="plus" size={18} color="#fff" /></View>
            <Text style={styles.addText}>{t('image.add')}</Text>
          </Pressable>
        )}
        {showLocked && (
          <Pressable style={[styles.add, styles.locked]} onPress={onLocked}>
            <Icon name="crown" size={20} color={colors.star} />
            <Text style={styles.lockedText}>{t('image.proUnlock')}</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.hint}>
        {isPro ? t('image.hintPro', { max: maxPhotos }) : t('image.hintFree')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  label: { fontSize: 15, fontWeight: '700', color: colors.ink1 },
  count: { fontSize: 12, color: colors.ink3 },
  req: { height: 18, paddingHorizontal: 6, borderRadius: 4, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  reqText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '22%', aspectRatio: 1, position: 'relative' },
  image: { width: '100%', height: '100%', borderRadius: 10, backgroundColor: colors.bg2 },
  remove: { position: 'absolute', top: 4, right: 4, width: 24, height: 24 },
  add: {
    width: '22%', aspectRatio: 1, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addCircle: { width: 28, height: 28, borderRadius: 99, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  locked: { borderColor: colors.star },
  lockedText: { fontSize: 10, fontWeight: '600', color: colors.ink2 },
  hint: { fontSize: 11, color: colors.ink3, marginTop: 6 },
});
