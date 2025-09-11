import { NextRequest } from "next/server";
import { upsertPhotoMemo, getPhotoMemo, deletePhotoMemo } from "@/lib/db";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  ERROR_CODES,
} from "@/lib/api-utils";
import { z } from "zod";

// バリデーションスキーマ
const memoSchema = z.object({
  memo: z.string().max(200, "メモは200文字以内で入力してください").optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: photoId } = await params;
    const authResult = await requireAuth();

    if (authResult.error) {
      return authResult.error;
    }

    const userId = authResult.session!.user!.id!;

    // メモ取得
    const photoMemo = await getPhotoMemo(photoId, userId);

    return createSuccessResponse({
      memo: photoMemo?.memo || null,
      is_reunited: photoMemo?.is_reunited || false,
      updated_at: photoMemo?.updated_at || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: photoId } = await params;
    const authResult = await requireAuth();

    if (authResult.error) {
      return authResult.error;
    }

    const userId = authResult.session!.user!.id!;
    const body = await request.json();

    // バリデーション
    const validationResult = memoSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validationResult.error.issues[0].message,
        400,
      );
    }

    const { memo } = validationResult.data;

    // メモ保存・更新
    const photoMemo = await upsertPhotoMemo({
      photo_id: photoId,
      user_id: userId,
      memo: memo || null,
    });

    return createSuccessResponse({
      id: photoMemo.id,
      memo: photoMemo.memo,
      is_reunited: photoMemo.is_reunited,
      updated_at: photoMemo.updated_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: photoId } = await params;
    const authResult = await requireAuth();

    if (authResult.error) {
      return authResult.error;
    }

    const userId = authResult.session!.user!.id!;

    // メモ削除
    const deletedMemo = await deletePhotoMemo(photoId, userId);

    if (!deletedMemo) {
      return createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        "削除するメモが見つかりません",
        404,
      );
    }

    return createSuccessResponse({
      message: "メモを削除しました",
      deleted_at: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
