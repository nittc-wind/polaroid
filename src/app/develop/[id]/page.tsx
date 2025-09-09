"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Download, Share, ImageIcon } from "lucide-react";

interface PhotoData {
  id: string;
  userId: string;
  imageUrl: string;
  storagePath?: string;
  receiverName: string | null;
  receivedAt: string | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  createdAt: string;
}

export default function DevelopPage() {
  const params = useParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isDeveloping, setIsDeveloping] = useState(true);
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // 写真データを取得
  useEffect(() => {
    const fetchPhotoData = async () => {
      try {
        const response = await fetch(`/api/photos/${params.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch photo: ${response.status}`);
        }
        const data = await response.json();
        setPhotoData(data);
        setLoading(false);

        // データ取得後に現像開始
        startDeveloping();
      } catch (err) {
        console.error("Error fetching photo data:", err);
        setError(err instanceof Error ? err.message : "Failed to load photo");
        setLoading(false);
      }
    };

    fetchPhotoData();
  }, [params.id]);

  const startDeveloping = () => {
    // 30秒かけて現像
    const duration = 30000;
    const interval = 100;
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsDeveloping(false);
          setIsDeveloped(true);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  };

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-6 max-h-[90vh] flex flex-col">
          {loading ? (
            // ローディング状態
            <>
              <CardHeader className="p-0 mb-6 text-center">
                <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
                  写真を読み込み中...
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  チェキデータを取得しています。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col p-0">
                <div className="flex-1 flex items-center justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#737373"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-spin"
                    >
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </>
          ) : error ? (
            // エラー状態
            <>
              <CardHeader className="p-0 mb-6 text-center">
                <CardTitle className="text-red-600 text-lg font-medium mb-2">
                  エラーが発生しました
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col p-0">
                <Button asChild className="w-full">
                  <Link href="/">ホームに戻る</Link>
                </Button>
              </CardContent>
            </>
          ) : isDeveloped ? (
            // 現像完了後の表示
            <>
              <CardHeader className="p-0 mb-6 text-center">
                <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
                  現像が完了しました！
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  あなたのチェキが完成しました
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col p-0">
                {/* チェキ風写真表示 */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative flex flex-col items-center bg-white rounded-[8px] shadow-xl border border-gray-100 py-4 px-2 w-full max-w-[280px] mx-auto cheki-card">
                    <div className="relative w-full flex-1 flex items-center justify-center">
                      <div
                        className="bg-white rounded-[12px] shadow-lg overflow-hidden flex items-center justify-center w-full"
                        style={{ aspectRatio: "1/1", maxWidth: "240px" }}
                      >
                        {photoData && (
                          <Image
                            src={photoData.imageUrl}
                            alt="完成したチェキ"
                            fill
                            className="object-cover"
                            sizes="(max-width: 600px) 80vw, 240px"
                            onError={() =>
                              setImageLoadError("画像の読み込みに失敗しました")
                            }
                          />
                        )}
                      </div>
                    </div>
                    {/* 下余白（チェキ風） */}
                    <div className="w-full h-8" />
                  </div>
                </div>

                {/* 写真情報 */}
                {photoData && (
                  <div className="mb-6 space-y-2">
                    <div className="text-center">
                      <p className="text-[#0a0a0a] font-medium">
                        {photoData.receiverName || "あなた"}のチェキ
                      </p>
                      <p className="text-[#737373] text-sm">
                        {new Date(photoData.createdAt).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/photos">写真一覧を見る</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/camera">新しく撮影する</Link>
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            // 現像中の表示
            <>
              <CardHeader className="p-0 mb-6 text-center">
                <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
                  現像中...
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  チェキを現像しています。しばらくお待ちください。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col p-0">
                {/* プログレスバー */}
                <div className="mb-6">
                  <div className="w-full bg-[#e5e5e5] rounded-full h-3 mb-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#603736] to-[#331515] rounded-full transition-all duration-100 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[#603736] text-sm font-medium">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                {/* 現像中のアニメーション表示エリア */}
                <div className="flex-1 flex items-center justify-center mb-6">
                  <div
                    className="w-full aspect-[4/5] bg-[#e5e5e5] rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      opacity: Math.max(0.1, progress / 100),
                      filter: `blur(${Math.max(0, 10 - progress / 10)}px)`,
                    }}
                  >
                    {/* 実際の写真を徐々に表示 */}
                    {photoData && progress > 10 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="relative w-full h-full"
                          style={{
                            opacity: Math.max(0, (progress - 10) / 90),
                          }}
                        >
                          <Image
                            src={photoData.imageUrl}
                            alt="現像中のチェキ"
                            fill
                            className="object-cover rounded-2xl"
                            sizes="(max-width: 600px) 80vw, 300px"
                          />
                        </div>
                      </div>
                    )}
                    {/* プレースホルダーアイコン */}
                    <div className="w-16 h-16 flex items-center justify-center">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#737373"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`${isDeveloping ? "animate-pulse" : ""}`}
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                    {/* 現像エフェクト */}
                    {isDeveloping && (
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-30 animate-pulse" />
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
