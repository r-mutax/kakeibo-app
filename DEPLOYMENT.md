# Kakeibo App デプロイメント実行ガイド

このガイドは、Kakeibo アプリを実際にデプロイするための実行手順書です。

## 🚀 クイックスタート

### 1. 事前準備

```bash
# リポジトリのクローン
git clone https://github.com/r-mutax/kakeibo-app.git
cd kakeibo-app

# 依存関係のインストール
npm install

# アプリケーションのビルド
npm run build

# デプロイメント準備の検証
./scripts/verify-deployment.sh
```

### 2. デプロイ先の選択

| プラットフォーム | 特徴 | 推奨用途 | コマンド |
|------------------|------|----------|----------|
| **Vercel** | 最も簡単、無料、Next.js推奨 | デモ・検証 | `./scripts/deploy.sh vercel` |
| **Railway** | SQLite対応、本格運用可能 | 本番環境 | 手動設定 + Git連携 |
| **Render** | バランス良、永続ストレージ | 本番環境 | 手動設定 + Git連携 |
| **Docker** | 最大の柔軟性 | 自己管理 | `./scripts/deploy.sh docker` |

## 📝 プラットフォーム別詳細手順

### Option A: Vercel (推奨 - 最も簡単)

**所要時間**: 5-10分

1. **Vercel CLI のセットアップ**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **デプロイ実行**
   ```bash
   ./scripts/deploy.sh vercel production
   ```

3. **データベース設定**
   - SQLiteは永続化されないため、[Neon](https://neon.tech/) 等のPostgreSQLを推奨
   - 環境変数 `DATABASE_URL` にPostgreSQL接続文字列を設定

### Option B: Railway (フルスタック対応)

**所要時間**: 10-15分

1. **Railway アカウント作成**
   - [Railway.app](https://railway.app/) でアカウント作成
   - GitHubアカウントで連携

2. **プロジェクト作成**
   - "New Project" → "Deploy from GitHub repo"
   - kakeibo-app リポジトリを選択

3. **環境変数設定**
   ```
   NODE_ENV=production
   DATABASE_URL=file:/app/data/prod.db
   ```

4. **デプロイ**
   - GitHubにpushすると自動デプロイ

### Option C: Render

**所要時間**: 10-15分

1. **Render アカウント作成**
   - [Render.com](https://render.com/) でアカウント作成

2. **Web Service 作成**
   - "New" → "Web Service"
   - GitHubリポジトリを接続

3. **設定**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=file:/opt/render/project/src/data/prod.db
     ```

### Option D: Docker (ローカル・自己管理)

**所要時間**: 5分

```bash
# Docker イメージのビルドと起動
./scripts/deploy.sh docker

# または Docker Compose を使用
./scripts/deploy.sh docker-compose

# 手動実行の場合
docker build -t kakeibo-app .
docker run -p 3000:3000 -v $(pwd)/data:/app/data kakeibo-app
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **ビルドエラー: "prisma client not found"**
   ```bash
   npx prisma generate
   npm run build
   ```

2. **データベース接続エラー**
   - `DATABASE_URL` 環境変数が正しく設定されているか確認
   - SQLite使用時はファイルパスの書き込み権限を確認

3. **デプロイ後にページが表示されない**
   - 環境変数 `NODE_ENV=production` が設定されているか確認
   - ビルドが正常に完了しているか確認

4. **Vercelでデータが消える**
   - SQLiteは永続化されません
   - PostgreSQL等の外部データベースサービスを使用してください

## 📊 動作確認

デプロイ成功後、以下の項目を確認してください：

- [ ] アプリケーションにアクセス可能
- [ ] パスコード設定画面が表示される
- [ ] データベース接続が正常
- [ ] 収支入力機能が動作
- [ ] データが永続化される

## 🛡️ セキュリティ設定

本番環境では以下を設定してください：

1. **HTTPS の有効化** (多くのプラットフォームで自動)
2. **環境変数での機密情報管理**
3. **定期的なデータバックアップ**
4. **アクセスログの監視**

## 📞 サポート

問題が発生した場合：

1. まず `./scripts/verify-deployment.sh` を実行
2. GitHub Issues でバグレポート
3. 詳細な手順書は `README.md` の「デプロイメント」セクションを参照

---

**最終更新**: 2025年1月
**対応バージョン**: Next.js 15.4.6, React 19.1.1