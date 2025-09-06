"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/AuthGuard";

function ScanPage() {
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
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-3 text-center">
            <CardTitle className="text-[#0a0a0a] text-base font-medium mb-1">
              QRコードを読み取る
            </CardTitle>
            <CardDescription className="text-[#737373] text-xs">
              相手が表示しているQRコードを読み取ってください
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center gap-4 p-0">
            <div className="w-full flex justify-center mb-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{
                  maxWidth: "100%",
                  aspectRatio: "4/3",
                  maxHeight: "40vh",
                }}
              />
            </div>
            <div className="w-full">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  className="w-full bg-[#603736] hover:bg-[#331515] text-white py-3"
                >
                  スキャンを開始
                </Button>
              ) : (
                <p className="text-[#737373] text-sm text-center">
                  QRコードを探しています...
                </p>
              )}
            </div>
            <div className="w-full mt-2">
              <Button variant="ghost" className="w-full py-2" asChild>
                <Link
                  href="/"
                  className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                >
                  ホームに戻る
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// スキャンページを認証ガードでラップ
export default function ScanPageWithAuth() {
  return (
    <AuthGuard>
      <ScanPage />
    </AuthGuard>
  );
}
