import { colors, type StatusKind } from '@/theme/tokens';

// shared.jsx のダミーデータ（STEP2 で実データへ差し替え）
export type DemoProduct = {
  id: string;
  name: string;
  price: number;
  profit: number;
  status: StatusKind;
  place: string;
  date: string;
  star: boolean;
  category: string;
  photos: number;
};

export const PRODUCTS: DemoProduct[] = [
  { id: 'p1', name: 'AirPods Pro 第2世代', price: 24800, profit: 18320, status: 'prep', place: 'リビング棚', date: '2024/05/20', star: true, category: '家電', photos: 4 },
  { id: 'p2', name: 'Canon EOS M100', price: 32800, profit: 24520, status: 'listed', place: 'リビング棚', date: '2024/05/18', star: false, category: '家電', photos: 3 },
  { id: 'p3', name: 'Nintendo Switch 有機EL', price: 28500, profit: 20150, status: 'stored', place: 'クローゼット上段', date: '2024/05/15', star: true, category: 'ゲーム', photos: 2 },
  { id: 'p4', name: 'The North Face マウンテンライトジャケット', price: 15800, profit: 10820, status: 'hold', place: 'クローゼット下段', date: '2024/05/10', star: false, category: 'ファッション', photos: 3 },
  { id: 'p5', name: 'Nike Air Jordan 1 Chicago', price: 36800, profit: 27520, status: 'listed', place: '玄関収納', date: '2024/05/08', star: false, category: 'ファッション', photos: 4 },
  { id: 'p6', name: '鬼滅の刃 全巻セット', price: 9600, profit: 6880, status: 'stored', place: '本棚', date: '2024/05/05', star: true, category: '本・漫画', photos: 2 },
];

export type CategorySale = { name: string; value: number; pct: number; color: string };

export const CATEGORY_SALES: CategorySale[] = [
  { name: '家電', value: 34800, pct: 27.9, color: colors.cat1 },
  { name: 'スマホ・タブレット', value: 28600, pct: 22.9, color: colors.cat2 },
  { name: 'ファッション', value: 21400, pct: 17.1, color: colors.cat3 },
  { name: 'ゲーム', value: 15800, pct: 12.7, color: colors.cat4 },
  { name: '本・漫画', value: 9600, pct: 7.7, color: colors.cat5 },
  { name: 'その他', value: 14600, pct: 11.7, color: colors.cat6 },
];
