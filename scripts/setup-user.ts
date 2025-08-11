import { PrismaClient } from '@prisma/client'
import { hashPasscode } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  // テスト用ユーザーを作成（パスコード: 1234）
  const testUser = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      passcodeHash: hashPasscode('1234'),
    },
  })

  console.log('テストユーザーを作成しました:', testUser)
  console.log('パスコード: 1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })