'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, ImageIcon } from "lucide-react"

export default function ReceivePage() {
  const params = useParams()
  const router = useRouter()
  const [name, setName] = useState('')
  const [locationPermission, setLocationPermission] = useState(false)
  const [step, setStep] = useState(1) // 1: Form, 2: Processing, 3: Complete
  const [remainingTime, setRemainingTime] = useState(45)

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
    setStep(2)
    
    // タイマーを開始
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setStep(3)
          return 0
        }
        return prev - 1
      })
    }, 1000)
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
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {step === 1 && (
          <div className="bg-[#ffffff] rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-[#0a0a0a] mb-2">写真を受け取る</h2>
              <p className="text-sm text-[#737373]">あなたの情報を入力してください</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="border border-[#e5e5e5] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-[#0a0a0a] mb-4">情報を入力</h3>

                <div className="mb-4">
                  <label className="text-sm text-[#0a0a0a] mb-2 block">あなたの名前*</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="名前を入力してください"
                    className="w-full"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                    id="location"
                    checked={locationPermission}
                    onCheckedChange={checked => setLocationPermission(checked === true)}
                    className="data-[state=checked]:bg-[#603736] data-[state=checked]:border-[#603736]"
                  />
                  <label htmlFor="location" className="text-sm text-[#0a0a0a]">
                    位置情報を記録する
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" asChild>
                    <Link href="/">キャンセル</Link>
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#603736] hover:bg-[#331515] text-white">
                    現像を開始
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#ffffff] rounded-xl p-6 h-full flex flex-col">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-6">現像中です...</h2>

            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-32 h-32 bg-[#e5e5e5] rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-[#737373]" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-[#737373]">残り時間: {remainingTime}秒</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#ffffff] rounded-xl p-6 h-full flex flex-col">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-6">現像が完了しました！</h2>

            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-32 h-32 bg-[#e5e5e5] rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-[#737373]" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-[#603736] hover:bg-[#331515] text-white">
                <Download className="w-4 h-4 mr-2" />
                保存する
              </Button>
              <Button className="flex-1 bg-[#603736] hover:bg-[#331515] text-white">
                <Download className="w-4 h-4 mr-2" />
                アプリを入手
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}