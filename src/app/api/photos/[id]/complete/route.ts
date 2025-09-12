import { NextRequest } from "next/server";
import { receivePhoto } from "@/lib/db";
import { getPhotoSignedUrl } from "@/lib/supabase/storage";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  getOptionalAuth,
  ERROR_CODES,
} from "@/lib/api-utils";

/**
 * POST /api/photos/[id]/complete - 完了画面用の画像受け取りAPI
 *
 * 機能:
 * - 未ログイン時: receiver_name で受け取り処理
 * - ログイン時: receiver_user_id で紐付け処理
 * - エラーハンドリング（既に受け取り済み、期限切れ等）
 * - 非同期処理でレンダリングをブロックしない
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { receiverName, location } = body;

    // オプショナル認証チェック
    const { session, isAuthenticated } = await getOptionalAuth();

    // バリデーション: ログインしていない場合は名前が必要
    if (
      !isAuthenticated &&
      (!receiverName || typeof receiverName !== "string")
    ) {
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

    // データベースに保存: ログイン状態に応じて異なるデータを保存
    let receiveData;
    if (isAuthenticated && session?.user?.id) {
      // ログインユーザーの場合: receiver_user_id を設定
      receiveData = {
        receiver_user_id: session.user.id,
        location: locationData,
      };
    } else {
      // 未ログインユーザーの場合: receiver_name を設定
      receiveData = {
        receiver_name: receiverName,
        location: locationData,
      };
    }

    const updatedPhoto = await receivePhoto(id, receiveData);

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
      ); // 2時間有効（完了画面での閲覧用）

      if (signedUrlResult.success) {
        imageUrl = signedUrlResult.data!.signedUrl;
      } else {
        console.warn(
          "Failed to generate signed URL for completed photo, falling back to image_url:",
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
      receiverUserId: updatedPhoto.receiver_user_id, // 新フィールド追加
      receivedAt: updatedPhoto.received_at,
      location: updatedPhoto.location,
      createdAt: updatedPhoto.created_at,
      // 認証状態情報も含める
      authenticationStatus: {
        isAuthenticated,
        processedBy: isAuthenticated ? "user" : "guest",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
