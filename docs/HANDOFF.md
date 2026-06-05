# 現状・引き継ぎ（sell-later-app）

セッションが途切れても再開できるよう、**今どこまで進んでいて・何が残っているか**をまとめる。毎セッション更新する唯一の場所。仕様は [DESIGN.md](DESIGN.md)、インフラ・配信・固有設定値は [OPERATIONS.md](OPERATIONS.md)。

## 現在地（最終更新: 2026-06-05）
- **App Store 審査ブロック中。Apple Developer Supportに問い合わせ済み（お問い合わせ番号 102908746727、2営業日以内に返信予定）。**
- **根本原因（重要）**: 初回IAPをバージョンに紐付ける「アプリ内購入とサブスクリプション」セクションが**バージョン1.0ページに表示されない** → サブスク2製品(lifetime/monthly、共にWaiting for Review)を審査に添付できず、レビュアーが購入フローに到達できない。**Expo/React Nativeアプリで起きる既知のASC不具合**（Apple Developer Forums 804327 / 766217、RevenueCatコミュニティで複数報告）。ビルド外して再追加では直らないことも確認済み。**ASC画面操作では解決不可、Apple側の対応待ち**。
  - 経緯: Guideline 2.1で3回連続リジェクト(購入フロー試せず)。当初はテストアカウント不足と判断しNotesにSandbox記載→効果なし。真因はIAP未添付と判明。
- レビュー用Sandboxアカウント `625.somq2525+sbx2@gmail.com`(クリーン、購入テスト禁止)をNotesに記載済み。`+sbx1`は既にPro購入済みで使用不可。
- 1回目リジェクト(Guideline 4 権限言語 / 3.1.2c サブスク情報)対応済み:写真権限の英語デフォルト+ja化、ペイウォールに機能するEULA/プライバシーリンク+自動更新説明、利用規約HTML公開(docs/terms.html)、ASC説明文にリンク追記、onboarding固定幅解消(iPad)。

## 次にやること（Apple返信後）
- サポート返信を確認。IAPセクションの出し方を教わるか、Apple側で紐付けてもらう。
- 紐付けできたら2製品(lifetime/monthly)をバージョンに添付して再提出。
- それまではコード変更不要（コード側は完成・問題なし）。
- STEP1〜4 のコード実装完了。GitHub Actions → TestFlight 自動配信パイプライン稼働中。
- 海外展開ピボット（i18n英日 / 多通貨セント保存 / 商品ごと手数料）実装済み。ブランド名 `Worthnest`（海外）/「うるカタ」（日本表示名）。
- オンボーディング・キーボード追従（keyboard-controller）・入力摩擦低減・設定ページ再構成・分析グラフ修正 完了。
- ストア掲載文・キーワード（英日）は [ASO_STORE_LISTING.md](ASO_STORE_LISTING.md)。カテゴリ=ユーティリティ/ショッピング。
- プライバシーポリシー: GitHub Pages（`docs/` 配下、index.html + privacy-policy.html）。
- 設定: プライマリ言語=英語 / iPad非対応（supportsTablet=false）/ 縦固定。

## ディレクトリ構成（src/）
```
app/                       expo-router ルート
  _layout.tsx              Root Stack。useMigrations→各storeをload。KeyboardProvider(Expo Go時no-op)
  index.tsx                onboardingDoneで /home or /onboarding へ
  onboarding.tsx           初回オンボ（2スライド+SVG、CTA→/add?from=onboarding）
  (tabs)/_layout.tsx       Tabs（カスタム TabBar）。home/list/analytics/settings ＋中央=追加モーダル
  (tabs)/{home,list,analytics,settings}.tsx
  item/[id].tsx            商品詳細   item/[id]/edit.tsx 編集(modal)
  add.tsx / sale.tsx       追加・売却記録(modal)
  settings/categories.tsx  カテゴリ編集   settings/info/[key].tsx 法務テキスト表示
components/                Icon(svg) / StatusBadge / PhotoSlot / TabBar / PickerSheet / ImageField /
                           ProductForm / FormScrollView(キーボード追従) / headers / ui / charts
theme/                     tokens.ts / status.ts
db/                        schema.ts(Drizzle) / client.ts / queries.ts
stores/                    useItemStore / useSettingsStore / useCategoryStore / selectors.ts
utils/                     calculations.ts(利益bps) / money.ts(通貨) / useCurrency.ts / format.ts / images.ts / limits.ts(Pro制限) / env.ts(isExpoGo)
i18n/                      en.ts / ja.ts / index.ts
constants/                 categories.ts / conditions.ts / platforms.ts / docs.ts(法務文言)
purchases/                 RevenueCat   ads/ AdMob
```
- Drizzle migration は 0000〜0007（0004=金額×100移行 / 0006=カテゴリキー化 / 0007=onboarding_done）。データモデル詳細は [DESIGN.md](DESIGN.md)。

## 残タスク
- **審査結果待ち**。リジェクトされたら理由に対応して再提出。
- **承認後: AdMob本番ID差し替え**（現状テストID。差し替え箇所は [OPERATIONS.md](OPERATIONS.md)）→ 再ビルド・再提出。
- 「売却済みにする」ボタンのわかりにくさ改善（相談ペンディング）。
- 完了済み（参考）: 実機確認（オンボ/キーボード追従/購入Sandbox/広告/Pro制限/英ロケール）、スクショ、掲載文入力、GitHub Pages。

## 既知の方針・意図的な未対応
- **テーマはライト描画固定**。light/dark/system の選択・保存はするが、ダークの実配色適用は後日。
- 詳細の「分析を見る」は分析タブへ遷移するのみ。
- キーボード追従はネイティブ依存のため **Expo Goでは効かない**（通常スクロールにフォールバック）。実機で要確認。
