import { NextResponse } from "next/server";
import { signedUrlCache } from "@/lib/signed-url-cache";
import { getPhotoSignedUrl } from "@/lib/supabase/storage";
import { createSuccessResponse } from "@/lib/api-utils";

/**
 * 署名付きURLキャッシュの性能分析用エンドポイント
 */
export async function GET() {
  try {
    const stats = signedUrlCache.getStats();

    return createSuccessResponse({
      cache: {
        size: stats.size,
        maxSize: stats.maxSize,
        hitRate: "N/A", // TODO: ヒット率計算を追加
        entries: stats.entries.slice(0, 10), // 最初の10件のみ表示
      },
      performance: {
        message:
          "パフォーマンステストは /api/test/performance/[path] で実行できます",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get cache stats" },
      { status: 500 },
    );
  }
}

/**
 * 署名付きURL生成のパフォーマンステスト
 */
export async function POST(request: Request) {
  try {
    const { testPath = "test-user/sample.jpg", iterations = 5 } =
      await request.json();

    const results = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();

      const result = await getPhotoSignedUrl(testPath, 3600);

      const endTime = Date.now();
      const duration = endTime - startTime;

      results.push({
        iteration: i + 1,
        success: result.success,
        duration_ms: duration,
        cached: i > 0, // 最初以外はキャッシュヒットの可能性
      });
    }

    const avgDuration =
      results.reduce((sum, r) => sum + r.duration_ms, 0) / results.length;
    const minDuration = Math.min(...results.map((r) => r.duration_ms));
    const maxDuration = Math.max(...results.map((r) => r.duration_ms));

    return createSuccessResponse({
      testPath,
      iterations,
      results,
      summary: {
        average_ms: Math.round(avgDuration * 100) / 100,
        min_ms: minDuration,
        max_ms: maxDuration,
        improvement:
          results.length > 1
            ? `初回: ${results[0].duration_ms}ms → 平均: ${Math.round(avgDuration)}ms`
            : "N/A",
      },
      cache: signedUrlCache.getStats(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Performance test failed" },
      { status: 500 },
    );
  }
}
