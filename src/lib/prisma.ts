// Types for Mock Prisma client
interface MockEntry {
  id: number
  date: Date
  type: string
  amount: number
  note: string | null
  categoryId: number | null
  userId: number
  createdAt: Date
  updatedAt: Date
  category?: MockCategory | null
}

interface MockCategory {
  id: number
  name: string
  color: string | null
  order: number | null
}

interface CreateEntryData {
  date: Date
  type: string
  amount: number
  note?: string | null
  categoryId?: number | null
  userId: number
}

interface EntryWhereInput {
  userId?: number
  type?: string
  categoryId?: number | null
  date?: {
    gte?: Date
    lte?: Date
  }
}

interface EntryFindManyArgs {
  where?: EntryWhereInput
  include?: {
    category?: boolean
  }
  orderBy?: {
    date?: 'asc' | 'desc'
  }
  skip?: number
  take?: number
}

interface EntryCreateArgs {
  data: CreateEntryData
  include?: {
    category?: boolean
  }
}

interface UserUpsertArgs {
  create: {
    passcodeHash: string
  }
}

// Mock Prisma client for testing without database
class MockPrismaClient {
  private entryIdCounter = 1
  private entries: MockEntry[] = []

  constructor() {
    // Initialize with some test data
    this.entries = [
      {
        id: 1,
        date: new Date('2024-01-15'),
        type: 'expense',
        amount: 1500,
        note: '食費',
        categoryId: 1,
        userId: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        category: {
          id: 1,
          name: 'テストカテゴリ',
          color: '#000000',
          order: 1
        }
      },
      {
        id: 2,
        date: new Date('2024-01-14'),
        type: 'income',
        amount: 50000,
        note: '給料',
        categoryId: null,
        userId: 1,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        category: null
      },
      {
        id: 3,
        date: new Date('2024-02-01'),
        type: 'expense',
        amount: 800,
        note: '交通費',
        categoryId: 2,
        userId: 1,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        category: {
          id: 2,
          name: '交通',
          color: '#ff0000',
          order: 2
        }
      }
    ]
  }

  user = {
    findFirst: async () => ({ 
      id: 1, 
      passcodeHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4' // hash of '1234'
    }),
    upsert: async ({ create }: UserUpsertArgs) => ({ id: 1, ...create })
  }

  entry = {
    create: async ({ data, include }: EntryCreateArgs) => {
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

      // Add to mock entries array
      this.entries.push(entry)

      return entry
    },

    findMany: async ({ where, include, orderBy, skip = 0, take }: EntryFindManyArgs) => {
      let filteredEntries = [...this.entries]

      // Apply where filters
      if (where) {
        if (where.userId !== undefined) {
          filteredEntries = filteredEntries.filter(e => e.userId === where.userId)
        }
        if (where.type) {
          filteredEntries = filteredEntries.filter(e => e.type === where.type)
        }
        if (where.categoryId !== undefined) {
          filteredEntries = filteredEntries.filter(e => e.categoryId === where.categoryId)
        }
        if (where.date) {
          if (where.date.gte) {
            filteredEntries = filteredEntries.filter(e => e.date >= where.date.gte)
          }
          if (where.date.lte) {
            filteredEntries = filteredEntries.filter(e => e.date <= where.date.lte)
          }
        }
      }

      // Apply ordering
      if (orderBy?.date === 'desc') {
        filteredEntries.sort((a, b) => b.date.getTime() - a.date.getTime())
      } else if (orderBy?.date === 'asc') {
        filteredEntries.sort((a, b) => a.date.getTime() - b.date.getTime())
      }

      // Apply pagination
      if (take) {
        filteredEntries = filteredEntries.slice(skip, skip + take)
      } else if (skip > 0) {
        filteredEntries = filteredEntries.slice(skip)
      }

      // Include category if requested
      if (include?.category) {
        return filteredEntries.map(entry => ({
          ...entry,
          category: entry.categoryId ? entry.category : null
        }))
      }

      return filteredEntries
    },

    count: async ({ where }: { where?: EntryWhereInput }) => {
      let filteredEntries = [...this.entries]

      // Apply where filters
      if (where) {
        if (where.userId !== undefined) {
          filteredEntries = filteredEntries.filter(e => e.userId === where.userId)
        }
        if (where.type) {
          filteredEntries = filteredEntries.filter(e => e.type === where.type)
        }
        if (where.categoryId !== undefined) {
          filteredEntries = filteredEntries.filter(e => e.categoryId === where.categoryId)
        }
        if (where.date) {
          if (where.date.gte) {
            filteredEntries = filteredEntries.filter(e => e.date >= where.date.gte)
          }
          if (where.date.lte) {
            filteredEntries = filteredEntries.filter(e => e.date <= where.date.lte)
          }
        }
      }

      return filteredEntries.length
    }
  }
}

export const prisma = new MockPrismaClient()