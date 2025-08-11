'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode.length !== 4) {
      setError('4桁のパスコードを入力してください')
      return
    }

    setLoading(true)
    setError('')

    const result = await login(passcode)
    
    if (result.success) {
      router.push('/expenses')
    } else {
      setError(result.error || 'ログインに失敗しました')
    }
    
    setLoading(false)
  }

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPasscode(value)
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '30px', color: '#333' }}>家計簿アプリ</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          4桁のパスコードを入力してください
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={passcode}
              onChange={handlePasscodeChange}
              placeholder="パスコード"
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '24px',
                textAlign: 'center',
                border: '2px solid #ddd',
                borderRadius: '8px',
                letterSpacing: '10px'
              }}
              maxLength={4}
              autoFocus
            />
          </div>
          
          {error && (
            <div style={{
              color: '#e74c3c',
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#fdf2f2',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || passcode.length !== 4}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              backgroundColor: passcode.length === 4 ? '#3498db' : '#bdc3c7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: passcode.length === 4 ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.3s'
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}