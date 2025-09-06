import { NextRequest } from "next/server";
import {
  requireAuth,
  requireSelfOrError,
  createSuccessResponse,
  createErrorResponse,
  parseSearchParams,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserById, getUserPhotos } from "@/lib/db";
import { paginationSchema } from "@/lib/validation";

/**
 * GET /api/users/[id]/photos - ユーザー写真一覧取得API
 *
 * 認証: 必須
 * 権限: 本人のみ（プライベート写真のため）
 * 機能: ページネーション対応、作成日降順
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

    // 本人確認（写真は個人情報のため本人のみアクセス可能）
    const selfCheckError = requireSelfOrError(currentUserId, userId);
    if (selfCheckError) return selfCheckError;

    // ユーザー存在確認
    const user = await getUserById(userId);
    if (!user) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // クエリパラメータのパースとバリデーション
    const { searchParams } = new URL(request.url);
    const { data: queryData, error: parseError } = parseSearchParams(
      searchParams,
      paginationSchema,
    );
    if (parseError) return parseError;

    const { page, limit } = queryData;

    // ユーザー写真一覧取得
    const result = await getUserPhotos(userId, page, limit);
    const { photos, total, total_pages } = result;

    const meta = {
      page,
      limit,
      total,
      total_pages,
    };

    return createSuccessResponse(photos, meta);
  } catch (error) {
    console.error("GET /api/users/[id]/photos error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "写真一覧の取得に失敗しました",
      500,
    );
  }
}
