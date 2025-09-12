"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { usePhotoData } from "@/hooks/usePhotoData";
import { useAuth } from "@/hooks/useAuth";

export default function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessedComplete, setHasProcessedComplete] = useState(false);

  // 認証状態の取得
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // 共有フックを使用
  const { photoData, loading, error, refetch } = usePhotoData(id);

  // 完了画面用の自動受け取り処理
  const processPhotoComplete = async (forceUserBinding = false) => {
    if (isProcessing || hasProcessedComplete) return;

    setIsProcessing(true);
    setCompleteError(null);

    try {
      // 位置情報取得（オプショナル）
      let locationData = null;
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          },
        );
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch {
        console.log("位置情報の取得をスキップ");
      }

      // APIに送信
      const requestBody: {
        location: { latitude: number; longitude: number } | null;
        receiverName?: string;
      } = {
        location: locationData,
      };

      // 未ログインユーザーの場合のみ名前を含める（初回時）
      if (!isAuthenticated && !forceUserBinding) {
        // デフォルトの受け取り者名を設定
        requestBody.receiverName = "チェキの受け取り者";
      }

      const response = await fetch(`/api/photos/${id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // エラーレスポンスの場合
        if (response.status === 404) {
          setCompleteError("写真が見つからないか、既に受け取り済みです");
        } else if (response.status === 410) {
          setCompleteError("写真の有効期限が切れています");
        } else {
          setCompleteError(data.error || "受け取り処理に失敗しました");
        }
        return;
      }

      // 成功時は写真データを更新
      setHasProcessedComplete(true);
      refetch(); // 写真データを再取得

      // ログイン後の紐付け成功時はメッセージ表示
      if (forceUserBinding && isAuthenticated) {
        // 紐付け成功の一時的な表示など（必要に応じて）
        console.log("アカウントとの紐付けが完了しました");
      }
    } catch (err) {
      console.error("Complete processing failed:", err);
      setCompleteError("受け取り処理中にエラーが発生しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 初回レンダリング時の自動受け取り処理
  useEffect(() => {
    if (!loading && !error && photoData && !hasProcessedComplete) {
      // URLパラメータから「ログイン後」かどうかを判定
      const fromLogin = searchParams.get("from") === "login";

      if (fromLogin && isAuthenticated) {
        // ログイン後の場合：ユーザー紐付け処理
        processPhotoComplete(true);
      } else if (!photoData.receivedAt) {
        // 未受け取りの場合：通常の受け取り処理
        processPhotoComplete(false);
      } else {
        // 既に受け取り済みの場合
        setHasProcessedComplete(true);
      }
    }
  }, [
    loading,
    error,
    photoData,
    isAuthenticated,
    hasProcessedComplete,
    searchParams,
  ]);

  // 画像の直接テスト用関数（デバッグ用）
  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      console.log(`Image URL test for ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      return response.ok;
    } catch (error) {
      console.error(`Image URL test failed for ${url}:`, error);
      return false;
    }
  };

  const handleDownload = async () => {
    if (!photoData?.imageUrl) {
      alert("ダウンロードできる画像がありません");
      return;
    }

    try {
      // Supabaseの署名付きURLから画像をダウンロード
      const response = await fetch(photoData.imageUrl);
      if (!response.ok) {
        throw new Error("画像の取得に失敗しました");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tomodachi-cheki-${photoData.receiverName || "photo"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("ダウンロードに失敗しました。再度お試しください。");
    }
  };

  const handleShare = () => {
    // TODO: シェア機能の実装
    if (navigator.share) {
      navigator.share({
        title: "ともだちチェキ",
        text: "友達との思い出をチェキで残しました！",
        url: window.location.href,
      });
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert("URLをクリップボードにコピーしました！");
    }
  };

  // 将来的な機能のプレースホルダー関数
  const handleAddToMemories = () => {
    // TODO: 思い出に追加機能の実装
    alert("思い出への追加機能は準備中です");
  };

  const handleLoginAndAdd = () => {
    // ログイン画面にリダイレクト（完了画面URLを指定）
    const redirectUrl = `/complete/${id}?from=login`;
    window.location.href = `/auth/signin?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // ログイン状態に応じたアクションボタンをレンダリング
  const renderActionButtons = () => {
    if (authLoading) {
      return (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                width="24"
                height="24"
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
        </div>
      );
    }

    if (isAuthenticated) {
      // ログイン時: 思い出に追加済み（無効）+ ホームに戻る
      return (
        <div className="space-y-3 mb-6">
          <div className="flex flex-row gap-3">
            <Button
              disabled={true}
              className="flex-1 bg-gray-400 text-white py-3 cursor-not-allowed"
            >
              思い出に追加済み
            </Button>
            <Button
              asChild
              className="flex-1 bg-[#603636] hover:bg-[#603636]/90 text-white py-3"
            >
              <Link href="/">ホームに戻る</Link>
            </Button>
          </div>
        </div>
      );
    } else {
      // 未ログイン時: ログインして思い出に追加 + ホームに戻る
      return (
        <div className="space-y-3 mb-6">
          <div className="flex flex-row gap-3">
            <Button
              onClick={handleLoginAndAdd}
              className="flex-1 bg-[#603636] hover:bg-[#603636]/90 text-white py-3"
            >
              ログインして思い出に追加
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-[#603636] text-[#603636] hover:bg-[#603636]/5 py-3"
            >
              <Link href="/">ホームに戻る</Link>
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-6 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-6 text-center">
            <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
              現像が完了しました！
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              あなたのチェキが完成しました
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-0">
            {loading || isProcessing ? (
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
                {isProcessing && (
                  <p className="text-[#737373] text-sm mt-2">
                    受け取り処理中...
                  </p>
                )}
              </div>
            ) : error || completeError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl aspect-[4/5] flex flex-col items-center justify-center mb-6 w-full p-4">
                <div className="text-red-800 text-sm text-center mb-2">
                  {completeError || error}
                </div>
                <Button
                  onClick={() => {
                    if (completeError) {
                      setCompleteError(null);
                      setHasProcessedComplete(false);
                      processPhotoComplete(false);
                    } else {
                      // 再取得処理をトリガー
                      window.location.reload();
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-800 border-red-200 hover:bg-red-100"
                >
                  再試行
                </Button>
              </div>
            ) : (
              <>
                {/* チェキ風写真表示 */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative flex flex-col items-center bg-white rounded-[8px] shadow-xl border border-gray-100 py-4 px-2 w-full max-w-[280px] mx-auto cheki-card">
                    <div className="relative w-full flex-1 flex items-center justify-center">
                      <div
                        className="bg-white rounded-[12px] shadow-lg overflow-hidden flex items-center justify-center w-full"
                        style={{ aspectRatio: "1/1", maxWidth: "240px" }}
                      >
                        {imageLoadError ? (
                          <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-[12px] flex flex-col items-center justify-center p-4">
                            <div className="text-red-800 text-xs text-center mb-2">
                              {imageLoadError}
                            </div>
                            <Button
                              onClick={() => {
                                setImageLoadError(null);
                                if (photoData?.imageUrl) {
                                  testImageUrl(photoData.imageUrl);
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-800 border-red-200 hover:bg-red-100 text-xs"
                            >
                              再試行
                            </Button>
                          </div>
                        ) : photoData?.imageUrl ? (
                          <Image
                            src={photoData.imageUrl}
                            alt="完成したチェキ"
                            fill
                            className="object-cover"
                            sizes="(max-width: 600px) 80vw, 240px"
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
                              setImageLoadError(null);
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
                {renderActionButtons()}
              </>
            )}

            {/* フッター情報 */}
            <div className="text-center space-y-3 w-full">
              <p className="text-[#737373] text-xs">
                ※ この写真は24時間後に自動的に削除されます
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
