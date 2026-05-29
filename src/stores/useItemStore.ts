import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import {
  deleteAllItemData,
  deleteImagesByItem,
  deleteItemRow,
  deleteSaleByItem,
  getAllImages,
  getAllItems,
  getAllSales,
  getImagesByItem,
  insertImage,
  insertItem,
  insertSale,
  setFavorite,
  updateItemRow,
} from '@/db/queries';
import type { Item, ItemImage, NewItem, SaleRecord } from '@/db/schema';
import { actualProfit } from '@/utils/calculations';
import { deleteImageFile, persistImage } from '@/utils/images';

// フォームが返す写真の状態
export type PhotoValue =
  | { kind: 'none' }
  | { kind: 'existing'; path: string }
  | { kind: 'new'; uri: string };

// 追加・編集フォームの入力値（id/日時/写真は除く）
export type ItemInput = {
  name: string;
  category: string;
  purchasePrice: number | null;
  expectedPrice: number;
  shippingFee: number;
  location: string | null;
  condition: Item['condition'];
  status: Item['status'];
  memo: string | null;
};

type ItemState = {
  items: Item[];
  images: ItemImage[];
  sales: SaleRecord[];
  loaded: boolean;
  load: () => void;
  addItem: (input: ItemInput, photos: PhotoValue[]) => Promise<string>;
  updateItem: (id: string, input: ItemInput, photos: PhotoValue[]) => Promise<void>;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  recordSale: (
    itemId: string,
    sale: { actualPrice: number; actualShipping: number; soldAt: Date },
    feeRate: number,
  ) => void;
  clearAllData: () => void;
};

const refresh = () => ({
  items: getAllItems(),
  images: getAllImages(),
  sales: getAllSales(),
  loaded: true,
});

// 写真配列で item_images を張り替える（既存維持・新規保存・削除を差分処理）
async function syncImages(itemId: string, photos: PhotoValue[], now: Date) {
  const keepPaths = new Set(photos.filter((p) => p.kind === 'existing').map((p) => (p as { path: string }).path));
  // 残さない既存ファイルを削除
  for (const img of getImagesByItem(itemId)) {
    if (!keepPaths.has(img.filePath)) deleteImageFile(img.filePath);
  }
  deleteImagesByItem(itemId);
  let order = 0;
  for (const photo of photos) {
    const path = photo.kind === 'existing' ? photo.path : photo.kind === 'new' ? await persistImage(photo.uri) : null;
    if (!path) continue;
    insertImage({ id: Crypto.randomUUID(), itemId, filePath: path, sortOrder: order++, createdAt: now });
  }
}

export const useItemStore = create<ItemState>((set) => ({
  items: [],
  images: [],
  sales: [],
  loaded: false,

  load: () => set(refresh()),

  addItem: async (input, photos) => {
    const id = Crypto.randomUUID();
    const now = new Date();
    const row: NewItem = { id, ...input, isFavorite: false, createdAt: now, updatedAt: now };
    insertItem(row);
    await syncImages(id, photos, now);
    set(refresh());
    return id;
  },

  updateItem: async (id, input, photos) => {
    const now = new Date();
    updateItemRow(id, { ...input, updatedAt: now });
    await syncImages(id, photos, now);
    set(refresh());
  },

  deleteItem: (id) => {
    for (const img of getImagesByItem(id)) deleteImageFile(img.filePath);
    deleteImagesByItem(id);
    deleteSaleByItem(id);
    deleteItemRow(id);
    set(refresh());
  },

  toggleFavorite: (id) => {
    const current = getAllItems().find((i) => i.id === id);
    if (!current) return;
    setFavorite(id, !current.isFavorite);
    set(refresh());
  },

  recordSale: (itemId, sale, feeRate) => {
    const now = new Date();
    const profit = actualProfit(sale.actualPrice, feeRate, sale.actualShipping);
    insertSale({
      id: Crypto.randomUUID(),
      itemId,
      actualPrice: sale.actualPrice,
      actualShippingFee: sale.actualShipping,
      actualProfit: profit,
      soldAt: sale.soldAt,
      createdAt: now,
    });
    updateItemRow(itemId, { status: 'sold', updatedAt: now });
    set(refresh());
  },

  clearAllData: () => {
    for (const img of getAllImages()) deleteImageFile(img.filePath);
    deleteAllItemData();
    set(refresh());
  },
}));
