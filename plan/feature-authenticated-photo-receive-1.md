---
goal: ログインユーザーの写真受け取り機能実装
version: 1.0
date_created: 2025-01-21
last_updated: 2025-01-21
owner: Development Team
status: "Planned"
tags: ["feature", "authentication", "database", "ui"]
---

# ログインユーザーの写真受け取り機能実装

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

ログインしているユーザーが写真を受け取った時に、そのユーザーと写真を紐づける機能を実装する。未ログインユーザーは従来通りの名前入力フローを維持する。

## 1. Requirements & Constraints

- **REQ-001**: ログインユーザーは自動的にユーザーIDで写真受け取りが記録される
- **REQ-002**: 未ログインユーザーは従来通り名前入力で受け取り可能
- **REQ-003**: 受け取り画面でログイン状態に応じてUIを出し分けする
- **REQ-004**: 写真一覧で受け取った写真には「受け取った」バッジを表示する
- **REQ-005**: 撮影者情報を表示する（受け取った画像の場合）
- **SEC-001**: 認証状態の確認はNextAuthセッション情報を使用
- **CON-001**: 既存のreceiver_nameカラムは未ログインユーザー用として維持
- **PAT-001**: 作成日順での表示、日付グルーピングは維持

## 2. Implementation Steps

### Implementation Phase 1: データベース設計変更

- GOAL-001: photosテーブルにreceiver_user_idカラム追加とDB関数更新

| Task     | Description                                               | Completed | Date       |
| -------- | --------------------------------------------------------- | --------- | ---------- |
| TASK-001 | SQLマイグレーション作成（receiver_user_idカラム追加）     | ✅        | 2025-01-21 |
| TASK-002 | Photo型定義にreceiver_user_idフィールド追加               | ✅        | 2025-01-21 |
| TASK-003 | receivePhoto関数を新仕様に対応（ログイン/未ログイン判定） | ✅        | 2025-01-21 |
| TASK-004 | getUserPhotos関数を受け取り写真も含むように拡張           | ✅        | 2025-01-21 |
| TASK-005 | 写真取得時に撮影者情報を含める新関数追加                  | ✅        | 2025-01-21 |

### Implementation Phase 2: API変更

- GOAL-002: 写真受け取りAPIでログイン状態対応

| Task     | Description                                                   | Completed | Date       |
| -------- | ------------------------------------------------------------- | --------- | ---------- |
| TASK-006 | /api/photos/[id]/receive でセッション情報確認機能追加         | ✅        | 2025-01-21 |
| TASK-007 | ログイン時はreceiver_user_id、未ログイン時はreceiver_name設定 | ✅        | 2025-01-21 |
| TASK-008 | レスポンス形式の調整（認証状態含む）                          | ✅        | 2025-01-21 |

### Implementation Phase 3: UI実装

- GOAL-003: 受け取り画面でのログイン状態別UI実装

| Task     | Description                                  | Completed | Date       |
| -------- | -------------------------------------------- | --------- | ---------- |
| TASK-009 | useAuth hookでセッション状態取得             | ✅        | 2025-01-21 |
| TASK-010 | ログイン時UI（ユーザー名表示、名前入力なし） | ✅        | 2025-01-21 |
| TASK-011 | 未ログイン時UI（従来の名前入力フォーム）     | ✅        | 2025-01-21 |
| TASK-012 | APIリクエスト処理の条件分岐実装              | ✅        | 2025-01-21 |

### Implementation Phase 4: 写真一覧表示拡張

- GOAL-004: 撮影・受け取り写真統合表示と受け取りバッジ

| Task     | Description                                   | Completed | Date       |
| -------- | --------------------------------------------- | --------- | ---------- |
| TASK-013 | PhotoCard コンポーネントに受け取りバッジ追加  | ✅        | 2025-01-21 |
| TASK-014 | 撮影者情報表示機能追加                        | ✅        | 2025-01-21 |
| TASK-015 | /api/users/[id]/photos で受け取り写真も含める | ✅        | 2025-01-21 |
| TASK-016 | 日付グルーピング維持したまま統合表示実装      | ✅        | 2025-01-21 |

## 3. Alternatives

- **ALT-001**: receiver_nameカラムを廃止してuser_idのみにする → 未ログインユーザーの履歴が残らないため不採用
- **ALT-002**: 別テーブルでreceivers管理 → 過度な正規化となり複雑性が増すため不採用

## 4. Dependencies

- **DEP-001**: NextAuth セッション管理機能
- **DEP-002**: useAuth hook
- **DEP-003**: 既存のPhoto型とDB関数

## 5. Files

- **FILE-001**: `/src/lib/db.ts` - Photo型定義とDB関数
- **FILE-002**: `/src/app/api/photos/[id]/receive/route.ts` - 受け取りAPI
- **FILE-003**: `/src/app/receive/[id]/page.tsx` - 受け取り画面
- **FILE-004**: `/src/app/api/users/[id]/photos/route.ts` - 写真一覧API
- **FILE-005**: `/src/components/PhotoCard.tsx` - 写真カードコンポーネント
- **FILE-006**: マイグレーションSQLファイル

## 6. Testing

- **TEST-001**: ログインユーザーでの写真受け取りテスト
- **TEST-002**: 未ログインユーザーでの写真受け取りテスト
- **TEST-003**: 写真一覧での受け取りバッジ表示テスト
- **TEST-004**: 撮影者情報表示テスト

## 7. Risks & Assumptions

- **RISK-001**: 既存データのreceiver_nameが空になる場合の表示対応
- **ASSUMPTION-001**: NextAuthセッション情報が確実に取得できる
- **ASSUMPTION-002**: 受け取り時にログアウトするケースは稀

## 8. Related Specifications / Further Reading

- NextAuth.js Documentation
- Neon Database SQL Documentation
