'use client'

import { useAuth } from '@/components/AuthProvider'
import LoginForm from '@/components/LoginForm'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/expenses')
    }
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        読み込み中...
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <LoginForm />
}