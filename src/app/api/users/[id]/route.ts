import { NextRequest } from "next/server";
import {
  requireAuth,
  requireSelfOrError,
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserById, updateUser, getUserByEmail, deleteUser } from "@/lib/db";
import { PublicUser, PrivateUser } from "@/types/api";
import { updateUserSchema } from "@/lib/validation";

/**
 * GET /api/users/[id] - ユーザー情報取得API
 *
 * 認証: 必須
 * 権限: 本人・管理者は全情報、他ユーザーは公開情報のみ
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    const userId = params.id;
    const currentUserId = session!.user.id;

    // ユーザー情報取得
    const user = await getUserById(userId);
    if (!user) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // 本人または管理者の場合：完全な情報を返却
    if (currentUserId === userId) {
      const privateUser: PrivateUser = {
        id: user.id,
        email: user.email,
        handle_name: user.handle_name,
        image: user.image,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return createSuccessResponse(privateUser);
    }

    // 他ユーザーの場合：公開情報のみ返却
    const publicUser: PublicUser = {
      id: user.id,
      handle_name: user.handle_name,
      image: user.image,
      created_at: user.created_at,
    };

    return createSuccessResponse(publicUser);
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
    const { data: updateData, error: parseError } = await parseRequestBody(
      request,
      updateUserSchema,
    );
    if (parseError) return parseError;

    // メールアドレス重複チェック（メールアドレスが更新される場合）
    if (updateData.email) {
      const existingUser = await getUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        return createErrorResponse(
          ERROR_CODES.EMAIL_ALREADY_EXISTS,
          "このメールアドレスは既に使用されています",
          409,
        );
      }
    }

    // ユーザー情報更新
    const updatedUser = await updateUser(userId, updateData);
    if (!updatedUser) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "指定されたユーザーが見つかりません",
        404,
      );
    }

    // 更新後の完全なユーザー情報を返却
    const privateUser: PrivateUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      handle_name: updatedUser.handle_name,
      image: updatedUser.image,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      email_verified: updatedUser.email_verified,
    };

    return createSuccessResponse(privateUser);
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
 * DELETE /api/users/[id] - ユーザー削除API
 *
 * 認証: 必須
 * 権限: 本人または管理者（現在は本人のみ実装）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    const userId = params.id;
    const currentUserId = session!.user.id;

    // 本人確認（管理者権限は将来的に実装）
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

    // ユーザー削除（ソフトデリート）
    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
      return createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "ユーザーの削除に失敗しました",
        500,
      );
    }

    // 削除成功レスポンス
    return createSuccessResponse({
      message: "ユーザーが正常に削除されました",
      deleted_user_id: userId,
    });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "ユーザーの削除に失敗しました",
      500,
    );
  }
}
