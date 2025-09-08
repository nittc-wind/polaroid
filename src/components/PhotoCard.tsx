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
          "relative flex flex-col items-center bg-white rounded-[20px] shadow-xl border border-gray-100 py-4 px-2 w-full max-w-[220px] mx-auto cursor-pointer",
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
              sizes="(max-width: 768px) 80vw, 180px"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      {/* 拡大表示（チェキ枠ごと中央に大きく） */}
      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleClose}
        >
          <div
            className="relative flex flex-col items-center bg-white rounded-[20px] shadow-xl border border-gray-100 py-6 px-4 w-full max-w-[400px] mx-auto cheki-card"
            style={{ aspectRatio: "3/4", perspective: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "w-full h-full transition-transform duration-500 flex-1 flex items-center justify-center",
                flipped ? "rotate-y-180" : "",
              )}
              style={{
                transformStyle: "preserve-3d",
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              {/* 表面（画像） */}
              {!flipped && (
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 flex items-center justify-center bg-white rounded-[12px] shadow-lg overflow-hidden w-full",
                  )}
                  style={{
                    backfaceVisibility: "hidden",
                    aspectRatio: "1/1",
                    maxWidth: "340px",
                    margin: "32px auto 0 auto",
                    cursor: "pointer",
                  }}
                  onClick={handleFlip}
                >
                  <Image
                    src={photo.image_url}
                    alt="cheki photo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 340px"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    タップで詳細
                  </span>
                </div>
              )}
              {/* 裏面（詳細情報） */}
              {flipped && (
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 flex flex-col items-center justify-center bg-white rounded-[12px] shadow-lg w-full p-6",
                  )}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    aspectRatio: "1/1",
                    maxWidth: "340px",
                    margin: "32px auto 0 auto",
                  }}
                >
                  <h2 className="text-lg font-bold mb-2">詳細情報</h2>
                  <ul className="text-sm space-y-2">
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
                    onClick={handleClose}
                  >
                    閉じる
                  </button>
                </div>
              )}
            </div>
            {/* 下余白（チェキ風） */}
            <div className="w-full h-8" />
          </div>
        </div>
      )}
    </>
  );
});
