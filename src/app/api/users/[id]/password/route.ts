import { NextRequest } from "next/server";
import {
  requireAuth,
  requireSelfOrError,
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserById, updateUserPassword } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";

/**
 * PATCH /api/users/[id]/password - パスワード変更API
 *
 * 認証: 必須
 * 権限: 本人のみ
 * セキュリティ: 現在のパスワード確認必須
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    const userId = params.id;
    const currentUserId = session!.user.id;

    // 本人確認
    const selfCheckError = requireSelfOrError(currentUserId, userId);
    if (selfCheckError) return selfCheckError;

    // リクエストボディのパースとバリデーション
    const { data: passwordData, error: parseError } = await parseRequestBody(
      request,
      changePasswordSchema,
    );
    if (parseError) return parseError;

    // ユーザー情報取得
    const user = await getUserById(userId);
    if (!user) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // 現在のパスワード確認
    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.current_password,
      user.password_hash,
    );

    if (!isCurrentPasswordValid) {
      return createErrorResponse(
        ERROR_CODES.INVALID_PASSWORD,
        "現在のパスワードが正しくありません",
        400,
      );
    }

    // 新しいパスワードをハッシュ化
    const newPasswordHash = await bcrypt.hash(passwordData.new_password, 12);

    // パスワード更新
    const updatedUser = await updateUserPassword(userId, newPasswordHash);
    if (!updatedUser) {
      return createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "パスワードの更新に失敗しました",
        500,
      );
    }

    // 成功レスポンス（パスワード情報は含めない）
    return createSuccessResponse({
      message: "パスワードが正常に変更されました",
      updated_at: updatedUser.updated_at,
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
