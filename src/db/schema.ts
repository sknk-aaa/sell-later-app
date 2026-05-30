import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// 設計書2章のデータモデル準拠
export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  purchasePrice: integer('purchase_price'),
  expectedPrice: integer('expected_price').notNull(),
  shippingFee: integer('shipping_fee').notNull().default(0),
  location: text('location'),
  condition: text('condition', { enum: ['new', 'good', 'normal', 'damaged'] }).notNull(),
  status: text('status', { enum: ['stored', 'prep', 'listed', 'sold', 'hold'] }).notNull(),
  memo: text('memo'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const itemImages = sqliteTable('item_images', {
  id: text('id').primaryKey(),
  itemId: text('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const saleRecords = sqliteTable('sale_records', {
  id: text('id').primaryKey(),
  itemId: text('item_id')
    .notNull()
    .unique()
    .references(() => items.id, { onDelete: 'cascade' }),
  actualPrice: integer('actual_price').notNull(),
  actualShippingFee: integer('actual_shipping_fee').notNull(),
  actualProfit: integer('actual_profit').notNull(),
  soldAt: integer('sold_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  isPro: integer('is_pro', { mode: 'boolean' }).notNull().default(false),
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).notNull().default('system'),
  language: text('language', { enum: ['system', 'en', 'ja'] }).notNull().default('system'),
  currency: text('currency', { enum: ['auto', 'USD', 'JPY', 'EUR', 'GBP', 'AUD', 'CAD'] }).notNull().default('auto'),
  feeRate: real('fee_rate').notNull().default(0.1),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type ItemImage = typeof itemImages.$inferSelect;
export type SaleRecord = typeof saleRecords.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type ItemCondition = Item['condition'];
export type ItemStatus = Item['status'];
