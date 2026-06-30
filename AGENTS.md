> 同dirの CLAUDE.md も併設。共通ルールは /home/aaa/project/AGENTS.md。

# sell-later-app（Worthnest / うるカタ）

「いつかメルカリで売る物」を資産として見える化する iOS アプリ。ホームで「全部売ったらいくら」を示し、断捨離・一般層に届かせる。**海外メイン（英語主・日本語副）にピボット済み**。スタック: Expo SDK54（expo-router6 / RN0.81.5 / React19.1）/ TypeScript / expo-sqlite + **Drizzle ORM** / Zustand / expo-file-system(新API) / expo-image-picker / react-native-svg / i18n-js / keyboard-controller。課金=react-native-purchases(**RevenueCat**)、広告=react-native-google-mobile-ads。

## 事業/マーケ方針

- このアプリは公開後も、ASO、ストア画像、オンボーディング、広告/Pro導線、レビュー獲得、SNS/動画施策を継続改善して売上を作る前提で扱う。
- コア訴求は「家にある不用品の資産価値を見える化する」。業者向け在庫管理ではなく、一般ユーザーの断捨離・片付け・副収入の文脈で伝える。
- 海外向けは Worthnest、英語主。日本向けは「うるカタ」/「売り物カタログ」。日本でもメルカリ等の商標をApp名で前面に出しすぎない。
- マーケ施策、ストア画像方針、SNS/動画台本、価格/広告/Pro AB案は `docs/MARKETING.md` に蓄積する。確定済みストア掲載文は `docs/ASO_STORE_LISTING.md` を正とする。

## このアプリ固有の厳守事項

- **Expo SDK は 54 に固定。勝手に上げない。** 確認端末の Expo Go が 54.0.2（SDK54上限）のため。SDK更新が要るときは端末の Expo Go 対応SDKを先に確認。リリースビルドは GitHub Actions + fastlane(prebuild)で SDK上限の制約を受けない。
- 実行は必ず **`npx expo`**（グローバル `expo` 未インストール）。
- ネイティブ依存（RevenueCat / AdMob / keyboard-controller）は **Expo Go では動かない**。`src/utils/env.ts` の `isExpoGo` で Expo Go 時は no-op 化して起動を維持する設計を壊さない。実動作は dev build / TestFlight で確認。
- **DBスキーマ変更時は必ず**: ①`src/db/schema.ts` 変更 → ②`npx drizzle-kit generate` で `drizzle/` にマイグレ生成＆コミット。手動でマイグレを足した場合は journal/snapshot/migrations.js を手で整合させ、`generate` が「No schema changes」を返す状態を維持する（過去に2度壊して `git reset --hard` で復旧した経緯あり）。
- 変更後の検証順: `ls drizzle/*.sql` と journal idx数の一致 → `drizzle-kit generate` が No changes → `npx tsc --noEmit`（エラー0維持）→ 可能なら `npx expo export -p ios`（出力は削除）。

## プロジェクト事実（設計判断・現状）

- **リリース状況**: v1.0.0 は App Store 公開中。v1.1.0（アイコン刷新/キーボード隠れ修正/ホームサマリー再構成/レビュー促進）は提出済み・審査待ち（最終更新 2026-06-09）。アップデート時は `app.json` の `version` を必ず上げる。
- **金額はDB内で常にマイナー単位の整数（×100, 通貨非依存・固定精度2）で保存**。表示/入力時に通貨の小数桁で変換、為替換算はしない。`src/utils/money.ts` ＋ `src/utils/useCurrency().fmt` を使う（旧 `yen()` は廃止）。JPYは小数0、他は2桁。`settings.currency` は `auto`+USD/JPY/EUR/GBP/AUD/CAD。
- **i18n**: `expo-localization`+`i18n-js`、翻訳は `src/i18n/{en,ja,index}.ts`。`useTranslation()` が `settings.language` を購読。端末ロケールで初期言語自動＋設定で手動切替。
- **手数料は商品ごと**に確定（`items.platform/feeRateBps(既定1000)/feeFixedCents`）。`src/utils/calculations.ts` の `feeAmountBps`/`profitBps` を使う（旧 `feeRate`/`expectedProfit` 等は廃止）。プリセットは `src/constants/platforms.ts`（eBay/Poshmark/Mercari/Vinted/Depop/Facebook/Custom）。
- **ブランド**: 海外名=**Worthnest**、日本名=**うるカタ**（App Store重複なし調査済）。`app.json` の `name`=Worthnest、日本語表示名は `locales/ja.json` の `CFBundleDisplayName`。
- **ASOドキュメント方針**: 確定テキスト（ストア貼付用）は `docs/ASO_STORE_LISTING.md`、戦略・競合分析は増えたら `docs/ASO_STRATEGY.md` に分離。カテゴリ=メイン:ユーティリティ/サブ:ショッピング 確定。
- **IAP審査の罠（再発防止）**: IAP製品を**単独で Submit for Review しない**（「審査待ち」でスタックし取り下げ不能・バージョン紐付け不可になる）。製品は「提出準備完了(Ready to Submit)」のままアプリバージョンと一緒に提出する。製品IDは再利用不可。

## 識別子・配信

- **bundle id**: `com.selllater.app`（変更時は app.json / fastlane/Appfile / ワークフロー env / 課金製品ID接頭辞 / AdMob を合わせる）
- **IAP製品ID**（RevenueCat Offering `default` / Entitlement `pro` 経由で取得）:
  - 買い切り: `com.selllater.app.pro.lifetime2`
  - サブスク: `com.selllater.app.pro.monthly2`
- **AdMob は本番ID差し替えが残タスク**（現状テストID）: app.json の `react-native-google-mobile-ads.iosAppId` ＋ `src/ads/AdBannerNative.tsx` の `BANNER_UNIT_ID`。審査までテストIDのまま（自分の広告クリックは規約違反）。
- **CI/CD**: `main` への push（または `v*` タグ・手動Run）で `ios.yml` がビルド→TestFlight 自動配信。GitHub `sknk-aaa`、publicリポ。詳細は `~/.claude/docs/IOS_CICD_RECIPE.md` と docs/OPERATIONS.md。
- プライバシーポリシー: GitHub Pages 公開 `https://sknk-aaa.github.io/sell-later-app/privacy-policy.html`（英日併記）。

## doc索引（要点＋ポインタ。中身は各docが正）

- `docs/HANDOFF.md` … 現状・残タスク・既知の意図的未対応。再開時はまずここ。
- `docs/DESIGN.md` … 仕様の正（データモデル・計算式・5タブ画面仕様・Pro制限）。
- `docs/OPERATIONS.md` … 運用の正（環境固定・bundle id・IAP/AdMob ID・配信・GitHub Secrets）。
- `docs/ASO_STORE_LISTING.md` … ストア掲載確定テキスト。
- `docs/MARKETING.md` … ストア訴求・ASO仮説・SNS/動画台本・価格/広告AB案。
