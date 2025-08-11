import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock Next.js request helper
function createRequest(body: any): NextRequest {
  return {
    json: async () => body,
  } as NextRequest
}

describe('/api/entries POST', () => {
  describe('正常なケース', () => {
    it('有効な収入エントリーを作成できること', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'income',
        amount: 50000,
        note: '給料',
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        id: expect.any(Number),
        date: expect.any(String),
        type: 'income',
        amount: 50000,
        note: '給料',
        userId: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      
      // Verify date is correctly parsed
      expect(new Date(data.data.date).toISOString()).toBe('2024-01-15T00:00:00.000Z')
    })

    it('有効な支出エントリーを作成できること', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: 1500,
        note: '食費',
        categoryId: 1,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toMatchObject({
        id: expect.any(Number),
        type: 'expense',
        amount: 1500,
        note: '食費',
        categoryId: 1,
        userId: 1,
        category: {
          id: 1,
          name: 'テストカテゴリ',
          color: '#000000',
          order: 1
        }
      })
    })

    it('noteとcategoryIdなしでエントリーを作成できること', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: 1000,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.note).toBeNull()
      expect(data.data.categoryId).toBeNull()
    })
  })

  describe('日付バリデーション', () => {
    it('日付が未指定の場合はエラーを返すこと', async () => {
      const requestBody = {
        type: 'expense',
        amount: 1000,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('日付は必須です')
    })

    it('日付が空文字の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '',
        type: 'expense',
        amount: 1000,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('日付は必須です')
    })

    it('無効な日付形式の場合はエラーを返すこと', async () => {
      const invalidDates = [
        'invalid-date',
        '2024-13-01', // 無効な月
        '15-01-2024'  // JavaScript Date constructorが理解できない形式
      ]

      for (const invalidDate of invalidDates) {
        const requestBody = {
          date: invalidDate,
          type: 'expense',
          amount: 1000,
          userId: 1
        }

        const request = createRequest(requestBody)
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('日付の形式が正しくありません')
      }
    })

    it('有効な日付形式は受け入れること', async () => {
      const validDates = [
        '2024/01/15', // スラッシュ形式
        '2024-02-30', // JavaScriptは2024-03-01に変換する
      ]

      for (const date of validDates) {
        const requestBody = {
          date,
          type: 'expense',
          amount: 1000,
          userId: 1
        }

        const request = createRequest(requestBody)
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      }
    })

    it('境界値の日付でも正常に処理できること', async () => {
      const boundaryDates = [
        '2024-01-01', // 年の初日
        '2024-12-31', // 年の最終日
        '2024-02-29', // うるう年
      ]

      for (const date of boundaryDates) {
        const requestBody = {
          date,
          type: 'expense',
          amount: 1000,
          userId: 1
        }

        const request = createRequest(requestBody)
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      }
    })
  })

  describe('typeバリデーション', () => {
    it('typeが未指定の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        amount: 1000,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('typeは"income"または"expense"である必要があります')
    })

    it('typeが空文字の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: '',
        amount: 1000,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('typeは"income"または"expense"である必要があります')
    })

    it('typeが無効な値の場合はエラーを返すこと', async () => {
      const invalidTypes = ['invalid', 'Income', 'EXPENSE', 'payment', 'spending']

      for (const invalidType of invalidTypes) {
        const requestBody = {
          date: '2024-01-15',
          type: invalidType,
          amount: 1000,
          userId: 1
        }

        const request = createRequest(requestBody)
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('typeは"income"または"expense"である必要があります')
      }
    })
  })

  describe('金額バリデーション', () => {
    it('金額が0の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: 0,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('金額は正の整数である必要があります')
    })

    it('金額が負の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: -100,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('金額は正の整数である必要があります')
    })

    it('金額が小数の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: 100.5,
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('金額は正の整数である必要があります')
    })

    it('金額が文字列の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: '1000',
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('金額は正の整数である必要があります')
    })

    it('金額が未指定の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        userId: 1
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('金額は正の整数である必要があります')
    })
  })

  describe('userIdバリデーション', () => {
    it('userIdが未指定の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: 1000
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('ユーザーIDは必須です')
    })

    it('userIdが文字列の場合はエラーを返すこと', async () => {
      const requestBody = {
        date: '2024-01-15',
        type: 'expense',
        amount: 1000,
        userId: '1'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('ユーザーIDは必須です')
    })
  })

  describe('エラーハンドリング', () => {
    it('JSONパースエラーの場合は500エラーを返すこと', async () => {
      const request = {
        json: async () => {
          throw new Error('Invalid JSON')
        }
      } as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('エントリーの作成に失敗しました')
    })
  })
})