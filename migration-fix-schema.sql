-- Supabase Storage移行のためのPhotosテーブル更新
-- storage_pathカラムを追加してSupabase Storage内のファイルパスを保存

-- 1. storage_pathカラムを追加（NULL許可、既存データとの互換性のため）
ALTER TABLE photos 
ADD COLUMN storage_path TEXT;

-- 2. storage_pathカラムにコメント追加（ドキュメント用）
COMMENT ON COLUMN photos.storage_path IS 'Supabase Storage内のファイルパス（例: user-123/1234567890-uuid.jpg）';

-- 3. 検索パフォーマンス向上のためのインデックス追加
CREATE INDEX IF NOT EXISTS idx_photos_storage_path ON photos(storage_path);

-- 4. 複合インデックス（ユーザー別ファイル検索用）
CREATE INDEX IF NOT EXISTS idx_photos_user_storage ON photos(user_id, storage_path) WHERE storage_path IS NOT NULL;

-- 5. 既存データの確認用クエリ（実行後に確認可能）
-- SELECT 
--   COUNT(*) as total_photos,
--   COUNT(CASE WHEN storage_path IS NOT NULL THEN 1 END) as supabase_photos,
--   COUNT(CASE WHEN storage_path IS NULL AND image_url IS NOT NULL THEN 1 END) as vercel_photos
-- FROM photos;

-- 6. テーブル構造確認用クエリ
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'photos'
-- ORDER BY ordinal_position;