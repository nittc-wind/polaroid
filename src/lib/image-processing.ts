/**
 * 画像処理ユーティリティ関数
 * インスタントカメラ風の白枠を画像に追加する機能を提供
 */

export interface FrameConfig {
  /** 上部の枠の高さ（画像高さに対する割合 0-1） */
  topRatio: number;
  /** 左右の枠の幅（画像幅に対する割合 0-1） */
  sideRatio: number;
  /** 下部の枠の高さ（画像高さに対する割合 0-1） */
  bottomRatio: number;
  /** 枠の色 */
  frameColor: string;
  /** ロゴを表示するかどうか */
  showLogo?: boolean;
  /** ロゴのサイズ（下部枠の高さに対する割合 0-1） */
  logoSizeRatio?: number;
  /** ロゴの右からのマージン（左右枠の幅に対する割合 0-1） */
  logoMarginRatio?: number;
  /** 日付を表示するかどうか */
  showDate?: boolean;
  /** 日付のフォントサイズ（下部枠の高さに対する割合 0-1） */
  dateFontSizeRatio?: number;
  /** 日付の左からのマージン（左右枠の幅に対する割合 0-1） */
  dateMarginRatio?: number;
  /** 日付の色 */
  dateColor?: string;
}

export interface ProcessedImageResult {
  /** 処理済みの画像Blob */
  blob: Blob;
  /** 元の画像サイズ */
  originalSize: { width: number; height: number };
  /** 処理後の画像サイズ */
  processedSize: { width: number; height: number };
}

/**
 * デフォルトの枠設定（インスタントカメラ風）
 */
export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  topRatio: 0.05, // 上部5%
  sideRatio: 0.05, // 左右5%
  bottomRatio: 0.2, // 下部20%
  frameColor: "#FFFFFF",
  showLogo: true,
  logoSizeRatio: 0.6, // 下部枠の60%の高さ
  logoMarginRatio: 0.3, // 左右枠の30%のマージン
  showDate: true,
  dateFontSizeRatio: 0.25, // 下部枠の25%の高さ
  dateMarginRatio: 0.3, // 左右枠の30%のマージン
  dateColor: "#333333",
};

/**
 * SVGをImageElementとして読み込む
 * @param svgPath SVGファイルのパス
 * @returns Promise<HTMLImageElement>
 */
async function loadSvgAsImage(svgPath: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`SVGファイルの読み込みに失敗しました: ${svgPath}`));
    img.src = svgPath;
  });
}

/**
 * 現在の日付をyyyy/mm/dd形式で取得
 * @returns 日付文字列
 */
function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * HTMLImageElementから画像データを読み込み、インスタントカメラ風の白枠を追加
 * @param imageElement 処理対象の画像要素
 * @param config 枠の設定（オプション）
 * @param quality 画像品質 0-1 （オプション、デフォルト: 0.92）
 * @returns 処理済み画像のBlob
 */
export async function addInstantCameraFrame(
  imageElement: HTMLImageElement,
  config: FrameConfig = DEFAULT_FRAME_CONFIG,
  quality: number = 0.92,
): Promise<ProcessedImageResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context の初期化に失敗しました"));
        return;
      }

      const originalWidth = imageElement.naturalWidth;
      const originalHeight = imageElement.naturalHeight;

      // 枠を含めた新しいキャンバスサイズを計算
      const frameWidth = originalWidth * config.sideRatio;
      const frameTopHeight = originalHeight * config.topRatio;
      const frameBottomHeight = originalHeight * config.bottomRatio;

      const newWidth = originalWidth + frameWidth * 2;
      const newHeight = originalHeight + frameTopHeight + frameBottomHeight;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // 背景（枠）を白で塗りつぶし
      ctx.fillStyle = config.frameColor;
      ctx.fillRect(0, 0, newWidth, newHeight);

      // 元の画像を中央に配置して描画
      const imageX = frameWidth;
      const imageY = frameTopHeight;

      ctx.drawImage(
        imageElement,
        imageX,
        imageY,
        originalWidth,
        originalHeight,
      );

      // ロゴを描画
      if (config.showLogo) {
        try {
          const logoImage = await loadSvgAsImage("/logo.svg");

          // ロゴのサイズを計算（下部枠の高さに対する割合）
          const logoHeight = frameBottomHeight * (config.logoSizeRatio || 0.6);
          // SVGのアスペクト比を維持してロゴの幅を計算
          const logoAspectRatio =
            logoImage.naturalWidth / logoImage.naturalHeight;
          const logoWidth = logoHeight * logoAspectRatio;

          // ロゴの配置位置を計算（右下）
          const logoMargin = frameWidth * (config.logoMarginRatio || 0.3);
          const logoX = newWidth - logoWidth - logoMargin;
          const logoY =
            originalHeight +
            frameTopHeight +
            (frameBottomHeight - logoHeight) / 2;

          // ロゴを描画
          ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        } catch (logoError) {
          console.warn("ロゴの描画に失敗しました:", logoError);
          // ロゴの描画に失敗しても処理を続行
        }
      }

      // 日付を描画
      if (config.showDate) {
        try {
          const dateString = getCurrentDateString();
          const fontSize =
            frameBottomHeight * (config.dateFontSizeRatio || 0.25);
          const dateMargin = frameWidth * (config.dateMarginRatio || 0.3);

          // フォント設定
          ctx.font = `${fontSize}px Arial, sans-serif`;
          ctx.fillStyle = config.dateColor || "#333333";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          // 日付の配置位置を計算（左下）
          const dateX = dateMargin;
          const dateY = originalHeight + frameTopHeight + frameBottomHeight / 2;

          // 日付を描画
          ctx.fillText(dateString, dateX, dateY);
        } catch (dateError) {
          console.warn("日付の描画に失敗しました:", dateError);
          // 日付の描画に失敗しても処理を続行
        }
      }

      // Blobに変換
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("画像のBlob変換に失敗しました"));
            return;
          }

          resolve({
            blob,
            originalSize: { width: originalWidth, height: originalHeight },
            processedSize: { width: newWidth, height: newHeight },
          });
        },
        "image/png",
        quality,
      );
    } catch (error) {
      reject(
        new Error(
          `画像処理中にエラーが発生しました: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      );
    }
  });
}

/**
 * VideoElementから現在のフレームを取得し、インスタントカメラ風の白枠を追加
 * @param videoElement ビデオ要素
 * @param config 枠の設定（オプション）
 * @param quality 画像品質 0-1 （オプション、デフォルト: 0.92）
 * @returns 処理済み画像のBlob
 */
export async function captureVideoFrameWithFrame(
  videoElement: HTMLVideoElement,
  config: FrameConfig = DEFAULT_FRAME_CONFIG,
  quality: number = 0.92,
): Promise<ProcessedImageResult> {
  return new Promise(async (resolve, reject) => {
    try {
      // まず、ビデオから画像を取得
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
        reject(new Error("一時Canvas context の初期化に失敗しました"));
        return;
      }

      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;

      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;

      // ビデオフレームを一時キャンバスに描画（左右反転を考慮）
      tempCtx.scale(-1, 1); // 左右反転
      tempCtx.drawImage(videoElement, -videoWidth, 0, videoWidth, videoHeight);

      // 一時キャンバスから画像要素を作成
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await addInstantCameraFrame(img, config, quality);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () =>
        reject(new Error("ビデオフレームの画像変換に失敗しました"));
      img.src = tempCanvas.toDataURL();
    } catch (error) {
      reject(
        new Error(
          `ビデオフレーム処理中にエラーが発生しました: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      );
    }
  });
}

/**
 * 画像処理がサポートされているかチェック
 * @returns サポート状況
 */
export function isImageProcessingSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    return !!ctx && typeof canvas.toBlob === "function";
  } catch {
    return false;
  }
}
