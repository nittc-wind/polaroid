import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { ZodError, ZodSchema } from "zod";
import {
  ApiSuccessResponse,
  ApiErrorResponse,
  ErrorDetails,
} from "@/types/api";
import type { Session } from "next-auth";

// エラーコード定数
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  BAD_REQUEST: "BAD_REQUEST",

  // Supabase Storage関連エラー
  STORAGE_UPLOAD_FAILED: "STORAGE_UPLOAD_FAILED",
  STORAGE_DOWNLOAD_FAILED: "STORAGE_DOWNLOAD_FAILED",
  STORAGE_DELETE_FAILED: "STORAGE_DELETE_FAILED",
  SIGNED_URL_GENERATION_FAILED: "SIGNED_URL_GENERATION_FAILED",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  STORAGE_CONNECTION_ERROR: "STORAGE_CONNECTION_ERROR",
} as const;

// 成功レスポンス作成ヘルパー
/**
 * 成功レスポンスを作成
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>["meta"],
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response);
}

// エラーレスポンス作成ヘルパー
export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: ErrorDetails,
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return NextResponse.json(response, { status });
}

// バリデーションエラーレスポンス作成
export function createValidationErrorResponse(
  error: ZodError,
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(
    ERROR_CODES.VALIDATION_ERROR,
    "入力値に問題があります",
    400,
    error.flatten().fieldErrors,
  );
}

// 認証チェックヘルパー
export async function requireAuth(): Promise<{
  error: NextResponse<ApiErrorResponse> | null;
  session: Session | null;
}> {
  const session = await auth();

  if (!session || !session.user) {
    return {
      error: createErrorResponse(
        ERROR_CODES.UNAUTHORIZED,
        "認証が必要です",
        401,
      ),
      session: null,
    };
  }

  return { error: null, session };
}

// オプショナル認証チェックヘルパー（認証されていなくてもエラーにならない）
export async function getOptionalAuth(): Promise<Session | null> {
  const session = await auth();
  return session;
}

// 本人確認ヘルパー
export function requireSelfOrError(
  sessionUserId: string,
  targetUserId: string,
): NextResponse<ApiErrorResponse> | null {
  if (sessionUserId !== targetUserId) {
    return createErrorResponse(
      ERROR_CODES.FORBIDDEN,
      "このリソースにアクセスする権限がありません",
      403,
    );
  }
  return null;
}

// リクエストボディパースヘルパー
export async function parseRequestBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): Promise<
  | { data: T; error: null }
  | { data: null; error: NextResponse<ApiErrorResponse> }
> {
  try {
    const body = await req.json();
    const validatedData = schema.parse(body);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: createValidationErrorResponse(error),
      };
    }

    return {
      data: null,
      error: createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        "リクエストボディの解析に失敗しました",
        400,
      ),
    };
  }
}

// クエリパラメータパースヘルパー
export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>,
):
  | { data: T; error: null }
  | { data: null; error: NextResponse<ApiErrorResponse> } {
  try {
    const params = Object.fromEntries(searchParams);
    const validatedData = schema.parse(params);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: createValidationErrorResponse(error),
      };
    }

    return {
      data: null,
      error: createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        "クエリパラメータの解析に失敗しました",
        400,
      ),
    };
  }
}

// ページネーション計算ヘルパー
export function calculatePagination(
  page: number,
  limit: number,
  total: number,
) {
  const total_pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    meta: {
      page,
      limit,
      total,
      total_pages,
    },
    offset,
  };
}

// Supabase Storage専用エラーハンドリング
export function handleStorageError(
  error: string | Error,
  operation: "upload" | "download" | "delete" | "signedUrl" = "upload",
): NextResponse<ApiErrorResponse> {
  const errorMessage = typeof error === "string" ? error : error.message;

  // エラーメッセージに基づいて適切なエラーコードを決定
  let errorCode: string;
  let statusCode = 500;
  let userMessage: string;

  if (
    errorMessage.includes("File size") ||
    errorMessage.includes("too large")
  ) {
    errorCode = ERROR_CODES.FILE_TOO_LARGE;
    statusCode = 413;
    userMessage = "ファイルサイズが大きすぎます（6MB以下にしてください）";
  } else if (
    errorMessage.includes("file type") ||
    errorMessage.includes("format")
  ) {
    errorCode = ERROR_CODES.INVALID_FILE_TYPE;
    statusCode = 400;
    userMessage =
      "サポートされていないファイル形式です（JPEG、PNG、WebPのみ対応）";
  } else if (
    errorMessage.includes("Missing") ||
    errorMessage.includes("environment")
  ) {
    errorCode = ERROR_CODES.STORAGE_CONNECTION_ERROR;
    statusCode = 500;
    userMessage = "ストレージサービスの設定エラーです";
  } else {
    // 操作別のエラーコード
    switch (operation) {
      case "upload":
        errorCode = ERROR_CODES.STORAGE_UPLOAD_FAILED;
        userMessage = "画像のアップロードに失敗しました";
        break;
      case "download":
        errorCode = ERROR_CODES.STORAGE_DOWNLOAD_FAILED;
        userMessage = "画像の取得に失敗しました";
        break;
      case "delete":
        errorCode = ERROR_CODES.STORAGE_DELETE_FAILED;
        userMessage = "画像の削除に失敗しました";
        break;
      case "signedUrl":
        errorCode = ERROR_CODES.SIGNED_URL_GENERATION_FAILED;
        userMessage = "画像へのアクセスURLの生成に失敗しました";
        break;
      default:
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
        userMessage = "ストレージ操作でエラーが発生しました";
    }
  }

  console.error(`Storage ${operation} error:`, errorMessage);

  return createErrorResponse(
    errorCode,
    userMessage,
    statusCode,
    process.env.NODE_ENV === "development" ? errorMessage : undefined,
  );
}

// ファイルバリデーション
export function validateFile(file: File): {
  isValid: boolean;
  error?: NextResponse<ApiErrorResponse>;
} {
  // ファイル形式チェック
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: createErrorResponse(
        ERROR_CODES.INVALID_FILE_TYPE,
        "JPEG、PNG、WebP形式の画像のみ対応しています",
        400,
      ),
    };
  }

  // ファイルサイズチェック (6MB)
  const maxSize = 6 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: createErrorResponse(
        ERROR_CODES.FILE_TOO_LARGE,
        "ファイルサイズは6MB以下にしてください",
        413,
      ),
    };
  }

  return { isValid: true };
}

// 汎用エラーハンドラー
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "サーバー内部エラーが発生しました",
      500,
      process.env.NODE_ENV === "development" ? error.message : undefined,
    );
  }

  return createErrorResponse(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    "予期しないエラーが発生しました",
    500,
  );
}
