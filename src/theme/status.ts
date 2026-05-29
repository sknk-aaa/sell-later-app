import { colors, type StatusKind } from './tokens';

// shared.jsx の STATUS / badge カラー定義を移植
type StatusMeta = {
  label: string;
  dotColor: string;
  // 実バッジ（塗り）
  solidBg: string;
  solidText: string;
  // soft バッジ
  softBg: string;
  softText: string;
};

export const STATUS: Record<StatusKind, StatusMeta> = {
  listed: {
    label: '出品中',
    dotColor: colors.statusListed,
    solidBg: colors.statusListed,
    solidText: '#fff',
    softBg: colors.statusListedBg,
    softText: colors.statusListed,
  },
  prep: {
    label: '出品準備中',
    dotColor: colors.statusPrep,
    solidBg: colors.statusPrep,
    solidText: '#fff',
    softBg: colors.statusPrepBg,
    softText: colors.statusPrep,
  },
  stored: {
    label: '保管中',
    dotColor: colors.statusStored,
    // 塗りバッジは緑アクセント（styles.css .badge.stored）
    solidBg: colors.statusStoredGreen,
    solidText: '#fff',
    // soft はグレー背景＋ink2（styles.css .badge.soft.stored）
    softBg: colors.statusStoredBg,
    softText: colors.ink2,
  },
  sold: {
    label: '売却済み',
    dotColor: colors.statusSold,
    solidBg: colors.statusSold,
    solidText: '#fff',
    softBg: colors.statusSoldBg,
    softText: colors.statusSold,
  },
  hold: {
    label: '保留',
    dotColor: colors.statusHold,
    solidBg: colors.statusHold,
    solidText: '#fff',
    softBg: colors.statusHoldBg,
    softText: colors.statusHold,
  },
};
