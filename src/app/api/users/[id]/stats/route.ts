import { NextRequest } from "next/server";
import {
  requireAuth,
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserById, getUserStats } from "@/lib/db";
import { UserStats } from "@/types/api";

/**
 * GET /api/users/[id]/stats - ユーザー統計情報取得API
 *
 * 認証: 必須
 * 権限: 本人は詳細統計、他ユーザーは公開統計のみ
 * 機能: 写真統計、アクティビティ情報
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // パラメータを非同期で取得
    const { id: userId } = await params;

    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    const currentUserId = session!.user.id;
    const isSelf = currentUserId === userId;

    // ユーザー存在確認
    const user = await getUserById(userId);
    if (!user) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // ユーザー統計情報取得
    const stats = await getUserStats(userId);
    if (!stats) {
      return createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "統計情報の取得に失敗しました",
        500,
      );
    }

    // 本人の場合：詳細な統計情報を返却
    if (isSelf) {
      const detailedStats: UserStats = {
        total_photos: stats.total_photos,
        received_photos: stats.received_photos,
        active_photos: stats.active_photos,
        join_date: stats.join_date,
        last_activity: stats.last_activity,
      };

      return createSuccessResponse(detailedStats);
    }

    // 他ユーザーの場合：公開統計情報のみ返却
    const publicStats = {
      total_photos: stats.total_photos,
      received_photos: stats.received_photos,
      join_date: stats.join_date,
      // active_photos, last_activity は非公開
    };

    return createSuccessResponse(publicStats);
  } catch (error) {
    console.error("GET /api/users/[id]/stats error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "統計情報の取得に失敗しました",
      500,
    );
  }
}
