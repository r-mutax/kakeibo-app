#!/bin/bash

# 本番環境用データベース初期化スクリプト
# Usage: ./scripts/init-production-db.sh

set -e

echo "🗄️ 本番環境データベースの初期化を開始します..."

# データベースディレクトリの作成
mkdir -p data

# Prismaクライアントの生成
echo "📦 Prisma クライアントを生成中..."
npx prisma generate

# データベースマイグレーションの実行
echo "🔄 データベースマイグレーションを実行中..."
if [ "$DATABASE_URL" ]; then
    echo "データベースURL: $DATABASE_URL"
    npx prisma migrate deploy
else
    echo "⚠️  DATABASE_URL 環境変数が設定されていません"
    echo "デフォルトのSQLiteデータベースを使用します"
    export DATABASE_URL="file:./data/prod.db"
    npx prisma migrate deploy
fi

echo "✅ データベースの初期化が完了しました!"
echo ""
echo "📊 データベース接続テスト..."
npx prisma db seed || echo "⚠️  Seed データは設定されていません（正常な状態です）"

echo "🎉 本番環境の準備が完了しました!"