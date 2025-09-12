import { NextRequest } from "next/server";
import { completePhoto } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  ERROR_CODES,
} from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 写真の現像完了処理
    const updatedPhoto = await completePhoto(id);

    if (!updatedPhoto) {
      return createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        "写真が見つからないか、受け取り情報が設定されていません",
        404,
      );
    }

    return createSuccessResponse({
      id: updatedPhoto.id,
      isReceived: updatedPhoto.is_received,
      receivedAt: updatedPhoto.received_at,
      message: "現像が完了しました",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
