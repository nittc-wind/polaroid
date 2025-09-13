"use client";

import { ArrowLeft, LogOut, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useUserPhotos } from "@/hooks/useUserPhotos";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

function MemoriesPage() {
  const { photos, loading, error, hasMore, loadMore, refresh } =
    useUserPhotos();
  const { logout } = useAuth();

  // 受け取り済みの写真のみをフィルタリングして日付ごとにグループ化
  const groupedPhotos = useMemo(() => {
    // 受け取り済みの写真のみフィルタリング
    const receivedPhotos = photos.filter((photo) => photo.is_received);

    if (!receivedPhotos.length) return [];
    const groups: Array<{ date: string; photos: typeof photos }> = [];
    const photosByDate = receivedPhotos.reduce(
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
      {} as Record<string, typeof photos>,
    );
    Object.entries(photosByDate).forEach(([date, datePhotos]) => {
      groups.push({ date, photos: datePhotos });
    });
    // 新しい日付順
    return groups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [photos]);

  const handlePhotoClick = (photo: (typeof photos)[0]) => {
    // TODO: 写真詳細画面への遷移を実装
    console.log("Photo clicked:", photo);
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <Button className="w-fit p-1" variant="ghost" asChild>
                <Link
                  href="/"
                  className="flex items-center text-[#737373] hover:text-[#0a0a0a]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <CardTitle className="text-[#0a0a0a] text-base font-medium">
                  思い出一覧
                </CardTitle>
                <CardDescription className="text-[#737373] text-xs">
                  撮影した写真を見返す
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-[#737373] hover:text-red-600 hover:bg-red-50 p-2"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            {loading ? (
              <div className="text-center text-[#737373] py-8">
                読み込み中...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                エラーが発生しました
              </div>
            ) : groupedPhotos.length === 0 ? (
              <div className="text-center text-[#737373] py-8">
                受け取り済みの写真がありません
              </div>
            ) : (
              <div className="space-y-6">
                {groupedPhotos.map((group) => (
                  <div key={group.date}>
                    <div className="text-[#603736] text-sm font-semibold mb-2 border-b border-[#e5e5e5] pb-1">
                      {group.date}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {group.photos.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => handlePhotoClick(photo)}
                          className="aspect-square bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={photo.image_url}
                            alt="思い出の写真"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* 全体のページネーション */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={loadMore}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 写真一覧ページを認証ガードでラップ
export default function PhotsPageWithAuth() {
  return (
    <AuthGuard>
      <MemoriesPage />
    </AuthGuard>
  );
}
