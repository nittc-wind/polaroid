import { NextRequest } from "next/server";
import { getPhoto } from "@/lib/db";
import { getPhotoSignedUrl } from "@/lib/supabase/storage";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  ERROR_CODES,
} from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        "Photo IDが必要です",
        400,
      );
    }

    const photo = await getPhoto(id);

    if (!photo) {
      return createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        "写真が見つかりません",
        404,
      );
    }

    // 24時間後に削除されているかチェック
    const expiryTime = new Date(photo.created_at);
    expiryTime.setHours(expiryTime.getHours() + 24);

    if (new Date() > expiryTime) {
      return createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        "写真の有効期限が切れています",
        410,
      );
    }

    // Supabase Storage署名付きURL生成
    const signedUrlResult = await getPhotoSignedUrl(photo.storage_path, 3600); // 1時間有効

    if (!signedUrlResult.success) {
      console.error("Failed to generate signed URL:", signedUrlResult.error);
      return createErrorResponse(
        ERROR_CODES.SIGNED_URL_GENERATION_FAILED,
        "画像の取得に失敗しました",
        500,
      );
    }

    const imageUrl = signedUrlResult.data!.signedUrl;

    return createSuccessResponse({
      id: photo.id,
      userId: photo.user_id,
      imageUrl,
      storagePath: photo.storage_path, // camelCaseに統一
      receiverName: photo.receiver_name,
      receivedAt: photo.received_at,
      location: photo.location,
      createdAt: photo.created_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
