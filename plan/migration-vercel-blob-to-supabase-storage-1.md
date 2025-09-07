---
goal: Vercel BlobからSupabase Storageへの移行と認証付きファイルアクセスの実装
version: 1.0
date_created: 2025-09-07
last_updated: 2025-09-07
owner: Development Team
status: "Planned"
tags: ["migration", "storage", "security", "supabase", "nextjs"]
---

# Vercel BlobからSupabase Storageへの移行実装プラン

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

現在のVercel Blobストレージは認証機能がなく、顔写真のような機密性の高いデータを扱うには不適切です。Supabase Storageに移行することで、認証付きファイルアクセス、Row Level Security (RLS)、署名付きURLによる安全なファイル共有を実現します。

## 1. Requirements & Constraints

- **REQ-001**: 認証されたユーザーのみがファイルにアクセス可能
- **REQ-002**: ユーザーは自分がアップロードしたファイルのみアクセス可能
- **REQ-003**: 既存のNextAuth認証システムとの統合
- **REQ-004**: 一時的なファイル共有のための署名付きURL生成
- **REQ-005**: 既存のAPI構造を極力維持
- **SEC-001**: ファイルはデフォルトで非公開
- **SEC-002**: 時間制限付きアクセス制御
- **SEC-003**: ファイルアップロード時のバリデーション強化
- **CON-001**: 現在のVercel Blob実装を段階的に置き換え
- **CON-002**: NextAuthセッション管理を継続使用
- **GUD-001**: Supabase RLSポリシーでアクセス制御を実装
- **PAT-001**: プライベートバケット + 署名付きURLパターンを使用

## 2. Implementation Steps

### Implementation Phase 1: Supabase環境セットアップ

- GOAL-001: Supabaseプロジェクト作成とStorage設定

| Task     | Description                                            | Completed | Date |
| -------- | ------------------------------------------------------ | --------- | ---- |
| TASK-001 | Supabaseプロジェクト作成とAPIキー取得                  |           |      |
| TASK-002 | 環境変数の設定 (.env.local)                            |           |      |
| TASK-003 | Supabaseクライアント用ライブラリのインストール         |           |      |
| TASK-004 | プライベートストレージバケット `photos` の作成         |           |      |
| TASK-005 | RLSポリシーの設定 (ユーザー認証とオーナーアクセス制御) |           |      |

### Implementation Phase 2: Supabaseクライアント実装

- GOAL-002: Next.js向けSupabaseクライアント設定

| Task     | Description                                    | Completed | Date |
| -------- | ---------------------------------------------- | --------- | ---- |
| TASK-006 | Server Component用Supabaseクライアント実装     |           |      |
| TASK-007 | Client Component用Supabaseクライアント実装     |           |      |
| TASK-008 | ミドルウェアでのSupabaseセッション管理実装     |           |      |
| TASK-009 | NextAuthとSupabaseの認証統合ユーティリティ作成 |           |      |

### Implementation Phase 3: ストレージユーティリティ実装

- GOAL-003: ファイルアップロード・アクセス機能の実装

| Task     | Description                                    | Completed | Date |
| -------- | ---------------------------------------------- | --------- | ---- |
| TASK-010 | ファイルアップロード用ユーティリティ関数の実装 |           |      |
| TASK-011 | 署名付きURL生成ユーティリティの実装            |           |      |
| TASK-012 | ファイル削除ユーティリティの実装               |           |      |
| TASK-013 | ファイルバリデーション機能の強化               |           |      |

### Implementation Phase 4: API Routes更新

- GOAL-004: 既存のVercel Blob APIをSupabase Storageに置き換え

| Task     | Description                                   | Completed | Date |
| -------- | --------------------------------------------- | --------- | ---- |
| TASK-014 | `/api/photos/route.ts` のSupabase Storage対応 |           |      |
| TASK-015 | `/api/photos/[id]/route.ts` の署名付きURL対応 |           |      |
| TASK-016 | QR受け取り用APIの画像アクセス機能更新         |           |      |
| TASK-017 | エラーハンドリングとレスポンス構造の統一      |           |      |

### Implementation Phase 5: フロントエンド更新

- GOAL-005: UI/UXのSupabase Storage対応

| Task     | Description                               | Completed | Date |
| -------- | ----------------------------------------- | --------- | ---- |
| TASK-018 | PhotoCard コンポーネントの署名付きURL対応 |           |      |
| TASK-019 | カメラ機能のアップロード処理更新          |           |      |
| TASK-020 | 受け取り機能の画像表示処理更新            |           |      |
| TASK-021 | エラー表示とローディング状態の改善        |           |      |

### Implementation Phase 6: テストと移行

- GOAL-006: テスト実装と段階的移行

| Task     | Description                                     | Completed | Date |
| -------- | ----------------------------------------------- | --------- | ---- |
| TASK-022 | ユニットテストの実装 (ストレージユーティリティ) |           |      |
| TASK-023 | 統合テストの実装 (API Routes)                   |           |      |
| TASK-024 | 本番環境でのテスト用フィーチャーフラグ実装      |           |      |
| TASK-025 | 段階的移行とロールバック計画の策定              |           |      |
| TASK-026 | 既存データの移行戦略実装                        |           |      |

## 3. Alternatives

- **ALT-001**: AWS S3 + CloudFront - より高機能だが実装複雑度が高い
- **ALT-002**: Google Cloud Storage - 類似機能だがNext.js統合がSupabaseより複雑
- **ALT-003**: Firebase Storage - SupabaseのFirebase代替として検討したが、既存Neon PostgreSQL構成との統合性を考慮してSupabaseを選択

## 4. Dependencies

- **DEP-001**: @supabase/ssr - Next.js SSR対応Supabaseクライアント
- **DEP-002**: @supabase/supabase-js - JavaScript用Supabaseクライアント
- **DEP-003**: 既存NextAuth認証システム - 継続使用
- **DEP-004**: Neon PostgreSQL - データベース構造は維持

## 5. Files

- **FILE-001**: `src/lib/supabase/server.ts` - Server Component用クライアント
- **FILE-002**: `src/lib/supabase/client.ts` - Client Component用クライアント
- **FILE-003**: `src/lib/supabase/storage.ts` - ストレージユーティリティ
- **FILE-004**: `src/lib/supabase/middleware.ts` - セッション管理ミドルウェア
- **FILE-005**: `src/app/api/photos/route.ts` - 写真アップロードAPI更新
- **FILE-006**: `src/app/api/photos/[id]/route.ts` - 写真取得API更新
- **FILE-007**: `src/components/PhotoCard.tsx` - 画像表示コンポーネント更新
- **FILE-008**: `middleware.ts` - ルートレベルミドルウェア更新
- **FILE-009**: `.env.local` - Supabase環境変数追加

## 6. Testing

- **TEST-001**: Supabaseクライアント接続テスト
- **TEST-002**: ファイルアップロード機能テスト (認証あり/なし)
- **TEST-003**: RLSポリシー動作テスト (オーナーアクセス制御)
- **TEST-004**: 署名付きURL生成・アクセステスト
- **TEST-005**: ファイル削除機能テスト
- **TEST-006**: セッション管理とミドルウェアテスト
- **TEST-007**: エラーハンドリングテスト
- **TEST-008**: パフォーマンステスト (署名付きURL生成速度)

## 7. Risks & Assumptions

- **RISK-001**: NextAuthとSupabaseセッションの同期問題
- **RISK-002**: 既存データ移行時のダウンタイム
- **RISK-003**: 署名付きURL生成のパフォーマンス影響
- **RISK-004**: RLSポリシー設定ミスによるセキュリティ脆弱性
- **ASSUMPTION-001**: 現在のファイルサイズは6MB以下（Supabase標準アップロード制限内）
- **ASSUMPTION-002**: 同時アップロード数は現在のVercel制限内
- **ASSUMPTION-003**: NextAuth認証セッションが継続して利用可能

## 8. Related Specifications / Further Reading

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Next.js with Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
