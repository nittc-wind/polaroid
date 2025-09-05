import { neon } from "@neondatabase/serverless";

// データベース接続
export const sql = neon(process.env.DATABASE_URL!);

// 型定義
export interface Photo {
  id: string;
  device_id: string;
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

// ヘルパー関数
export async function createPhoto(data: {
  device_id: string;
  image_url: string;
  expires_at?: Date;
}) {
  const expires_at =
    data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000);

  const result = await sql`
    INSERT INTO photos (device_id, image_url, expires_at)
    VALUES (${data.device_id}, ${data.image_url}, ${expires_at})
    RETURNING *
  `;

  return result[0] as Photo;
}

export async function getPhoto(id: string) {
  const result = await sql`
    SELECT * FROM photos 
    WHERE id = ${id}
    LIMIT 1
  `;

  return result[0] as Photo | undefined;
}

export async function getPhotosByDevice(device_id: string) {
  const result = await sql`
    SELECT * FROM photos 
    WHERE device_id = ${device_id}
      AND expires_at > NOW()
    ORDER BY created_at DESC
  `;

  return result as Photo[];
}

export async function receivePhoto(
  id: string,
  data: {
    receiver_name: string;
    location?: { latitude: number; longitude: number; address?: string };
  },
) {
  const result = await sql`
    UPDATE photos 
    SET 
      is_received = true,
      receiver_name = ${data.receiver_name},
      received_at = NOW(),
      location = ${JSON.stringify(data.location) || null}
    WHERE id = ${id}
      AND is_received = false
      AND expires_at > NOW()
    RETURNING *
  `;

  return result[0] as Photo | undefined;
}

// 期限切れ写真のクリーンアップ
export async function cleanupExpiredPhotos() {
  await sql`
    DELETE FROM photos 
    WHERE expires_at < NOW()
  `;
}
