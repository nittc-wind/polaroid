"use client";

import { PhotoCard } from "./PhotoCard";
import { Button } from "./ui/button";
import { Camera, RefreshCw, AlertCircle } from "lucide-react";

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

interface PhotoGridProps {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onPhotoClick?: (photo: Photo) => void;
}

export function PhotoGrid({
  photos,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRefresh,
  onPhotoClick,
}: PhotoGridProps) {
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
          まだ写真がありません
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
      {/* 写真グリッド */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
        ))}
      </div>

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

      {/* 全て読み込み完了メッセージ */}
      {!hasMore && photos.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          すべての写真を表示しました
        </div>
      )}
    </div>
  );
}
