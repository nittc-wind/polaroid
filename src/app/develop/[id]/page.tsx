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
import { usePhotoData } from "@/hooks/usePhotoData";
import { useProfileGame } from "@/hooks/useProfileGame";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";

export default function DevelopPage() {
  const params = useParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isDeveloping, setIsDeveloping] = useState(true);
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // 共有フックを使用
  const { photoData, loading, error } = usePhotoData(params.id as string);

  // プロフィール交換ゲーム
  const {
    gameState,
    progressInfo,
    hasNextQuestion,
    currentQuestion,
    isTransitioning,
    startGame,
    goToNextQuestion,
    syncWithDevelopProgress,
    isGameActive,
  } = useProfileGame();

  // データ取得完了後に現像とゲームを開始
  useEffect(() => {
    if (photoData && isDeveloping && !isDeveloped && progress === 0) {
      startDeveloping();
      // ゲームを開始
      if (!gameState.isGameStarted) {
        try {
          startGame();
        } catch (error) {
          console.error("Failed to start profile game:", error);
        }
      }
    }
  }, [
    photoData,
    isDeveloping,
    isDeveloped,
    progress,
    gameState.isGameStarted,
    startGame,
  ]);

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

  // 現像完了時の自動ナビゲーション
  useEffect(() => {
    if (isDeveloped && !isDeveloping && progress >= 100) {
      // 1.5秒待ってから complete ページに遷移
      const timer = setTimeout(() => {
        router.push(`/complete/${params.id}`);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isDeveloped, isDeveloping, progress, router, params.id]);

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col overflow-hidden">
          {loading ? (
            // ローディング状態
            <>
              <CardHeader className="p-0 mb-4 text-center flex-shrink-0">
                <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
                  写真を読み込み中...
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  チェキデータを取得しています。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col p-0 flex-1 min-h-0">
                <div className="flex-1 flex items-center justify-center mb-6 min-h-0">
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
              <CardHeader className="p-0 mb-4 text-center flex-shrink-0">
                <CardTitle className="text-red-600 text-lg font-medium mb-2">
                  エラーが発生しました
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col p-0 flex-1">
                <Button asChild className="w-full">
                  <Link href="/">ホームに戻る</Link>
                </Button>
              </CardContent>
            </>
          ) : isDeveloped ? (
            // 現像完了後の表示（シンプル版 - 自動遷移のため）
            <>
              <CardHeader className="p-0 mb-4 text-center flex-shrink-0">
                <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
                  現像が完了しました！
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  完成した写真を確認しています...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col p-0 flex-1 min-h-0">
                {/* シンプルな完成写真表示 */}
                <div className="flex items-center justify-center mb-4 flex-1 min-h-0">
                  <div className="w-full max-h-full aspect-[4/5] bg-[#e5e5e5] rounded-2xl flex items-center justify-center relative overflow-hidden">
                    {imageLoadError ? (
                      <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center justify-center p-4">
                        <div className="text-red-800 text-xs text-center mb-2">
                          {imageLoadError}
                        </div>
                        <Button
                          onClick={() => {
                            setImageLoadError(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-800 border-red-200 hover:bg-red-100 text-xs"
                        >
                          再試行
                        </Button>
                      </div>
                    ) : photoData ? (
                      <Image
                        src={photoData.imageUrl}
                        alt="完成したチェキ"
                        fill
                        className="object-cover rounded-2xl"
                        sizes="(max-width: 600px) 80vw, 300px"
                        unoptimized={true} // Supabase署名付きURL用に最適化を無効化
                        onError={(e) => {
                          console.error("Image load error:", e);
                          console.error(
                            "Failed image URL:",
                            photoData.imageUrl,
                          );
                          setImageLoadError("画像の読み込みに失敗しました");
                        }}
                        onLoad={() => {
                          console.log(
                            "Image loaded successfully:",
                            photoData.imageUrl,
                          );
                        }}
                      />
                    ) : (
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
                    )}
                  </div>
                </div>

                {/* 遷移中インジケーター */}
                <div className="text-center text-[#737373] text-sm flex-shrink-0">
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-[#603736] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#603736] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#603736] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            // 現像中の表示
            <>
              <CardHeader className="p-0 mb-3 text-center flex-shrink-0">
                <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
                  現像中...
                </CardTitle>
                <CardDescription className="text-[#737373] text-sm">
                  チェキを現像しています。お互いのことを知り合いましょう！
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col p-0 space-y-3 flex-1 min-h-0 overflow-hidden">
                {/* プロフィール交換ゲーム */}
                {isGameActive && currentQuestion && (
                  <div className="flex-shrink-0">
                    <QuestionDisplay
                      question={currentQuestion}
                      questionNumber={progressInfo.current}
                      totalQuestions={progressInfo.total}
                      isTransitioning={isTransitioning}
                    />
                  </div>
                )}

                {/* プログレスバー */}
                <div className="flex-shrink-0">
                  <div className="w-full bg-[#e5e5e5] rounded-full h-3 mb-2 overflow-hidden">
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
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div
                    className="w-full max-h-full aspect-[4/5] bg-[#e5e5e5] rounded-2xl flex items-center justify-center relative overflow-hidden"
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
                            unoptimized={true} // Supabase署名付きURL用に最適化を無効化
                            onError={(e) => {
                              console.error(
                                "Image load error during development:",
                                e,
                              );
                              console.error(
                                "Failed image URL:",
                                photoData.imageUrl,
                              );
                              setImageLoadError(
                                "現像中の画像読み込みに失敗しました",
                              );
                            }}
                            onLoad={() => {
                              console.log(
                                "Development image loaded successfully:",
                                photoData.imageUrl,
                              );
                            }}
                          />
                        </div>
                      </div>
                    )}
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
