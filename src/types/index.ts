export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Photo {
  id: string;
  userId: string;
  imageUrl: string;
  storagePath: string; // Supabase Storage内のファイルパス
  qrCode: string;
  createdAt: Date;
  expiresAt: Date;
  isReceived: boolean;
  receiverName?: string;
  receivedAt?: Date;
  location?: Location;
}

export interface PhotoMemo {
  id: string;
  photo_id: string;
  user_id: string;
  memo: string | null;
  is_reunited: boolean;
  created_at: Date;
  updated_at: Date;
}

// 拡張された写真型（メモ情報と撮影者情報付き）
export interface PhotoWithMemo extends Photo {
  photographer_name: string | null;
  memo: string | null;
  is_reunited: boolean | null;
  memo_updated_at: Date | null;
}

export interface CreatePhotoRequest {
  userId: string;
  imageBlob: Blob;
}

export interface CreatePhotoResponse {
  success: boolean;
  photoId: string;
  qrCode: string;
  error?: string;
}

// 画像処理関連の型定義
export interface ImageFrameConfig {
  /** 上部の枠の高さ（画像高さに対する割合 0-1） */
  topRatio: number;
  /** 左右の枠の幅（画像幅に対する割合 0-1） */
  sideRatio: number;
  /** 下部の枠の高さ（画像高さに対する割合 0-1） */
  bottomRatio: number;
  /** 枠の色 */
  frameColor: string;
}

export interface ProcessedImageResult {
  /** 処理済みの画像Blob */
  blob: Blob;
  /** 元の画像サイズ */
  originalSize: { width: number; height: number };
  /** 処理後の画像サイズ */
  processedSize: { width: number; height: number };
}

export interface ImageProcessingProgress {
  /** 現在の処理ステップ */
  step: "capturing" | "processing" | "uploading" | "complete";
  /** プログレスメッセージ */
  message: string;
  /** 進捗率 (0-100) */
  progress: number;
}

export interface ReceivePhotoRequest {
  photoId: string;
  receiverName: string;
  location?: Location;
}

export interface ReceivePhotoResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface QRScanResult {
  photoId: string;
  isValid: boolean;
  isExpired: boolean;
  isAlreadyReceived: boolean;
}

export interface PhotoListItem {
  id: string;
  imageUrl: string;
  storagePath: string; // Supabase Storage内のファイルパス
  createdAt: Date;
  isReceived: boolean;
  receiverName?: string;
  receivedAt?: Date;
  location?: Location;
}

export interface GroupedPhotos {
  [date: string]: PhotoListItem[];
}

// Supabase Storage関連の型定義
export interface StorageUploadResult {
  success: boolean;
  data?: {
    path: string;
    publicUrl?: string;
    signedUrl?: string;
  };
  error?: string;
}

export interface StorageDownloadResult {
  success: boolean;
  data?: {
    signedUrl: string;
    expiresIn: number;
  };
  error?: string;
}
