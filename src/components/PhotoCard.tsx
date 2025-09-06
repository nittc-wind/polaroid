"use client";

import { memo } from "react";
import Image from "next/image";
import { Check, Clock, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  image_url: string;
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

interface PhotoCardProps {
  photo: Photo;
  onClick?: (photo: Photo) => void;
  className?: string;
}

export const PhotoCard = memo(function PhotoCard({
  photo,
  onClick,
  className,
}: PhotoCardProps) {
  const isExpired = new Date() > photo.expires_at;
  const handleClick = () => onClick?.(photo);

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

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        "relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200",
        isExpired && "opacity-60",
        className,
      )}
      onClick={handleClick}
    >
      {/* 写真画像 */}
      <div className="relative aspect-square">
        <Image
          src={photo.image_url}
          alt={`撮影日: ${photo.created_at.toLocaleDateString()}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          loading="lazy"
        />

        {/* ステータスオーバーレイ */}
        <div className="absolute top-1 right-1">
          <div
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium",
              status.bgColor,
              status.color,
            )}
          >
            <StatusIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{status.label}</span>
          </div>
        </div>

        {/* 位置情報インジケーター */}
        {photo.location && (
          <div className="absolute top-1 left-1">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 text-white text-xs">
              <MapPin className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>

      {/* 写真情報 */}
      <div className="p-2">
        <div className="text-xs text-gray-600 mb-1">
          {photo.created_at.toLocaleDateString("ja-JP", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* 受け取り情報 */}
        {photo.is_received && photo.received_at && (
          <div className="text-xs text-green-600">
            {photo.received_at.toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
            })}{" "}
            受け取り
          </div>
        )}

        {/* 期限情報 */}
        {!photo.is_received && !isExpired && (
          <div className="text-xs text-yellow-600">
            {photo.expires_at.toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
            })}{" "}
            まで
          </div>
        )}
      </div>
    </div>
  );
});
