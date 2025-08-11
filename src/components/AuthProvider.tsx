'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: number
}

interface Session {
  userId: number
  timestamp: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (passcode: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // セッション情報をローカルストレージから復元
    const sessionData = localStorage.getItem('kakeibo-session')
    if (sessionData) {
      try {
        const session: Session = JSON.parse(sessionData)
        // セッションの有効性をチェック（24時間）
        const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000
        if (!isExpired) {
          setUser({ id: session.userId })
        } else {
          localStorage.removeItem('kakeibo-session')
        }
      } catch (error) {
        console.error('セッション復元エラー:', error)
        localStorage.removeItem('kakeibo-session')
      }
    }
    setLoading(false)
  }, [])

  const login = async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      })

      const data = await response.json()

      if (data.success) {
        // セッション情報をローカルストレージに保存
        localStorage.setItem('kakeibo-session', JSON.stringify(data.session))
        setUser({ id: data.session.userId })
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      return { success: false, error: 'ログインに失敗しました' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
    
    localStorage.removeItem('kakeibo-session')
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}