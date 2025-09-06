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


  const handleShare = () => {
    // TODO: シェア機能の実装
    if (navigator.share) {
      navigator.share({
        title: 'ともだちチェキ',
        text: '友達との思い出をチェキで残しました！',
        url: window.location.href
      });
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert('URLをクリップボードにコピーしました！');
    }
  };

  const handleShare = () => {
    // TODO: シェア機能の実装
    if (navigator.share) {
      navigator.share({
        title: 'ともだちチェキ',
        text: '友達との思い出をチェキで残しました！',
        url: window.location.href
      });
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert('URLをクリップボードにコピーしました！');
    }
  };

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-3xl p-8 w-full max-w-sm mx-auto shadow-lg">
        <h1 className="text-[#603636] text-xl font-medium mb-8 text-center">現像が完了しました！</h1>

<<<<<<< HEAD
      <div>
        {/* チェキ風の写真表示 */}
        <div
          style={{
            width: "320px",
            padding: "10px",
            border: "1px solid #ccc",
            backgroundColor: "white",
          }}
        >
          {photoData?.imageUrl ?<Image
            src={photoData.imageUrl}
            alt="完成した写真"
            width={300}
            height={300}
            style={{ width: "100%", height: "auto" }}
          />:<p>画像が読み込めませんでした</p>}
          <div style={{ marginTop: "10px", minHeight: "50px" }}>
            <p>2024.09.02 - Nagoya</p>
          </div>
=======
        <div className="bg-[#e5e5e5] rounded-2xl aspect-[4/5] flex items-center justify-center mb-6 relative overflow-hidden">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="完成した写真"
              fill
              className="object-cover"
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
>>>>>>> f85289f (wip:completeもどす)
        </div>

        <div className="flex flex-row gap-3 mb-6">
          <Button 
            onClick={handleDownload}
            className="flex-1 bg-[#603636] hover:bg-[#603636]/90 text-white rounded-xl py-3"
          >
            保存する
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 border-[#603636] text-[#603636] hover:bg-[#603636]/5 rounded-xl py-3 bg-transparent"
          >
            シェアする
          </Button>
        </div>

        <div className="text-center space-y-3">
          <div>
            <h2 className="text-[#603636] text-base font-medium mb-1">ともだちチェキを使ってみませんか？</h2>
            <p className="text-[#737373] text-xs">あなたも友達との思い出を特別な形で残しましょう！</p>
          </div>
          
          <Button variant="ghost" className="w-full text-[#603636] hover:bg-[#603636]/5">
            <Link href="/" className="w-full block">
              アプリを使ってみる
            </Link>
          </Button>

          <p className="text-[#737373] text-xs">※ この写真は24時間後に自動的に削除されます</p>
        </div>
      </div>
    </div>
  );
}
