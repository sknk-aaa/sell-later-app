# 開発引き継ぎメモ（sell-later-app）

セッションが途切れても次の担当が再開できるよう、現状と要点をまとめる。最終更新時点で **STEP1〜3 完了・実機確認済み**。残りは **STEP4（課金・広告・リリース準備）**。

## 1. アプリ概要
「いつかメルカリで売る物」を管理するiOSアプリ。家にある売れる物を資産として見える化し、ホームで「全部売ったらいくらか」を示す。設計書は [docs/sellitlater_design_v1.md](sellitlater_design_v1.md)、実装指示は [docs/02_claude_code_instructions.md](02_claude_code_instructions.md)。UIは Claude Design プロトタイプを React Native へ忠実移植したもの。

## 2. 技術スタックと**固定バージョン（重要）**
- Expo **SDK 54**（expo ~54.0.35 / expo-router 6 / react-native 0.81.5 / react 19.1.0）/ TypeScript ~5.9.2
- expo-sqlite + **Drizzle ORM** / Zustand / expo-file-system(新File/Directory/Paths API) / expo-image-picker / react-native-svg / @react-native-community/datetimepicker
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

## 9. 残り（STEP4 予定）
react-native-iap（買い切り1,500円＋サブスク月額480円）/ Pro判定(Setting.isPro)と制限（21件超でアップグレード誘導・写真2枚目以降ロック・分析ロック）/ AdMobバナー（無料版のみ）/ アプリアイコン・スプラッシュ / App Storeメタデータ / `expo prebuild --platform ios`（ios/ をGit管理）/ fastlane(match/pilot, Fastfile build/beta) / `.github/workflows/ios.yml`（macos-latest, main push/タグ, Secrets: MATCH_PASSWORD / MATCH_GIT_BASIC_AUTHORIZATION / App Store Connect API Key関連）。詳細は設計書6章 STEP4。

## 10. Git運用
- 変更後は原則コミット（日本語メッセージ）、**push はユーザーが行う**。
- 生成物・node_modules・秘密情報はコミットしない（`.gitignore` 済み、`/ios` `/android` も無視）。
- これまでのコミット: STEP1 / STEP2 / SDK56→55 / SDK55→54 / STEP3。
