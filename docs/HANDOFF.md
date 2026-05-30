# 現状・引き継ぎ（sell-later-app）

セッションが途切れても再開できるよう、**今どこまで進んでいて・何が残っているか**をまとめる。毎セッション更新する唯一の場所。仕様は [DESIGN.md](DESIGN.md)、インフラ・配信・固有設定値は [OPERATIONS.md](OPERATIONS.md)。

## 現在地（最終更新: 2026-05-30）
- **STEP1〜4 のコード実装完了**、**GitHub Actions → TestFlight 初回配信成功（ビルド `1.0.0 (1)`）**。CI自動配信パイプライン完成。
- 海外展開ピボット（i18n英日 / 多通貨セント保存 / 商品ごと手数料）実装済み。ブランド名 `Worthnest`（海外）/「うるカタ」（日本表示名）。
- オンボーディング・キーボード追従（keyboard-controller）・入力摩擦低減・UI調整 完了。
- **リリース準備中**。次は最新ビルドのpush → TestFlight実機確認。

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

## 残タスク（リリースまで）
- **最新ビルドのpush → TestFlight実機確認**: オンボ初回表示 / キーボード追従 / 購入（Sandbox）/ 広告バナー / Pro制限（21件超・写真2枚目・分析ロック）/ 英語ロケール表示。
- **App Store スクリーンショット**（ユーザー作業。6.5インチ必須・各ロケール）。
- **AdMob本番ID差し替え**（審査までテストIDのまま。差し替え箇所は [OPERATIONS.md](OPERATIONS.md)）。
- GitHub Pages 有効化（プライバシーポリシーURL。設定は [OPERATIONS.md](OPERATIONS.md)）。

## 既知の方針・意図的な未対応
- **テーマはライト描画固定**。light/dark/system の選択・保存はするが、ダークの実配色適用は後日。
- 詳細の「分析を見る」は分析タブへ遷移するのみ。
- キーボード追従はネイティブ依存のため **Expo Goでは効かない**（通常スクロールにフォールバック）。実機で要確認。
