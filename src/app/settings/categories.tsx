import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { DetailHeader } from '@/components/headers';
import { Button } from '@/components/ui';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { colors } from '@/theme/tokens';

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const categories = useCategoryStore((s) => s.categories);
  const add = useCategoryStore((s) => s.add);
  const remove = useCategoryStore((s) => s.remove);
  const [name, setName] = React.useState('');

  const onAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name === trimmed)) {
      Alert.alert('追加できません', '同じ名前のカテゴリが既にあります。');
      return;
    }
    add(trimmed);
    setName('');
  };

  const onRemove = (id: string, label: string) => {
    Alert.alert('カテゴリを削除', `「${label}」を削除しますか？登録済みの商品のカテゴリ表示は変わりません。`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <DetailHeader title="カテゴリの編集" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
      >
        <View style={styles.addRow}>
          <View style={styles.inputBox}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="新しいカテゴリ名"
              placeholderTextColor={colors.ink4}
              style={styles.input}
              maxLength={20}
              onSubmitEditing={onAdd}
              returnKeyType="done"
            />
          </View>
          <Button label="追加" variant="primary" small onPress={onAdd} />
        </View>

        <View style={styles.listCard}>
          {categories.map((c, i) => (
            <View key={c.id} style={[styles.row, i !== categories.length - 1 && styles.rowBorder]}>
              <View style={styles.rowIcon}><Icon name="tag" size={15} color={colors.primary} /></View>
              <Text style={styles.rowLabel}>{c.name}</Text>
              {c.isDefault ? (
                <Text style={styles.defaultTag}>標準</Text>
              ) : (
                <Pressable hitSlop={8} onPress={() => onRemove(c.id, c.name)}>
                  <Icon name="trash" size={18} color={colors.danger} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.hint}>標準カテゴリは削除できません。追加したカテゴリのみ削除できます。</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  inputBox: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  input: { fontSize: 15, color: colors.ink1, padding: 0 },

  listCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: colors.ink1 },
  defaultTag: { fontSize: 12, color: colors.ink4 },
  hint: { fontSize: 12, color: colors.ink3, marginTop: 12, lineHeight: 18 },
});
