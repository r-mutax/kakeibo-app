'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'

export default function ExpensesPage() {
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          borderBottom: '1px solid #ddd',
          paddingBottom: '20px'
        }}>
          <h1 style={{ margin: 0, color: '#333' }}>支出一覧</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          <p>ユーザー ID: {user?.id}</p>
          <p>支出データがまだありません。</p>
          <p>ここに支出一覧が表示されます。</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}