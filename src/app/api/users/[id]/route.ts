import { NextRequest } from "next/server";
import {
  requireAuth,
  requireSelfOrError,
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserById, updateUser, deleteUser } from "@/lib/db";
import { updateUserSchema } from "@/lib/validation";

/**
 * GET /api/users/[id] - 特定ユーザー情報取得API
 *
 * 認証: 必須
 * 権限: 本人のみ（将来的には他ユーザーも公開情報のみ取得可能に拡張可能）
 * 機能: ユーザーの基本情報を返す（パスワードは除く）
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

    // 本人確認（現在は本人のみアクセス可能）
    const selfCheckError = requireSelfOrError(currentUserId, userId);
    if (selfCheckError) return selfCheckError;

    // ユーザー情報取得
    const user = await getUserById(userId);
    if (!user) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    return createSuccessResponse(user);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "ユーザー情報の取得に失敗しました",
      500,
    );
  }
}

/**
 * PATCH /api/users/[id] - ユーザー情報更新API
 *
 * 認証: 必須
 * 権限: 本人のみ
 * 機能: メールアドレス、ハンドルネーム、プロフィール画像を更新
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

    // 本人確認
    const selfCheckError = requireSelfOrError(currentUserId, userId);
    if (selfCheckError) return selfCheckError;

    // リクエストボディのパースとバリデーション
    const { data: bodyData, error: parseError } = await parseRequestBody(
      request,
      updateUserSchema,
    );
    if (parseError) return parseError;

    // ユーザー存在確認
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // ユーザー情報更新
    const updatedUser = await updateUser(userId, bodyData);
    if (!updatedUser) {
      return createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "ユーザー情報の更新に失敗しました",
        500,
      );
    }

    return createSuccessResponse(updatedUser);
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "ユーザー情報の更新に失敗しました",
      500,
    );
  }
}

/**
 * DELETE /api/users/[id] - ユーザーアカウント削除API
 *
 * 認証: 必須
 * 権限: 本人のみ
 * 機能: ユーザーアカウントを削除（現在は物理削除、将来的にソフトデリート検討）
 */
export async function DELETE(
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

    // 本人確認
    const selfCheckError = requireSelfOrError(currentUserId, userId);
    if (selfCheckError) return selfCheckError;

    // ユーザー存在確認
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // ユーザーアカウント削除
    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
      return createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "ユーザーアカウントの削除に失敗しました",
        500,
      );
    }

    return createSuccessResponse({
      message: "ユーザーアカウントが正常に削除されました",
      deleted_user: deletedUser,
    });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "ユーザーアカウントの削除に失敗しました",
      500,
    );
  }
}
