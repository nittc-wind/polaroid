"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import { useSearchParams } from "next/navigation";
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
import { useAuth } from "@/hooks/useAuth";

export default function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const shouldClaim = searchParams.get("claim") === "true";

  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<{
    isProcessing: boolean;
    isSuccess: boolean;
    error: string | null;
  }>({
    isProcessing: false,
    isSuccess: false,
    error: null,
  });

  // 認証状態の取得
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // 共有フックを使用
  const { photoData, loading, error, refetch } = usePhotoData(id);

  // 写真紐付けAPI呼び出し
  const claimPhoto = useCallback(async () => {
    try {
      setClaimStatus((prev) => ({ ...prev, isProcessing: true, error: null }));

      const response = await fetch(`/api/photos/${id}/claim`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "写真の紐付けに失敗しました");
      }

      setClaimStatus({
        isProcessing: false,
        isSuccess: true,
        error: null,
      });

      // 写真データを再取得して最新状態を反映
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err) {
      console.error("Photo claim error:", err);
      setClaimStatus({
        isProcessing: false,
        isSuccess: false,
        error:
          err instanceof Error ? err.message : "写真の紐付けに失敗しました",
      });
    }
  }, [id, refetch]); // 認証後の自動紐付け処理
  useEffect(() => {
    if (
      shouldClaim &&
      isAuthenticated &&
      !authLoading &&
      !claimStatus.isProcessing &&
      !claimStatus.isSuccess
    ) {
      // URLからclaimパラメータを削除（ブラウザ履歴を汚さないため）
      const url = new URL(window.location.href);
      url.searchParams.delete("claim");
      window.history.replaceState({}, "", url.toString());

      // 写真紐付けを実行
      claimPhoto();
    }
  }, [
    shouldClaim,
    isAuthenticated,
    authLoading,
    claimStatus.isProcessing,
    claimStatus.isSuccess,
    claimPhoto,
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
    // returnUrl とclaim パラメータ付きでログイン画面に遷移
    const returnUrl = encodeURIComponent(`/complete/${id}`);
    window.location.href = `/auth/signin?returnUrl=${returnUrl}&claim=true`;
  };

  // ログイン状態に応じたアクションボタンをレンダリング
  const renderActionButtons = () => {
    if (authLoading || claimStatus.isProcessing) {
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
            {claimStatus.isProcessing && (
              <span className="ml-2 text-sm text-[#737373]">
                思い出に追加中...
              </span>
            )}
          </div>
        </div>
      );
    }

    if (isAuthenticated) {
      // 紐付け成功時の表示
      if (claimStatus.isSuccess) {
        return (
          <div className="space-y-3 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 text-sm text-center">
                ✅ 写真を思い出に追加しました！
              </p>
            </div>
            <div className="flex flex-row gap-3">
              <Button
                disabled={true}
                className="flex-1 bg-green-600 text-white py-3 cursor-not-allowed"
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
      }

      // 既に紐付け済みかチェック
      const isAlreadyClaimed = photoData?.receiverUserId === user?.id;

      if (isAlreadyClaimed) {
        // 既に紐付け済みの場合
        return (
          <div className="space-y-3 mb-6">
            <div className="flex flex-row gap-3">
              <Button
                disabled={true}
                className="flex-1 bg-green-600 text-white py-3 cursor-not-allowed"
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
      }

      // ログイン時: 思い出に追加可能
      return (
        <div className="space-y-3 mb-6">
          <div className="flex flex-row gap-3">
            <Button
              onClick={claimPhoto}
              disabled={claimStatus.isProcessing}
              className="flex-1 bg-[#603636] hover:bg-[#603636]/90 text-white py-3"
            >
              {claimStatus.isProcessing ? "追加中..." : "思い出に追加"}
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
    } else {
      // 紐付けエラー時の表示
      if (claimStatus.error) {
        return (
          <div className="space-y-3 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm text-center mb-2">
                ❌ {claimStatus.error}
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setClaimStatus({
                      isProcessing: false,
                      isSuccess: false,
                      error: null,
                    });
                    claimPhoto();
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-800 border-red-300 hover:bg-red-100"
                >
                  再試行
                </Button>
              </div>
            </div>
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
            <CardTitle className="text-[#331515] text-lg font-medium mb-2">
              現像が完了しました！
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              あなたのチェキが完成しました
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-0">
            {loading ? (
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
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl aspect-[4/5] flex flex-col items-center justify-center mb-6 w-full p-4">
                <div className="text-red-800 text-sm text-center mb-2">
                  {error}
                </div>
                <Button
                  onClick={() => {
                    // 再取得処理をトリガー
                    window.location.reload();
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
