import { createSupabaseServiceClient } from "./server";

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    publicUrl?: string;
    signedUrl?: string;
  };
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  data?: {
    signedUrl: string;
    expiresIn: number;
  };
  error?: string;
}

/**
 * 写真をSupabase Storageにアップロード
 * @param file アップロードするファイル
 * @param userId ユーザーID（フォルダパス用）
 * @param filename ファイル名（UUIDなど）
 */
export async function uploadPhoto(
  file: File | Buffer,
  userId: string,
  filename: string,
): Promise<UploadResult> {
  try {
    const supabase = createSupabaseServiceClient();
    const filePath = `${userId}/${filename}`;

    const { data, error } = await supabase.storage
      .from("photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    return {
      success: true,
      data: {
        path: data.path,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
}

/**
 * 写真の署名付きURLを生成（プライベートアクセス用）
 * @param path Storageファイルパス
 * @param expiresIn 有効期限（秒）デフォルト1時間
 */
export async function getPhotoSignedUrl(
  path: string,
  expiresIn: number = 3600,
): Promise<DownloadResult> {
  try {
    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase.storage
      .from("photos")
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Supabase Storage signed URL error:", error);
      return {
        success: false,
        error: `Failed to create signed URL: ${error.message}`,
      };
    }

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        expiresIn,
      },
    };
  } catch (error) {
    console.error("Signed URL error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown signed URL error",
    };
  }
}

/**
 * 写真を削除
 * @param path Storageファイルパス
 */
export async function deletePhoto(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServiceClient();

    const { error } = await supabase.storage.from("photos").remove([path]);

    if (error) {
      console.error("Supabase Storage delete error:", error);
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown delete error",
    };
  }
}

/**
 * ユーザーの全写真リストを取得
 * @param userId ユーザーID
 */
export async function listUserPhotos(userId: string): Promise<{
  success: boolean;
  data?: Array<{ name: string; path: string; updated_at: string }>;
  error?: string;
}> {
  try {
    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase.storage.from("photos").list(userId, {
      limit: 100,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error) {
      console.error("Supabase Storage list error:", error);
      return {
        success: false,
        error: `Failed to list photos: ${error.message}`,
      };
    }

    return {
      success: true,
      data:
        data?.map((file) => ({
          name: file.name,
          path: `${userId}/${file.name}`,
          updated_at: file.updated_at || "",
        })) || [],
    };
  } catch (error) {
    console.error("List photos error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown list error",
    };
  }
}
