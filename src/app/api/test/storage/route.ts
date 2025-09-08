import { NextRequest } from "next/server";
import { testSpecificFile } from "@/lib/supabase/test";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  ERROR_CODES,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        "Storage path is required",
        400,
      );
    }

    const result = await testSpecificFile(path);

    if (!result.success) {
      return createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        `Storage test failed: ${result.error}`,
        404,
      );
    }

    return createSuccessResponse({
      message: "Storage test successful",
      fileSize: result.data?.fileSize,
      signedUrl: result.data?.signedUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
