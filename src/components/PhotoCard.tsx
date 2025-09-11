"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  X,
  MapPin,
  Calendar,
  FileText,
  Edit3,
  Hand,
} from "lucide-react";

interface Photo {
  id: string;
  image_url: string;
  storage_path?: string; // Supabase Storage用パス
  created_at: Date;
  expires_at: Date;
  is_received: boolean;
  receiver_name?: string;
  receiver_user_id?: string; // 新フィールド
  received_at?: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photo_type?: "captured" | "received"; // 写真の種類
  photographer_name?: string; // 撮影者名
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
  // 通常カードタップで拡大
  const [enlarged, setEnlarged] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isExpired = new Date() > photo.expires_at;

  const handleCardClick = () => {
    setEnlarged(true);
    onClick?.(photo);
  };

  // 拡大後のチェキタップで裏返し
  const handleFlip = () => setFlipped((f) => !f);

  // 裏面の「閉じる」で元に戻す
  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEnlarged(false);
    setFlipped(false);
  };

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
      // 受け取り済みの場合
      let label = "受け取り済み";
      if (photo.photo_type === "received" && photo.photographer_name) {
        label = `${photo.photographer_name}から受け取り`;
      } else if (photo.receiver_name) {
        label = photo.receiver_name;
      }

      return {
        type: "received",
        icon: Check,
        label,
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
          {/* 受け取りバッジ（左上） */}
          {photo.photo_type === "received" && (
            <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              受け取り
            </div>
          )}

          <div
            className="bg-white rounded-[12px] shadow-lg overflow-hidden flex items-center justify-center w-full"
            style={{ aspectRatio: "1/1", maxWidth: "180px" }}
          >
            {imageError ||
            !photo.image_url ||
            photo.image_url.startsWith("supabase://") ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <X className="w-8 h-8 text-gray-400" />
              </div>
            ) : (
              <Image
                src={photo.image_url}
                alt="cheki photo"
                fill
                className="object-cover"
                sizes="(max-width: 600px) 60vw, 160px"
                loading="lazy"
                unoptimized={true}
                onError={() => setImageError(true)}
                onLoad={() => setImageLoading(false)}
              />
            )}
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
                "absolute inset-0 flex flex-col items-center justify-center w-full h-full px-4 py-4",
                flipped ? "opacity-0 pointer-events-none" : "",
              )}
              style={{ backfaceVisibility: "hidden" }}
              onClick={handleFlip}
            >
              <div className="relative w-full flex-1 flex items-center justify-center">
                {/* 受け取りバッジ（拡大表示時） */}
                {photo.photo_type === "received" && (
                  <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                    受け取り
                  </div>
                )}

                <div
                  className="bg-white rounded-[12px] shadow-lg overflow-hidden flex items-center justify-center"
                  style={{
                    aspectRatio: "1/1",
                    maxWidth: "180px",
                    width: "100%",
                    margin: "0 auto",
                  }}
                >
                  {imageError ||
                  !photo.image_url ||
                  photo.image_url.startsWith("supabase://") ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <X className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={photo.image_url}
                      alt="cheki photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 600px) 60vw, 160px"
                      loading="lazy"
                      unoptimized={true}
                      onError={() => setImageError(true)}
                      onLoad={() => setImageLoading(false)}
                    />
                  )}
                </div>
              </div>
              {/* 下余白（チェキ風） */}
              <div className="w-full h-10" />
            </div>
            {/* 裏面（詳細情報） */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center w-full h-full px-4 py-4",
                flipped ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              onClick={handleFlip}
            >
              <div
                className="bg-white rounded-[12px] shadow-lg w-full p-6 flex flex-col"
                style={{
                  maxWidth: "180px",
                  margin: "0 auto",
                }}
              >
                {/* Name section */}
                {photo.receiver_name && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <span className="text-black text-lg">👤</span>
                    </div>
                    <span className="text-lg text-black">
                      {photo.receiver_name}
                    </span>
                  </div>
                )}

                {/* Location section */}
                {photo.location && (
                  <div className="flex items-center gap-4 mb-6">
                    <MapPin className="w-6 h-6 text-black" strokeWidth={1.5} />
                    <span className="text-lg text-black">
                      {photo.location.address
                        ? photo.location.address
                        : `${photo.location.latitude.toFixed(4)}, ${photo.location.longitude.toFixed(4)}`}
                    </span>
                  </div>
                )}

                {/* Date section */}
                <div className="flex items-center gap-4 mb-6">
                  <Calendar className="w-6 h-6 text-black" strokeWidth={1.5} />
                  <span className="text-lg text-black">
                    {photo.created_at.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>

                {/* Status section */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {photo.is_received ? (
                      <Check
                        className="w-6 h-6 text-green-600"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Clock
                        className="w-6 h-6 text-yellow-600"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <span className="text-lg text-black">
                    {photo.is_received ? "受け取り済み" : "未受け取り"}
                  </span>
                </div>

                {/* Memo section */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <FileText
                      className="w-6 h-6 text-black"
                      strokeWidth={1.5}
                    />
                    <span className="text-lg text-black">メモ</span>
                  </div>

                  {/* Memo text area */}
                  <div className="relative">
                    <div className="w-full h-16 border border-gray-400 rounded-md p-3 text-sm text-gray-600"></div>
                    <Edit3
                      className="absolute bottom-3 right-3 w-5 h-5 text-gray-600"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-center">
                  <button
                    className="bg-[#603736] hover:bg-[#331515] text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                  >
                    <Hand className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">閉じる</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
