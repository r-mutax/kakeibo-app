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

## ライセンス

ISC License - 詳細は [LICENSE](LICENSE) ファイルをご確認ください。