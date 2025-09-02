'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Photo {
  id: string
  createdAt: string
  isReceived: boolean
  receiverName?: string
  imageUrl: string
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [groupedPhotos, setGroupedPhotos] = useState<Record<string, Photo[]>>({})

  useEffect(() => {
    // TODO: APIから写真一覧を取得
    // 仮データ
    const mockPhotos: Photo[] = [
      {
        id: '1',
        createdAt: new Date().toISOString(),
        isReceived: true,
        receiverName: '田中太郎',
        imageUrl: '/sample.jpg'
      },
      {
        id: '2',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isReceived: false,
        imageUrl: '/sample2.jpg'
      }
    ]
    
    setPhotos(mockPhotos)
    
    // 日付でグルーピング
    const grouped = mockPhotos.reduce((acc, photo) => {
      const date = new Date(photo.createdAt).toLocaleDateString('ja-JP')
      if (!acc[date]) acc[date] = []
      acc[date].push(photo)
      return acc
    }, {} as Record<string, Photo[]>)
    
    setGroupedPhotos(grouped)
  }, [])

  return (
    <div>
      <h1>写真一覧</h1>

      {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
        <div key={date}>
          <h2>{date}</h2>
          <ul>
            {datePhotos.map((photo) => (
              <li key={photo.id}>
                <div>
                  <img 
                    src={photo.imageUrl} 
                    alt="写真" 
                    width="100"
                    style={{ border: '1px solid #ccc' }}
                  />
                  <p>
                    {photo.isReceived 
                      ? `✅ ${photo.receiverName}さんが受け取りました`
                      : '⏳ 受け取り待ち'
                    }
                  </p>
                  <p>
                    {new Date(photo.createdAt).toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {photos.length === 0 && (
        <p>まだ写真がありません</p>
      )}

      <nav>
        <ul>
          <li><Link href="/camera">写真を撮る</Link></li>
          <li><Link href="/">ホームに戻る</Link></li>
        </ul>
      </nav>
    </div>
  )
}