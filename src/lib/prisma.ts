// Mock Prisma client for testing without database
class MockPrismaClient {
  user = {
    findFirst: async () => ({ 
      id: 1, 
      passcodeHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4' // hash of '1234'
    }),
    upsert: async ({ create }: any) => ({ id: 1, ...create })
  }
}

export const prisma = new MockPrismaClient()