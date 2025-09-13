---
goal: ログインして思い出に追加機能の実装
version: 1.0
date_created: 2025-01-21
last_updated: 2025-01-21
owner: Development Team
status: "Planned"
tags: ["feature", "authentication", "photo-management"]
---

# ログインして思い出に追加機能の実装

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

未ログインユーザーが写真受け取り後に、ログイン/新規登録を行い、自動的に写真をユーザーアカウントに紐付ける機能を実装する。

## 1. Requirements & Constraints

- **REQ-001**: 未ログインユーザーが「ログインして思い出に追加」ボタンを押すとログイン/新規登録画面に遷移
- **REQ-002**: 認証後に自動的に `/complete/[id]` にリダイレクト
- **REQ-003**: リダイレクト後に自動で写真紐付けAPIを呼び出し
- **REQ-004**: 写真の有効期限（24時間）切れの場合はエラーメッセージ表示
- **REQ-005**: 既に他ユーザーに紐付け済みの写真の場合はエラーとして処理
- **REQ-006**: 未ログインユーザーの `receiver_name` 設定との整合性を保持
- **SEC-001**: 認証されたユーザーのみが写真紐付け操作を実行可能
- **SEC-002**: 写真IDの不正アクセスを防止
- **CON-001**: メール認証は不要（即座にログイン完了）
- **CON-002**: 既存の認証フローを活用
- **GUD-001**: エラーハンドリングを適切に実装
- **PAT-001**: Next.js App Router のベストプラクティスに従う

## 2. Implementation Steps

### Implementation Phase 1: 認証フロー改修

- GOAL-001: ログイン/新規登録時のリダイレクト先制御を実装

| Task     | Description                                              | Completed | Date       |
| -------- | -------------------------------------------------------- | --------- | ---------- |
| TASK-001 | ログイン画面でreturnUrlクエリパラメータ対応を追加        | ✅        | 2025-01-21 |
| TASK-002 | 新規登録画面でreturnUrlクエリパラメータ対応を追加        | ✅        | 2025-01-21 |
| TASK-003 | complete画面での「ログインして思い出に追加」ボタンの実装 | ✅        | 2025-01-21 |

### Implementation Phase 2: 写真紐付けAPI実装

- GOAL-002: 写真とユーザーの紐付けAPIエンドポイントを作成

| Task     | Description                                      | Completed | Date       |
| -------- | ------------------------------------------------ | --------- | ---------- |
| TASK-004 | PUT /api/photos/[id]/claim APIエンドポイント作成 | ✅        | 2025-01-21 |
| TASK-005 | 写真の有効性検証ロジック実装                     | ✅        | 2025-01-21 |
| TASK-006 | 重複紐付けチェック機能実装                       | ✅        | 2025-01-21 |
| TASK-007 | receiver_name との整合性検証実装                 | ✅        | 2025-01-21 |

### Implementation Phase 3: フロントエンド統合

- GOAL-003: complete画面での自動紐付け機能を実装

| Task     | Description                                     | Completed | Date |
| -------- | ----------------------------------------------- | --------- | ---- |
| TASK-008 | URLクエリパラメータによる自動紐付けトリガー実装 |           |      |
| TASK-009 | 紐付け成功時のUI更新実装                        |           |      |
| TASK-010 | エラーハンドリングとユーザーフィードバック実装  |           |      |
| TASK-011 | ローディング状態の適切な表示実装                |           |      |

## 3. Alternatives

- **ALT-001**: ユーザーが明示的に「思い出に追加」ボタンを押すタイミングで紐付け → 自動紐付けを選択してUX向上
- **ALT-002**: 期限切れ写真の期限延長機能 → エラー表示を選択してシンプルな仕様に
- **ALT-003**: 複数ユーザーでの写真共有機能 → エラー処理を選択して明確な所有権管理

## 4. Dependencies

- **DEP-001**: 既存の認証システム（NextAuth.js）
- **DEP-002**: useAuth フック
- **DEP-003**: usePhotoData フック
- **DEP-004**: 既存の写真テーブル構造
- **DEP-005**: Supabase Storage の署名付きURL

## 5. Files

- **FILE-001**: `/src/app/auth/signin/page.tsx` - ログイン画面のリダイレクト対応
- **FILE-002**: `/src/app/auth/signup/page.tsx` - 新規登録画面のリダイレクト対応
- **FILE-003**: `/src/app/complete/[id]/page.tsx` - complete画面の機能実装
- **FILE-004**: `/src/app/api/photos/[id]/claim/route.ts` - 写真紐付けAPIエンドポイント
- **FILE-005**: `/src/lib/db.ts` - データベース操作関数の追加
- **FILE-006**: `/src/types/api.ts` - API型定義の追加

## 6. Testing

- **TEST-001**: 未ログインユーザーの認証フロー正常動作テスト
- **TEST-002**: 写真紐付けAPI の各種エラーケーステスト
- **TEST-003**: 有効期限切れ写真のエラーハンドリングテスト
- **TEST-004**: 重複紐付けエラーのテスト
- **TEST-005**: receiver_name 整合性検証テスト
- **TEST-006**: UI状態変化の統合テスト

## 7. Risks & Assumptions

- **RISK-001**: 認証処理中にブラウザを閉じた場合の状態不整合
- **RISK-002**: Supabase署名付きURLの有効期限とアプリ側の期限の差異
- **RISK-003**: 大量の同時アクセス時のデータベース競合状態
- **ASSUMPTION-001**: 既存の認証システムが安定して動作する
- **ASSUMPTION-002**: 写真の24時間有効期限ポリシーが変更されない
- **ASSUMPTION-003**: receiver_name は信頼できるデータソースである

## 8. Related Specifications / Further Reading

- [Next.js Authentication Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
