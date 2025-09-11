"use client";

import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

interface PhotoMemoData {
  memo: string | null;
  is_reunited: boolean;
  updated_at: string | null;
}

interface UsePhotoMemoReturn {
  memoData: PhotoMemoData | null;
  loading: boolean;
  error: string | null;
  saveMemo: (memo: string) => Promise<boolean>;
  deleteMemo: () => Promise<boolean>;
  toggleReunion: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function usePhotoMemo(photoId: string): UsePhotoMemoReturn {
  const [memoData, setMemoData] = useState<PhotoMemoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // メモデータを取得
  const refresh = useCallback(async () => {
    if (!isAuthenticated || !photoId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/photos/${photoId}/memo`);

      if (!response.ok) {
        throw new Error("メモの取得に失敗しました");
      }

      const result = await response.json();
      setMemoData(result.data);
    } catch (err) {
      console.error("Failed to fetch memo:", err);
      setError(err instanceof Error ? err.message : "メモの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [photoId, isAuthenticated]);

  // メモを保存
  const saveMemo = useCallback(
    async (memo: string): Promise<boolean> => {
      if (!isAuthenticated || !photoId) return false;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/photos/${photoId}/memo`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memo }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "メモの保存に失敗しました",
          );
        }

        const result = await response.json();
        setMemoData(result.data);
        return true;
      } catch (err) {
        console.error("Failed to save memo:", err);
        setError(
          err instanceof Error ? err.message : "メモの保存に失敗しました",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [photoId, isAuthenticated],
  );

  // メモを削除
  const deleteMemo = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !photoId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/photos/${photoId}/memo`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "メモの削除に失敗しました");
      }

      // メモ削除後はデータをクリア
      setMemoData(null);
      return true;
    } catch (err) {
      console.error("Failed to delete memo:", err);
      setError(err instanceof Error ? err.message : "メモの削除に失敗しました");
      return false;
    } finally {
      setLoading(false);
    }
  }, [photoId, isAuthenticated]);

  // 再会ステータスを切り替え
  const toggleReunion = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !photoId) return false;

    setLoading(true);
    setError(null);

    try {
      const newReunionStatus = !(memoData?.is_reunited || false);

      const response = await fetch(`/api/photos/${photoId}/reunion`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_reunited: newReunionStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "再会ステータスの更新に失敗しました",
        );
      }

      const result = await response.json();
      setMemoData(result.data);
      return true;
    } catch (err) {
      console.error("Failed to toggle reunion status:", err);
      setError(
        err instanceof Error
          ? err.message
          : "再会ステータスの更新に失敗しました",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [photoId, isAuthenticated, memoData?.is_reunited]);

  return {
    memoData,
    loading,
    error,
    saveMemo,
    deleteMemo,
    toggleReunion,
    refresh,
  };
}
