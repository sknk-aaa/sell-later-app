# 運用の正（sell-later-app）

インフラ・環境・配信・固有設定値をまとめる。**変化が遅い情報**の置き場。現状・残タスクは [HANDOFF.md](HANDOFF.md)、仕様は [DESIGN.md](DESIGN.md)、汎用CI手順は `~/.claude/docs/IOS_CICD_RECIPE.md`。

## 環境・バージョン固定（厳守）
- Expo **SDK 54 固定**（expo ~54.0.35 / expo-router 6 / react-native 0.81.5 / react 19.1.0）/ TypeScript ~5.9.2。**勝手に上げない**。開発確認端末の **Expo Go が 54.0.2（SDK54まで）** のため。SDK更新時は必ず端末のExpo Go対応SDKを先に確認する。
- 実行は必ず **`npx expo`**（グローバル `expo` 未インストール）。
- ネイティブ依存（RevenueCat課金 / AdMob広告 / keyboard-controller）は **Expo Go では動かない** → `src/utils/env.ts` の `isExpoGo` で **Expo Go時はno-op化**して起動を維持。実動作は dev build / TestFlight で確認。この前提を壊さない。

## アプリ固有の値
- **bundle id**: `com.selllater.app`（変更時は `app.json` の `ios.bundleIdentifier` / `fastlane/Appfile` の `APP_IDENTIFIER` / 両ワークフローの env / 課金製品ID接頭辞 / AdMob を合わせる）
- **ホーム表示名**: `app.json` の `name` ＝ `Worthnest`（ストア掲載名はASCでロケール別に設定。日本語表示名「うるカタ」は `locales/ja.json` の `CFBundleDisplayName`）
- **プライバシーポリシーURL**: `docs/privacy-policy.html` を GitHub Pages（Settings → Pages → main / docs）で公開。`https://sknk-aaa.github.io/sell-later-app/privacy-policy.html`（英日併記）

## 課金（IAP）— RevenueCat経由
製品は App Store Connect で作成済み:
- 非消費型（買い切り）: `com.selllater.app.pro.lifetime2` / ¥1,500
- 自動更新サブスク: `com.selllater.app.pro.monthly2` / ¥500/月（サブスクグループ内）
  - ※旧ID(`...lifetime`/`...monthly`)は「審査待ち」でスタックし紐付け不可になったため作り直し（製品IDは再利用不可）。詳細は HANDOFF 参照。

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

## ビルド・配信（CI/CD）
- **GitHub Actions(macOS) + fastlane（prebuild方式・EAS非依存）**。`main` への push（または `v*` タグ・手動Run）で `ios.yml` が走り、ビルド→TestFlight 自動アップロード。1回10〜30分。**publicリポなのでActionsは無料**。
- `ios/` は**非コミット**（CIが毎回 `expo prebuild` で生成）。
- 汎用手順・ハマり所の全文は `~/.claude/docs/IOS_CICD_RECIPE.md`（他アプリ流用可）。
- 証明書: `fastlane ios certs`（match）で配布証明書＋プロファイルを certificates リポに保存済み（**初回1回のみ実行済み**）。再発行時以外は不要。
- ビルド番号: gym前に `set_info_plist_value` で `CFBundleVersion` を `$GITHUB_RUN_NUMBER` に書換（Expo生成Info.plistの固定値対策）。

## GitHub Secrets（登録済み・8つ）
`EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `APPLE_TEAM_ID` / `MATCH_GIT_URL` / `MATCH_PASSWORD` / `MATCH_GIT_BASIC_AUTHORIZATION` / `APP_STORE_CONNECT_API_KEY_ID`(=GSFCH87D9K) / `APP_STORE_CONNECT_API_ISSUER_ID` / `APP_STORE_CONNECT_API_KEY`（= .p8の生PEM中身）。

## ユーザー側セットアップ（完了済み）
- Apple Developer: App ID `com.selllater.app` 登録、Sandboxテスター作成。ASCでアプリ作成・IAP製品2つ作成。
- ASC API キー: `AuthKey_GSFCH87D9K.p8`、Key ID `GSFCH87D9K`。

## 検証コマンド（変更後に実行）
- `npx tsc --noEmit` … 型チェック（エラー0維持）
- スキーマ変更時 `npx drizzle-kit generate` … `drizzle/` にマイグレ生成＆コミット
- `npx expo export -p ios` … JSバンドル成功でモジュール解決を確認（後 `/tmp` 出力は削除）

## 開発確認（実機・JS修正）
`npx expo start -c --tunnel` → iPhoneの Expo Go でQR読取。前のサーバーはCtrl+Cで停止、Expo Go履歴の古いプロジェクトは削除してから新QRで開く。**この環境(WSL/Linux)にiOSシミュレータは無い**ため、AI側は上記コマンドで担保、実機目視はユーザー。
