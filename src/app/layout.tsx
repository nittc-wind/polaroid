import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ともだちチェキ',
  description: '出会いを特別な思い出に',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <a href="/">ともだちチェキ</a>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <p>&copy; 2024 ともだちチェキ</p>
        </footer>
      </body>
    </html>
  )
}