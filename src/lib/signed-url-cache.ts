/**
 * 署名付きURLキャッシュ機能
 * メモリベースのLRUキャッシュでSupabase署名付きURLの生成コストを削減
 */

interface CachedSignedUrl {
  signedUrl: string;
  expiresAt: number; // Unix timestamp
  createdAt: number; // Unix timestamp
}

class SignedUrlCache {
  private cache = new Map<string, CachedSignedUrl>();
  private maxSize = 1000; // 最大キャッシュサイズ
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 5分ごとに期限切れエントリをクリーンアップ
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * キャッシュから署名付きURLを取得
   * @param path ファイルパス
   * @returns キャッシュされたURL（有効期限内）またはnull
   */
  get(path: string): string | null {
    const cached = this.cache.get(path);

    if (!cached) {
      return null;
    }

    const now = Date.now();

    // 有効期限の10%前に期限切れとして扱う（バッファ時間）
    const expiryBuffer = (cached.expiresAt - cached.createdAt) * 0.1;
    const effectiveExpiry = cached.expiresAt - expiryBuffer;

    if (now >= effectiveExpiry) {
      this.cache.delete(path);
      return null;
    }

    return cached.signedUrl;
  }

  /**
   * 署名付きURLをキャッシュに保存
   * @param path ファイルパス
   * @param signedUrl 署名付きURL
   * @param expiresIn 有効期限（秒）
   */
  set(path: string, signedUrl: string, expiresIn: number): void {
    const now = Date.now();

    // LRUキャッシュの実装：サイズ制限に達したら古いエントリを削除
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(path, {
      signedUrl,
      expiresAt: now + expiresIn * 1000,
      createdAt: now,
    });
  }

  /**
   * 期限切れエントリをクリーンアップ
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [path, cached] of this.cache.entries()) {
      if (now >= cached.expiresAt) {
        this.cache.delete(path);
      }
    }
  }

  /**
   * キャッシュ統計を取得（デバッグ用）
   */
  getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{ path: string; expiresIn: number; ageSeconds: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([path, cached]) => ({
      path,
      expiresIn: Math.max(0, Math.floor((cached.expiresAt - now) / 1000)),
      ageSeconds: Math.floor((now - cached.createdAt) / 1000),
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries,
    };
  }

  /**
   * 特定のパスのキャッシュを削除
   * @param path ファイルパス
   */
  delete(path: string): boolean {
    return this.cache.delete(path);
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * リソースをクリーンアップ
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// シングルトンインスタンス
export const signedUrlCache = new SignedUrlCache();

// プロセス終了時のクリーンアップ
if (typeof process !== "undefined") {
  process.on("exit", () => {
    signedUrlCache.destroy();
  });
}
