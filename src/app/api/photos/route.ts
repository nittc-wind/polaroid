import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createPhoto } from "@/lib/db";
import { requireAuth } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const deviceId = request.headers.get("x-device-id");

    if (!file) {
      return NextResponse.json(
        { error: "画像ファイルが必要です" },
        { status: 400 },
      );
    }

    // 認証されたユーザーのIDを取得
    const userId = session!.user.id;

    // Blob Storageにアップロード
    const blob = await put(`photos/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // データベースに保存
    const photo = await createPhoto({
      device_id: deviceId || `user-${userId}`,
      user_id: userId,
      image_url: blob.url,
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 },
    );
  }
}
