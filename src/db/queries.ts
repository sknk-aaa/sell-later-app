import { desc, eq } from 'drizzle-orm';
import { db } from './client';
import {
  items,
  itemImages,
  saleRecords,
  settings,
  type ItemImage,
  type NewItem,
  type SaleRecord,
  type Setting,
} from './schema';

// ── Items ──────────────────────────────────────────────
export const getAllItems = () => db.select().from(items).orderBy(desc(items.createdAt)).all();

export const insertItem = (row: NewItem) => db.insert(items).values(row).run();

export const updateItemRow = (id: string, patch: Partial<NewItem>) =>
  db.update(items).set(patch).where(eq(items.id, id)).run();

export const deleteItemRow = (id: string) => db.delete(items).where(eq(items.id, id)).run();

export const setFavorite = (id: string, value: boolean) =>
  db.update(items).set({ isFavorite: value, updatedAt: new Date() }).where(eq(items.id, id)).run();

// ── Item images ────────────────────────────────────────
export const getAllImages = (): ItemImage[] => db.select().from(itemImages).all();

export const getImagesByItem = (itemId: string): ItemImage[] =>
  db.select().from(itemImages).where(eq(itemImages.itemId, itemId)).all();

export const insertImage = (row: typeof itemImages.$inferInsert) =>
  db.insert(itemImages).values(row).run();

export const deleteImagesByItem = (itemId: string) =>
  db.delete(itemImages).where(eq(itemImages.itemId, itemId)).run();

// ── Sale records ───────────────────────────────────────
export const getAllSales = (): SaleRecord[] => db.select().from(saleRecords).all();

export const insertSale = (row: typeof saleRecords.$inferInsert) =>
  db.insert(saleRecords).values(row).run();

export const deleteSaleByItem = (itemId: string) =>
  db.delete(saleRecords).where(eq(saleRecords.itemId, itemId)).run();

// ── Settings (singleton id=1) ──────────────────────────
export const getSettings = (): Setting | undefined =>
  db.select().from(settings).where(eq(settings.id, 1)).get();

export const ensureSettings = (): Setting => {
  const existing = getSettings();
  if (existing) return existing;
  db.insert(settings).values({ id: 1 }).run();
  return getSettings()!;
};

export const updateSettings = (patch: Partial<Omit<Setting, 'id'>>) =>
  db.update(settings).set(patch).where(eq(settings.id, 1)).run();
