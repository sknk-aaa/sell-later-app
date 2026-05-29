import { isExpoGo } from '@/utils/env';

// AdMob 初期化（Expo Go では何もしない）。動的importでExpo Goにネイティブを読み込ませない。
export function initAds() {
  if (isExpoGo) return;
  import('react-native-google-mobile-ads')
    .then(({ default: mobileAds }) => mobileAds().initialize())
    .catch(() => {});
}
