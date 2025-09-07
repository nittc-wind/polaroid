"use client";

import { ArrowLeft } from "lucide-react";
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
import { PhotoGrid } from "@/components/PhotoGrid";
import { useUserPhotos } from "@/hooks/useUserPhotos";
import { useMemo } from "react";

function MemoriesPage() {
  const { photos, loading, error, refresh } = useUserPhotos();

  // 日付ごとにグループ化
  const groupedPhotos = useMemo(() => {
    if (!photos.length) return [];
    const groups: Array<{ date: string; photos: typeof photos }> = [];
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
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-3 flex flex-row items-center gap-2">
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
            ) : (
              <div className="space-y-6">
                {groupedPhotos.map((group) => (
                  <div key={group.date}>
                    <div className="text-[#603736] text-sm font-semibold mb-2 border-b border-[#e5e5e5] pb-1">
                      {group.date}
                    </div>
                    <PhotoGrid
                      photos={group.photos}
                      loading={false}
                      error={null}
                      hasMore={false}
                      onLoadMore={() => {}}
                      onRefresh={refresh}
                      onPhotoClick={handlePhotoClick}
                    />
                  </div>
                ))}
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
