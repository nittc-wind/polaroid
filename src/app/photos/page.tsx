"use client";

import { ArrowLeft, LogOut } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

function MemoriesPage() {
  const { photos, loading, error, hasMore, loadMore, refresh } =
    useUserPhotos();
  const { logout } = useAuth();

  // 受け取り済みの写真のみをフィルタリング
  const receivedPhotos = useMemo(() => {
    return photos.filter((photo) => photo.is_received);
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
            <PhotoGrid
              photos={receivedPhotos}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onRefresh={refresh}
              onPhotoClick={handlePhotoClick}
              groupByDate={true}
            />
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
