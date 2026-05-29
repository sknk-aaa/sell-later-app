# 開発引き継ぎメモ（sell-later-app）

セッションが途切れても次の担当が再開できるよう、現状と要点をまとめる。最終更新時点で **STEP1〜4 のコード実装完了**（STEP1〜3は実機確認済み）。現在は **CIでのTestFlight初回配信をデバッグ中** → **最新状況は末尾「12. リリースCIの現在地」を最初に読む**こと。

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
- 設定の「利益の計算方法 / よくある質問 / お問い合わせ / 利用規約 / プライバシーポリシー」はv1.0プレースホルダ（Alert）。
- 詳細の「分析を見る」は分析タブへ遷移するのみ。
- **ビルド/配信は GitHub Actions(macOS) + fastlane（prebuild方式・EAS非依存）**。STEP4で実装。Expo Go はあくまで開発確認用で、STEP4で native依存(iap/admob)が入ると dev client に移行する。

## 9. STEP4（実装済みコード）
- 課金: **RevenueCat**（`src/purchases/`：config.ts のAPIキー/エンタイトルメント`pro`、PurchaseProvider が `react-native-purchases` で offerings取得/購入/復元、entitlement→isProをsettingsへ反映。Expo Goでは no-op）。製品: 買い切り¥1,500=`com.selllater.app.pro.lifetime` / 月額¥500=`com.selllater.app.pro.monthly`。iOSキーは `EXPO_PUBLIC_REVENUECAT_IOS_KEY`。
- Pro制限: `src/utils/limits.ts`。21件超で `/paywall`（[TabBar](../src/components/TabBar.tsx)・[list](../src/app/(tabs)/list.tsx)）、写真2枚目ロック（[ImageField](../src/components/ImageField.tsx)）、分析ロック（[analytics](../src/app/(tabs)/analytics.tsx)）。ペイウォール=[paywall.tsx](../src/app/paywall.tsx)。
- 写真複数枚: 無料1/Pro10（ProductForm/ImageField/useItemStore/selectors/詳細カルーセル）。
- 広告: `src/ads/`＋[AdBanner](../src/components/AdBanner.tsx)。無料&非Expo Goのみ、現状Googleテストユニット。home/list下部。
- アイコン/スプラッシュ: `scripts/gen-assets.js`（依存なしPNG生成）→ `assets/`（青基調プレースホルダ）。
- CI: `ios/`は非コミット。`.github/workflows/ios.yml` が macos-latest で `npm ci`→`expo prebuild`→`pod-install`→`fastlane ios beta`。fastlane=リポジトリ直下 `Gemfile`/`fastlane/{Appfile,Matchfile,Fastfile}`（match→gym→pilot、workspace/schemeは自動検出）。
- **残り=ユーザー作業のみ**: Apple/ASC・IAP製品・AdMob ID・match用リポジトリ・ASC APIキー・GitHub Secrets。手順は [docs/RELEASE_SETUP.md](RELEASE_SETUP.md)。

## 10. Git運用
- 変更後は原則コミット（日本語メッセージ）、**push はユーザーが行う**。
- 生成物・node_modules・秘密情報はコミットしない（`.gitignore` 済み、`/ios` `/android` `*.p8` も無視）。
- リモート: `origin` = `https://github.com/sknk-aaa/sell-later-app.git`（main）。

## 11. 完了済みのユーザー側セットアップ
- Apple Developer: App ID `com.selllater.app` 登録、Sandboxテスター作成。App Store Connect でアプリ作成・IAP製品2つ（`...pro.lifetime`¥1,500 / `...pro.monthly`¥500）作成。
- RevenueCat: プロジェクト`selllater`、App Storeアプリ追加、In-App Purchaseキー登録、製品→Entitlement `pro`→Offering `default(current)` 設定。iOS公開キー取得。
- ASC API キー発行（fastlane/RevenueCat用）: ファイル `AuthKey_GSFCH87D9K.p8`、**Key ID `GSFCH87D9K`**。
- GitHub Secrets（8つ）登録済み: `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `APPLE_TEAM_ID` / `MATCH_GIT_URL` / `MATCH_PASSWORD` / `MATCH_GIT_BASIC_AUTHORIZATION` / `APP_STORE_CONNECT_API_KEY_ID`(=GSFCH87D9K) / `APP_STORE_CONNECT_API_ISSUER_ID` / `APP_STORE_CONNECT_API_KEY`（= .p8の生PEM中身）。

## 12. リリースCIの現在地（★次セッションはここから）
GitHub Actions で初回TestFlight配信をデバッグ中。CIの通過順に潰してきた:
1. ✅ workspace検出（アプリ名が日本語のためExpoがプロジェクト名を `app` に採用 → `ios/app.xcworkspace`。Fastfileは `__dir__` 基準の絶対パスで検出）。
2. ✅ ASC APIキー読込（`invalid curve name`は解消。Secretは**生PEMの.p8中身**を入れる方式。ワークフローの「Prepare ASC API key」が `KEY OK` を確認）。
3. ⛔ **現在の詰まり = match の証明書リポジトリ clone 失敗**。「iOS Certificates (one-time setup)」を実行すると **`GIT AUTH FAILED`**。

**次の一手（やること）:**
- まず未pushコミットがあるので **`git push`**（最新コミット `ci: match git検証を詳細化…`）。
- GitHub → Actions → **「iOS Certificates (one-time setup)」→ Run workflow**（branch=main）を実行。
- 「Verify match git access」ステップの3行を読む:
  - `URL format:` … `MATCH_GIT_URL` が `https://github.com/sknk-aaa/certificates.git` 形式か（SSHや`.git`無しはNG）
  - `BASIC_AUTH:` … `MATCH_GIT_BASIC_AUTHORIZATION` が `user:token` にデコードできるか（不正なら `echo -n "sknk-aaa:ghp_..." | base64 -w0` で作り直し）
  - `--- git ls-remote ---` 下のエラー … `404/Repository not found`=certificatesリポジトリ未作成かURL違い、`401/403`=トークン権限不足（classic `repo` スコープ要、`certificates`にアクセスできること）
- 上記で原因を直す（多くは①certificates空privateリポジトリ未作成、②BASIC_AUTHのbase64ミス、③トークン権限）。
- `GIT AUTH OK` になれば「iOS Certificates」が証明書を生成・保存 → 次に **「iOS TestFlight」を再実行**（push or 失敗RunのRe-run）→ gym→pilotでTestFlight配信、が通る想定。

**CI通過後の残タスク:**
- AdMob本番ID差し替え（`app.json` の `react-native-google-mobile-ads` `iosAppId` と `src/ads/AdBannerNative.tsx` の `BANNER_UNIT_ID`。現状GoogleテストID）。
- ストア掲載名の確定（App Store Connect入力。ホーム表示名は `app.json` の `name`）。
- 本番アイコン/スプラッシュ差し替え（`assets/`）。
- TestFlight実機で購入(サンドボックス)・広告・Pro制限・複数写真の最終確認。
