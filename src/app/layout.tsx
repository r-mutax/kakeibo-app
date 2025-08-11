import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

export const metadata = {
  title: '家計簿アプリ',
  description: '4桁パスコード認証付き家計簿アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}