'use client'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
export default function CameraPage(){
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreamReady, setIsStreamReady] = useState(false)

  // カメラ起動
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreamReady(true)
      }
    } catch (err) {
      console.error('カメラの起動に失敗しました:', err)
      alert('カメラの使用を許可してください')
    }
  }
  // 撮影
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      // TODO: 画像をアップロードしてQR画面へ遷移
      alert('撮影しました！（TODO: アップロード処理）')
      router.push('/qr/sample-id')
    }
  }

  return (
      
    <div className="flex justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>写真を撮る</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
          <div>
            <h1>写真を撮る</h1>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              width="100%"
              style={{ maxWidth: '500px' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div>
            {!isStreamReady ? (
              <button onClick={startCamera}>カメラを起動</button>
            ) : (
              <button onClick={capture}>撮影する</button>
            )}
          </div>

          <div>
            <Link href="/">ホームに戻る</Link>
      </div>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
      
      
      
    </div>
  )
}