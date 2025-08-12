import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CreateEntryRequest {
  date: string
  type: string
  amount: number
  note?: string
  categoryId?: number
  userId: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const yearMonth = searchParams.get('yearMonth') // Format: YYYY-MM
    const categoryId = searchParams.get('categoryId')
    const type = searchParams.get('type')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      )
    }

    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'ユーザーIDは数値である必要があります' },
        { status: 400 }
      )
    }

    // Validate type if provided
    if (type && type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'typeは"income"または"expense"である必要があります' },
        { status: 400 }
      )
    }

    // Validate categoryId if provided
    let categoryIdNum: number | undefined
    if (categoryId) {
      categoryIdNum = parseInt(categoryId)
      if (isNaN(categoryIdNum)) {
        return NextResponse.json(
          { error: 'カテゴリIDは数値である必要があります' },
          { status: 400 }
        )
      }
    }

    // Validate pagination parameters
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    if (isNaN(pageNum) || pageNum < 1) {
      return NextResponse.json(
        { error: 'ページ番号は1以上の数値である必要があります' },
        { status: 400 }
      )
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return NextResponse.json(
        { error: '件数は1以上100以下の数値である必要があります' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      userId: userIdNum
    }

    // Add type filter if provided
    if (type) {
      where.type = type
    }

    // Add category filter if provided
    if (categoryIdNum) {
      where.categoryId = categoryIdNum
    }

    // Add year-month filter if provided
    if (yearMonth) {
      // Validate year-month format
      const yearMonthRegex = /^\d{4}-\d{2}$/
      if (!yearMonthRegex.test(yearMonth)) {
        return NextResponse.json(
          { error: '年月の形式はYYYY-MMである必要があります' },
          { status: 400 }
        )
      }

      const [year, month] = yearMonth.split('-')
      const monthNum = parseInt(month)
      
      // Validate month is between 01-12
      if (monthNum < 1 || monthNum > 12) {
        return NextResponse.json(
          { error: '年月の形式はYYYY-MMである必要があります' },
          { status: 400 }
        )
      }

      const startDate = new Date(parseInt(year), monthNum - 1, 1)
      const endDate = new Date(parseInt(year), monthNum, 0, 23, 59, 59, 999)

      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    // Calculate skip for pagination
    const skip = (pageNum - 1) * limitNum

    // Get entries with category information
    const [entries, totalCount] = await Promise.all([
      prisma.entry.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.entry.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    return NextResponse.json({
      success: true,
      data: {
        entries,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage
        }
      }
    })

  } catch (error) {
    console.error('Entry fetch error:', error)
    return NextResponse.json(
      { error: 'エントリーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEntryRequest = await request.json()
    const { date, type, amount, note, categoryId, userId } = body

    // Input validation
    if (!date) {
      return NextResponse.json(
        { error: '日付は必須です' },
        { status: 400 }
      )
    }

    // Validate date format
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: '日付の形式が正しくありません' },
        { status: 400 }
      )
    }

    // Validate type
    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json(
        { error: 'typeは"income"または"expense"である必要があります' },
        { status: 400 }
      )
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: '金額は正の整数である必要があります' },
        { status: 400 }
      )
    }

    // Validate userId
    if (!userId || typeof userId !== 'number') {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      )
    }

    // Create entry in database
    const entry = await prisma.entry.create({
      data: {
        date: dateObj,
        type,
        amount,
        note: note || null,
        categoryId: categoryId || null,
        userId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: entry,
    })

  } catch (error) {
    console.error('Entry creation error:', error)
    return NextResponse.json(
      { error: 'エントリーの作成に失敗しました' },
      { status: 500 }
    )
  }
}