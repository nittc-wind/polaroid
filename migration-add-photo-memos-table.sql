-- Photo Memos テーブル作成マイグレーション
-- 写真に対するメモと再会ステータスを管理

-- photo_memosテーブル作成
CREATE TABLE photo_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memo TEXT CHECK (char_length(memo) <= 200),
  is_reunited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(photo_id, user_id) -- 写真とユーザーの組み合わせは一意
);

-- インデックス作成
CREATE INDEX idx_photo_memos_photo_id ON photo_memos(photo_id);
CREATE INDEX idx_photo_memos_user_id ON photo_memos(user_id);
CREATE INDEX idx_photo_memos_photo_user ON photo_memos(photo_id, user_id);
CREATE INDEX idx_photo_memos_reunited ON photo_memos(user_id, is_reunited) WHERE is_reunited = TRUE;

-- 更新日時の自動更新トリガー作成
CREATE OR REPLACE FUNCTION update_photo_memos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_photo_memos_updated_at
  BEFORE UPDATE ON photo_memos
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_memos_updated_at();

-- コメント追加
COMMENT ON TABLE photo_memos IS '写真に対するユーザーのメモと再会ステータスを管理するテーブル';
COMMENT ON COLUMN photo_memos.id IS 'メモレコードの一意識別子';
COMMENT ON COLUMN photo_memos.photo_id IS '対象写真のID';
COMMENT ON COLUMN photo_memos.user_id IS 'メモを作成したユーザーのID';
COMMENT ON COLUMN photo_memos.memo IS 'ユーザーのメモ（最大200文字）';
COMMENT ON COLUMN photo_memos.is_reunited IS '再会済みかどうかのフラグ';
COMMENT ON COLUMN photo_memos.created_at IS 'レコード作成日時';
COMMENT ON COLUMN photo_memos.updated_at IS 'レコード最終更新日時';
