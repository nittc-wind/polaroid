import { NextRequest, NextResponse } from "next/server";
import { createPhoto } from "@/lib/db";
import { requireAuth } from "@/lib/api-utils";
import { uploadPhoto } from "@/lib/supabase/storage";
import { v4 as uuidv4 } from "uuid";

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

    // ファイル形式とサイズの検証
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "JPEG、PNG、WebP形式の画像のみ対応しています" },
        { status: 400 },
      );
    }

    const maxSize = 6 * 1024 * 1024; // 6MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "ファイルサイズは6MB以下にしてください" },
        { status: 400 },
      );
    }

    // 認証されたユーザーのIDを取得
    const userId = session!.user.id;

    // ユニークなファイル名を生成
    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${uuidv4()}.${fileExtension}`;

    // Supabase Storageにアップロード
    const uploadResult = await uploadPhoto(file, userId, filename);

    if (!uploadResult.success) {
      console.error("Supabase Storage upload failed:", uploadResult.error);
      return NextResponse.json(
        { error: "画像のアップロードに失敗しました" },
        { status: 500 },
      );
    }

    // データベースに保存（storagePath追加）
    const photo = await createPhoto({
      device_id: deviceId || `user-${userId}`,
      user_id: userId,
      image_url: "", // 一時的に空文字（後で署名付きURLで動的生成）
      storage_path: uploadResult.data!.path,
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
