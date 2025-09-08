/**
 * Supabase Storage設定テスト用ユーティリティ
 */

import { createSupabaseServiceClient } from "./server";

export async function testStorageSetup() {
  try {
    const supabase = createSupabaseServiceClient();

    // 1. バケット一覧を取得
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("Failed to list buckets:", bucketsError);
      return { success: false, error: bucketsError.message };
    }

    console.log("Available buckets:", buckets);

    // 2. photosバケットの存在確認
    const photosBucket = buckets?.find((bucket) => bucket.name === "photos");

    if (!photosBucket) {
      console.error("photos bucket not found");
      return { success: false, error: "photos bucket does not exist" };
    }

    console.log("photos bucket config:", photosBucket);

    // 3. photosバケット内のファイル一覧を取得（テスト）
    const { data: files, error: listError } = await supabase.storage
      .from("photos")
      .list("", { limit: 5 });

    if (listError) {
      console.error("Failed to list files in photos bucket:", listError);
      return { success: false, error: listError.message };
    }

    console.log("Files in photos bucket (first 5):", files);

    return {
      success: true,
      data: {
        buckets,
        photosBucket,
        fileCount: files?.length || 0,
      },
    };
  } catch (error) {
    console.error("Storage setup test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function testSpecificFile(path: string) {
  try {
    const supabase = createSupabaseServiceClient();

    // 1. ファイルの存在確認
    const { data: file, error: downloadError } = await supabase.storage
      .from("photos")
      .download(path);

    if (downloadError) {
      console.error(`File ${path} download test failed:`, downloadError);
      return { success: false, error: downloadError.message };
    }

    console.log(`File ${path} exists, size:`, file?.size);

    // 2. 署名付きURL生成テスト
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from("photos")
      .createSignedUrl(path, 60); // 1分間

    if (signedUrlError) {
      console.error(
        `Signed URL generation failed for ${path}:`,
        signedUrlError,
      );
      return { success: false, error: signedUrlError.message };
    }

    console.log(`Signed URL generated for ${path}:`, signedUrl?.signedUrl);

    return {
      success: true,
      data: {
        fileSize: file?.size,
        signedUrl: signedUrl?.signedUrl,
      },
    };
  } catch (error) {
    console.error(`File test failed for ${path}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
