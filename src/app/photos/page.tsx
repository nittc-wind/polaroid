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

function MemoriesPage() {
  const { photos, loading, error, hasMore, loadMore, refresh } =
    useUserPhotos();

  const handlePhotoClick = (photo: {
    id: string;
    image_url: string;
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
  }) => {
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
            <PhotoGrid
              photos={photos}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onRefresh={refresh}
              onPhotoClick={handlePhotoClick}
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
