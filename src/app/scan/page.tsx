"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);

        // TODO: QRコードスキャンライブラリを実装
        // 仮の遷移
        setTimeout(() => {
          alert("QRコードを検出しました！");
          router.push("/receive/sample-id");
        }, 3000);
      }
    } catch (err) {
      console.error("カメラの起動に失敗しました:", err);
      alert("カメラの使用を許可してください");
    }
  };

  return (
    <div>
      <h1>QRコードを読み取る</h1>
      <p>相手が表示しているQRコードを読み取ってください</p>

      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="100%"
          style={{ maxWidth: "500px" }}
        />
      </div>

      <div>
        {!isScanning ? (
          <button onClick={startScanning}>スキャンを開始</button>
        ) : (
          <p>QRコードを探しています...</p>
        )}
      </div>

      <div>
        <Link href="/">ホームに戻る</Link>
      </div>
    </div>
  );
}
