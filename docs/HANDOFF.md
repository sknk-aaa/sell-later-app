# 現状・引き継ぎ（sell-later-app）

セッションが途切れても再開できるよう、**今どこまで進んでいて・何が残っているか**をまとめる。毎セッション更新する唯一の場所。仕様は [DESIGN.md](DESIGN.md)、インフラ・配信・固有設定値は [OPERATIONS.md](OPERATIONS.md)。

## 現在地（最終更新: 2026-06-09）
- **v1.0.0 App Storeリリース済み（公開中）。** その後 **v1.1.0 を提出済み（リリース後初アップデート、審査結果待ち）。**
- v1.1.0 の内容: アイコン刷新(icon02=家+タグW+巣)、入力欄のキーボード隠れ修正(FormScroll.bottomOffset=100)、ホーム画面サマリー再構成(上段=売却済み利益+想定利益合計/下段=4ステータス件数アイコン)、レビュー促進(課金後・登録3件目=requestReview / 設定「レビューして応援」=ストアのwrite-review画面へ)。
- 課金: 製品ID `com.selllater.app.pro.lifetime2` / `com.selllater.app.pro.monthly2`(作り直し版)。RevenueCat Offering経由で取得するためコードは製品ID非依存。
- レビュー用Sandbox `625.somq2525+sbx2@gmail.com`(クリーン)をNotesに記載済み。`+sbx1`はPro購入済みで使用不可。

## 次にやること
- **v1.1.0 審査結果待ち**。
- AdMob本番ID差し替え([OPERATIONS.md](OPERATIONS.md))が**未対応**(現状テストID)。本番収益化するなら次アップデートで差し替え。
- アップデート時はapp.jsonの`version`を必ず上げる(同バージョンは提出不可)。

## 審査で踏んだ罠（再発防止メモ）
- **初回IAPは「提出準備完了(Ready to Submit)」のままアプリバージョンと一緒に提出する。絶対に単独でSubmit for Reviewしない。** 単独提出すると「審査待ち」でスタックし、バージョンに紐付けられず作り直し(新製品ID)になる。製品IDは再利用不可。
- サブスクアプリは購入フロー内に「名称・期間・価格・EULA/プライバシーリンク」を全て表示する必要(Guideline 3.1.2c)。ペイウォールにプランカードで明示済み。
- レビュー用Sandboxは購入済みだと「最初からPro」で購入フロー審査不可→クリーンなものを渡す。
- 権限文言は端末言語に追従させる(app.jsonは英語デフォルト+locales/ja.jsonで上書き)。
- CI: Ruby 3.3.4+でfastlane依存のmulti_json等が標準gemから外れる→Gemfileに明示追加済み。
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
