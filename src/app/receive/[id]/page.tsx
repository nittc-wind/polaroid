'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ReceivePage() {
  const params = useParams()
  const router = useRouter()
  const [name, setName] = useState('')
  const [locationPermission, setLocationPermission] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('名前を入力してください')
      return
    }

    // 位置情報を取得
    if (locationPermission) {
      try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
      } catch {
        console.error('位置情報の取得に失敗')
      }
    }

    // TODO: APIに送信
    console.log('送信データ:', { name, locationPermission, id: params.id })
    
    // 現像画面へ
    router.push(`/develop/${params.id}`)
  }

  const requestLocationPermission = async () => {
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      setLocationPermission(true)
      alert('位置情報の使用を許可しました')
    } catch {
      alert('位置情報の使用を許可してください')
    }
  }

  return (
    <div>
      <h1>写真を受け取る</h1>
      <p>あなたの情報を入力してください</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">お名前:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 田中太郎"
            required
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={locationPermission}
              onChange={(e) => setLocationPermission(e.target.checked)}
            />
            位置情報を共有する（任意）
          </label>
          {!locationPermission && (
            <button type="button" onClick={requestLocationPermission}>
              位置情報を許可
            </button>
          )}
        </div>

        <div>
          <button type="submit">現像を開始</button>
        </div>
      </form>

      <div>
        <Link href="/">キャンセル</Link>
      </div>
    </div>
  )
}