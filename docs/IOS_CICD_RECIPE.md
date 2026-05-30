# iOS を Mac無し・無料で TestFlight 配信するレシピ（再現用）

Expo(React Native) アプリを **GitHub Actions + fastlane** でビルドし、TestFlight へ自動配信する手順。`sell-later-app` で実際に成功した構成を、**別アプリでも再現できる**よう一般化したもの。

## このやり方の要点
- **Mac不要**。GitHub Actions の macOS ランナーでビルドする。
- **EAS不要**（EAS Buildは月$30〜）。`expo prebuild` でネイティブ生成 → fastlane でビルド。
- **publicリポなら GitHub Actions は無料・無制限**。privateだと月2,000分・macは10倍消費＝実質200分/月なので注意。
- `ios/` `android/` は**コミットしない**。CIが毎回 `expo prebuild` で生成する。
- 証明書は **fastlane match** で別の**privateリポ**に暗号化保存。Mac無しでも CI 上で生成できる。
- 日常のJS修正は **Expo Go / dev build** で即確認。CI配信はネイティブ確認・リリース時だけ（1回10〜30分かかる）。

---

## 0. 前提（Apple側・1回だけ）
1. **Apple Developer Program** 登録（有料・年¥）。
2. **App Store Connect でアプリを作成**（bundle id を決める。例 `com.example.app`）。※これが無いとアップロードで弾かれる。
3. **App ID** を Certificates, Identifiers & Profiles で登録（ASCアプリ作成時に自動登録されることも多い）。
4. **Team ID**（10桁）を控える。

---

## 1. 必要なもの（Secrets の素材）
| 素材 | 取得元 | 用途 |
|---|---|---|
| **Team ID** | Apple Developer → Membership | 署名 |
| **証明書用 privateリポ** | GitHub で空のprivateリポを新規作成（例 `you/certificates`） | match の保存先 |
| **GitHub PAT** | GitHub → Settings → Developer settings → **Personal access tokens (classic)**、`repo` スコープ | match が証明書リポを git clone/push する認証 |
| **MATCH_PASSWORD** | 自分で決める任意のパスフレーズ | 証明書の暗号化キー |
| **ASC API Key** | App Store Connect → Users and Access → Integrations → **API Keys** | アップロード・証明書管理。`.p8`／`Key ID`／`Issuer ID` を取得 |
| (任意) RevenueCat等の公開キー | 各サービス | JSバンドル時に注入する `EXPO_PUBLIC_*` |

### MATCH_GIT_BASIC_AUTHORIZATION の作り方（最重要・ハマりやすい）
match は git 認証に `base64("ユーザー名:PAT")` を使う。**この値のコピーミスで何度も 401/Repository not found になる**ので、ローカルで**通ることを検証してから**Secretに入れる：

```bash
TOKEN='ghp_実際のトークン'            # シングルクォートで囲む
# ① トークン単体が有効か（200なら正しい）
curl -s -o /dev/null -w "user=%{http_code}\n" -H "Authorization: Bearer $TOKEN" https://api.github.com/user
# ② base64を作り、そのbase64でも通るか（basic=200なら、その文字列が正解）
B=$(printf '%s' "ユーザー名:$TOKEN" | base64 -w0)
curl -s -o /dev/null -w "basic=%{http_code}\n" -H "Authorization: Basic $B" https://api.github.com/user
echo "$B"     # ← この1行をそのまま Secret に貼る（改行・欠けに注意。clip.exe推奨）
```

---

## 2. GitHub Secrets（リポジトリ Settings → Secrets and variables → Actions）
| Secret | 内容 |
|---|---|
| `APPLE_TEAM_ID` | Team ID（10桁） |
| `MATCH_GIT_URL` | 証明書リポのURL（**`https://github.com/you/certificates.git` 形式**。`.git`必須、SSH不可） |
| `MATCH_PASSWORD` | 証明書の暗号化パスフレーズ |
| `MATCH_GIT_BASIC_AUTHORIZATION` | 上の §1 で検証した `base64("user:token")` |
| `APP_STORE_CONNECT_API_KEY_ID` | API Key の Key ID |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID |
| `APP_STORE_CONNECT_API_KEY` | `.p8` の**生PEM中身**（`-----BEGIN PRIVATE KEY-----`ごと）。base64でも可 |
| (任意) `EXPO_PUBLIC_*` | RevenueCat等の公開キー |

---

## 3. リポジトリに追加するファイル

### `.gitignore`（生成物・秘密情報を除外）
```
/ios
/android
.env
.env*.local
*.p8
AuthKey_*.p8
```

### `Gemfile`
```ruby
source "https://rubygems.org"
gem "fastlane"
gem "cocoapods"
```

### `fastlane/Appfile`
```ruby
app_identifier(ENV["APP_IDENTIFIER"])
apple_id(ENV["APPLE_ID"]) if ENV["APPLE_ID"]
itc_team_id(ENV["ITC_TEAM_ID"]) if ENV["ITC_TEAM_ID"]
team_id(ENV["APPLE_TEAM_ID"]) if ENV["APPLE_TEAM_ID"]
```

### `fastlane/Matchfile`
```ruby
git_url(ENV["MATCH_GIT_URL"])
storage_mode("git")
type("appstore")
app_identifier([ENV["APP_IDENTIFIER"]])
readonly(true)
```

### `fastlane/Fastfile`（★ここに落とし穴対策が全部入っている）
```ruby
default_platform(:ios)

platform :ios do
  # CI環境では一時キーチェーンを作成・解錠（codesignのUIダイアログ待ちハングを防ぐ）
  before_all do
    setup_ci if ENV["CI"]
  end

  def asc_api_key
    app_store_connect_api_key(
      key_id: ENV["APP_STORE_CONNECT_API_KEY_ID"],
      issuer_id: ENV["APP_STORE_CONNECT_API_ISSUER_ID"],
      key_filepath: ENV["ASC_API_KEY_PATH"],
      in_house: false
    )
  end

  # expo prebuild が生成した workspace を Fastfile基準の絶対パスで検出
  # （アプリ名が日本語等だと Expo はプロジェクト名を "app" に正規化する）
  def detect_workspace
    root = File.expand_path("..", __dir__)
    Dir[File.join(root, "ios", "*.xcworkspace")].first or
      UI.user_error!("ios/*.xcworkspace が見つかりません。先に expo prebuild + pod install を実行")
  end

  desc "証明書/プロファイルを作成しmatchリポへ保存（初回1回だけ）"
  lane :certs do
    match(type: "appstore", readonly: false, api_key: asc_api_key)
  end

  desc "証明書取得→署名→IPAビルド"
  lane :build do
    workspace = detect_workspace
    scheme = File.basename(workspace, ".xcworkspace")
    app_id = ENV["APP_IDENTIFIER"]
    match(type: "appstore", readonly: true, api_key: asc_api_key)
    profile_name = ENV["sigh_#{app_id}_appstore_profile-name"] || "match AppStore #{app_id}"
    root = File.expand_path("..", __dir__)
    # prebuild生成プロジェクトは自動署名・チーム空 → 手動署名へ書き換え
    update_code_signing_settings(
      use_automatic_signing: false,
      path: File.join(root, "ios", "#{scheme}.xcodeproj"),
      team_id: ENV["APPLE_TEAM_ID"],
      code_sign_identity: "Apple Distribution",
      profile_name: profile_name
    )
    # ビルド番号を自動採番（重複回避）。Expo生成のInfo.plistはCFBundleVersionが
    # 固定値なので xcargs(CURRENT_PROJECT_VERSION) は効かない → Info.plistを直接書換
    build_no = ENV["GITHUB_RUN_NUMBER"] || Time.now.to_i.to_s
    set_info_plist_value(
      path: File.join(root, "ios", scheme, "Info.plist"),
      key: "CFBundleVersion",
      value: build_no
    )
    gym(
      workspace: workspace,
      scheme: scheme,
      configuration: "Release",
      export_method: "app-store",
      output_directory: "build",
      output_name: "app.ipa",
      export_options: {
        method: "app-store",
        signingStyle: "manual",
        provisioningProfiles: { app_id => profile_name }
      }
    )
  end

  desc "ビルドしてTestFlightへ配信"
  lane :beta do
    build
    pilot(
      api_key: asc_api_key,
      ipa: "build/app.ipa",
      skip_waiting_for_build_processing: true,
      distribute_external: false
    )
  end
end
```

### `.github/workflows/ios-certs.yml`（証明書を作る・初回1回だけ手動実行）
```yaml
name: iOS Certificates (one-time setup)
on:
  workflow_dispatch:
jobs:
  certs:
    runs-on: macos-latest
    timeout-minutes: 30
    env:
      APP_IDENTIFIER: com.example.app           # ← アプリのbundle idに変更
      APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
      MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
      MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
      MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
      APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
      APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_API_ISSUER_ID }}
      APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
          bundler-cache: true
      - name: Prepare ASC API key
        run: |
          KEYFILE="$RUNNER_TEMP/asc_api_key.p8"
          if printf '%s' "$APP_STORE_CONNECT_API_KEY" | grep -q "BEGIN PRIVATE KEY"; then
            printf '%s\n' "$APP_STORE_CONNECT_API_KEY" > "$KEYFILE"
          else
            printf '%s' "$APP_STORE_CONNECT_API_KEY" | base64 --decode > "$KEYFILE"
          fi
          echo "ASC_API_KEY_PATH=$KEYFILE" >> "$GITHUB_ENV"
          if openssl pkey -in "$KEYFILE" -noout; then echo "KEY OK"; else echo "KEY INVALID"; exit 1; fi
      - name: Verify match git access
        run: |
          CLEAN=$(printf '%s' "$MATCH_GIT_BASIC_AUTHORIZATION" | tr -d '\r\n ')
          echo "::add-mask::$CLEAN"
          echo "MATCH_GIT_BASIC_AUTHORIZATION=$CLEAN" >> "$GITHUB_ENV"
          set +e
          # checkoutの認証ヘッダと衝突しないようリポ外で検証
          OUT=$(cd "$RUNNER_TEMP" && git -c credential.helper= -c http.extraheader="Authorization: Basic $CLEAN" ls-remote "$MATCH_GIT_URL" 2>&1); CODE=$?
          echo "$OUT" | head -3
          if [ $CODE -eq 0 ]; then echo "GIT AUTH OK"; else echo "GIT AUTH FAILED (exit $CODE)"; exit 1; fi
      - name: Create & store certificates
        run: bundle exec fastlane ios certs
```

### `.github/workflows/ios.yml`（ビルド→TestFlight。push/タグ/手動で起動）
```yaml
name: iOS TestFlight
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:
jobs:
  build:
    runs-on: macos-26          # ★ Apple が iOS 26 SDK / Xcode 26 を必須化（macos-latestだと古いXcodeで弾かれる）
    timeout-minutes: 60
    env:
      APP_IDENTIFIER: com.example.app          # ← bundle idに変更
      APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
      MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
      MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
      MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
      APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
      APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_API_ISSUER_ID }}
      APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
      # 必要なら EXPO_PUBLIC_*（RevenueCat等）も列挙
    steps:
      - uses: actions/checkout@v4
      - name: Select latest Xcode (iOS 26 SDK required by App Store)
        run: |
          LATEST=$(ls -d /Applications/Xcode_*.app 2>/dev/null | sort -V | tail -1)
          sudo xcode-select -s "$LATEST/Contents/Developer"
          xcodebuild -version
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install JS dependencies
        run: npm ci
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
          bundler-cache: true
      - name: Prebuild iOS native project
        run: npx expo prebuild --platform ios --no-install
      - name: Install CocoaPods
        run: cd ios && pod install --repo-update
      - name: Prepare ASC API key
        run: |
          KEYFILE="$RUNNER_TEMP/asc_api_key.p8"
          if printf '%s' "$APP_STORE_CONNECT_API_KEY" | grep -q "BEGIN PRIVATE KEY"; then
            printf '%s\n' "$APP_STORE_CONNECT_API_KEY" > "$KEYFILE"
          else
            printf '%s' "$APP_STORE_CONNECT_API_KEY" | base64 --decode > "$KEYFILE"
          fi
          echo "ASC_API_KEY_PATH=$KEYFILE" >> "$GITHUB_ENV"
          if openssl pkey -in "$KEYFILE" -noout; then echo "KEY OK"; else echo "KEY INVALID"; exit 1; fi
      - name: Verify match git access
        run: |
          CLEAN=$(printf '%s' "$MATCH_GIT_BASIC_AUTHORIZATION" | tr -d '\r\n ')
          echo "::add-mask::$CLEAN"
          echo "MATCH_GIT_BASIC_AUTHORIZATION=$CLEAN" >> "$GITHUB_ENV"
          set +e
          OUT=$(cd "$RUNNER_TEMP" && git -c credential.helper= -c http.extraheader="Authorization: Basic $CLEAN" ls-remote "$MATCH_GIT_URL" 2>&1); CODE=$?
          echo "$OUT" | head -3
          if [ $CODE -eq 0 ]; then echo "GIT AUTH OK"; else echo "GIT AUTH FAILED (exit $CODE)"; exit 1; fi
      - name: Build & upload to TestFlight
        run: bundle exec fastlane ios beta
```

---

## 4. 実行順序
1. §0〜3 を全部済ませる（Secrets 7つ＋ファイル一式をpush）。
2. Actions →**「iOS Certificates (one-time setup)」→ Run workflow**（証明書を作成しmatchリポへ保存）。**初回1回だけ**。
3. Actions →**「iOS TestFlight」を実行**（push か手動）。成功すると TestFlight にビルドが上がる。
4. App Store Connect → TestFlight タブで処理完了（数分〜30分）→ 輸出コンプライアンス回答 → 内部テスター追加 → iPhoneの **TestFlightアプリ**でインストール。

---

## 5. ハマった問題と解決（このアプリで実際に踏んだ順）
| 症状 | 原因 | 解決 |
|---|---|---|
| `ios/*.xcworkspace が見つからない` | 日本語アプリ名でExpoがプロジェクト名を `app` に正規化 | Fastfileで `__dir__` 基準の絶対パス検出（`detect_workspace`） |
| ASCキー `invalid curve name` / `KEY INVALID` | Secretの中身が壊れ/base64ミス | 「Prepare ASC API key」で生PEM・base64両対応＋`openssl`で検証。生PEMをそのまま貼るのが楽 |
| match `GIT AUTH FAILED` / `Repository not found` | `MATCH_GIT_BASIC_AUTHORIZATION` のトークン値ミス | §1の手順でローカルcurl 200を確認してからSecret再設定。URLは`.git`付き |
| 検証stepだけ `Repository not found`（APIは200） | `actions/checkout` の認証ヘッダと衝突 | `cd $RUNNER_TEMP` でリポ外実行＋`http.extraheader`のみ付与 |
| gym archive `Signing requires a development team` | prebuild生成projが自動署名・チーム空 | `update_code_signing_settings` で手動署名化＋gym `export_options` manual |
| ネイティブは進むが**codesignで無限ハング**（タイムアウト） | login.keychain の署名UIダイアログ待ち | Fastfile `before_all { setup_ci if ENV["CI"] }`（一時キーチェーン） |
| アップロードで `Validation failed (409) SDK version issue` | Appleが iOS 26 SDK / Xcode 26 必須化、ランナーが旧Xcode | `runs-on: macos-26` ＋「最新Xcode選択」step |
| 2回目以降アップロードが `bundle version '1' already used` (409) | Expo生成Info.plistのCFBundleVersionが固定値で `xcargs(CURRENT_PROJECT_VERSION)` が効かない | gym前に `set_info_plist_value` で `ios/<scheme>/Info.plist` の `CFBundleVersion` を `$GITHUB_RUN_NUMBER` に直接書換 |

---

## 6. 新アプリへ移植する時のチェックリスト
- [ ] `Gemfile` / `fastlane/{Appfile,Matchfile,Fastfile}` / `.github/workflows/{ios.yml,ios-certs.yml}` をコピー
- [ ] 両ワークフローの `APP_IDENTIFIER` を新アプリの bundle id に変更
- [ ] `.gitignore` に `/ios /android *.p8` 等
- [ ] ASCでアプリ作成（bundle id一致）
- [ ] 証明書用の**新しい空privateリポ**を用意（アプリごとに分けてもよい。`MATCH_GIT_URL`）
- [ ] Secrets 7つを登録（PATは使い回し可。`MATCH_GIT_BASIC_AUTHORIZATION`は§1で検証）
- [ ] ASC API Key はアカウント共通で使い回せる（Key ID/Issuer ID/.p8）
- [ ] 「iOS Certificates」を1回実行 → 「iOS TestFlight」を実行
- [ ] publicリポなら無料。privateなら分数に注意

## 7. 開発と配信の使い分け
- **JS/UIの修正** → `npx expo start -c --tunnel` ＋ Expo Go で即確認（無料・即反映）。
- **課金/広告/ネイティブ依存・最終確認・配信** → push → CI → TestFlight（1回10〜30分）。
- ネイティブ依存(課金SDK・広告SDK等)は **Expo Go では動かない**ので、`Constants.executionEnvironment === 'storeClient'` 判定でExpo Go時はno-op化しておくと、開発はExpo Go・本番はTestFlightで両立できる。
