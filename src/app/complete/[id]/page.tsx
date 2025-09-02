'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
  const params = useParams()
  const [photoUrl, setPhotoUrl] = useState<string>('')

  useEffect(() => {
    // TODO: APIから写真URLを取得
    setPhotoUrl('/sample-photo.jpg')
  }, [params.id])

  const handleDownload = () => {
    // TODO: 実際のダウンロード処理
    alert('写真をダウンロードしました！')
  }

  return (
    <div>
      <h1>写真が完成しました！</h1>
      
      <div>
        {/* チェキ風の写真表示 */}
        <div style={{
          width: '320px',
          padding: '10px',
          border: '1px solid #ccc',
          backgroundColor: 'white'
        }}>
          <Image 
            src={photoUrl}
            alt="完成した写真"
            width={300}
            height={300}
            style={{ width: '100%', height: 'auto' }}
          />
          <div style={{ marginTop: '10px', minHeight: '50px' }}>
            <p>2024.09.02 - Nagoya</p>
          </div>
        </div>
      </div>

      <div>
        <button onClick={handleDownload}>
          写真をダウンロード
        </button>
      </div>

      <div>
        <h2>ともだちチェキを使ってみませんか？</h2>
        <p>あなたも友達との思い出を特別な形で残しましょう！</p>
        <Link href="/">
          アプリを使ってみる
        </Link>
      </div>

      <div>
        <p>※ この写真は24時間後に自動的に削除されます</p>
      </div>
    </div>
  )
}