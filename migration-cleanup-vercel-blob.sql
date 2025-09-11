-- Vercel Blob完全削除のためのデータベーススキーマ最適化
-- Supabase Storage専用構造への変更

-- 1. 既存のVercel Blobデータを含むレコードを削除（データ消失許可済み）
DELETE FROM photos 
WHERE storage_path IS NULL 
   OR storage_path = '' 
   OR image_url LIKE '%vercel-storage.com%';

-- 2. storage_pathをNOT NULL制約に変更
ALTER TABLE photos 
ALTER COLUMN storage_path SET NOT NULL;

-- 3. storage_pathに制約を追加（空文字列を防ぐ）
ALTER TABLE photos 
ADD CONSTRAINT chk_storage_path_not_empty 
CHECK (length(trim(storage_path)) > 0);

-- 4. image_urlの用途を明確化するためのコメント更新
COMMENT ON COLUMN photos.image_url IS 'Supabase Storage署名付きURL用のベースURL（supabase://photos/形式）';
COMMENT ON COLUMN photos.storage_path IS 'Supabase Storage内の実際のファイルパス（例: user-123/1234567890-uuid.jpg）- 必須フィールド';

-- 5. 新しいインデックスの追加（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_photos_storage_path_not_null ON photos(storage_path) WHERE storage_path IS NOT NULL;

-- 6. 古いインデックスの削除（冗長になったもの）
DROP INDEX IF EXISTS idx_photos_storage_path;

-- 7. 確認用クエリ（実行後に確認）
SELECT 
  COUNT(*) as total_photos,
  COUNT(CASE WHEN storage_path IS NOT NULL THEN 1 END) as supabase_photos,
  MIN(length(storage_path)) as min_path_length,
  MAX(length(storage_path)) as max_path_length
FROM photos;

-- 8. スキーマ確認
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'photos'
ORDER BY ordinal_position;
