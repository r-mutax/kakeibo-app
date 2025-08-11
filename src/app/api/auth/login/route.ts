import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPasscode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json()

    if (!passcode || passcode.length !== 4 || !/^\d{4}$/.test(passcode)) {
      return NextResponse.json(
        { error: 'パスコードは4桁の数字で入力してください' },
        { status: 400 }
      )
    }

    // ユーザーを取得（今回は1ユーザーのみを想定）
    const user = await prisma.user.findFirst()

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // パスコード検証
    const isValid = verifyPasscode(passcode, user.passcodeHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'パスコードが間違っています' },
        { status: 401 }
      )
    }

    // セッション情報を返す
    const sessionData = {
      userId: user.id,
      timestamp: Date.now(),
    }

    return NextResponse.json({
      success: true,
      session: sessionData,
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
}