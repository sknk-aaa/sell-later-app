import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// styles.css :root を 1:1 で移植したデザイントークン
export const colors = {
  primary: '#2F7BFF',
  primaryPressed: '#1F5FD9',
  primarySoft: '#E8F0FF',

  statusListed: '#2F7BFF',
  statusListedBg: '#E8F1FF',
  statusPrep: '#F59E0B',
  statusPrepBg: '#FEF1DB',
  statusStored: '#6B7280',
  statusStoredBg: '#E8EBEF',
  statusStoredGreen: '#10B981',
  statusStoredGreenBg: '#E3F8EC',
  statusSold: '#10B981',
  statusSoldBg: '#E3F8EC',
  statusHold: '#A855F7',
  statusHoldBg: '#F3E8FF',

  profit: '#10B981',
  danger: '#FF5C5C',
  dangerSoft: '#FFE3E3',

  bg: '#F5F6F8',
  bg2: '#EEF0F4',
  surface: '#FFFFFF',
  divider: '#E9EBEF',
  border: '#E4E6EB',

  ink1: '#14181F',
  ink2: '#4B5563',
  ink3: '#8A8F98',
  ink4: '#B4B8BF',

  // カテゴリパレット（ドーナツ / 凡例）
  cat1: '#4A8DFF',
  cat2: '#FF9A2E',
  cat3: '#34C77A',
  cat4: '#F2C94C',
  cat5: '#A56BD9',
  cat6: '#6BB6FF',
  cat7: '#C9CDD3',

  star: '#F5B82B',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const;

// --shadow-card 相当（iOS: shadow*, Android: elevation）
export const shadowCard: ViewStyle = Platform.select({
  ios: {
    shadowColor: 'rgba(20,24,31,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  default: { elevation: 2 },
}) as ViewStyle;

// tabular-nums + lining-nums を有効にした数値スタイル（--font-num 相当）
export const numFont: TextStyle = {
  fontVariant: ['tabular-nums', 'lining-nums'],
  letterSpacing: -0.1,
};

export type StatusKind = 'listed' | 'prep' | 'stored' | 'sold' | 'hold';
