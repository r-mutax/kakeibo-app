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