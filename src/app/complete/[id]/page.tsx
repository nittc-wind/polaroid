"use client";

import { useState, useEffect } from "react";
import { use } from "react";
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
  imageUrl: string; // Supabaseの署名付きURL
  storagePath?: string; // Supabaseストレージパス（camelCase）
  receiverName: string | null;
  receivedAt: string | null; // ISO date string
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  createdAt: string; // ISO date string
}

export default function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // 画像の直接テスト用関数
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

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`/api/photos/${id}`);

        if (!response.ok) {
          // 新しいエラーレスポンス形式に対応
          try {
            const errorData = await response.json();
            if (response.status === 404) {
              setError("写真が見つかりません");
            } else if (response.status === 410) {
              setError("写真の有効期限が切れています");
            } else if (errorData.error?.message) {
              setError(`写真の取得に失敗しました: ${errorData.error.message}`);
            } else {
              setError("写真の取得に失敗しました");
            }
          } catch {
            if (response.status === 404) {
              setError("写真が見つかりません");
            } else if (response.status === 410) {
              setError("写真の有効期限が切れています");
            } else {
              setError("写真の取得に失敗しました");
            }
          }
          return;
        }

        // 新しい成功レスポンス形式に対応
        const result = await response.json();
        console.log("API Response:", result); // デバッグ用ログ
        console.log("Response success:", result.success); // デバッグ用ログ
        console.log("Response data:", result.data); // デバッグ用ログ

        if (!result.success || !result.data) {
          console.error("Response structure error:", result); // デバッグ用ログ
          setError("サーバーのレスポンスが不正です");
          return;
        }

        console.log("Photo data about to set:", result.data); // デバッグ用ログ
        console.log("Photo imageUrl:", result.data.imageUrl); // デバッグ用ログ

        // 画像URLをテスト
        if (result.data.imageUrl) {
          console.log("Testing image URL accessibility...");
          const isAccessible = await testImageUrl(result.data.imageUrl);
          console.log("Image URL accessible:", isAccessible);

          if (!isAccessible) {
            console.warn(
              "Image URL is not accessible, this may cause display issues",
            );
          }
        }

        // ストレージパスのテスト
        if (result.data.storagePath) {
          console.log("Testing storage path:", result.data.storagePath);
          // ストレージの直接テストを実行
          try {
            const storageTest = await fetch("/api/test/storage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: result.data.storagePath }),
            });
            const storageResult = await storageTest.json();
            console.log("Storage test result:", storageResult);
          } catch (error) {
            console.error("Storage test failed:", error);
          }
        }

        setPhotoData(result.data);
      } catch (err) {
        console.error("Error fetching photo:", err);
        setError("写真の取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-3xl p-8 shadow-lg flex flex-col">
          <CardHeader className="p-0 mb-6 text-center">
            <CardTitle className="text-[#603636] text-xl font-medium mb-2">
              現像が完了しました！
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              完成した写真を保存・シェアできます
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-0">
            {loading ? (
              <div className="bg-[#e5e5e5] rounded-2xl aspect-[4/5] flex items-center justify-center mb-6 relative overflow-hidden w-full">
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
                    className="animate-pulse"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
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
                    setError(null);
                    setLoading(true);
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
              <div className="bg-[#e5e5e5] rounded-2xl aspect-[4/5] flex items-center justify-center mb-6 relative overflow-hidden w-full">
                {imageLoadError ? (
                  <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center justify-center p-4">
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
                      URL再テスト
                    </Button>
                  </div>
                ) : photoData?.imageUrl ? (
                  <Image
                    src={photoData.imageUrl}
                    alt="完成した写真"
                    fill
                    className="object-cover"
                    unoptimized={true} // Supabase署名付きURL用に最適化を無効化
                    onError={(e) => {
                      console.error("Image load error:", e);
                      console.error("Failed image URL:", photoData.imageUrl);
                      setImageLoadError(
                        "画像の読み込みに失敗しました。URLに問題がある可能性があります。",
                      );
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
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-row gap-3 mb-6 w-full">
              <Button
                onClick={handleDownload}
                disabled={loading || error !== null || !photoData?.imageUrl}
                className="flex-1 bg-[#603636] hover:bg-[#603636]/90 text-white rounded-xl py-3 disabled:opacity-50"
              >
                保存する
              </Button>
              <Button
                onClick={handleShare}
                disabled={loading || error !== null}
                variant="outline"
                className="flex-1 border-[#603636] text-[#603636] hover:bg-[#603636]/5 rounded-xl py-3 bg-transparent disabled:opacity-50"
              >
                シェアする
              </Button>
            </div>
            <div className="text-center space-y-3 w-full">
              <div>
                <CardTitle className="text-[#603636] text-base font-medium mb-1">
                  ともだちチェキを使ってみませんか？
                </CardTitle>
                <CardDescription className="text-[#737373] text-xs">
                  あなたも友達との思い出を特別な形で残しましょう！
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="w-full text-[#603636] hover:bg-[#603636]/5"
                asChild
              >
                <Link href="/" className="w-full block">
                  アプリを使ってみる
                </Link>
              </Button>
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
