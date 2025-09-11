"use client";

import { useState, useEffect } from "react";

export interface PhotoData {
  id: string;
  userId: string;
  imageUrl: string;
  storagePath?: string;
  receiverName: string | null;
  receivedAt: string | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  createdAt: string;
}

interface UsePhotoDataResult {
  photoData: PhotoData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// シンプルなインメモリキャッシュ
const photoCache = new Map<string, { data: PhotoData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export function usePhotoData(id: string): UsePhotoDataResult {
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // キャッシュチェック
      const cached = photoCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("Using cached photo data for", id);
        setPhotoData(cached.data);
        setLoading(false);
        return;
      }

      console.log("Fetching fresh photo data for", id);
      const response = await fetch(`/api/photos/${id}`);

      if (!response.ok) {
        // エラーレスポンス処理
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            setError("写真が見つかりません");
          } else if (response.status === 410) {
            setError("写真の有効期限が切れています");
          } else if (errorData.error?.message) {
            setError(`写真の取得に失敗しました: ${errorData.error.message}`);
          } else {
            setError("写真の取得に失敗しました");
          }
        } catch {
          if (response.status === 404) {
            setError("写真が見つかりません");
          } else if (response.status === 410) {
            setError("写真の有効期限が切れています");
          } else {
            setError("写真の取得に失敗しました");
          }
        }
        return;
      }

      // 成功レスポンス処理
      const result = await response.json();
      console.log("API Response:", result);

      if (!result.success || !result.data) {
        console.error("Response structure error:", result);
        setError("サーバーのレスポンスが不正です");
        return;
      }

      const photoData = result.data;
      console.log("Photo data retrieved:", photoData);

      // キャッシュに保存
      photoCache.set(id, {
        data: photoData,
        timestamp: Date.now(),
      });

      setPhotoData(photoData);
    } catch (err) {
      console.error("Error fetching photo data:", err);
      setError("写真の取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPhotoData();
    }
  }, [id]);

  return {
    photoData,
    loading,
    error,
    refetch: fetchPhotoData,
  };
}

// キャッシュクリア関数（必要に応じて使用）
export function clearPhotoCache(id?: string) {
  if (id) {
    photoCache.delete(id);
  } else {
    photoCache.clear();
  }
}
