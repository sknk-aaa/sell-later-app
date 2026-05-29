import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import type { PhotoValue } from '@/stores/useItemStore';
import { pickImage } from '@/utils/images';
import { colors } from '@/theme/tokens';

// 写真1枚の選択/差し替え/削除（無料版仕様）
export function ImageField({ photo, onChange }: { photo: PhotoValue; onChange: (p: PhotoValue) => void }) {
  const uri = photo.kind === 'existing' ? photo.path : photo.kind === 'new' ? photo.uri : null;

  const pick = async () => {
    const picked = await pickImage();
    if (picked) onChange({ kind: 'new', uri: picked });
  };

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={styles.label}>写真</Text>
        <View style={styles.req}>
          <Text style={styles.reqText}>必須</Text>
        </View>
      </View>

      <View style={styles.row}>
        {uri ? (
          <View style={styles.cell}>
            <Image source={{ uri }} style={styles.image} />
            <Pressable
              style={styles.remove}
              hitSlop={6}
              onPress={() =>
                Alert.alert('写真を削除', 'この写真を削除しますか？', [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '削除', style: 'destructive', onPress: () => onChange({ kind: 'none' }) },
                ])
              }
            >
              <Icon name="closeCircle" size={24} />
            </Pressable>
            <Pressable style={styles.replace} onPress={pick}>
              <Text style={styles.replaceText}>変更</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.add} onPress={pick}>
            <View style={styles.addCircle}>
              <Icon name="plus" size={18} color="#fff" />
            </View>
            <Text style={styles.addText}>追加</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.hint}>無料版では1枚まで登録できます</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  label: { fontSize: 15, fontWeight: '700', color: colors.ink1 },
  req: { height: 18, paddingHorizontal: 6, borderRadius: 4, backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center' },
  reqText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  row: { flexDirection: 'row' },
  cell: { width: '31%', aspectRatio: 1, position: 'relative' },
  image: { width: '100%', height: '100%', borderRadius: 10, backgroundColor: colors.bg2 },
  remove: { position: 'absolute', top: 4, right: 4, width: 24, height: 24 },
  replace: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  replaceText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  add: {
    width: '31%', aspectRatio: 1, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addCircle: { width: 28, height: 28, borderRadius: 99, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 12, fontWeight: '500', color: colors.primary },
  hint: { fontSize: 11, color: colors.ink3, marginTop: 6 },
});
