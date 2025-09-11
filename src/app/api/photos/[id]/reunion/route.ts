import { NextRequest } from "next/server";
import { updateReunionStatus, getPhotoMemo } from "@/lib/db";
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  ERROR_CODES,
} from "@/lib/api-utils";
import { z } from "zod";

// バリデーションスキーマ
const reunionSchema = z.object({
  is_reunited: z.boolean(),
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

    // 再会ステータス取得
    const photoMemo = await getPhotoMemo(photoId, userId);

    return createSuccessResponse({
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
    const validationResult = reunionSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        validationResult.error.issues[0].message,
        400,
      );
    }

    const { is_reunited } = validationResult.data;

    // 再会ステータス更新
    const photoMemo = await updateReunionStatus(photoId, userId, is_reunited);

    return createSuccessResponse({
      id: photoMemo.id,
      is_reunited: photoMemo.is_reunited,
      memo: photoMemo.memo,
      updated_at: photoMemo.updated_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
