import "@/app/globals.css";
import type { Metadata } from 'next'
import Link from 'next/link'

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
          <Link href="/">ともだちチェキ</Link>
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