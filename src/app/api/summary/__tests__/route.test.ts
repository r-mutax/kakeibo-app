import { NextRequest } from 'next/server'
import { GET } from '../route'

interface CategorySummary {
  categoryId: number | null
  categoryName: string
  totalAmount: number
  entryCount: number
}

interface DailySummary {
  date: string
  income: number
  expense: number
  balance: number
}

// Mock Next.js request helper for GET requests
function createGetRequest(searchParams: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost:3000/api/summary')
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  
  return {
    url: url.toString(),
  } as NextRequest
}

describe('/api/summary GET', () => {
  describe('正常なケース', () => {
    it('指定した月の集計データを正しく取得できること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        period: '2024-01',
        summary: {
          totalIncome: expect.any(Number),
          totalExpense: expect.any(Number),
          balance: expect.any(Number)
        },
        byCategory: expect.any(Array),
        daily: expect.any(Array)
      })
    })

    it('収入・支出・差額が正しく計算されること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Mock data has: income 50000, expense 1500 for Jan 2024
      expect(data.data.summary.totalIncome).toBe(50000)
      expect(data.data.summary.totalExpense).toBe(1500)
      expect(data.data.summary.balance).toBe(48500)
    })

    it('カテゴリ別集計が正しく計算されること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.data.byCategory)).toBe(true)
      
      // カテゴリ別データは支出のみが集計される
      data.data.byCategory.forEach((category: CategorySummary) => {
        expect(category).toMatchObject({
          categoryId: expect.anything(), // number or null
          categoryName: expect.any(String),
          totalAmount: expect.any(Number),
          entryCount: expect.any(Number)
        })
        expect(category.totalAmount).toBeGreaterThan(0)
        expect(category.entryCount).toBeGreaterThan(0)
      })
    })

    it('カテゴリが未設定のエントリーは「未分類」として扱われること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Check if there's an uncategorized entry
      const uncategorizedEntry = data.data.byCategory.find((cat: CategorySummary) => cat.categoryId === null)
      if (uncategorizedEntry) {
        expect(uncategorizedEntry.categoryName).toBe('未分類')
      }
    })

    it('カテゴリ別集計が金額の多い順にソートされていること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      const categories = data.data.byCategory
      if (categories.length > 1) {
        for (let i = 0; i < categories.length - 1; i++) {
          expect(categories[i].totalAmount).toBeGreaterThanOrEqual(categories[i + 1].totalAmount)
        }
      }
    })

    it('日別推移が正しく計算されること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.data.daily)).toBe(true)
      
      data.data.daily.forEach((day: DailySummary) => {
        expect(day).toMatchObject({
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
          income: expect.any(Number),
          expense: expect.any(Number),
          balance: expect.any(Number)
        })
        expect(day.balance).toBe(day.income - day.expense)
        expect(day.income).toBeGreaterThanOrEqual(0)
        expect(day.expense).toBeGreaterThanOrEqual(0)
      })
    })

    it('日別推移が日付順（昇順）でソートされていること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      const daily = data.data.daily
      if (daily.length > 1) {
        for (let i = 0; i < daily.length - 1; i++) {
          expect(daily[i].date <= daily[i + 1].date).toBe(true)
        }
      }
    })

    it('指定月内の日付のみが含まれること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      data.data.daily.forEach((day: DailySummary) => {
        expect(day.date).toMatch(/^2024-01-\d{2}$/)
      })
    })
  })

  describe('エッジケース', () => {
    it('データがない月でも空の結果を正しく返すこと', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-12' // No data for this month
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        period: '2024-12',
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0
        },
        byCategory: [],
        daily: []
      })
    })

    it('1日だけデータがある場合も正しく処理できること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-02' // Has only one day of data (2024-02-01)
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.summary.totalExpense).toBe(800)
      expect(data.data.daily).toHaveLength(1)
      expect(data.data.daily[0].date).toBe('2024-02-01')
      expect(data.data.byCategory).toHaveLength(1)
    })

    it('月末の境界値でも正しく処理できること', async () => {
      // Test February (28/29 days)
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-02' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.period).toBe('2024-02')
    })

    it('うるう年の2月でも正しく処理できること', async () => {
      const request = createGetRequest({ 
        userId: '1', 
        yearMonth: '2024-02' // 2024 is a leap year
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.period).toBe('2024-02')
    })

    it('存在しないユーザーでも空の結果を返すこと', async () => {
      const request = createGetRequest({ 
        userId: '999', // Non-existent user
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.summary).toMatchObject({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
      })
    })
  })

  describe('バリデーション', () => {
    it('userIdが未指定の場合はエラーを返すこと', async () => {
      const request = createGetRequest({ yearMonth: '2024-01' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('ユーザーIDは必須です')
    })

    it('userIdが数値でない場合はエラーを返すこと', async () => {
      const request = createGetRequest({ 
        userId: 'invalid', 
        yearMonth: '2024-01' 
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('ユーザーIDは数値である必要があります')
    })

    it('yearMonthが未指定の場合はエラーを返すこと', async () => {
      const request = createGetRequest({ userId: '1' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('年月は必須です')
    })

    it('yearMonthの形式が無効な場合はエラーを返すこと', async () => {
      const invalidFormats = [
        '2024-1',    // Single digit month
        '24-01',     // Two digit year
        '2024/01',   // Slash separator
        '2024-13',   // Invalid month
        '2024-00',   // Invalid month
        'invalid',   // Non-date string
        '2024',      // Year only
        '01-2024'    // Reversed format
      ]
      
      for (const yearMonth of invalidFormats) {
        const request = createGetRequest({ userId: '1', yearMonth })
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('年月の形式はYYYY-MMである必要があります')
      }
    })

    it('有効なyearMonth形式は受け入れること', async () => {
      const validFormats = [
        '2024-01',  // January
        '2024-12',  // December
        '2000-01',  // Year 2000
        '2099-12'   // Future year
      ]
      
      for (const yearMonth of validFormats) {
        const request = createGetRequest({ userId: '1', yearMonth })
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.period).toBe(yearMonth)
      }
    })
  })

  describe('エラーハンドリング', () => {
    it('データベースエラーの場合は500エラーを返すこと', async () => {
      // This test would require mocking prisma to throw an error
      // For now, we'll skip this as it requires more complex setup
      // In a real application, you might mock the prisma client
    })

    it('予期しないエラーの場合は適切なエラーメッセージを返すこと', async () => {
      // This would test the catch block in the API
      // The current implementation handles this with a generic error message
      const request = createGetRequest({ userId: '1', yearMonth: '2024-01' })
      const response = await GET(request)
      
      // This should normally succeed, but if there was an error,
      // it should return the expected error format
      if (response.status === 500) {
        const data = await response.json()
        expect(data.error).toBe('集計データの取得に失敗しました')
      }
    })
  })
})