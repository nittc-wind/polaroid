// データベースマイグレーション実行用スクリプト
import { neon } from "@neondatabase/serverless";

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 現在のPhotosテーブル構造を確認中...');
    
    // 現在のスキーマ確認
    const currentSchema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'photos'
      ORDER BY ordinal_position;
    `;
    
    console.log('現在のスキーマ:', currentSchema);
    
    // storage_pathカラムの存在確認
    const hasStoragePath = currentSchema.some(col => col.column_name === 'storage_path');
    
    if (!hasStoragePath) {
      console.log('📝 storage_pathカラムを追加中...');
      
      await sql`ALTER TABLE photos ADD COLUMN storage_path TEXT;`;
      
      console.log('📝 既存レコードのstorage_pathを空文字で初期化中...');
      
      await sql`
        UPDATE photos 
        SET storage_path = '' 
        WHERE storage_path IS NULL;
      `;
      
      console.log('📝 インデックスを作成中...');
      
      await sql`CREATE INDEX IF NOT EXISTS idx_photos_storage_path ON photos(storage_path);`;
      
      console.log('✅ マイグレーション完了!');
    } else {
      console.log('ℹ️ storage_pathカラムは既に存在します');
    }
    
    // 更新後のスキーマ確認
    const updatedSchema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'photos'
      ORDER BY ordinal_position;
    `;
    
    console.log('更新後のスキーマ:', updatedSchema);
    
  } catch (error) {
    console.error('❌ マイグレーション失敗:', error);
    process.exit(1);
  }
}

runMigration();
