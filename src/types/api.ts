// エラー詳細の型定義
export type ErrorDetails =
  | string
  | Record<string, string[]> // Zodバリデーションエラー用
  | Record<string, unknown> // その他のオブジェクト形式のエラー
  | null
  | undefined;

// API共通型定義
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: ErrorDetails;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
}

// より厳密な型安全性を提供する分離された成功/エラーレスポンス
export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
  };
};

// Discriminated Union型 - 使用時により厳密な型チェックが可能
export type StrictApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

// ユーザー関連型定義
export interface PublicUser {
  id: string;
  handle_name: string;
  image?: string | null;
  created_at: Date;
}

export interface PrivateUser extends PublicUser {
  email: string;
  updated_at: Date;
  email_verified?: Date | null;
}

export interface UserWithStats extends PublicUser {
  stats: {
    total_photos: number;
    received_photos: number;
    active_photos?: number;
  };
}

// 写真関連型定義
export interface Photo {
  id: string;
  device_id: string;
  user_id: string | null;
  image_url: string;
  created_at: Date;
  expires_at: Date;
  is_received: boolean;
  receiver_name: string | null;
  received_at: Date | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
}

// 写真紐付けリクエスト型定義
export interface PhotoClaimRequest {
  photo_id: string;
}

// 写真紐付けレスポンス型定義
export interface PhotoClaimResponse {
  photo_id: string;
}

// 統計情報型定義
export interface UserStats {
  total_photos: number;
  received_photos: number;
  active_photos: number;
  join_date: Date;
  last_activity: Date | null;
}

// ページネーション型定義
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// NextAuth拡張型定義（NextAuth v5対応）
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      handle_name: string;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    handle_name?: string;
    image?: string | null;
  }
}

// JWT型定義（NextAuth v5では@auth/coreから）
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    handle_name: string;
  }
}
