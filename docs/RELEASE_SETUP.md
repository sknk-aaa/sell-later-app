# このアプリ固有のリリース設定値

> **状態（2026-05-30）: セットアップ完了・TestFlight初回配信成功済み。**
> **配信手順そのもの（fastlane/match/Secrets/ワークフロー）は汎用化して [IOS_CICD_RECIPE.md](IOS_CICD_RECIPE.md) に集約**。本書はこのアプリ固有の値（bundle id・課金製品・RevenueCat・AdMob）と完了状況だけを記録する。Secrets一覧・証明書の完了状況は [HANDOFF.md](HANDOFF.md) 11〜12章。

## アプリ固有の値
- **bundle id**: `com.selllater.app`（変更時は `app.json` の `ios.bundleIdentifier` / `fastlane/Appfile` の `APP_IDENTIFIER` / 両ワークフローの env / 課金製品ID接頭辞 / AdMob を合わせる）
- **ホーム表示名**: `app.json` の `name` ＝「売るもの管理」（ストア掲載名は別途ASCで設定）

## 課金（IAP）— RevenueCat経由
製品は App Store Connect で作成（作成済み）:
- 非消費型（買い切り）: `com.selllater.app.pro.lifetime` / ¥1,500
- 自動更新サブスク: `com.selllater.app.pro.monthly` / ¥500/月（サブスクグループ内）

RevenueCat 設定（完了済み）:
- プロジェクト `selllater`、iOSアプリ（bundle id `com.selllater.app`）追加
- ASCの **In-App Purchase キー(.p8)** を登録（レシート検証用）
- **Entitlement `pro`** に両製品を割当（`src/purchases/config.ts` の `ENTITLEMENT_PRO` と一致）
- **Offering `default`(current)** に2製品のパッケージ
- iOS公開SDKキー(`appl_xxx`) → Secret `EXPO_PUBLIC_REVENUECAT_IOS_KEY`（CIのJSバンドル時に注入）。ローカルdev buildは `.env` に同キー
- サンドボックステスター（ASC → Users and Access → Sandbox）で実機テスト購入

## AdMob（本番ID差し替えが残タスク）
現状はGoogleテストID。本番化する箇所:
- `app.json` の `react-native-google-mobile-ads` プラグイン `iosAppId`
- `src/ads/AdBannerNative.tsx` の `BANNER_UNIT_ID`（現在 `TestIds.BANNER`）
- ※審査までは**テストIDのまま**（自分の広告クリックは規約違反）

## 実機での動作確認チェック（TestFlight）
- 広告バナー表示（無料時）／21件目で `/paywall` 誘導／写真2枚目ロック／分析ロック
- 買い切り・月額の購入と復元 → 購入後 `isPro` 反映で広告非表示・制限解除
- 複数写真（Pro）／アイコン・スプラッシュ（現状は青プレースホルダ、本番は `assets/` 差し替え。`node scripts/gen-assets.js` で再生成）
