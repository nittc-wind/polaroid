---
goal: Vercel BlobからSupabase Storageへの完全移行計画
version: 2.0
date_created: 2025-01-15
last_updated: 2025-01-15
owner: Development Team
status: "In progress"
tags: ["migration", "infrastructure", "storage", "cleanup"]
---

# Vercel BlobからSupabase Storageへの完全移行計画

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

Vercel Blob（完全public）からSupabase Storage（署名付きURL）への完全移行を実施し、後方互換性を完全に排除する計画です。Supabase Storageが完全動作することを確認済みのため、Vercel Blob関連のコード、依存関係、設定を全て削除します。

## 1. Requirements & Constraints

- **REQ-001**: Vercel Blob依存関係の完全削除
- **REQ-002**: データベーススキーマのSupabase Storage専用への変更
- **REQ-003**: 設定ファイルからVercel Blob関連設定の削除
- **REQ-004**: 後方互換性コードの完全削除
- **CON-001**: 既存のVercel Blobデータは消失して良い
- **CON-002**: Supabase Storageが完全動作していることが前提
- **SEC-001**: 署名付きURLによる安全なファイルアクセスの維持
- **GUD-001**: コードの簡素化とメンテナンス性向上

## 2. Implementation Steps

### Implementation Phase 1: 依存関係とライブラリの削除

- GOAL-001: Vercel Blob関連の依存関係を完全削除

| Task     | Description                                | Completed | Date       |
| -------- | ------------------------------------------ | --------- | ---------- |
| TASK-001 | package.jsonから@vercel/blobを削除         | ✅        | 2025-01-15 |
| TASK-002 | package-lock.jsonの更新（npm install実行） | ✅        | 2025-01-15 |
| TASK-003 | 不要になったTypeScript型定義の確認         | ✅        | 2025-01-15 |

### Implementation Phase 2: データベーススキーマの最適化

- GOAL-002: Photosテーブルを純Supabase Storage用に最適化

| Task     | Description                                                     | Completed | Date       |
| -------- | --------------------------------------------------------------- | --------- | ---------- |
| TASK-004 | image_urlカラムの用途変更（後方互換用URLから純粋な表示URL用へ） | ✅        | 2025-01-15 |
| TASK-005 | storage_pathをNOT NULL制約に変更                                | ✅        | 2025-01-15 |
| TASK-006 | 古いVercel BlobのURLフォーマット識別コードの削除                | ✅        | 2025-01-15 |
| TASK-007 | データベーススキーマの整合性確認                                | ✅        | 2025-01-15 |

### Implementation Phase 3: アプリケーションコードの最適化

- GOAL-003: 後方互換性コードの削除とコード簡素化

| Task     | Description                                     | Completed | Date       |
| -------- | ----------------------------------------------- | --------- | ---------- |
| TASK-008 | 写真取得APIからVercel Blob後方互換コードを削除  | ✅        | 2025-01-15 |
| TASK-009 | 写真アップロードAPIの簡素化                     | ✅        | 2025-01-15 |
| TASK-010 | image_urlの設定ロジックを純粋なSupabase用に変更 | ✅        | 2025-01-15 |
| TASK-011 | db.tsのPhotoインターフェース更新                | ✅        | 2025-01-15 |

### Implementation Phase 4: 設定とドキュメントの更新

- GOAL-004: 設定ファイルとドキュメントからVercel関連項目を削除

| Task     | Description                                | Completed | Date       |
| -------- | ------------------------------------------ | --------- | ---------- |
| TASK-012 | next.config.tsからVercel Blob domainを削除 | ✅        | 2025-01-15 |
| TASK-013 | 環境変数設定の確認（Vercel Blob関連削除）  | ✅        | 2025-01-15 |
| TASK-014 | 移行関連SQLファイルの整理                  | ✅        | 2025-01-15 |
| TASK-015 | READMEやドキュメントの更新                 |           |            |

### Implementation Phase 5: テストと検証

- GOAL-005: 完全移行後の動作検証

| Task     | Description                    | Completed | Date |
| -------- | ------------------------------ | --------- | ---- |
| TASK-016 | 写真アップロード機能の動作確認 |           |      |
| TASK-017 | 写真表示機能の動作確認         |           |      |
| TASK-018 | 写真削除機能の動作確認         |           |      |
| TASK-019 | エラーハンドリングの確認       |           |      |
| TASK-020 | パフォーマンステスト           |           |      |

## 3. Alternatives

- **ALT-001**: 段階的移行（却下：Supabase Storageが完全動作済みのため不要）
- **ALT-002**: 両システムの並行運用継続（却下：後方互換性削除が要件）
- **ALT-003**: データマイグレーション実装（却下：既存データ消失許可済み）

## 4. Dependencies

- **DEP-001**: Supabase Storage環境の完全動作（✅ 確認済み）
- **DEP-002**: Supabase認証システム（✅ 既存）
- **DEP-003**: データベース接続（✅ 既存）

## 5. Files

- **FILE-001**: `/package.json` - 依存関係削除
- **FILE-002**: `/next.config.ts` - domain設定更新
- **FILE-003**: `/src/lib/db.ts` - Photoインターフェース更新
- **FILE-004**: `/src/app/api/photos/route.ts` - アップロードAPI最適化
- **FILE-005**: `/src/app/api/photos/[id]/route.ts` - 取得API簡素化
- **FILE-006**: 新規SQLマイグレーションファイル - スキーマ最適化
- **FILE-007**: `/migration-*.sql` - 既存移行ファイルの整理

## 6. Testing

- **TEST-001**: 写真アップロード・表示・削除の統合テスト
- **TEST-002**: 署名付きURL生成・有効性テスト
- **TEST-003**: エラーハンドリング（ファイル不存在、権限なし等）
- **TEST-004**: 大容量ファイルアップロードテスト
- **TEST-005**: 並行アクセステスト

## 7. Risks & Assumptions

- **RISK-001**: 移行中の一時的なサービス停止
- **RISK-002**: 予期しないVercel Blob依存関係の発見
- **RISK-003**: Supabase Storage設定の不備
- **ASSUMPTION-001**: Supabase Storageが本番環境で正常動作
- **ASSUMPTION-002**: 既存ユーザーはデータ消失を受け入れ可能
- **ASSUMPTION-003**: 現在のSupabase Storage設定が最適

## 8. Related Specifications / Further Reading

- [Previous Migration Plan](./migration-vercel-blob-to-supabase-storage-1.md)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
