import { NextRequest } from "next/server";
import {
  requireAuth,
  createSuccessResponse,
  createErrorResponse,
  parseSearchParams,
  ERROR_CODES,
} from "@/lib/api-utils";
import { searchUsers } from "@/lib/db";
import { PublicUser } from "@/types/api";
import { searchUsersSchema } from "@/lib/validation";

/**
 * GET /api/users?search - ユーザー検索API
 *
 * 認証: 必須
 * 機能: ハンドル名での部分一致検索、ページネーション対応
 * 返却: 公開情報のみ（プライバシー保護）
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    // クエリパラメータのパースとバリデーション
    const { searchParams } = new URL(request.url);
    const { data: queryData, error: parseError } = parseSearchParams(
      searchParams,
      searchUsersSchema,
    );
    if (parseError) return parseError;

    const { search, page, limit } = queryData;

    // ユーザー検索実行
    const result = await searchUsers(search, page, limit);

    // ページネーション情報は既にsearchUsersから取得
    const { users, total, total_pages } = result;
    const meta = {
      page,
      limit,
      total,
      total_pages,
    };

    // 公開情報のみに変換（プライバシー保護）
    const publicUsers: PublicUser[] = users.map((user) => ({
      id: user.id,
      handle_name: user.handle_name,
      image: user.image,
      created_at: user.created_at,
    }));

    return createSuccessResponse(publicUsers, meta);
  } catch (error) {
    console.error("GET /api/users search error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "ユーザー検索に失敗しました",
      500,
    );
  }
}
