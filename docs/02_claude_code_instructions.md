# Claude Code への指示文（実装）

> **⚠️ 履歴ドキュメント（完了済み・STEP1〜4 実装完了）。** これは開発開始時の初期計画書であり、**現行の正ではない**。経緯を辿る目的でのみ参照すること。実装途中で計画から変わった点に注意:
> - 課金は `react-native-iap` → **RevenueCat(react-native-purchases)** に変更
> - 月額は 480円 → **500円**
> - `ios/` は **Git管理しない**（CIが毎回 `expo prebuild` で生成）
> - CIランナーは `macos-latest` → **macos-26**（iOS 26 SDK必須化に対応）
>
> **現状・構成・残タスクは [HANDOFF.md](HANDOFF.md)、配信手順は [IOS_CICD_RECIPE.md](IOS_CICD_RECIPE.md) を見ること。**

## 役割
Claude Code は **中身（実装）** を担当する。UI/見た目は Claude Design で作成済みのプロトタイプを使い、データ・ロジック・課金・配信を設計書に基づいて実装する。

## 渡すもの
1. Claude Design からエクスポートしたパッケージ（プロトタイプ＋デザイン意図）
2. 設計書（sellitlater_design_v1.md）
3. この指示文

---

## 前提の共有（最初に伝える）

これから iOS アプリ「売るもの管理アプリ」を実装してもらう。UIは添付の Claude Design プロトタイプで完成しているので、それを React Native + Expo の実装に落とし込み、設計書に従ってデータ層・ロジック・課金を作っていく。

技術スタック（設計書 1.3 準拠）:
- React Native + Expo SDK（Bare Workflow / prebuild方式。EAS Buildには依存しない）/ TypeScript
- expo-router / expo-sqlite + Drizzle ORM / Zustand
- expo-file-system（画像）/ react-native-iap（課金）/ AdMob（広告）
- GitHub Actions (macOS runner) + fastlane（match で証明書管理、pilot で TestFlight配信）

これから4ステップに分けて依頼する。**各ステップの範囲を超えて先回り実装しないこと。** 各ステップ完了時に報告し、こちらの確認を待つこと。

---

## STEP 1: プロトタイプを実装コードに変換（データなし）
- Expo + TypeScript プロジェクト初期化
- Claude Design プロトタイプを React Native + expo-router の実装に変換
- 5タブ + 商品詳細 + 編集 + 売却記録モーダルの全画面
- ハードコードのダミーデータで見た目を完成、画面遷移を配線
- デザインシステム（色・タイポ・共通コンポーネント）をコード化
- 完了条件: `npx expo start` で起動し、全画面がプロトタイプ通りに表示され遷移が動く

## STEP 2: データ基盤 + コア体験
- SQLite + Drizzle スキーマ（設計書2章のデータモデル準拠：Item / ItemImage / SaleRecord / Setting）
- Zustand ストア
- 写真機能（expo-image-picker + ファイル保存、無料版1枚）
- ダミー→実データ差し替え: 追加・編集・削除、一覧（基本表示）、ホーム集計、詳細、売却記録
- 利益計算は設計書3章準拠（手数料10%、見込み利益、利益率、実利益）
- 完了条件: 追加→ホーム反映→詳細→売却記録までが動く

## STEP 3: 機能拡充
- 一覧の並び替え・絞り込み・グリッド/リスト切替
- お気に入り（★）機能
- 分析画面のグラフ（カテゴリ別ドーナツ、月別折れ線、横棒、ステータス別ドーナツ、売却実績テーブル）
- 設定画面の機能（テーマ、データ初期化、ステータス/カテゴリ編集、アプリ情報）
- 完了条件: Pro制限なしの完全版として動作

## STEP 4: 課金・広告・リリース準備
- react-native-iap（買い切り1,500円 + サブスク月額480円）
- Pro版判定（Setting.isPro）と各画面の制限適用:
  - 21件目でアップグレード誘導 / 写真2枚目以降ロック / 分析ロック
- AdMob バナー（無料版のみ）
- アプリアイコン、スプラッシュ、App Store メタデータ
- `npx expo prebuild --platform ios` でネイティブプロジェクト生成（iosディレクトリをGit管理に追加）
- fastlane セットアップ:
  - `fastlane match`（証明書・プロビジョニングプロファイル管理、別途プライベートリポジトリが必要）
  - `fastlane pilot`（TestFlight配信）
  - Fastfile に build / beta レーン定義
- GitHub Actions ワークフロー (`.github/workflows/ios.yml`):
  - `runs-on: macos-latest`
  - GitHub Secretsを使用（MATCH_PASSWORD / MATCH_GIT_BASIC_AUTHORIZATION / App Store Connect API Key関連）
  - main pushまたはタグでトリガー、ビルド成功でTestFlight自動配信
- 設計書6章のSTEP 4詳細を参照すること
- 完了条件: GitHub Actionsでビルドが成功しTestFlight配布、課金・広告・Pro制限が動作

---

## v1.0で実装しない要素（設計書4.4準拠）
プロトタイプにも含まれていないはずだが、念のため明示:
- 設定: バックアップ / エクスポート / アカウント / 通貨設定 / 通知設定
- ホーム: 通知ベル
- 商品詳細: シェア / 複製
- iCloud同期、CSV、他フリマ連携、税務管理 等（設計書8章参照）

## 注意
- メルカリ手数料率は Setting.feeRate（デフォルト0.10）で保持し、ハードコードしない
- データ初期化時は DBレコード削除 + 画像ディレクトリ削除を両方実行
- 各ステップで動作確認しながら進め、勝手に次ステップへ進まない
