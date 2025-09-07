import { NextRequest, NextResponse } from "next/server";
import { getPhoto } from "@/lib/db";
import { getPhotoSignedUrl } from "@/lib/supabase/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 },
      );
    }

    const photo = await getPhoto(id);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // 24時間後に削除されているかチェック
    const expiryTime = new Date(photo.created_at);
    expiryTime.setHours(expiryTime.getHours() + 24);

    if (new Date() > expiryTime) {
      return NextResponse.json({ error: "Photo has expired" }, { status: 410 });
    }

    // Supabase Storage用の署名付きURL生成
    let imageUrl = photo.image_url; // 既存のURL（Vercel Blob）をデフォルト

    if (photo.storage_path) {
      // Supabase Storageパスが存在する場合は署名付きURLを生成
      const signedUrlResult = await getPhotoSignedUrl(photo.storage_path, 3600); // 1時間有効

      if (signedUrlResult.success) {
        imageUrl = signedUrlResult.data!.signedUrl;
      } else {
        console.error("Failed to generate signed URL:", signedUrlResult.error);
        // エラーの場合は既存のimage_urlを使用（フォールバック）
      }
    }

    return NextResponse.json({
      id: photo.id,
      userId: photo.user_id,
      imageUrl,
      storagePath: photo.storage_path, // フロントエンド用
      receiverName: photo.receiver_name,
      receivedAt: photo.received_at,
      location: photo.location,
      createdAt: photo.created_at,
    });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
