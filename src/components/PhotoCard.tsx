"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  image_url: string;
  storage_path?: string; // Supabase Storage用パス
  created_at: Date;
  expires_at: Date;
  is_received: boolean;
  receiver_name?: string;
  received_at?: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

type PhotoCardProps = {
  photo: Photo;
  onClick?: (photo: Photo) => void;
  className?: string;
};

export const PhotoCard = memo(function PhotoCard({
  photo,
  onClick,
  className,
}: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isExpired = new Date() > photo.expires_at;
  const handleClick = () => onClick?.(photo);

  // 画像URL決定ロジック
  const getImageUrl = () => {
    // Supabase Storageの場合は、APIから取得した署名付きURLを使用
    // APIレスポンスで既に適切なURLが設定されているはず
    return photo.image_url;
  };

  // 状態の判定
  const getStatus = () => {
    if (isExpired && !photo.is_received) {
      return {
        type: "expired",
        icon: X,
        label: "期限切れ",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
      };
    }
    if (photo.is_received) {
      return {
        type: "received",
        icon: Check,
        label: photo.receiver_name || "受け取り済み",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    }
    return {
      type: "waiting",
      icon: Clock,
      label: "待機中",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    };
  };
  return (
    <>
      {/* 通常表示（小さいチェキ） */}
      <div
        className={cn(
          "relative flex flex-col items-center bg-white rounded-[8px] shadow-xl border border-gray-100 py-4 px-2 w-full max-w-[220px] mx-auto cursor-pointer",
          className,
          "cheki-card",
        )}
        style={{ aspectRatio: "3/4", perspective: "1000px" }}
        onClick={handleCardClick}
      >
        <div className="relative w-full flex-1 flex items-center justify-center">

          <div
            className="bg-white rounded-[12px] shadow-lg overflow-hidden flex items-center justify-center w-full"
            style={{ aspectRatio: "1/1", maxWidth: "180px" }}
          >
            <Image
              src={photo.image_url}
              alt="cheki photo"
              fill
              className="object-cover"
              sizes="(max-width: 600px) 60vw, 160px"
              loading="lazy"
            />
          </div>
        </div>
        {/* 下余白（チェキ風） */}
        <div className="w-full h-6" />
      </div>
      {/* 拡大表示（チェキ枠ごと中央に大きく） */}
      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleClose}
        >
          <div
            className={cn(
              "relative flex flex-col items-center bg-white rounded-[8px] shadow-xl border border-gray-100 py-8 px-4 w-full max-w-[340px] mx-auto cheki-card transition-transform duration-500",
              flipped ? "rotate-y-180" : "",
            )}
            style={{
              aspectRatio: "3/4",
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 表面（画像） */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center w-full h-full",
                flipped ? "opacity-0 pointer-events-none" : "",
              )}
              style={{ backfaceVisibility: "hidden" }}
              onClick={handleFlip}
            >
              <div className="relative w-full flex-1 flex items-center justify-center">
                <div
                  className="bg-white rounded-[12px] shadow-lg overflow-hidden flex items-center justify-center"
                  style={{
                    aspectRatio: "1/1",
                    maxWidth: "180px",
                    width: "100%",
                    margin: "0 auto",
                  }}
                >
                  <Image
                    src={photo.image_url}
                    alt="cheki photo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 600px) 60vw, 160px"
                    loading="lazy"
                  />
                </div>
              </div>
              {/* 下余白（チェキ風） */}
              <div className="w-full h-10" />
            </div>
            {/* 裏面（詳細情報） */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center w-full h-full",
                flipped ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              onClick={handleFlip}
            >
              <div
                className="bg-white rounded-[12px] shadow-lg w-full p-6 flex flex-col items-center justify-center"
                style={{
                  aspectRatio: "1/1",
                  maxWidth: "340px",
                  margin: "32px auto 0 auto",
                }}
              >
                <h2 className="text-lg font-bold mb-2">詳細情報</h2>
                <ul className="text-sm space-y-2">
                  {photo.receiver_name && <li>名前: {photo.receiver_name}</li>}
                  <li>
                    撮影日:{" "}
                    {photo.created_at.toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </li>
                  {photo.location && (
                    <li>
                      位置情報:{" "}
                      {photo.location.address ??
                        `${photo.location.latitude}, ${photo.location.longitude}`}
                    </li>
                  )}
                  <li>
                    受け取り:{" "}
                    {photo.is_received ? "受け取り済み" : "未受け取り"}
                  </li>
                  {photo.received_at && (
                    <li>
                      受け取り日時:{" "}
                      {photo.received_at.toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                      })}
                    </li>
                  )}
                  <li>
                    有効期限:{" "}
                    {photo.expires_at.toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                    })}
                  </li>
                </ul>
                <button
                  className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
            {/* 下余白（チェキ風） */}
            <div className="w-full h-8" />
          </div>
        </div>
      )}
    </>
  );
});
