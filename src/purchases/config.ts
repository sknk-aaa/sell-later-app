// RevenueCat 設定。iOS公開SDKキーは EXPO_PUBLIC_REVENUECAT_IOS_KEY で注入（appl_xxx）。
export const REVENUECAT_IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? 'appl_REPLACE_WITH_YOUR_KEY';

// RevenueCat ダッシュボードで作るエンタイトルメント識別子
export const ENTITLEMENT_PRO = 'pro';

// 参考: App Store Connect で作成する製品ID（RevenueCatのProductに紐付ける）
export const SKU_LIFETIME = 'com.selllater.app.pro.lifetime2'; // 買い切り ¥1,500
export const SKU_MONTHLY = 'com.selllater.app.pro.monthly2'; // 月額 ¥500
