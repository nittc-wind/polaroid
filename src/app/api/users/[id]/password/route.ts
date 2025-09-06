import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import {
  requireAuth,
  requireSelfOrError,
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserWithPassword, updateUserPassword } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validation";

/**
 * PATCH /api/users/[id]/password - パスワード変更API
 *
 * 認証: 必須
 * 権限: 本人のみ
 * 機能: 現在のパスワード確認後、新パスワードに変更
 */
export async function PATCH(
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

    // 本人確認（パスワード変更は本人のみ）
    const selfCheckError = requireSelfOrError(currentUserId, userId);
    if (selfCheckError) return selfCheckError;

    // リクエストボディのパースとバリデーション
    const { data: bodyData, error: parseError } = await parseRequestBody(
      request,
      changePasswordSchema,
    );
    if (parseError) return parseError;

    const { current_password, new_password } = bodyData;

    // ユーザー存在確認（パスワード含む）
    const user = await getUserWithPassword(userId);
    if (!user) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // 現在のパスワード確認
    const isCurrentPasswordValid = await bcrypt.compare(
      current_password,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      return createErrorResponse(
        ERROR_CODES.INVALID_PASSWORD,
        "現在のパスワードが正しくありません",
        400,
      );
    }

    // 新パスワードをハッシュ化
    const hashedNewPassword = await bcrypt.hash(new_password, 12);

    // パスワード更新
    await updateUserPassword(userId, hashedNewPassword);

    return createSuccessResponse({
      message: "パスワードが正常に変更されました",
    });
  } catch (error) {
    console.error("PATCH /api/users/[id]/password error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "パスワードの変更に失敗しました",
      500,
    );
  }
}
