import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export function generateUserId(): string {
  // localStorageから取得、なければ新規作成
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('tomodachi-cheki-user-id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('tomodachi-cheki-user-id', userId);
    }
    return userId;
  }
  return uuidv4(); // サーバーサイドではランダム生成
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function generateQRCodeData(photoId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/receive/${photoId}`;
}

export function generateUniqueQRCode(): string {
  return uuidv4();
}

export function isQRCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function getExpirationTime(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30); // 30分後に期限切れ
  return now;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function groupPhotosByDate<T extends { createdAt: string | Date }>(
  photos: T[]
): Record<string, T[]> {
  return photos.reduce<Record<string, T[]>>((groups, photo) => {
    const date = formatDate(new Date(photo.createdAt));
    if (!groups[date]) {
      groups[date] = [] as T[];
    }
    groups[date].push(photo);
    return groups;
  }, {} as Record<string, T[]>);
}

export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // アスペクト比を保持してリサイズ
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', quality);
    };

    img.src = URL.createObjectURL(file);
  });
}

export function addTextToImage(imageBlob: Blob, text: string, date: string): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 画像を描画
      ctx.drawImage(img, 0, 0);

      // テキスト設定
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;

      // 名前を下部に追加
      ctx.strokeText(text, 10, canvas.height - 40);
      ctx.fillText(text, 10, canvas.height - 40);

      // 日付を下部に追加
      ctx.strokeText(date, 10, canvas.height - 10);
      ctx.fillText(date, 10, canvas.height - 10);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    };

    img.src = URL.createObjectURL(imageBlob);
  });
}