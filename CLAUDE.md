# sell-later-app（売るもの管理）

「いつかメルカリで売る物」を資産として見える化するiOSアプリ。ホームで「全部売ったらいくら」を示す。
※ `/project/CLAUDE.md` の共通ルール（日本語・commit止まりでpushしない・コメント原則不要・型安全・破壊的操作禁止 等）を継承する。ここには**このアプリ固有の事項**だけ書く。

## 厳守事項（最優先）
- **Expo SDK は 54 に固定。勝手に上げない。** 動作確認に使う端末の Expo Go が 54.0.2（SDK54まで）のため。SDK更新時は必ず端末側の対応SDKを先に確認。→ [docs/HANDOFF.md](docs/HANDOFF.md) 2章
- 実行は必ず **`npx expo`**（グローバル `expo` 未インストール）。
- ネイティブ依存（**RevenueCat課金 / AdMob広告**）は **Expo Go では動かない**。`src/utils/env.ts` の `isExpoGo` で **Expo Go時はno-op化**して起動を維持する設計。実動作は dev build / TestFlight で確認する。この前提を壊さない。

## スタック
Expo SDK54（expo-router6 / RN0.81.5 / React19.1）/ TypeScript / expo-sqlite + **Drizzle ORM** / Zustand / expo-file-system(新API) / expo-image-picker / react-native-svg。課金=react-native-purchases(RevenueCat)、広告=react-native-google-mobile-ads。

## 変更後の検証（可能な範囲で実行）
- `npx tsc --noEmit` … 型チェック（エラー0維持）
- スキーマ変更時 `npx drizzle-kit generate` … `drizzle/` にマイグレ生成＆コミット
- `npx expo export -p ios` … JSバンドル成功でモジュール解決を確認（後 `/tmp` 出力は削除）

## 開発確認（実機・JS修正）
`npx expo start -c --tunnel` → iPhoneの Expo Go でQR読取。前のサーバーはCtrl+Cで停止、Expo Go履歴の古いプロジェクトは削除してから新QRで開く。**この環境(WSL/Linux)にiOSシミュレータは無い**ため、AI側は上記コマンドで担保、実機目視はユーザー。

## 配信（ネイティブ確認・リリース）
`main` に push すると GitHub Actions が TestFlight までビルド・配信（**publicリポなので無料**）。1回10〜30分。証明書作成は「iOS Certificates」を初回1回だけ実行済み。詳細・再現手順は [docs/IOS_CICD_RECIPE.md](docs/IOS_CICD_RECIPE.md)。

## ドキュメント索引
| doc | 役割 | いつ読む |
|---|---|---|
| [docs/HANDOFF.md](docs/HANDOFF.md) | **現状・全体像・構成・残タスク** | まず最初に。再開時の起点 |
| [docs/sellitlater_design_v1.md](docs/sellitlater_design_v1.md) | 設計書（仕様の正） | 仕様・データモデル・計算式を確認する時 |
| [docs/IOS_CICD_RECIPE.md](docs/IOS_CICD_RECIPE.md) | iOS CI/CD再現手順（汎用） | 配信が詰まった時／他アプリへ流用する時 |
| [docs/RELEASE_SETUP.md](docs/RELEASE_SETUP.md) | このアプリ固有のリリース設定値（IAP製品ID・RevenueCat・AdMob） | 課金/広告の本番設定を扱う時 |
| [docs/02_claude_code_instructions.md](docs/02_claude_code_instructions.md) | 初期の4ステップ計画書（**履歴・完了済み**） | 経緯を辿る時のみ |

## ディレクトリ要点（src/）
`app/`=expo-routerルート（`_layout`でマイグレ適用後にstore load、(tabs)+item/[id]+add/sale/paywallモーダル） / `components/` / `theme/`(tokens) / `db/`(Drizzle schema/queries) / `stores/`(Zustand+selectors) / `utils/`(calculations=利益計算, limits=Pro制限, env) / `purchases/`(RevenueCat) / `ads/`(AdMob)。詳細は [docs/HANDOFF.md](docs/HANDOFF.md) 5章。
