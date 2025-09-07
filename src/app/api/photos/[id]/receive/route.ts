import { NextRequest, NextResponse } from "next/server";
import { receivePhoto } from "@/lib/db";
import { getPhotoSignedUrl } from "@/lib/supabase/storage";
import {
  createErrorResponse,
  createSuccessResponse,
  handleStorageError,
  handleApiError,
  ERROR_CODES,
} from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { receiverName, location } = body;

    // バリデーション
    if (!receiverName || typeof receiverName !== "string") {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "受け取り者の名前が必要です",
        400,
      );
    }

    // 位置情報の処理（オプショナル）
    let locationData:
      | { latitude: number; longitude: number; address?: string }
      | undefined = undefined;
    if (
      location &&
      typeof location.latitude === "number" &&
      typeof location.longitude === "number"
    ) {
      locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || undefined,
      };
    }

    // データベースに保存
    const updatedPhoto = await receivePhoto(id, {
      receiver_name: receiverName,
      location: locationData,
    });

    if (!updatedPhoto) {
      return createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        "写真が見つからないか、既に受け取り済みです",
        404,
      );
    }

    // Supabase Storage用の署名付きURL生成
    let imageUrl = updatedPhoto.image_url; // デフォルト（既存データ用）

    if (updatedPhoto.storage_path) {
      // Supabase Storageパスが存在する場合は署名付きURLを生成
      const signedUrlResult = await getPhotoSignedUrl(
        updatedPhoto.storage_path,
        7200,
      ); // 2時間有効（受け取り後の閲覧用）

      if (signedUrlResult.success) {
        imageUrl = signedUrlResult.data!.signedUrl;
      } else {
        console.warn(
          "Failed to generate signed URL for received photo, falling back to image_url:",
          signedUrlResult.error,
        );
        // エラーの場合は既存のimage_urlを使用（フォールバック）
      }
    }

    return createSuccessResponse({
      id: updatedPhoto.id,
      userId: updatedPhoto.user_id,
      imageUrl, // 署名付きURLまたは既存URL
      storagePath: updatedPhoto.storage_path, // camelCaseに統一
      receiverName: updatedPhoto.receiver_name,
      receivedAt: updatedPhoto.received_at,
      location: updatedPhoto.location,
      createdAt: updatedPhoto.created_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
