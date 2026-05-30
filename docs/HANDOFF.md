# 開発引き継ぎメモ（sell-later-app）

セッションが途切れても次の担当が再開できるよう、現状と要点をまとめる。最終更新時点で **STEP1〜4 のコード実装完了**（STEP1〜3は実機確認済み）。**GitHub Actions → TestFlight の初回配信に成功し、CI自動配信パイプラインが完成（2026-05-30）**。ビルド `1.0.0 (1)` が TestFlight に上がり、内部テスターの実機へインストール済み。→ **現状と残タスクは末尾「12. リリースCIの現在地」を読む**こと。

## 1. アプリ概要
「いつかメルカリで売る物」を管理するiOSアプリ。家にある売れる物を資産として見える化し、ホームで「全部売ったらいくらか」を示す。設計書は [docs/sellitlater_design_v1.md](sellitlater_design_v1.md)、実装指示は [docs/02_claude_code_instructions.md](02_claude_code_instructions.md)。UIは Claude Design プロトタイプを React Native へ忠実移植したもの。

## 2. 技術スタックと**固定バージョン（重要）**
- Expo **SDK 54**（expo ~54.0.35 / expo-router 6 / react-native 0.81.5 / react 19.1.0）/ TypeScript ~5.9.2
- expo-sqlite + **Drizzle ORM** / Zustand / expo-file-system(新File/Directory/Paths API) / expo-image-picker / react-native-svg / @react-native-community/datetimepicker
- STEP4追加: **react-native-purchases(RevenueCat)**(課金) / **react-native-google-mobile-ads**(広告) / expo-splash-screen。これらはネイティブ依存で**Expo Goに無い** → `src/utils/env.ts` の `isExpoGo` で**Expo Go時はno-op化**して起動を維持（実動作はdev build/TestFlight）。
- **⚠️ Expo SDK を勝手に上げない**。開発確認に使う端末の **Expo Go が 54.0.2（SDK54まで）** のため。最初56で組んでGoに弾かれ、56→55→54 と下げて一致させた経緯あり。SDK更新時は必ず端末のExpo Go対応SDKを先に確認する。

## 3. 起動・確認方法
- 実行は必ず **`npx`** 経由（グローバル `expo` は未インストール）。
- 開発確認: `npx expo start -c --tunnel` →（前のサーバーは必ずCtrl+Cで停止、Expo Goの履歴の古いプロジェクトは削除）→ 新QRをExpo Goで読む。`--tunnel` は大学Wi-Fi等の同一ネット制約回避、`-c` はキャッシュクリア。
- **この開発環境(WSL2/Linux)にはiOSシミュレータが無い**ため、AI側の検証は下記コマンドで担保し、実機目視はユーザーが実施する運用。

## 4. 検証コマンド（変更後に必ず実行）
- `npx tsc --noEmit` … 型チェック（エラー0を維持）
- スキーマ変更時 `npx drizzle-kit generate` … `drizzle/` にマイグレーション生成＆コミット
- `npx expo export -p ios` … バンドル成功でモジュール解決・JSビルドを確認（成功後 `/tmp` の出力は削除）

## 5. ディレクトリ構成（src/）
```
app/                       expo-router ルート
  _layout.tsx              Root Stack。useMigrations でマイグレ適用→成功後に各storeをload。modal(add/sale/edit)登録
  index.tsx                / → /home へ Redirect
  (tabs)/_layout.tsx       Tabs（カスタム TabBar）。home/list/analytics/settings ＋中央=追加モーダル
  (tabs)/{home,list,analytics,settings}.tsx
  item/[id].tsx            商品詳細   item/[id]/edit.tsx 編集(modal)
  add.tsx                  追加(modal)   sale.tsx 売却記録(modal)
  settings/categories.tsx  カテゴリ編集
components/                Icon(svg) / StatusBadge / PhotoSlot / TabBar / PickerSheet / ImageField /
                           ProductForm / headers / ui / charts/{Donut,LineChart}
theme/                     tokens.ts(styles.css :root を移植) / status.ts
db/                        schema.ts(Drizzle) / client.ts / queries.ts
stores/                    useItemStore / useSettingsStore / useCategoryStore / selectors.ts(派生hook)
utils/                     calculations.ts(利益計算) / format.ts / images.ts(画像保存)
constants/                 categories.ts(seed用) / conditions.ts
types/sql.d.ts             .sql inline-import 用の型宣言
```
- Drizzle+Expo設定: `babel.config.js`(inline-import) / `metro.config.js`(sqlを sourceExts) / `drizzle.config.ts`。`_layout.tsx` が `drizzle/migrations.js` を取り込み適用。

## 6. データモデル / ロジックの要点
- テーブル: `items` / `item_images` / `sale_records` / `settings`(id=1シングルトン) / `categories`。金額は円(integer)、日時は timestamp_ms。
- **status は UI実装キーに統一**: `stored(保管中)/prep(出品準備中)/listed(出品中)/sold(売却済み)/hold(保留)`（設計書の preparing→prep, maybe→stored に対応）。**5種固定**（売却ロジック直結のため編集不可）。
- 利益計算（[utils/calculations.ts](../src/utils/calculations.ts)）: 見込み利益 = 売価 − round(売価×feeRate) − 送料。feeRate は settings（既定0.10）。実利益も同式。
- 画像: `expo-file-system` の新API（`Paths.document/images/` に UUIDで保存）。**無料版=1枚**（Pro複数枚はSTEP4）。
- カテゴリ: DBテーブル化済み。標準11カテゴリは isDefault=true で seed・削除不可、追加分のみ削除可。`items.category` は文字列保持（FKでないのでカテゴリ削除は既存itemに影響しない）。

## 7. 完了済み（STEP1〜3）
- STEP1: 全画面UIをプロトタイプ忠実移植（ダミーデータ）。
- STEP2: SQLite+Drizzle、Zustand、写真、追加/編集/削除/お気に入り/ホーム集計/詳細/売却記録の実データ化。
- STEP3: 一覧の並び替え・絞り込み、分析画面の実データ化（各グラフ＋期間/タブ）、設定（テーマ保存・データ削除・カテゴリ編集・アプリ情報）、売却日の日付選択。

## 8. 既知の方針・未対応（意図的）
- **テーマはライト描画固定**。light/dark/system の選択・保存はするが、ダークの実配色適用は後日ポリッシュ（全画面のtokens色参照をテーマ化する大改修のため分離）。
- 設定の「利益の計算方法 / よくある質問 / 利用規約 / プライバシーポリシー」は**アプリ内テキスト画面で実装済み**（`src/constants/docs.ts` に内容、`app/settings/info/[key].tsx` で表示、DetailHeader方式）。「お問い合わせ」は mailto（`625.somq2525@gmail.com`）。※規約/プライバシーの**運営者名は汎用表記**、ASCのプライバシーポリシーURL欄用に同文面のホスティングは別途必要。
- 詳細の「分析を見る」は分析タブへ遷移するのみ。
- **ビルド/配信は GitHub Actions(macOS) + fastlane（prebuild方式・EAS非依存）**。STEP4で実装。Expo Go はあくまで開発確認用で、STEP4で native依存(iap/admob)が入ると dev client に移行する。

## 9. STEP4（実装済みコード）
- 課金: **RevenueCat**（`src/purchases/`：config.ts のAPIキー/エンタイトルメント`pro`、PurchaseProvider が `react-native-purchases` で offerings取得/購入/復元、entitlement→isProをsettingsへ反映。Expo Goでは no-op）。製品: 買い切り¥1,500=`com.selllater.app.pro.lifetime` / 月額¥500=`com.selllater.app.pro.monthly`。iOSキーは `EXPO_PUBLIC_REVENUECAT_IOS_KEY`。
- Pro制限: `src/utils/limits.ts`。21件超で `/paywall`（[TabBar](../src/components/TabBar.tsx)・[list](../src/app/(tabs)/list.tsx)）、写真2枚目ロック（[ImageField](../src/components/ImageField.tsx)）、分析ロック（[analytics](../src/app/(tabs)/analytics.tsx)）。ペイウォール=[paywall.tsx](../src/app/paywall.tsx)。
- 写真複数枚: 無料1/Pro10（ProductForm/ImageField/useItemStore/selectors/詳細カルーセル）。
- 広告: `src/ads/`＋[AdBanner](../src/components/AdBanner.tsx)。無料&非Expo Goのみ、現状Googleテストユニット。home/list下部。
- アイコン/スプラッシュ: `scripts/gen-assets.js`（依存なしPNG生成）→ `assets/`（青基調プレースホルダ）。
- CI: `ios/`は非コミット。`.github/workflows/ios.yml` が **macos-26（Xcode 26 / iOS 26 SDK 必須に対応）** で `npm ci`→`expo prebuild`→`pod install`→ASCキー復元→match検証→`fastlane ios beta`。fastlane=リポジトリ直下 `Gemfile`/`fastlane/{Appfile,Matchfile,Fastfile}`（match→gym→pilot、workspace/schemeは自動検出）。`fastlane/Fastfile` の要点: `before_all` で `setup_ci`（CI時の一時キーチェーン）、`build` レーンで `update_code_signing_settings`（手動署名・APPLE_TEAM_ID・matchプロファイル）＋ gym の `xcargs` でビルド番号=`GITHUB_RUN_NUMBER`。
- 証明書セットアップ用に `.github/workflows/ios-certs.yml`（`fastlane ios certs`＝match `readonly:false`）あり。**初回1回だけ手動実行済み**（配布証明書 `82CTL825DG` / プロファイル `match AppStore com.selllater.app` を certificates リポに保存済み）。再発行が必要な時以外は実行不要。

## 10. Git運用
- 変更後は原則コミット（日本語メッセージ）、**push はユーザーが行う**。
- 生成物・node_modules・秘密情報はコミットしない（`.gitignore` 済み、`/ios` `/android` `*.p8` も無視）。
- リモート: `origin` = `https://github.com/sknk-aaa/sell-later-app.git`（main）。

## 11. 完了済みのユーザー側セットアップ
- Apple Developer: App ID `com.selllater.app` 登録、Sandboxテスター作成。App Store Connect でアプリ作成・IAP製品2つ（`...pro.lifetime`¥1,500 / `...pro.monthly`¥500）作成。
- RevenueCat: プロジェクト`selllater`、App Storeアプリ追加、In-App Purchaseキー登録、製品→Entitlement `pro`→Offering `default(current)` 設定。iOS公開キー取得。
- ASC API キー発行（fastlane/RevenueCat用）: ファイル `AuthKey_GSFCH87D9K.p8`、**Key ID `GSFCH87D9K`**。
- GitHub Secrets（8つ）登録済み: `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `APPLE_TEAM_ID` / `MATCH_GIT_URL` / `MATCH_PASSWORD` / `MATCH_GIT_BASIC_AUTHORIZATION` / `APP_STORE_CONNECT_API_KEY_ID`(=GSFCH87D9K) / `APP_STORE_CONNECT_API_ISSUER_ID` / `APP_STORE_CONNECT_API_KEY`（= .p8の生PEM中身）。

## 12. リリースCIの現在地

**✅ GitHub Actions → TestFlight 初回配信に成功（2026-05-30）。** `main` への push（または `v*` タグ・手動 Run）で `ios.yml` が走り、ビルド→TestFlight 自動アップロードが通る状態。ビルド `1.0.0 (1)` が TestFlight に上がり、内部テスター「売るもの管理テスター」の実機にインストール済み。

### CIで踏んだ問題と解決（同種の再発時の参考）
1. **workspace検出** … 日本語アプリ名のためExpoがプロジェクト名を `app` に採用 → `ios/app.xcworkspace`。Fastfileは `__dir__` 基準の絶対パスで検出。
2. **ASC APIキー読込** … Secret `APP_STORE_CONNECT_API_KEY` は**生PEMの.p8中身**（base64でも可。ワークフローが両対応し `openssl` で `KEY OK` 検証）。
3. **match の git 認証** … `MATCH_GIT_BASIC_AUTHORIZATION` は `base64("sknk-aaa:<PAT>")`。トークン値ミスで `GIT AUTH FAILED`/`Repository not found` が続いた → WSLで `curl -H "Authorization: Bearer <PAT>" https://api.github.com/user`＝200、base64のround-trip検証してから Secret 再設定で解決。検証stepの `git ls-remote` は `actions/checkout` の認証ヘッダと衝突するため **`cd $RUNNER_TEMP` でリポ外実行**（`http.extraheader` のみ付与）。
4. **証明書作成** … 「iOS Certificates」ワークフロー（`fastlane ios certs`）を1回実行して配布証明書＋プロファイルを certificates リポに保存（初回のみ）。
5. **gym archive 失敗 `Signing requires a development team`** … prebuild生成プロジェクトが自動署名・チーム空のため → `update_code_signing_settings`（自動署名OFF・APPLE_TEAM_ID・matchプロファイル）＋ gym `export_options`(signingStyle manual) で手動署名化。
6. **codesign ハング（40分超でタイムアウト）** … login.keychain の署名UIダイアログ待ち → Fastfile `before_all { setup_ci if ENV["CI"] }`（一時キーチェーン）で解消。
7. **アップロードで `Validation failed (409) SDK version issue`** … Apple が iOS 26 SDK / Xcode 26 必須化 → ランナーを `runs-on: macos-26` ＋「最新Xcode選択step」に変更。
8. **ビルド番号重複対策** … Expo生成のInfo.plistは `CFBundleVersion` が固定値で `xcargs(CURRENT_PROJECT_VERSION)` が効かない（アップロードで `bundle version '1' already used` 409）。→ gym前に `set_info_plist_value` で `ios/<scheme>/Info.plist` の `CFBundleVersion` を `$GITHUB_RUN_NUMBER` に直接書換。

### 残タスク
- **実機での最終動作確認（TestFlight）**: 購入（RevenueCatサンドボックス＝ASCのSandboxテスターでサインイン）・広告バナー（無料時／現状テスト広告）・Pro制限（21件超・写真2枚目ロック・分析ロック）・複数写真。
- **AdMob本番ID差し替え**: `app.json` の `react-native-google-mobile-ads` `iosAppId` と `src/ads/AdBannerNative.tsx` の `BANNER_UNIT_ID`（現状Googleテスト）。※審査までテストIDのまま。
- **ストア掲載名の確定**（App Store Connect入力。ホーム表示名は `app.json` の `name`＝「売るもの管理」）。
- **本番アイコン/スプラッシュ差し替え**（`assets/`、現状 `scripts/gen-assets.js` の青プレースホルダ）。
- 配信運用: 日常のJS修正は Expo Go で即確認、ネイティブ確認・配信時のみ push→CI。`sell-later-app` リポは **public** なので Actions は無料・無制限。RN Releaseビルドは1回10〜30分。
- **他アプリへ再現する手順は [docs/IOS_CICD_RECIPE.md](IOS_CICD_RECIPE.md) に一般化してまとめた**（Mac無し・無料でTestFlight配信。設定ファイル全文＋ハマり所と解決の一覧）。
