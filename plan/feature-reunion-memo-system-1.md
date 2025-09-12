---
goal: 再会機能とメモ機能の実装
version: 1.0
date_created: 2025-01-24
last_updated: 2025-01-24
owner: Development Team
status: "Planned"
tags: ["feature", "database", "ui", "memo", "reunion"]
---

# 再会機能とメモ機能の実装計画

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

初対面の人との再会を記録し、思い出を残すためのメモ機能と再会ステータス機能を実装する。

## 1. Requirements & Constraints

- **REQ-001**: 写真1枚につき最大2つのメモ（送信者用・受信者用）を保存可能
- **REQ-002**: メモは200字以内の制限
- **REQ-003**: 再会ボタンは写真拡大→裏返し画面に配置
- **REQ-004**: 再会ステータスは何度でも適用/取り消し可能
- **REQ-005**: 再会済み写真にはバッジ表示
- **REQ-006**: メモと再会ステータスは個人ごとに管理
- **SEC-001**: メモの内容は投稿者以外からは見えない
- **SEC-002**: 適切な認証チェックを実装
- **CON-001**: 既存のPhoto型との互換性を保持
- **CON-002**: 現在の写真一覧画面のパフォーマンスを維持
- **GUD-001**: photo_memosテーブルで統一的にメモと再会ステータスを管理
- **PAT-001**: RESTful APIパターンに従った実装

## 2. Implementation Steps

### Implementation Phase 1: データベース設計と基盤構築

- GOAL-001: photo_memosテーブルの作成とDB関数の実装

| Task     | Description                                   | Completed | Date |
| -------- | --------------------------------------------- | --------- | ---- |
| TASK-001 | photo_memosテーブルのマイグレーションSQL作成  |           |      |
| TASK-002 | photo_memosテーブルの作成実行                 |           |      |
| TASK-003 | PhotoMemo型定義の追加                         |           |      |
| TASK-004 | メモ関連のDB関数実装（CRUD操作）              |           |      |
| TASK-005 | 既存のgetUserPhotos関数にメモ情報を含める修正 |           |      |

### Implementation Phase 2: API エンドポイント実装

- GOAL-002: メモと再会ステータス管理のAPIエンドポイント作成

| Task     | Description                                 | Completed | Date |
| -------- | ------------------------------------------- | --------- | ---- |
| TASK-006 | /api/photos/[id]/memo エンドポイント実装    |           |      |
| TASK-007 | /api/photos/[id]/reunion エンドポイント実装 |           |      |
| TASK-008 | バリデーション機能（200字制限など）実装     |           |      |
| TASK-009 | 認証・認可機能の実装                        |           |      |

### Implementation Phase 3: フロントエンド UI 実装

- GOAL-003: メモ機能と再会機能のUI実装

| Task     | Description                         | Completed | Date |
| -------- | ----------------------------------- | --------- | ---- |
| TASK-010 | PhotoCard裏面にメモ入力フォーム追加 |           |      |
| TASK-011 | PhotoCard裏面に再会ボタン追加       |           |      |
| TASK-012 | 再会済みバッジの表示機能実装        |           |      |
| TASK-013 | メモ保存・更新の非同期処理実装      |           |      |
| TASK-014 | 再会ステータス変更の非同期処理実装  |           |      |

### Implementation Phase 4: カスタムフック実装

- GOAL-004: メモと再会機能のカスタムフック作成

| Task     | Description                        | Completed | Date |
| -------- | ---------------------------------- | --------- | ---- |
| TASK-015 | usePhotoMemoカスタムフック実装     |           |      |
| TASK-016 | useReunionStatusカスタムフック実装 |           |      |
| TASK-017 | 既存フックとの連携機能実装         |           |      |

### Implementation Phase 5: テスト・最適化

- GOAL-005: 機能テストとパフォーマンス最適化

| Task     | Description                              | Completed | Date |
| -------- | ---------------------------------------- | --------- | ---- |
| TASK-018 | API エンドポイントのテスト作成           |           |      |
| TASK-019 | フロントエンドコンポーネントのテスト作成 |           |      |
| TASK-020 | パフォーマンステスト・最適化             |           |      |
| TASK-021 | ユーザビリティテストとUI調整             |           |      |

## 3. Alternatives

- **ALT-001**: 別々のテーブル（memos, reunion_status）を作成する案 → 管理の複雑化のため却下
- **ALT-002**: photosテーブルに直接カラム追加する案 → 個人ごとの管理ができないため却下
- **ALT-003**: メモ機能をファイルベースで実装する案 → データベース管理の一貫性のため却下

## 4. Dependencies

- **DEP-001**: 既存のユーザー認証システム
- **DEP-002**: PostgreSQL データベース
- **DEP-003**: 既存のPhoto型とDB関数
- **DEP-004**: React Hook Form（メモ入力フォーム用）
- **DEP-005**: Zod（バリデーション用）

## 5. Files

- **FILE-001**: `migration-add-photo-memos-table.sql` - photo_memosテーブル作成マイグレーション
- **FILE-002**: `/src/lib/db.ts` - PhotoMemo型定義とDB関数追加
- **FILE-003**: `/src/app/api/photos/[id]/memo/route.ts` - メモ管理API
- **FILE-004**: `/src/app/api/photos/[id]/reunion/route.ts` - 再会ステータス管理API
- **FILE-005**: `/src/components/PhotoCard.tsx` - 裏面UI追加（メモ・再会ボタン）
- **FILE-006**: `/src/hooks/usePhotoMemo.ts` - メモ管理カスタムフック
- **FILE-007**: `/src/hooks/useReunionStatus.ts` - 再会ステータス管理カスタムフック
- **FILE-008**: `/src/types/index.ts` - PhotoMemo型定義追加

## 6. Testing

- **TEST-001**: photo_memosテーブルのCRUD操作テスト
- **TEST-002**: メモ保存・更新APIのテスト
- **TEST-003**: 再会ステータス変更APIのテスト
- **TEST-004**: 200字制限バリデーションテスト
- **TEST-005**: 認証・認可機能のテスト
- **TEST-006**: PhotoCard裏面UIのテスト
- **TEST-007**: 再会済みバッジ表示のテスト
- **TEST-008**: 写真一覧のパフォーマンステスト

## 7. Risks & Assumptions

- **RISK-001**: 既存の写真一覧表示のパフォーマンス低下の可能性
- **RISK-002**: メモの文字数制限によるユーザビリティ問題
- **RISK-003**: 写真の裏面UIが複雑になりすぎる可能性
- **ASSUMPTION-001**: ユーザーは自分のメモのみ編集可能
- **ASSUMPTION-002**: 再会ステータスは個人の主観的判断
- **ASSUMPTION-003**: メモは平文で保存（暗号化は不要）

## 8. Related Specifications / Further Reading

- [既存のPhoto型定義](/src/lib/db.ts)
- [PhotoCardコンポーネント](/src/components/PhotoCard.tsx)
- [ユーザー認証機能](/plan/feature-user-authentication-1.md)
- [写真一覧機能](/src/app/photos/page.tsx)
