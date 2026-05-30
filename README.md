# sell-later-app（Worthnest / うるカタ）

「いつかメルカリで売る物」を資産として見える化するiOSアプリ（React Native + Expo SDK54）。家にある売れる物を記録し、「全部売ったらいくら」を示す。海外メイン（英語主・日本語副）。

## ドキュメント
- [CLAUDE.md](CLAUDE.md) … 開発の入口・厳守事項・doc索引（AI/担当者はまずここ）
- [docs/HANDOFF.md](docs/HANDOFF.md) … 現状・残タスク
- [docs/DESIGN.md](docs/DESIGN.md) … 設計書（仕様の正）
- [docs/OPERATIONS.md](docs/OPERATIONS.md) … 運用の正（環境・課金/広告・配信・固有設定値）

## 開発
```
npx expo start -c --tunnel   # Expo Go(SDK54)で確認（JS/UIは即反映）
npx tsc --noEmit             # 型チェック
```

## 配信
`main` に push すると GitHub Actions が TestFlight までビルド・自動配信（publicリポなので無料）。手順は `~/.claude/docs/IOS_CICD_RECIPE.md`。
