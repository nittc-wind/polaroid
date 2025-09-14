"use client";

import { PhotoCard } from "./PhotoCard";
import { Button } from "./ui/button";
import { Camera, RefreshCw, AlertCircle } from "lucide-react";
import { useMemo } from "react";

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
  // 拡張プロパティ
  photographer_name?: string | null;
  memo?: string | null;
  is_reunited?: boolean | null;
  memo_updated_at?: Date | null;
}

interface PhotoGridProps {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onPhotoClick?: (photo: Photo) => void;
  groupByDate?: boolean; // 日付ごとにグループ化するかどうか
}

export function PhotoGrid({
  photos,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRefresh,
  onPhotoClick,
  groupByDate = false,
}: PhotoGridProps) {
  // 日付ごとにグループ化するかどうかで表示を分ける
  const groupedPhotos = useMemo(() => {
    if (!groupByDate) return null;

    const groups: Array<{ date: string; photos: Photo[] }> = [];
    const photosByDate = photos.reduce(
      (acc, photo) => {
        const date = new Date(photo.created_at).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(photo);
        return acc;
      },
      {} as Record<string, Photo[]>,
    );

    Object.entries(photosByDate).forEach(([date, datePhotos]) => {
      groups.push({ date, photos: datePhotos });
    });

    // 新しい日付順にソート
    return groups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [photos, groupByDate]);
  // エラー状態
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          エラーが発生しました
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">{error}</p>
        <Button
          onClick={onRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          再試行
        </Button>
      </div>
    );
  }

  // 初回ローディング状態
  if (loading && photos.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // 空状態（写真なし）
  if (!loading && photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Camera className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          受け取り済みの写真がありません
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          カメラで写真を撮影して、思い出を作りましょう！
        </p>
        <Button asChild>
          <a href="/camera" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            撮影する
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 日付グループ化表示 */}
      {groupByDate && groupedPhotos ? (
        <div className="space-y-6">
          {groupedPhotos.map((group) => (
            <div key={group.date}>
              <div className="text-[#603736] text-sm font-semibold mb-2 border-b border-[#e5e5e5] pb-1">
                {group.date}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {group.photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onClick={onPhotoClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 通常の写真グリッド */
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
          ))}
        </div>
      )}

      {/* さらに読み込みボタン */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                読み込み中...
              </>
            ) : (
              "さらに表示"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
