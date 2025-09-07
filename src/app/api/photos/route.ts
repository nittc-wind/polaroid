import { NextRequest, NextResponse } from "next/server";
import { createPhoto } from "@/lib/db";
import {
  requireAuth,
  validateFile,
  handleStorageError,
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ERROR_CODES,
} from "@/lib/api-utils";
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
      return createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        "画像ファイルが必要です",
        400,
      );
    }

    // ファイルバリデーション（統一されたバリデーション関数を使用）
    const validation = validateFile(file);
    if (!validation.isValid) {
      return validation.error!;
    }

    // 認証されたユーザーのIDを取得
    const userId = session!.user.id;

    // ユニークなファイル名を生成
    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${uuidv4()}.${fileExtension}`;

    // Supabase Storageにアップロード
    const uploadResult = await uploadPhoto(file, userId, filename);

    if (!uploadResult.success) {
      return handleStorageError(uploadResult.error!, "upload");
    }

    // データベースに保存（storagePath追加）
    const photo = await createPhoto({
      device_id: deviceId || `user-${userId}`,
      user_id: userId,
      image_url: "", // 一時的に空文字（後で署名付きURLで動的生成）
      storage_path: uploadResult.data!.path,
    });

    return createSuccessResponse(photo);
  } catch (error) {
    return handleApiError(error);
  }
}
