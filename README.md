# sell-later-app

「いつかメルカリで売る物」を管理するiOSアプリ（React Native + Expo SDK54）。

## ドキュメント
- [CLAUDE.md](CLAUDE.md) … 開発の入口・厳守事項・doc索引（AI/担当者はまずここ）
- [docs/HANDOFF.md](docs/HANDOFF.md) … 現状・構成・残タスク
- [docs/sellitlater_design_v1.md](docs/sellitlater_design_v1.md) … 設計書（仕様の正）
- [docs/IOS_CICD_RECIPE.md](docs/IOS_CICD_RECIPE.md) … Mac無し・無料でTestFlight配信するCI手順（汎用・他アプリ流用可）
- [docs/RELEASE_SETUP.md](docs/RELEASE_SETUP.md) … このアプリ固有のリリース設定値（課金・広告）

## 開発
```
npx expo start -c --tunnel   # Expo Go(SDK54)で確認（JS/UIは即反映）
npx tsc --noEmit             # 型チェック
```

## 配信
`main` に push すると GitHub Actions が TestFlight までビルド・自動配信（publicリポなので無料）。手順は [docs/IOS_CICD_RECIPE.md](docs/IOS_CICD_RECIPE.md)。
