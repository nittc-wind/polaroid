import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      <h1>ともだちチェキ</h1>
      <p>一緒に撮った写真を、チェキ風に現像してお渡しします</p>
      
      <nav>
        <ul>
          <li>
            <Link href="/camera">
              写真を撮る
            </Link>
          </li>
          <li>
            <Link href="/photos">
              写真一覧を見る
            </Link>
          </li>
          <li>
            <Link href="/scan">
              QRコードを読み取る（受け取り側）
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}