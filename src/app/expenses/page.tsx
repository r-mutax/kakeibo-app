'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  color?: string
  order?: number
}

interface Entry {
  id: number
  date: string
  type: 'income' | 'expense'
  amount: number
  note?: string
  categoryId?: number
  userId: number
  createdAt: string
  updatedAt: string
  category?: Category
}

interface EntriesResponse {
  success: boolean
  data: {
    entries: Entry[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      limit: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

export default function ExpensesPage() {
  const { logout, user } = useAuth()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    yearMonth: '',
    type: '',
    categoryId: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 50,
    hasNextPage: false,
    hasPrevPage: false
  })

  const fetchEntries = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        userId: user.id.toString(),
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString()
      })

      // Add filters if they exist
      if (filters.yearMonth) params.append('yearMonth', filters.yearMonth)
      if (filters.type) params.append('type', filters.type)
      if (filters.categoryId) params.append('categoryId', filters.categoryId)

      const response = await fetch(`/api/entries?${params}`)
      const data: EntriesResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'エントリーの取得に失敗しました')
      }

      if (data.success) {
        setEntries(data.data.entries)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('エントリー取得エラー:', error)
      setError(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [user?.id, pagination.currentPage, filters])

  const handleLogout = () => {
    logout()
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page when filtering
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ja-JP') + '円'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    return type === 'income' ? '収入' : '支出'
  }

  const getTypeColor = (type: string) => {
    return type === 'income' ? '#27ae60' : '#e74c3c'
  }

  // Generate year-month options for the filter
  const generateYearMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Generate options for current year and previous year
    for (let year = currentYear; year >= currentYear - 1; year--) {
      const maxMonth = year === currentYear ? currentMonth : 11
      for (let month = maxMonth; month >= 0; month--) {
        const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`
        const label = `${year}年${month + 1}月`
        options.push({ value: yearMonth, label })
      }
    }
    return options
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
          <h1 style={{ margin: 0, color: '#333' }}>収支一覧</h1>
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

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              年月:
            </label>
            <select
              value={filters.yearMonth}
              onChange={(e) => handleFilterChange('yearMonth', e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">すべて</option>
              {generateYearMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              種類:
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">すべて</option>
              <option value="income">収入</option>
              <option value="expense">支出</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setFilters({ yearMonth: '', type: '', categoryId: '' })
                setPagination(prev => ({ ...prev, currentPage: 1 }))
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '23px'
              }}
            >
              フィルターをクリア
            </button>
          </div>
        </div>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            読み込み中...
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            エラー: {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#666'
          }}>
            <p>該当するエントリーがありません。</p>
            <p>フィルターの条件を変更してください。</p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            {/* Entries table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>日付</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>種類</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>金額</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>カテゴリ</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>
                        {formatDate(entry.date)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          color: getTypeColor(entry.type),
                          fontWeight: 'bold'
                        }}>
                          {getTypeLabel(entry.type)}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        fontWeight: 'bold',
                        color: getTypeColor(entry.type)
                      }}>
                        {entry.type === 'expense' ? '-' : '+'}{formatAmount(entry.amount)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {entry.category?.name || '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {entry.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '20px',
                padding: '15px'
              }}>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: pagination.hasPrevPage ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed'
                  }}
                >
                  前へ
                </button>
                
                <span style={{ padding: '0 10px', fontSize: '14px' }}>
                  {pagination.currentPage} / {pagination.totalPages} ページ 
                  (全 {pagination.totalCount} 件)
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: pagination.hasNextPage ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed'
                  }}
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}