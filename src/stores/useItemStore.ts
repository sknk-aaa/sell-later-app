import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import {
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
  addItem: (input: ItemInput, photo: PhotoValue) => Promise<string>;
  updateItem: (id: string, input: ItemInput, photo: PhotoValue) => Promise<void>;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  recordSale: (
    itemId: string,
    sale: { actualPrice: number; actualShipping: number; soldAt: Date },
    feeRate: number,
  ) => void;
};

const refresh = () => ({
  items: getAllItems(),
  images: getAllImages(),
  sales: getAllSales(),
  loaded: true,
});

// 写真を永続化して item_images を張り替える
async function syncImage(itemId: string, photo: PhotoValue, now: Date) {
  if (photo.kind === 'existing') return; // 変更なし
  // 既存画像（ファイル＋レコード）を削除
  for (const img of getImagesByItem(itemId)) deleteImageFile(img.filePath);
  deleteImagesByItem(itemId);
  if (photo.kind === 'new') {
    const path = await persistImage(photo.uri);
    insertImage({ id: Crypto.randomUUID(), itemId, filePath: path, sortOrder: 0, createdAt: now });
  }
}

export const useItemStore = create<ItemState>((set) => ({
  items: [],
  images: [],
  sales: [],
  loaded: false,

  load: () => set(refresh()),

  addItem: async (input, photo) => {
    const id = Crypto.randomUUID();
    const now = new Date();
    const row: NewItem = { id, ...input, isFavorite: false, createdAt: now, updatedAt: now };
    insertItem(row);
    if (photo.kind === 'new') {
      const path = await persistImage(photo.uri);
      insertImage({ id: Crypto.randomUUID(), itemId: id, filePath: path, sortOrder: 0, createdAt: now });
    }
    set(refresh());
    return id;
  },

  updateItem: async (id, input, photo) => {
    const now = new Date();
    updateItemRow(id, { ...input, updatedAt: now });
    await syncImage(id, photo, now);
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
}));
