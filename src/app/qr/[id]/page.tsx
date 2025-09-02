'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function QRPage() {
  const params = useParams()
  const [timeLeft, setTimeLeft] = useState(3600) // 1時間（秒）

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}時間${minutes}分${secs}秒`
  }

  return (
    <div>
      <h1>QRコード</h1>
      <p>相手に読み取ってもらってください</p>

      <div>
        {/* TODO: 実際のQRコード表示 */}
        <div style={{ 
          width: '200px', 
          height: '200px', 
          border: '1px solid black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          QRコード（ID: {params.id}）
        </div>
      </div>

      <div>
        <p>有効期限: {formatTime(timeLeft)}</p>
        {timeLeft === 0 && <p>このQRコードは有効期限切れです</p>}
      </div>

      <nav>
        <ul>
          <li><Link href="/camera">もう一度撮影する</Link></li>
          <li><Link href="/photos">写真一覧を見る</Link></li>
          <li><Link href="/">ホームに戻る</Link></li>
        </ul>
      </nav>
    </div>
  )
}