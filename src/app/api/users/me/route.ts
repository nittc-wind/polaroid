import { NextRequest } from "next/server";
import {
  requireAuth,
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserById } from "@/lib/db";
import { PrivateUser } from "@/types/api";

/**
 * GET /api/users/me - 現在のユーザー情報取得API
 *
 * 認証: 必須
 * 権限: 本人のみ（完全なプロフィール情報を返却）
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    const currentUserId = session!.user.id;

    // 現在のユーザー情報取得
    const user = await getUserById(currentUserId);
    if (!user) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "ユーザー情報が見つかりません",
        404,
      );
    }

    // 完全なプロフィール情報を返却
    const privateUser: PrivateUser = {
      id: user.id,
      email: user.email,
      handle_name: user.handle_name,
      image: user.image,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_verified: user.email_verified,
    };

    return createSuccessResponse(privateUser);
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "ユーザー情報の取得に失敗しました",
      500,
    );
  }
}
