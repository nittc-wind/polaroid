-- Supabase Storage移行のためのPhotosテーブル更新
-- storage_pathカラムを追加してSupabase Storage内のファイルパスを保存
-- ⚠️ 注意: このファイルは歴史的記録用です。最新の完全移行は migration-cleanup-vercel-blob.sql を使用してください

ALTER TABLE photos 
ADD COLUMN storage_path TEXT;

-- 既存レコードには空文字を設定（後でマイグレーション時に適切なパスに更新）
UPDATE photos 
SET storage_path = '' 
WHERE storage_path IS NULL;

-- インデックス追加（ファイルパス検索用）
CREATE INDEX IF NOT EXISTS idx_photos_storage_path ON photos(storage_path);

-- 確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'photos'
ORDER BY ordinal_position;
