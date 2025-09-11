"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check, Clock, X, Heart, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { usePhotoMemo } from "@/hooks/usePhotoMemo";
import { useAuth } from "@/hooks/useAuth";

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
  // メモ関連プロパティ（オプショナル）
  memo?: string | null;
  is_reunited?: boolean | null;
  memo_updated_at?: Date | null;
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
        {/* 再会バッジ */}
        {(memoData?.is_reunited || photo.is_reunited) && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Heart className="w-3 h-3 fill-current" />
            <span>再会済み</span>
          </div>
        )}

        <div className="relative w-full flex-1 flex items-center justify-center">
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
                {isAuthenticated ? (
                  <>
                    {/* メモ機能 */}
                    <div className="w-full mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-[#603636]" />
                        <h3 className="text-sm font-semibold text-[#603636]">
                          メモ
                        </h3>
                      </div>

                      {isEditingMemo ? (
                        <div className="space-y-2">
                          <textarea
                            value={memoText}
                            onChange={(e) => setMemoText(e.target.value)}
                            placeholder="200文字以内でメモを入力..."
                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#603636] focus:border-transparent"
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
                                className="text-xs px-2 py-1 h-auto bg-[#603636] hover:bg-[#603636]/90"
                              >
                                保存
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="min-h-[60px] p-3 border border-gray-200 rounded-md bg-gray-50 cursor-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingMemo(true);
                          }}
                        >
                          {memoData?.memo ? (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {memoData.memo}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">
                              タップしてメモを追加...
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 再会ボタン */}
                    <div className="w-full mb-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReunionToggle();
                        }}
                        disabled={memoLoading}
                        className={cn(
                          "w-full flex items-center justify-center gap-2",
                          memoData?.is_reunited
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700",
                        )}
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4",
                            memoData?.is_reunited && "fill-current",
                          )}
                        />
                        {memoData?.is_reunited ? "再会済み" : "再会した！"}
                      </Button>
                    </div>

                    {/* エラー表示 */}
                    {memoError && (
                      <div className="w-full mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                        {memoError}
                      </div>
                    )}

                    {/* 詳細情報 */}
                    <div className="w-full mb-4">
                      <h3 className="text-sm font-semibold text-[#603636] mb-2">
                        詳細情報
                      </h3>
                      <div className="text-xs space-y-1 text-gray-600">
                        {photo.receiver_name && (
                          <div>名前: {photo.receiver_name}</div>
                        )}
                        <div>
                          撮影日:{" "}
                          {photo.created_at.toLocaleDateString("ja-JP", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {photo.location && (
                          <div>
                            位置情報:{" "}
                            {photo.location.address ??
                              `${photo.location.latitude}, ${photo.location.longitude}`}
                          </div>
                        )}
                        <div>
                          受け取り:{" "}
                          {photo.is_received ? "受け取り済み" : "未受け取り"}
                        </div>
                        {photo.received_at && (
                          <div>
                            受け取り日時:{" "}
                            {photo.received_at.toLocaleDateString("ja-JP", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        )}
                        <div>
                          有効期限:{" "}
                          {photo.expires_at.toLocaleDateString("ja-JP", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 未ログイン時の詳細情報のみ */}
                    <h2 className="text-lg font-bold mb-2">詳細情報</h2>
                    <ul className="text-sm space-y-2">
                      {photo.receiver_name && (
                        <li>名前: {photo.receiver_name}</li>
                      )}
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
                  </>
                )}

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
