# kakeibo-app

## 概要

kakeibo-appは、日本の伝統的な家計簿をデジタル化したモダンな家計管理アプリケーションです。収入と支出を簡単に記録・管理し、カテゴリ別に分類することで、家計の見える化を実現します。

## 主な機能

- **収支管理**: 収入と支出の記録・編集・削除
- **カテゴリ分類**: 支出をカテゴリ別に分類して管理
- **パスコード認証**: セキュアなユーザー認証システム
- **データ可視化**: 家計の状況を分かりやすく表示
- **レスポンシブデザイン**: スマートフォン・タブレット・PCに対応

## 技術スタック

- **フロントエンド**: 
  - Next.js 15
  - React 19
  - TypeScript
- **バックエンド**: 
  - Prisma ORM
  - SQLite データベース
- **開発環境**: 
  - Node.js
  - npm

## セットアップ

### 前提条件

- Node.js (v18以上)
- npm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/r-mutax/kakeibo-app.git
cd kakeibo-app

# 依存関係をインストール
npm install

# データベースを初期化
npx prisma migrate dev

# 開発サーバーを起動
npm run dev
```

### 環境変数

必要に応じて`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
DATABASE_URL="file:./dev.db"
```

## 使用方法

1. アプリケーションを起動後、ブラウザで `http://localhost:3000` にアクセス
2. 初回利用時にパスコードを設定
3. 収入・支出を記録して家計管理を開始

## デプロイメント

### デプロイ先の選定

本アプリケーションは複数のプラットフォームにデプロイ可能です。以下は主要な候補とその特徴です：

#### 推奨プラットフォーム

| プラットフォーム | 無料枠 | SQLite対応 | 設定難易度 | 推奨用途 |
|------------------|--------|-------------|------------|----------|
| **Vercel** | ○ | △※1 | 低 | 検証・デモ |
| **Railway** | ○※2 | ○ | 中 | 本格運用 |
| **Render** | ○※3 | ○ | 中 | 本格運用 |

※1 ServerlessのためSQLiteは永続化されません。PostgreSQL等への移行を推奨  
※2 月500時間まで無料、$5/月でのクレジット付与  
※3 月750時間まで無料、静的サイトは無制限  

### デプロイ方法

#### Option 1: Vercel (推奨 - 簡単設定)

**特徴**: Next.js公式推奨、最も簡単なデプロイ、ただしデータベースの永続化には別途サービスが必要

**手順**:

1. **アカウント準備**
   ```bash
   # Vercel CLIをインストール
   npm i -g vercel
   
   # GitHubでログイン
   vercel login
   ```

2. **プロジェクト設定**
   ```bash
   # プロジェクトルートで実行
   vercel
   
   # 初回設定では以下を選択:
   # ? Set up and deploy "kakeibo-app"? [Y/n] y
   # ? Which scope do you want to deploy to? [あなたのアカウント]
   # ? Link to existing project? [N/y] n
   # ? What's your project's name? kakeibo-app
   # ? In which directory is your code located? ./
   ```

3. **環境変数設定**
   ```bash
   # 本番用データベースURL設定 (Neon.tech等のPostgreSQLを推奨)
   vercel env add DATABASE_URL
   # 例: postgresql://username:password@hostname:port/database
   ```

4. **デプロイ実行**
   ```bash
   vercel --prod
   ```

#### Option 2: Railway (SQLite対応 - 本格運用)

**特徴**: フルスタックアプリに対応、SQLiteの永続化可能、Docker対応

**前提条件**:
- [Railway](https://railway.app/)アカウント
- GitHub連携設定

**手順**:

1. **Railway設定ファイル作成**
   
   プロジェクトルートに `railway.toml` を作成:
   ```toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   healthcheckPath = "/"
   healthcheckTimeout = 300
   restartPolicyType = "on_failure"
   ```

2. **環境変数設定**
   
   `.env.production` を作成:
   ```env
   NODE_ENV=production
   DATABASE_URL="file:/app/data/prod.db"
   ```

3. **デプロイ**
   - RailwayのダッシュボードでGitHubリポジトリと連携
   - 自動デプロイが実行される
   - 環境変数をRailwayの管理画面で設定

#### Option 3: Render (バランス型)

**特徴**: 無料枠が充実、永続ストレージ対応、WebServiceとして運用可能

**手順**:

1. **render.yaml設定**
   
   プロジェクトルートに `render.yaml` を作成:
   ```yaml
   services:
     - type: web
       name: kakeibo-app
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: DATABASE_URL
           value: file:/opt/render/project/src/data/prod.db
   ```

2. **デプロイ**
   - [Render](https://render.com/)でGitHubリポジトリと連携
   - `render.yaml` が自動検出される
   - デプロイが実行される

### データベース初期化

デプロイ後、初回のみデータベースの初期化が必要です：

```bash
# Vercel (PostgreSQL使用時)
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate

# Railway/Render (SQLite使用時)
# デプロイ時に自動実行されるよう package.json の build script を修正
```

### トラブルシューティング

#### よくある問題

1. **ビルドエラー: "prisma client not found"**
   ```bash
   # package.json の build script を修正
   "build": "prisma generate && next build"
   ```

2. **データベース接続エラー**
   - 環境変数 `DATABASE_URL` が正しく設定されているか確認
   - デプロイ先でのPrismaクライアント生成が完了しているか確認

3. **ファイルアップロード権限エラー**
   - SQLite使用時は書き込み権限のあるディレクトリを使用
   - Vercelなど serverless 環境では永続化されない点に注意

### セキュリティ設定

本番環境では以下の設定を推奨します：

1. **環境変数での機密情報管理**
   ```bash
   # デプロイ先の管理画面で設定
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_secret_key  # 認証機能使用時
   ```

2. **HTTPS強制** (多くのプラットフォームで自動設定)

3. **CORS設定** (必要に応じて)

## ライセンス

ISC License - 詳細は [LICENSE](LICENSE) ファイルをご確認ください。