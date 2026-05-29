import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { deleteCategory, getAllCategories, insertCategory } from '@/db/queries';
import type { Category } from '@/db/schema';
import { CATEGORIES } from '@/constants/categories';

type CategoryState = {
  categories: Category[];
  load: () => void;
  add: (name: string) => void;
  remove: (id: string) => void;
};

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  load: () => {
    let rows = getAllCategories();
    if (rows.length === 0) {
      // 設計書2.4の固定カテゴリを初期投入
      CATEGORIES.forEach((name, i) =>
        insertCategory({ id: Crypto.randomUUID(), name, sortOrder: i, isDefault: true }),
      );
      rows = getAllCategories();
    }
    set({ categories: rows });
  },
  add: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const rows = getAllCategories();
    if (rows.some((c) => c.name === trimmed)) return; // 重複は無視
    const sortOrder = rows.reduce((m, c) => Math.max(m, c.sortOrder), -1) + 1;
    insertCategory({ id: Crypto.randomUUID(), name: trimmed, sortOrder, isDefault: false });
    set({ categories: getAllCategories() });
  },
  remove: (id) => {
    deleteCategory(id);
    set({ categories: getAllCategories() });
  },
}));
