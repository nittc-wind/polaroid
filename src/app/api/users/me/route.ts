import { NextRequest } from "next/server";
import {
  requireAuth,
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES,
} from "@/lib/api-utils";
import { getUserById, updateUser, getUserByEmail } from "@/lib/db";
import { PrivateUser } from "@/types/api";
import { UpdateUserRequest } from "@/types";
import { z } from "zod";

// バリデーションスキーマ
const updateUserSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
});

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

/**
 * PUT /api/users/me - 現在のユーザー情報更新API
 *
 * 認証: 必須
 * 権限: 本人のみ
 */
export async function PUT(request: NextRequest) {
  try {
    // 認証チェック
    const { error: authError, session } = await requireAuth();
    if (authError) return authError;

    const currentUserId = session!.user.id;

    // リクエストボディ取得・検証
    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        "入力データが無効です",
        400,
      );
    }

    const updateData: UpdateUserRequest = validationResult.data;

    // 現在のユーザー情報取得
    const currentUser = await getUserById(currentUserId);
    if (!currentUser) {
      return createErrorResponse(
        ERROR_CODES.USER_NOT_FOUND,
        "ユーザー情報が見つかりません",
        404,
      );
    }

    // メールアドレス重複チェック（メールアドレスが変更されている場合）
    if (updateData.email && updateData.email !== currentUser.email) {
      const existingUser = await getUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== currentUserId) {
        return createErrorResponse(
          ERROR_CODES.BAD_REQUEST,
          "このメールアドレスは既に使用されています",
          409,
        );
      }
    }

    // ユーザー情報更新
    const updatedUser = await updateUser(currentUserId, {
      email: updateData.email,
      handle_name: updateData.username,
    });

    if (!updatedUser) {
      return createErrorResponse(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "ユーザー情報の更新に失敗しました",
        500,
      );
    }

    // 更新されたユーザー情報を返却
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
    console.error("PUT /api/users/me error:", error);
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "ユーザー情報の更新に失敗しました",
      500,
    );
  }
}
