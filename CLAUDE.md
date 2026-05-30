# sell-later-app（Worthnest / うるカタ）

「いつかメルカリで売る物」を資産として見える化するiOSアプリ。ホームで「全部売ったらいくら」を示す。海外メイン（英語主・日本語副）。
※ `/project/CLAUDE.md` の共通ルール（日本語・commit止まりでpushしない・コメント原則不要・型安全・破壊的操作禁止・ドキュメント構成 等）を継承する。ここには**このアプリ固有の事項**だけ書く。

## 厳守事項（最優先）
- **Expo SDK は 54 に固定。勝手に上げない。** 動作確認端末の Expo Go が 54.0.2（SDK54まで）のため。詳細は [docs/OPERATIONS.md](docs/OPERATIONS.md)。
- 実行は必ず **`npx expo`**（グローバル `expo` 未インストール）。
- ネイティブ依存（RevenueCat課金 / AdMob広告 / keyboard-controller）は **Expo Go では動かない**。`src/utils/env.ts` の `isExpoGo` で **Expo Go時はno-op化**して起動を維持する設計。実動作は dev build / TestFlight で確認。この前提を壊さない。

## スタック
Expo SDK54（expo-router6 / RN0.81.5 / React19.1）/ TypeScript / expo-sqlite + **Drizzle ORM** / Zustand / expo-file-system(新API) / expo-image-picker / react-native-svg / i18n-js / keyboard-controller。課金=react-native-purchases(RevenueCat)、広告=react-native-google-mobile-ads。

## 変更後の検証（可能な範囲で実行）
- `npx tsc --noEmit` … 型チェック（エラー0維持）
- スキーマ変更時 `npx drizzle-kit generate` … `drizzle/` にマイグレ生成＆コミット
- `npx expo export -p ios` … JSバンドル成功でモジュール解決を確認（後 `/tmp` 出力は削除）

## ドキュメント索引
| doc | 役割 | いつ読む |
|---|---|---|
| [docs/HANDOFF.md](docs/HANDOFF.md) | **現状・残タスク**（毎回更新） | まず最初に。再開時の起点 |
| [docs/DESIGN.md](docs/DESIGN.md) | 仕様の正（データモデル・計算式・画面） | 仕様を確認・変更する時 |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | 運用の正（環境固定・bundle id・課金/広告ID・配信・Secrets） | インフラ・配信・固有設定を扱う時 |
| `~/.claude/docs/IOS_CICD_RECIPE.md` | iOS CI/CD再現手順（汎用・全アプリ共通） | 配信が詰まった時／他アプリへ流用する時 |
