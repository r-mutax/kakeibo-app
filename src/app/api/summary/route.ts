import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SummaryData {
  period: string
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
  }
  byCategory: Array<{
    categoryId: number | null
    categoryName: string
    totalAmount: number
    entryCount: number
  }>
  daily: Array<{
    date: string
    income: number
    expense: number
    balance: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const yearMonth = searchParams.get('yearMonth') // Format: YYYY-MM

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

    // Validate yearMonth
    if (!yearMonth) {
      return NextResponse.json(
        { error: '年月は必須です' },
        { status: 400 }
      )
    }

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

    // Calculate date range for the month
    const startDate = new Date(parseInt(year), monthNum - 1, 1)
    const endDate = new Date(parseInt(year), monthNum, 0, 23, 59, 59, 999)

    // Get all entries for the specified month and user
    const entries = await prisma.entry.findMany({
      where: {
        userId: userIdNum,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calculate summary totals
    const totalIncome = entries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0)
    
    const totalExpense = entries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0)
    
    const balance = totalIncome - totalExpense

    // Calculate category breakdown (only for expenses)
    const categoryMap = new Map<string, {
      categoryId: number | null
      categoryName: string
      totalAmount: number
      entryCount: number
    }>()

    entries
      .filter(entry => entry.type === 'expense')
      .forEach(entry => {
        const categoryKey = entry.categoryId ? entry.categoryId.toString() : 'null'
        const categoryName = entry.category ? entry.category.name : '未分類'
        
        if (categoryMap.has(categoryKey)) {
          const existing = categoryMap.get(categoryKey)!
          existing.totalAmount += entry.amount
          existing.entryCount += 1
        } else {
          categoryMap.set(categoryKey, {
            categoryId: entry.categoryId,
            categoryName,
            totalAmount: entry.amount,
            entryCount: 1
          })
        }
      })

    const byCategory = Array.from(categoryMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount) // Sort by amount descending

    // Calculate daily breakdown
    const dailyMap = new Map<string, {
      date: string
      income: number
      expense: number
    }>()

    entries.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0] // YYYY-MM-DD format
      
      if (dailyMap.has(dateKey)) {
        const existing = dailyMap.get(dateKey)!
        if (entry.type === 'income') {
          existing.income += entry.amount
        } else {
          existing.expense += entry.amount
        }
      } else {
        dailyMap.set(dateKey, {
          date: dateKey,
          income: entry.type === 'income' ? entry.amount : 0,
          expense: entry.type === 'expense' ? entry.amount : 0
        })
      }
    })

    const daily = Array.from(dailyMap.values())
      .map(day => ({
        ...day,
        balance: day.income - day.expense
      }))
      .sort((a, b) => a.date.localeCompare(b.date)) // Sort chronologically

    const summaryData: SummaryData = {
      period: yearMonth,
      summary: {
        totalIncome,
        totalExpense,
        balance
      },
      byCategory,
      daily
    }

    return NextResponse.json({
      success: true,
      data: summaryData
    })

  } catch (error) {
    console.error('Summary fetch error:', error)
    return NextResponse.json(
      { error: '集計データの取得に失敗しました' },
      { status: 500 }
    )
  }
}