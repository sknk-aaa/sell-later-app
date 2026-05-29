// 無料版の制限値（Pro版で解放）
export const FREE_ITEM_LIMIT = 20; // 21件目でアップグレード誘導
export const FREE_PHOTO_LIMIT = 1;
export const PRO_PHOTO_LIMIT = 10;

export const photoLimit = (isPro: boolean) => (isPro ? PRO_PHOTO_LIMIT : FREE_PHOTO_LIMIT);
export const canAddItem = (isPro: boolean, count: number) => isPro || count < FREE_ITEM_LIMIT;
