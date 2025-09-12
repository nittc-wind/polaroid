import { neon } from "@neondatabase/serverless";

// データベース接続
export const sql = neon(process.env.DATABASE_URL!);

// 型定義
export interface Photo {
  id: string;
  device_id: string;
  user_id: string | null;
  image_url: string;
  storage_path: string; // Supabase Storage内のファイルパス（必須）
  created_at: Date;
  expires_at: Date;
  is_received: boolean;
  receiver_name: string | null; // 未ログインユーザー用
  receiver_user_id: string | null; // ログインユーザー用
  received_at: Date | null;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
}

// User型定義（NextAuth対応）
export interface User {
  id: string;
  email: string;
  password_hash: string;
  handle_name: string;
  created_at: Date;
  updated_at: Date;
  email_verified?: Date | null;
  image?: string | null;
}

// PhotoMemo型定義（メモと再会ステータス管理）
export interface PhotoMemo {
  id: string;
  photo_id: string;
  user_id: string;
  memo: string | null;
  is_reunited: boolean;
  created_at: Date;
  updated_at: Date;
}

// ヘルパー関数
export async function createPhoto(data: {
  device_id: string;
  user_id?: string | null;
  image_url: string;
  storage_path: string; // Supabase Storage用（必須）
  expires_at?: Date;
}) {
  const expires_at =
    data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000);

  const result = await sql`
    INSERT INTO photos (device_id, user_id, image_url, storage_path, expires_at)
    VALUES (${data.device_id}, ${data.user_id || null}, ${data.image_url}, ${data.storage_path}, ${expires_at})
    RETURNING *
  `;

  return result[0] as Photo;
}

// 最低限のユーザー作成関数（insertのみ、バリデーション・認証なし）
export async function createUser(data: {
  email: string;
  password_hash: string;
  handle_name: string;
}) {
  const result = await sql`
    INSERT INTO users (email, password_hash, handle_name)
    VALUES (${data.email}, ${data.password_hash}, ${data.handle_name})
    RETURNING *
  `;
  return result[0] as User;
}

// ユーザー情報取得（ID指定）
export async function getUserById(id: string) {
  const result = await sql`
    SELECT id, email, handle_name, created_at, updated_at
    FROM users 
    WHERE id = ${id}
    LIMIT 1
  `;

  return result[0] as User | undefined;
}

// ユーザー情報取得（メールアドレス指定）
export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, handle_name, created_at, updated_at, email_verified, image
    FROM users 
    WHERE email = ${email}
    LIMIT 1
  `;

  return result[0] as User | undefined;
}

// ユーザー情報取得（パスワード含む）
export async function getUserWithPassword(id: string) {
  const result = await sql`
    SELECT id, email, password_hash, handle_name, created_at, updated_at, email_verified, image
    FROM users 
    WHERE id = ${id}
    LIMIT 1
  `;

  return result[0] as (User & { password_hash: string }) | undefined;
}

// ユーザー情報更新
export async function updateUser(
  id: string,
  data: Partial<Pick<User, "email" | "handle_name" | "image">>,
) {
  // 動的にクエリを構築
  if (data.email && data.handle_name) {
    const result = await sql`
      UPDATE users 
      SET 
        email = ${data.email},
        handle_name = ${data.handle_name},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, handle_name, created_at, updated_at, email_verified, image
    `;
    return result[0] as User | undefined;
  } else if (data.email) {
    const result = await sql`
      UPDATE users 
      SET 
        email = ${data.email},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, handle_name, created_at, updated_at, email_verified, image
    `;
    return result[0] as User | undefined;
  } else if (data.handle_name) {
    const result = await sql`
      UPDATE users 
      SET 
        handle_name = ${data.handle_name},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, handle_name, created_at, updated_at, email_verified, image
    `;
    return result[0] as User | undefined;
  } else if (data.image !== undefined) {
    const result = await sql`
      UPDATE users 
      SET 
        image = ${data.image},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, handle_name, created_at, updated_at, email_verified, image
    `;
    return result[0] as User | undefined;
  }

  return undefined;
}

// パスワード更新
export async function updateUserPassword(id: string, password_hash: string) {
  const result = await sql`
    UPDATE users 
    SET 
      password_hash = ${password_hash},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, email, handle_name, created_at, updated_at
  `;

  return result[0] as User | undefined;
}

// ユーザー削除（ソフトデリート）
export async function deleteUser(id: string) {
  // まずは物理削除として実装（後でソフトデリートに変更可能）
  const result = await sql`
    DELETE FROM users 
    WHERE id = ${id}
    RETURNING id
  `;

  return result.length > 0;
}

// ユーザー検索
export async function searchUsers(
  query?: string,
  page: number = 1,
  limit: number = 20,
) {
  const offset = (page - 1) * limit;

  if (query) {
    // 検索クエリありの場合
    const countResult = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE handle_name ILIKE ${`%${query}%`}
    `;
    const total = parseInt(countResult[0].count);

    const users = await sql`
      SELECT id, email, handle_name, created_at, updated_at, image
      FROM users 
      WHERE handle_name ILIKE ${`%${query}%`}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      users: users as User[],
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  } else {
    // 全ユーザー取得の場合
    const countResult = await sql`
      SELECT COUNT(*) as count FROM users
    `;
    const total = parseInt(countResult[0].count);

    const users = await sql`
      SELECT id, email, handle_name, created_at, updated_at, image
      FROM users 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      users: users as User[],
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }
}

// ユーザー統計情報取得
export async function getUserStats(userId: string) {
  const stats = await sql`
    SELECT 
      COUNT(CASE WHEN user_id = ${userId} THEN 1 END) as total_photos,
      COUNT(CASE WHEN user_id = ${userId} AND is_received = true THEN 1 END) as received_photos,
      COUNT(CASE WHEN user_id = ${userId} AND is_received = false AND expires_at > NOW() THEN 1 END) as active_photos,
      (SELECT created_at FROM users WHERE id = ${userId}) as join_date,
      (SELECT MAX(created_at) FROM photos WHERE user_id = ${userId}) as last_activity
    FROM photos
  `;

  if (stats.length === 0) {
    return null;
  }

  return {
    total_photos: parseInt(stats[0].total_photos) || 0,
    received_photos: parseInt(stats[0].received_photos) || 0,
    active_photos: parseInt(stats[0].active_photos) || 0,
    join_date: stats[0].join_date,
    last_activity: stats[0].last_activity,
  };
}

// ユーザーの写真一覧取得（受け取り済みの写真のみ）
// 撮影した写真で受け取り済み + 受け取った写真
export async function getUserPhotos(
  userId: string,
  page: number = 1,
  limit: number = 20,
) {
  const offset = (page - 1) * limit;

  // 総件数取得（受け取り済みの写真のみ）
  // 撮影した写真で受け取り済み、または受け取った写真
  const countResult = await sql`
    SELECT COUNT(*) as count 
    FROM photos 
    WHERE (user_id = ${userId} AND is_received = true) OR receiver_user_id = ${userId}
  `;
  const total = parseInt(countResult[0].count);

  // データ取得（メモ情報と撮影者情報も含める）
  // 受け取り済みの写真のみを取得
  const photos = await sql`
    SELECT 
      p.*,
      u.handle_name as photographer_name,
      pm.memo,
      pm.is_reunited,
      pm.updated_at as memo_updated_at
    FROM photos p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN photo_memos pm ON p.id = pm.photo_id AND pm.user_id = ${userId}
    WHERE (p.user_id = ${userId} AND p.is_received = true) OR p.receiver_user_id = ${userId}
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return {
    photos: photos as (Photo & {
      photographer_name: string | null;
      memo: string | null;
      is_reunited: boolean | null;
      memo_updated_at: Date | null;
    })[],
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}

export async function getPhoto(id: string) {
  const result = await sql`
    SELECT * FROM photos 
    WHERE id = ${id}
    LIMIT 1
  `;

  return result[0] as Photo | undefined;
}

// 写真詳細取得（撮影者情報含む）
export async function getPhotoWithPhotographer(id: string) {
  const result = await sql`
    SELECT 
      p.*,
      u.handle_name as photographer_name
    FROM photos p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ${id}
    LIMIT 1
  `;

  return result[0] as
    | (Photo & { photographer_name: string | null })
    | undefined;
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
    receiver_name?: string; // 未ログインユーザー用
    receiver_user_id?: string; // ログインユーザー用
    location?: { latitude: number; longitude: number; address?: string };
  },
) {
  // ログインユーザーの場合
  if (data.receiver_user_id) {
    const result = await sql`
      UPDATE photos 
      SET 
        is_received = true,
        receiver_user_id = ${data.receiver_user_id},
        receiver_name = NULL,
        received_at = NOW(),
        location = ${JSON.stringify(data.location) || null}
      WHERE id = ${id}
        AND is_received = false
        AND expires_at > NOW()
      RETURNING *
    `;
    return result[0] as Photo | undefined;
  }

  // 未ログインユーザーの場合
  if (data.receiver_name) {
    const result = await sql`
      UPDATE photos 
      SET 
        is_received = true,
        receiver_name = ${data.receiver_name},
        receiver_user_id = NULL,
        received_at = NOW(),
        location = ${JSON.stringify(data.location) || null}
      WHERE id = ${id}
        AND is_received = false
        AND expires_at > NOW()
      RETURNING *
    `;
    return result[0] as Photo | undefined;
  }

  // どちらも指定されていない場合はエラー
  throw new Error("Either receiver_name or receiver_user_id must be provided");
}

// 期限切れ写真のクリーンアップ
export async function cleanupExpiredPhotos() {
  await sql`
    DELETE FROM photos 
    WHERE expires_at < NOW()
  `;
}

// ========================================
// PhotoMemo関連のDB関数
// ========================================

// PhotoMemo作成・更新（UPSERT）
export async function upsertPhotoMemo(data: {
  photo_id: string;
  user_id: string;
  memo?: string | null;
  is_reunited?: boolean;
}) {
  const result = await sql`
    INSERT INTO photo_memos (photo_id, user_id, memo, is_reunited)
    VALUES (${data.photo_id}, ${data.user_id}, ${data.memo || null}, ${data.is_reunited || false})
    ON CONFLICT (photo_id, user_id) 
    DO UPDATE SET 
      memo = EXCLUDED.memo,
      is_reunited = EXCLUDED.is_reunited,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return result[0] as PhotoMemo;
}

// PhotoMemo取得（単一）
export async function getPhotoMemo(photo_id: string, user_id: string) {
  const result = await sql`
    SELECT * FROM photo_memos 
    WHERE photo_id = ${photo_id} AND user_id = ${user_id}
    LIMIT 1
  `;

  return result[0] as PhotoMemo | undefined;
}

// 写真に対するすべてのメモ取得
export async function getPhotoMemos(photo_id: string) {
  const result = await sql`
    SELECT pm.*, u.handle_name as user_handle_name
    FROM photo_memos pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.photo_id = ${photo_id}
    ORDER BY pm.created_at ASC
  `;

  return result as (PhotoMemo & { user_handle_name: string })[];
}

// ユーザーのメモ一覧取得（再会済みフィルタ可能）
export async function getUserPhotoMemos(
  user_id: string,
  is_reunited?: boolean,
  page: number = 1,
  limit: number = 20,
) {
  const offset = (page - 1) * limit;

  const whereClause =
    is_reunited !== undefined
      ? sql`WHERE pm.user_id = ${user_id} AND pm.is_reunited = ${is_reunited}`
      : sql`WHERE pm.user_id = ${user_id}`;

  const result = await sql`
    SELECT pm.*, p.image_url, p.storage_path, p.created_at as photo_created_at,
           p.receiver_name, p.is_received
    FROM photo_memos pm
    JOIN photos p ON pm.photo_id = p.id
    ${whereClause}
    ORDER BY pm.updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result as (PhotoMemo & {
    image_url: string;
    storage_path: string;
    photo_created_at: Date;
    receiver_name: string | null;
    is_received: boolean;
  })[];
}

// メモ削除
export async function deletePhotoMemo(photo_id: string, user_id: string) {
  const result = await sql`
    DELETE FROM photo_memos 
    WHERE photo_id = ${photo_id} AND user_id = ${user_id}
    RETURNING *
  `;

  return result[0] as PhotoMemo | undefined;
}

// 再会ステータスのみ更新
export async function updateReunionStatus(
  photo_id: string,
  user_id: string,
  is_reunited: boolean,
) {
  const result = await sql`
    INSERT INTO photo_memos (photo_id, user_id, is_reunited)
    VALUES (${photo_id}, ${user_id}, ${is_reunited})
    ON CONFLICT (photo_id, user_id) 
    DO UPDATE SET 
      is_reunited = EXCLUDED.is_reunited,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return result[0] as PhotoMemo;
}
