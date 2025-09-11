import { NextRequest } from "next/server";
import { receivePhoto } from "@/lib/db";
import { getPhotoSignedUrl } from "@/lib/supabase/storage";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  ERROR_CODES,
  getOptionalAuth,
} from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { receiverName, location } = body;

    // 認証状態を確認（オプショナル）
    const session = await getOptionalAuth();
    const isAuthenticated = session && session.user;

    // 認証済みユーザーの場合とそうでない場合での処理分岐
    if (isAuthenticated) {
      // ログインユーザーの場合：receiverNameは不要
      const userId = session.user.id;

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

      // データベースに保存（ログインユーザー用）
      const updatedPhoto = await receivePhoto(id, {
        receiver_user_id: userId,
        location: locationData,
      });

      if (!updatedPhoto) {
        return createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          "写真が見つからないか、既に受け取り済みです",
          404,
        );
      }

      // レスポンス準備
      const responseData = await preparePhotoResponse(updatedPhoto, true);
      return createSuccessResponse(responseData);
    } else {
      // 未ログインユーザーの場合：receiverNameが必要
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

      // データベースに保存（未ログインユーザー用）
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

      // レスポンス準備
      const responseData = await preparePhotoResponse(updatedPhoto, false);
      return createSuccessResponse(responseData);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// レスポンス準備のヘルパー関数
interface Photo {
  id: string;
  user_id: string;
  image_url: string;
  storage_path?: string;
  receiver_name?: string;
  receiver_user_id?: string;
  received_at?: string; // Assuming it's a string, could be Date
  location?: { latitude: number; longitude: number; address?: string };
  created_at: string; // Assuming it's a string, could be Date
}

interface PhotoResponse {
  id: string;
  userId: string;
  imageUrl: string;
  storagePath?: string;
  receiverName?: string;
  receiverUserId?: string;
  receivedAt?: string;
  location?: { latitude: number; longitude: number; address?: string };
  createdAt: string;
  isAuthenticated: boolean;
}

async function preparePhotoResponse(
  photo: Photo,
  isAuthenticated: boolean,
): Promise<PhotoResponse> {
  // Supabase Storage用の署名付きURL生成
  let imageUrl = photo.image_url; // デフォルト（既存データ用）

  if (photo.storage_path) {
    // Supabase Storageパスが存在する場合は署名付きURLを生成
    const signedUrlResult = await getPhotoSignedUrl(photo.storage_path, 7200); // 2時間有効（受け取り後の閲覧用）

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

  return {
    id: photo.id,
    userId: photo.user_id,
    imageUrl, // 署名付きURLまたは既存URL
    storagePath: photo.storage_path, // camelCaseに統一
    receiverName: photo.receiver_name,
    receiverUserId: photo.receiver_user_id,
    receivedAt: photo.received_at,
    location: photo.location,
    createdAt: photo.created_at,
    isAuthenticated, // 認証状態をレスポンスに含める
  };
}
