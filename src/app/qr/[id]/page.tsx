"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QRPage() {
  const params = useParams();
  const [timeLeft, setTimeLeft] = useState(3600); // 1時間（秒）

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}時間${minutes}分${secs}秒`;
  };

  return (
    <div className="container min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="inner w-full max-w-md mx-auto">
        <Card className="card">
          <CardHeader>
            <CardTitle className="text-lg">QRコード</CardTitle>
            <p className="text-[#737373] text-sm">
              相手に読み取ってもらってください
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* TODO: 実際のQRコード表示 */}
            <div className="w-48 h-48 border border-black flex items-center justify-center rounded bg-white">
              QRコード（ID: {params.id}）
            </div>
            <div className="w-full text-center">
              <p className="text-[#737373] text-sm">
                有効期限: {formatTime(timeLeft)}
              </p>
              {timeLeft === 0 && (
                <p className="text-red-500 text-sm">
                  このQRコードは有効期限切れです
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button variant="ghost" className="w-full">
                <Link
                  href="/camera"
                  className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                >
                  もう一度撮影する
                </Link>
              </Button>
              <Button variant="ghost" className="w-full">
                <Link
                  href="/photos"
                  className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                >
                  写真一覧を見る
                </Link>
              </Button>
              <Button variant="ghost" className="w-full">
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
