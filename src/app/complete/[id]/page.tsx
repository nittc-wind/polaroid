"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Share, ImageIcon } from "lucide-react";

interface PhotoData {
  id: string;
  imageUrl: string;
  receiverName: string | null;
  receivedAt: Date | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  createdAt: Date;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`/api/photos/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("写真が見つかりません");
          } else if (response.status === 410) {
            setError("写真の有効期限が切れています");
          } else {
            setError("写真の取得に失敗しました");
          }
          return;
        }

        const data = await response.json();
        setPhotoData(data);
      } catch (err) {
        console.error("Error fetching photo:", err);
        setError("写真の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  const handleDownload = async () => {
    if (!photoData?.imageUrl) return;

    try {
      const response = await fetch(photoData.imageUrl);
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
      alert("ダウンロードに失敗しました");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ともだちチェキ",
          text: `${photoData?.receiverName || "友達"}との思い出の写真です！`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert("URLをクリップボードにコピーしました");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  const getLocationText = () => {
    if (!photoData?.location) return "";
    if (photoData.location.address) return photoData.location.address;
    return `${photoData.location.latitude.toFixed(4)}, ${photoData.location.longitude.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-[#ffffff] rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-[#e5e5e5] rounded-lg flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-[#737373]" />
            </div>
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-2">
              写真を読み込み中...
            </h2>
            <p className="text-sm text-[#737373]">しばらくお待ちください</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-[#ffffff] rounded-xl p-6 text-center">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-2">
              エラーが発生しました
            </h2>
            <p className="text-sm text-[#737373] mb-6">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-[#ffffff] rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-[#0a0a0a] mb-2">
              写真が完成しました！
            </h2>
            <p className="text-sm text-[#737373]">
              あなたの思い出がチェキになりました
            </p>
          </div>

          {/* チェキ風の写真表示 */}
          <div className="mb-6 flex justify-center">
            <div
              className="bg-white p-4 rounded-lg shadow-lg"
              style={{ width: "280px" }}
            >
              <div className="relative aspect-square overflow-hidden rounded-md mb-3">
                {photoData?.imageUrl ? (
                  <Image
                    src={photoData.imageUrl}
                    alt="完成した写真"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#e5e5e5] flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-[#737373]" />
                  </div>
                )}
              </div>

              {/* チェキのメモ部分 */}
              <div className="text-center space-y-1">
                {photoData?.receiverName && (
                  <p className="text-sm font-medium text-[#0a0a0a]">
                    {photoData.receiverName}
                  </p>
                )}
                <p className="text-xs text-[#737373]">
                  {photoData &&
                    formatDate(photoData.receivedAt || photoData.createdAt)}
                  {getLocationText() && ` - ${getLocationText()}`}
                </p>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-[#603736] hover:bg-[#331515] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              保存する
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share className="w-4 h-4 mr-2" />
              シェア
            </Button>
          </div>

          {/* アプリ宣伝 */}
          <div className="border border-[#e5e5e5] rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-[#0a0a0a] mb-2">
              ともだちチェキを使ってみませんか？
            </h3>
            <p className="text-xs text-[#737373] mb-3">
              あなたも友達との思い出を特別な形で残しましょう！
            </p>
            <Button
              asChild
              className="w-full bg-[#603736] hover:bg-[#331515] text-white"
            >
              <Link href="/">アプリを使ってみる</Link>
            </Button>
          </div>

          {/* 注意事項 */}
          <p className="text-xs text-[#737373] text-center">
            ※ この写真は24時間後に自動的に削除されます
          </p>
        </div>
      </div>
    </div>
  );
}
