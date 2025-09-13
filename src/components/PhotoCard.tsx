"use client";

import { memo, useState, useEffect } from "react";
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
  HandMetal,
  Heart,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePhotoMemo } from "@/hooks/usePhotoMemo";
import { useAuth } from "@/hooks/useAuth";
import { reverseGeocode } from "@/lib/geocoding";

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
  // メモ関連プロパティ（オプショナル）
  photographer_name?: string | null;
  memo?: string | null;
  is_reunited?: boolean | null;
  memo_updated_at?: Date | null;
  photo_type?: "captured" | "received"; // 写真の種類
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

  // 位置情報取得のための状態
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // メモ機能
  const [memoText, setMemoText] = useState("");
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const { isAuthenticated } = useAuth();
  const {
    memoData,
    loading: memoLoading,
    error: memoError,
    saveMemo,
    deleteMemo,
    toggleReunion,
    refresh,
  } = usePhotoMemo(photo.id);

  const isExpired = new Date() > photo.expires_at;

  // メモデータの初期化
  useEffect(() => {
    if (enlarged && isAuthenticated) {
      refresh();
    }
  }, [enlarged, isAuthenticated, refresh]);

  // メモテキストの同期
  useEffect(() => {
    if (memoData?.memo) {
      setMemoText(memoData.memo);
    } else {
      setMemoText("");
    }
  }, [memoData?.memo]);

  // 位置情報の取得（拡大表示時のみ実行）
  useEffect(() => {
    if (photo.location && !photo.location.address && enlarged && flipped) {
      const fetchLocationName = async () => {
        setLocationLoading(true);
        try {
          const name = await reverseGeocode(
            photo.location!.latitude,
            photo.location!.longitude,
          );
          setLocationName(name);
        } catch (error) {
          console.error("Failed to fetch location:", error);
        } finally {
          setLocationLoading(false);
        }
      };

      fetchLocationName();
    }
  }, [photo.location, enlarged, flipped]);

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
    setIsEditingMemo(false);
  };

  // メモ保存処理
  const handleSaveMemo = async () => {
    if (!memoText.trim()) {
      await deleteMemo();
    } else {
      await saveMemo(memoText.trim());
    }
    setIsEditingMemo(false);
  };

  // メモ編集キャンセル
  const handleCancelMemo = () => {
    setMemoText(memoData?.memo || "");
    setIsEditingMemo(false);
  };

  // 再会ボタンクリック
  const handleReunionToggle = async () => {
    await toggleReunion();
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
        {/* 再会バッジ */}
        {(memoData?.is_reunited || photo.is_reunited) && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Heart className="w-3 h-3 fill-current" />
            <span>再会済み</span>
          </div>
        )}

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
                "absolute inset-0 flex flex-col items-center justify-center w-full h-full px-2 py-4",
                flipped ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              onClick={handleFlip}
            >
              <div className="w-full max-w-[260px]">
                {/* Name section - centered */}
                {photo.receiver_name && (
                  <div className="text-center mb-4">
                    <span className="text-lg text-black font-medium">
                      {photo.receiver_name}
                    </span>
                    {/* Divider line */}
                    <div className="w-full h-px bg-gray-300 mt-3 mb-4"></div>
                  </div>
                )}

                {/* Location section */}
                {photo.location && (
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-black" strokeWidth={1.5} />
                    <span className="text-base text-black">
                      {photo.location.address ||
                        locationName ||
                        (locationLoading
                          ? "位置情報を取得中..."
                          : `${photo.location.latitude.toFixed(4)}, ${photo.location.longitude.toFixed(4)}`)}
                    </span>
                  </div>
                )}

                {/* Date section */}
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-black" strokeWidth={1.5} />
                  <span className="text-base text-black">
                    {photo.created_at.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>

                {/* Memo section - 認証状態に応じて機能的なメモまたは静的なメモを表示 */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText
                      className="w-5 h-5 text-black"
                      strokeWidth={1.5}
                    />
                    <span className="text-base text-black">メモ</span>
                  </div>

                  {isAuthenticated ? (
                    /* 認証済み：機能的なメモエリア */
                    <>
                      {isEditingMemo ? (
                        <div className="space-y-2">
                          <textarea
                            value={memoText}
                            onChange={(e) => setMemoText(e.target.value)}
                            placeholder="200文字以内でメモを入力..."
                            className="w-full h-14 px-3 py-2 border border-gray-400 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#603736] focus:border-transparent"
                            maxLength={200}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {memoText.length}/200
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelMemo();
                                }}
                                disabled={memoLoading}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                キャンセル
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveMemo();
                                }}
                                disabled={memoLoading}
                                className="text-xs px-2 py-1 h-auto bg-[#603736] hover:bg-[#603736]/90"
                              >
                                保存
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="relative cursor-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingMemo(true);
                          }}
                        >
                          <div className="w-full h-14 border border-gray-400 rounded-md p-2 text-xs text-gray-600 flex items-start">
                            {memoData?.memo ? (
                              <span className="whitespace-pre-wrap">
                                {memoData.memo}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                タップしてメモを追加...
                              </span>
                            )}
                          </div>
                          <Edit3
                            className="absolute bottom-2 right-2 w-4 h-4 text-gray-600"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    /* 未認証：静的なメモエリア */
                    <div className="relative">
                      <div className="w-full h-14 border border-gray-400 rounded-md p-2 text-xs text-gray-600 flex items-start">
                        {photo.memo ? (
                          <span className="whitespace-pre-wrap">
                            {photo.memo}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            メモはありません
                          </span>
                        )}
                      </div>
                      <Edit3
                        className="absolute bottom-2 right-2 w-4 h-4 text-gray-600"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  {/* エラー表示 */}
                  {memoError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      {memoError}
                    </div>
                  )}
                </div>

                {/* Submit button - 認証状態に応じて機能的な再会ボタンまたは静的なボタンを表示 */}
                <div className="flex justify-center">
                  {isAuthenticated ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReunionToggle();
                      }}
                      disabled={memoLoading}
                      className={cn(
                        "px-4 py-2 rounded-full flex items-center gap-2 transition-colors",
                        memoData?.is_reunited
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-[#603736] hover:bg-[#331515] text-white",
                      )}
                    >
                      {memoData?.is_reunited ? (
                        <>
                          <Heart
                            className="w-4 h-4 fill-current"
                            strokeWidth={1.5}
                          />
                          <span className="text-sm font-medium">再会済み</span>
                        </>
                      ) : (
                        <>
                          <HandMetal className="w-4 h-4" strokeWidth={1.5} />
                          <span className="text-sm font-medium">再会</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <button
                      className="bg-[#603736] hover:bg-[#331515] text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                      }}
                    >
                      <HandMetal className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">
                        {photo.is_reunited ? "再会済み" : "再会"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
