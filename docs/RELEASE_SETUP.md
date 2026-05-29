# リリース設定手順（STEP4・ユーザー作業）

コード/CI設定は実装済み。**TestFlight配信・課金・広告の実動作**には、以下のアカウント作成とシークレット登録が必要。ここが完了すると GitHub Actions（main push / `v*` タグ）でビルド→TestFlight自動配信が動く。

## 0. 重要な前提
- **Expo Go では課金/広告は動かない**（ネイティブ依存）。ただしアプリは起動する（課金/広告のみ無効化）。課金・広告・最終ビルドは **dev build または TestFlight** で確認する。
- iOSの `ios/` ディレクトリは**Gitに含めない**。CIが毎回 `expo prebuild` で生成する。

## 1. Apple Developer / App Store Connect
1. Apple Developer Program に登録（有料）。
2. App Store Connect で新規アプリを作成。bundle id は **`com.selllater.app`**（変更する場合は `app.json` の `ios.bundleIdentifier` と `fastlane/Appfile`・`src/purchases/products.ts` のSKU接頭辞・AdMob設定も合わせる）。
3. `APPLE_TEAM_ID`（10桁）を控える。

## 2. 課金（IAP）製品を作成（App Store Connect）
※ 課金は **RevenueCat** 経由（`react-native-purchases`）。ただし製品自体は必ず ASC で作る。
- 非消費型（買い切り）: 製品ID **`com.selllater.app.pro.lifetime`** / 価格 ¥1,500
- 自動更新サブスク: サブスクグループ作成 → 製品ID **`com.selllater.app.pro.monthly`** / 価格 ¥500/月
- 審査用にサンドボックステスター（Users and Access → Sandbox）を作成し、実機でサインインしてテスト購入。
- App Store Connect → Users and Access → Integrations → **In-App Purchase** キーを発行（RevenueCatに登録する）。

## 2b. RevenueCat 設定
1. [RevenueCat](https://www.revenuecat.com/) でアカウント作成 → Project 作成 → iOSアプリ追加（bundle id `com.selllater.app`）。
2. App Store Connect の **In-App Purchase キー（.p8）** を RevenueCat に登録（レシート検証用）。
3. **Products**: 上記2製品（lifetime / monthly）を RevenueCat に追加。
4. **Entitlements**: 識別子 **`pro`** を作成し、両製品を割り当てる（`src/purchases/config.ts` の `ENTITLEMENT_PRO` と一致）。
5. **Offerings**: `default` オファリングに2製品のパッケージを入れる（`current` として配信。アプリはこの current の availablePackages を表示）。
6. **iOS公開SDKキー**（`appl_xxx`）をコピー → GitHub Secret `EXPO_PUBLIC_REVENUECAT_IOS_KEY` に登録（CIのJSバンドル時に注入される）。ローカルdev buildで試す場合は `.env` に `EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx`。

## 3. AdMob
1. AdMob アカウント作成 → iOSアプリを追加。
2. **アプリID**（`ca-app-pub-XXXX~YYYY`）と**バナー広告ユニットID**を取得。
3. 差し替え箇所:
   - `app.json` の `react-native-google-mobile-ads` プラグイン `iosAppId`（現在はGoogleテストID）。
   - `src/ads/AdBannerNative.tsx` の `BANNER_UNIT_ID`（現在 `TestIds.BANNER`）。
   - ※本番審査までは**テストIDのまま**にすること（自分の広告をクリックすると規約違反）。

## 4. fastlane match（証明書管理）※Mac不要
1. **空のプライベートGitリポジトリ**を別途作成（例 `youraccount/certificates`）→ そのURLが `MATCH_GIT_URL`。
2. 証明書の暗号化パスフレーズを自分で決める → `MATCH_PASSWORD`。
3. 上記＋ASC APIキー等の Secrets を**先に全部登録**（セクション6）。
4. GitHub → Actions → **「iOS Certificates (one-time setup)」**ワークフローを **Run workflow** で1回だけ実行。
   → macOSランナー上で `fastlane ios certs` が走り、証明書/プロビジョニングプロファイルを生成して match リポジトリへ保存する（**Mac不要**）。
5. 以後の本番ビルドは `ios.yml` が `readonly` で取得して使う。

## 5. App Store Connect API Key
App Store Connect → Users and Access → Integrations → API Keys で Key を発行:
- `.p8` ファイル、`Key ID`、`Issuer ID` を取得。
- `.p8` は base64 化して Secret に入れる: `base64 -i AuthKey_XXXX.p8 | pbcopy`

## 6. GitHub Secrets 登録
リポジトリ Settings → Secrets and variables → Actions:
| Secret | 内容 |
|---|---|
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `MATCH_GIT_URL` | 証明書リポジトリのURL |
| `MATCH_PASSWORD` | match の暗号化パスフレーズ |
| `MATCH_GIT_BASIC_AUTHORIZATION` | 証明書リポジトリ取得用 `base64(user:token)` |
| `APP_STORE_CONNECT_API_KEY_ID` | API Key の Key ID |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID |
| `APP_STORE_CONNECT_API_KEY` | `.p8` を base64 化した文字列 |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat の iOS公開SDKキー（`appl_xxx`） |

## 7. 配信
- `main` に push、または `v1.0.0` のようなタグを作成すると `.github/workflows/ios.yml` が起動。
- 手順: `npm ci` → `expo prebuild` → `pod-install` → `fastlane ios beta`（match→gym→pilotでTestFlightへ）。
- 成功すると TestFlight に表示される（処理待ちは数分〜十数分）。

## 8. 動作確認（実機）
- TestFlightビルドで: 広告バナー表示（無料時）、21件目で誘導、写真複数枚（Pro）、分析ロック/解放、買い切り・月額の購入と復元、購入後 isPro が反映され広告非表示。
- アイコン/スプラッシュは青基調のプレースホルダ。本番デザインができたら `assets/` を差し替え（`node scripts/gen-assets.js` は再生成用）。
