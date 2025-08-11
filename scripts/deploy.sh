#!/bin/bash

# Kakeibo App デプロイメントヘルパー
# 使用方法: ./scripts/deploy.sh [platform] [environment]
# 例: ./scripts/deploy.sh vercel production

set -e

PLATFORM=$1
ENVIRONMENT=${2:-production}

echo "🚀 Kakeibo アプリのデプロイを開始します..."
echo "プラットフォーム: $PLATFORM"
echo "環境: $ENVIRONMENT"

# 共通の前処理
echo "📦 依存関係をインストール中..."
npm install

echo "🔧 Prisma クライアントを生成中..."
npx prisma generate

echo "🏗️ アプリケーションをビルド中..."
npm run build

case $PLATFORM in
  "vercel")
    echo "🌐 Vercel にデプロイ中..."
    if command -v vercel &> /dev/null; then
      if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
      else
        vercel
      fi
    else
      echo "❌ エラー: Vercel CLI がインストールされていません"
      echo "インストール: npm i -g vercel"
      exit 1
    fi
    ;;
  
  "docker")
    echo "🐳 Docker イメージをビルド中..."
    docker build -t kakeibo-app .
    echo "✅ Docker イメージのビルドが完了しました"
    echo "起動方法: docker run -p 3000:3000 kakeibo-app"
    ;;
  
  "docker-compose")
    echo "🐳 Docker Compose でデプロイ中..."
    docker-compose down
    docker-compose up --build -d
    echo "✅ Docker Compose でのデプロイが完了しました"
    echo "アクセス: http://localhost:3000"
    ;;
  
  *)
    echo "❌ 未サポートのプラットフォーム: $PLATFORM"
    echo "サポート対象: vercel, docker, docker-compose"
    echo ""
    echo "使用方法:"
    echo "  ./scripts/deploy.sh vercel [production|preview]"
    echo "  ./scripts/deploy.sh docker"
    echo "  ./scripts/deploy.sh docker-compose"
    exit 1
    ;;
esac

echo "🎉 デプロイが完了しました!"