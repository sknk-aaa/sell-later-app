import { Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { isExpoGo } from '@/utils/env';

const APP_ID = '6774561736';
const WRITE_REVIEW_URL = `https://apps.apple.com/app/id${APP_ID}?action=write-review`;

// 自動レビュー促進（課金後・登録3回目など）。
// requestReview自体をAppleが頻度制御（年3回まで・出ないこともある）するので、
// 条件達成時に素直に呼ぶ。Expo Goでは何もしない。
export async function maybeRequestReview() {
  if (isExpoGo) return;
  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview();
  }
}

// ユーザーが能動的に「レビューして応援」を押した時。
// 星＋本文を書けるよう、App Storeのレビュー記入画面へ直接遷移する。
export async function openWriteReview() {
  await Linking.openURL(WRITE_REVIEW_URL).catch(async () => {
    // 失敗時はネイティブダイアログにフォールバック
    if (await StoreReview.hasAction()) await StoreReview.requestReview();
  });
}
