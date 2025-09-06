import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { ZodError, ZodSchema } from "zod";
import {
  ApiResponse,
  StrictApiResponse,
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
