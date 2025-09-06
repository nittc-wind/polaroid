import { z } from "zod";

// ユーザー認証関連スキーマ
export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上である必要があります"),
});

export const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上である必要があります"),
  handle_name: z
    .string()
    .min(1, "ハンドル名を入力してください")
    .max(100, "ハンドル名は100文字以内である必要があります")
    .regex(
      /^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
      "ハンドル名には英数字、ひらがな、カタカナ、漢字、アンダースコアのみ使用できます",
    ),
});

// ユーザー情報更新スキーマ
export const updateUserSchema = z
  .object({
    handle_name: z
      .string()
      .min(1, "ハンドル名を入力してください")
      .max(100, "ハンドル名は100文字以内である必要があります")
      .regex(
        /^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        "ハンドル名には英数字、ひらがな、カタカナ、漢字、アンダースコアのみ使用できます",
      )
      .optional(),
    email: z
      .string()
      .email("有効なメールアドレスを入力してください")
      .optional(),
  })
  .refine((data) => data.handle_name || data.email, {
    message: "少なくとも1つのフィールドを更新してください",
  });

// パスワード変更スキーマ
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "現在のパスワードを入力してください"),
    new_password: z
      .string()
      .min(6, "新しいパスワードは6文字以上である必要があります"),
    confirm_password: z.string().min(1, "パスワード確認を入力してください"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "新しいパスワードと確認パスワードが一致しません",
    path: ["confirm_password"],
  });

// ユーザー検索スキーマ
export const searchUsersSchema = z.object({
  search: z.string().min(1, "検索クエリを入力してください").optional(),
  page: z.coerce
    .number()
    .min(1, "ページ番号は1以上である必要があります")
    .default(1),
  limit: z.coerce
    .number()
    .min(1)
    .max(100, "1ページあたりの件数は100件以下である必要があります")
    .default(20),
});

// ページネーション共通スキーマ
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .min(1, "ページ番号は1以上である必要があります")
    .default(1),
  limit: z.coerce
    .number()
    .min(1)
    .max(100, "1ページあたりの件数は100件以下である必要があります")
    .default(20),
});

// UUID検証スキーマ
export const uuidSchema = z.string().uuid("有効なUUIDを指定してください");

// 型エクスポート
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
