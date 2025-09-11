import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

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

interface PhotosResponse {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useUserPhotos(
  initialPage: number = 1,
  limit: number = 20,
): PhotosResponse {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPhotos = async (pageNum: number = 1, append: boolean = false) => {
    if (!user?.id) {
      setError("認証が必要です");
      setLoading(false);
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await fetch(
        `/api/users/${user.id}/photos?page=${pageNum}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`写真の取得に失敗しました: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "写真の取得に失敗しました");
      }

      const newPhotos = data.data.map((photo: Photo) => ({
        ...photo,
        created_at: new Date(photo.created_at),
        expires_at: new Date(photo.expires_at),
        received_at: photo.received_at
          ? new Date(photo.received_at)
          : undefined,
      }));

      if (append) {
        setPhotos((prev) => [...prev, ...newPhotos]);
      } else {
        setPhotos(newPhotos);
      }

      // ページネーション情報を使用してhasMoreを判定
      const { page: currentPage, total_pages } = data.meta || {};
      setHasMore(currentPage < total_pages);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "写真の取得中にエラーが発生しました";
      setError(errorMessage);
      console.error("Photos fetch error:", err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    if (user?.id) {
      fetchPhotos(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPhotos(nextPage, true);
    }
  };

  const refresh = () => {
    setPage(1);
    setHasMore(true);
    fetchPhotos(1);
  };

  return {
    photos,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
