// Mock Prisma client for testing without database
class MockPrismaClient {
  private entryIdCounter = 1

  user = {
    findFirst: async () => ({ 
      id: 1, 
      passcodeHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4' // hash of '1234'
    }),
    upsert: async ({ create }: any) => ({ id: 1, ...create })
  }

  entry = {
    create: async ({ data, include }: any) => {
      const entry = {
        id: this.entryIdCounter++,
        date: data.date,
        type: data.type,
        amount: data.amount,
        note: data.note,
        categoryId: data.categoryId,
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (include?.category && data.categoryId) {
        return {
          ...entry,
          category: {
            id: data.categoryId,
            name: 'テストカテゴリ',
            color: '#000000',
            order: 1
          }
        }
      }

      return entry
    }
  }
}

export const prisma = new MockPrismaClient()