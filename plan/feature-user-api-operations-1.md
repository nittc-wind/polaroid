---
goal: User操作APIエンドポイント設計・実装計画 - CRUD操作とプロファイル管理
version: 1.0
date_created: 2025-09-06
last_updated: 2025-09-06
owner: 2名体制開発チーム
status: "Planned"
tags: ["feature", "api", "user-management", "crud", "profile", "authentication"]
---

# User操作APIエンドポイント設計・実装計画

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

この実装計画は「ともだちチェキ」サービスにおけるUser操作のAPIエンドポイントを設計・実装することを目標とした計画です。ユーザーのCRUD操作、プロファイル管理、認証関連の包括的なAPI設計を行います。

## 1. Requirements & Constraints

- **REQ-001**: ユーザー情報取得API（GET /api/users/[id]）
- **REQ-002**: ユーザープロファイル更新API（PATCH /api/users/[id]）
- **REQ-003**: ユーザー削除API（DELETE /api/users/[id]）
- **REQ-004**: 現在のユーザー情報取得API（GET /api/users/me）
- **REQ-005**: ユーザー検索API（GET /api/users?search=query）
- **REQ-006**: パスワード変更API（PATCH /api/users/[id]/password）
- **REQ-007**: ユーザーの写真一覧取得API（GET /api/users/[id]/photos）
- **REQ-008**: ユーザーのアクティビティ統計API（GET /api/users/[id]/stats）
- **SEC-001**: NextAuth.jsによるセッション管理とCSRF保護
- **SEC-002**: パスワード変更時の現在パスワード確認
- **SEC-003**: 他ユーザーの個人情報保護（公開可能情報のみ返却）
- **SEC-004**: レート制限による不正アクセス防止
- **SEC-005**: 入力値の適切なバリデーションとサニタイゼーション
- **CON-001**: 既存の認証システムとの整合性維持
- **CON-002**: RESTful API設計原則の遵守
- **CON-003**: 既存のデータベーススキーマの活用
- **CON-004**: エラーハンドリングの統一
- **GUD-001**: OpenAPI仕様書の作成
- **GUD-002**: TypeScript strict modeでの型安全性
- **GUD-003**: Server Componentパターンの活用
- **GUD-004**: 適切なHTTPステータスコードの使用
- **PAT-001**: 統一されたレスポンス形式の採用
- **PAT-002**: 共通のエラーハンドリングパターンの使用

## 2. Implementation Steps

### Implementation Phase 1: 基盤とユーティリティ実装

- GOAL-001: API共通基盤とユーティリティ関数の構築

| Task     | Description                               | Completed | Date       |
| -------- | ----------------------------------------- | --------- | ---------- |
| TASK-001 | NextAuth.js設定とプロバイダー設定         | ✅        | 2025-09-06 |
| TASK-002 | Neonデータベースアダプター設定            | ✅        | 2025-09-06 |
| TASK-003 | バリデーションスキーマ定義（Zod使用）     | ✅        | 2025-09-06 |
| TASK-004 | API共通レスポンス型定義とヘルパー関数実装 | ✅        | 2025-09-06 |
| TASK-005 | NextAuth用データベーステーブル作成        | ✅        | 2025-09-06 |

### Implementation Phase 2: 基本CRUD API実装

- GOAL-002: ユーザーの基本的なCRUD操作APIの完成

| Task     | Description                                     | Completed | Date |
| -------- | ----------------------------------------------- | --------- | ---- |
| TASK-006 | GET /api/users/[id] - ユーザー情報取得API実装   |           |      |
| TASK-007 | GET /api/users/me - 現在ユーザー情報取得API実装 |           |      |
| TASK-008 | PATCH /api/users/[id] - ユーザー情報更新API実装 |           |      |
| TASK-009 | DELETE /api/users/[id] - ユーザー削除API実装    |           |      |
| TASK-010 | 認可制御ロジックの実装（本人確認・管理者権限）  |           |      |

### Implementation Phase 3: 拡張機能API実装

- GOAL-003: パスワード管理と検索機能APIの実装

| Task     | Description                                            | Completed | Date |
| -------- | ------------------------------------------------------ | --------- | ---- |
| TASK-011 | PATCH /api/users/[id]/password - パスワード変更API実装 |           |      |
| TASK-012 | GET /api/users?search - ユーザー検索API実装            |           |      |
| TASK-013 | GET /api/users/[id]/photos - ユーザー写真一覧API実装   |           |      |
| TASK-014 | GET /api/users/[id]/stats - ユーザー統計情報API実装    |           |      |
| TASK-015 | ページネーション機能の実装                             |           |      |

### Implementation Phase 4: セキュリティ・最適化・テスト

- GOAL-004: セキュリティ強化とパフォーマンス最適化

| Task     | Description                              | Completed | Date |
| -------- | ---------------------------------------- | --------- | ---- |
| TASK-016 | レート制限ミドルウェア実装               |           |      |
| TASK-017 | APIキャッシュ戦略の実装                  |           |      |
| TASK-018 | OpenAPI仕様書作成                        |           |      |
| TASK-019 | 包括的なAPIテストスイート作成            |           |      |
| TASK-020 | セキュリティ監査とペネトレーションテスト |           |      |

## 3. Alternatives

- **ALT-001**: GraphQL APIの採用（現在はREST APIを選択）
- **ALT-002**: tRPCによるタイプセーフAPI（現在はREST + Zodバリデーションを選択）
- **ALT-003**: 自作JWT認証の継続（現在はNextAuth.jsを採用）
- **ALT-004**: Auth0等の外部認証サービス（現在はNextAuth.jsを選択）
- **ALT-005**: Prismaによるデータベース操作（現在は直接SQL操作を継続）

## 4. Dependencies

- **DEP-001**: next-auth（NextAuth.js本体）
- **DEP-002**: @auth/neon-adapter（Neonデータベースアダプター）
- **DEP-003**: zod（入力値バリデーション）
- **DEP-004**: bcryptjs（パスワードハッシュ化・検証）
- **DEP-005**: @types/bcryptjs（TypeScript型定義）
- **DEP-006**: rate-limiter-flexible（レート制限）
- **DEP-007**: 既存のNeon Database接続
- **DEP-008**: uuid（ユーザーID生成）

## 5. Files

- **FILE-001**: `/src/lib/auth.ts` - NextAuth設定ファイル
- **FILE-002**: `/src/app/api/auth/[...nextauth]/route.ts` - NextAuth APIルート
- **FILE-003**: `/src/lib/validation.ts` - Zodバリデーションスキーマ
- **FILE-004**: `/src/lib/api-utils.ts` - API共通ユーティリティ
- **FILE-005**: `/src/lib/rate-limit.ts` - レート制限ミドルウェア
- **FILE-006**: `/src/app/api/users/[id]/route.ts` - 個別ユーザーCRUD API
- **FILE-007**: `/src/app/api/users/me/route.ts` - 現在ユーザー情報API
- **FILE-008**: `/src/app/api/users/[id]/password/route.ts` - パスワード変更API
- **FILE-009**: `/src/app/api/users/[id]/photos/route.ts` - ユーザー写真一覧API
- **FILE-010**: `/src/app/api/users/[id]/stats/route.ts` - ユーザー統計API
- **FILE-011**: `/src/app/api/users/route.ts` - ユーザー検索・一覧API
- **FILE-012**: `/src/types/api.ts` - API関連型定義
- **FILE-013**: `/docs/api.yaml` - OpenAPI仕様書

## 6. Testing

- **TEST-001**: ユーザー情報取得APIのテスト（認証済み・未認証）
- **TEST-002**: ユーザー情報更新APIのテスト（本人・他人・管理者）
- **TEST-003**: パスワード変更APIのテスト（現在パスワード確認）
- **TEST-004**: ユーザー削除APIのテスト（論理削除・物理削除）
- **TEST-005**: 検索APIのテスト（部分一致・ページネーション）
- **TEST-006**: 認可制御のテスト（権限不足・不正アクセス）
- **TEST-007**: バリデーションテスト（不正入力・境界値）
- **TEST-008**: レート制限テスト（過度なリクエスト）
- **TEST-009**: パフォーマンステスト（大量データ・同時接続）
- **TEST-010**: セキュリティテスト（SQLインジェクション・XSS）

## 7. Risks & Assumptions

- **RISK-001**: 大量ユーザー時のパフォーマンス劣化リスク
- **RISK-002**: JWT認証の適切な無効化の複雑さ
- **RISK-003**: 個人情報漏洩リスク（不適切な認可制御）
- **RISK-004**: レート制限設定の適切性の判断難易度
- **RISK-005**: データベース負荷増大によるレスポンス遅延
- **ASSUMPTION-001**: ユーザーは有効なJWTトークンを保持している
- **ASSUMPTION-002**: データベース接続は安定している
- **ASSUMPTION-003**: フロントエンドからの適切な認証ヘッダー送信
- **ASSUMPTION-004**: ユーザーIDはUUID形式で一意性が保証されている
- **ASSUMPTION-005**: 削除はソフトデリート（論理削除）を基本とする

## 8. Related Specifications / Further Reading

[REST API Design Best Practices](https://restfulapi.net/)
[JSON Web Token (JWT) RFC 7519](https://tools.ietf.org/html/rfc7519)
[OpenAPI Specification](https://swagger.io/specification/)
[Zod Validation Library](https://zod.dev/)
[Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

# API エンドポイント設計詳細

## エンドポイント一覧

### 1. ユーザー情報取得

```http
GET /api/users/{id}
```

**認証**: 必須（JWT）
**権限**: 本人または管理者、または公開情報のみ
**パラメータ**:

- `id` (path): ユーザーID (UUID)

**レスポンス例**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com", // 本人のみ
    "handle_name": "ユーザー名",
    "created_at": "2025-09-06T10:00:00Z",
    "updated_at": "2025-09-06T10:00:00Z",
    "stats": {
      "total_photos": 25,
      "received_photos": 18
    }
  }
}
```

### 2. 現在のユーザー情報取得

```http
GET /api/users/me
```

**認証**: 必須（JWT）
**レスポンス**: 完全なプロファイル情報

### 3. ユーザー情報更新

```http
PATCH /api/users/{id}
```

**認証**: 必須（JWT）
**権限**: 本人のみ
**リクエストボディ**:

```json
{
  "handle_name": "新しいユーザー名",
  "email": "new-email@example.com"
}
```

### 4. パスワード変更

```http
PATCH /api/users/{id}/password
```

**認証**: 必須（JWT）
**権限**: 本人のみ
**リクエストボディ**:

```json
{
  "current_password": "現在のパスワード",
  "new_password": "新しいパスワード"
}
```

### 5. ユーザー削除

```http
DELETE /api/users/{id}
```

**認証**: 必須（JWT）
**権限**: 本人または管理者
**動作**: ソフトデリート（論理削除）

### 6. ユーザー検索

```http
GET /api/users?search={query}&page={page}&limit={limit}
```

**認証**: 必須（JWT）
**パラメータ**:

- `search` (query): 検索クエリ（ハンドル名での部分一致）
- `page` (query): ページ番号（デフォルト: 1）
- `limit` (query): 1ページあたりの件数（デフォルト: 20、最大: 100）

### 7. ユーザー写真一覧

```http
GET /api/users/{id}/photos?page={page}&limit={limit}
```

**認証**: 必須（JWT）
**権限**: 本人のみ（プライベート写真）
**パラメータ**:

- `page` (query): ページ番号
- `limit` (query): 1ページあたりの件数

### 8. ユーザー統計情報

```http
GET /api/users/{id}/stats
```

**認証**: 必須（JWT）
**権限**: 本人または公開統計情報のみ
**レスポンス例**:

```json
{
  "success": true,
  "data": {
    "total_photos": 25,
    "received_photos": 18,
    "active_photos": 7,
    "join_date": "2025-09-01T00:00:00Z",
    "last_activity": "2025-09-06T09:30:00Z"
  }
}
```

## 共通レスポンス形式

### 成功レスポンス

```json
{
  "success": true,
  "data": {}, // または []
  "meta": {
    // ページネーション情報（該当時のみ）
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "details": {} // 詳細情報（該当時のみ）
  }
}
```

## エラーコード一覧

| コード                | HTTPステータス | 説明                       |
| --------------------- | -------------- | -------------------------- |
| UNAUTHORIZED          | 401            | 認証が必要                 |
| FORBIDDEN             | 403            | アクセス権限なし           |
| USER_NOT_FOUND        | 404            | ユーザーが見つからない     |
| VALIDATION_ERROR      | 400            | 入力値バリデーションエラー |
| EMAIL_ALREADY_EXISTS  | 409            | メールアドレス重複         |
| INVALID_PASSWORD      | 400            | 現在のパスワードが不正     |
| RATE_LIMIT_EXCEEDED   | 429            | レート制限超過             |
| INTERNAL_SERVER_ERROR | 500            | サーバー内部エラー         |

## セキュリティ考慮事項

1. **認証・認可**:
   - すべてのエンドポイントでJWT認証必須
   - リソースへのアクセス権限を適切に制御
   - 本人確認の徹底

2. **入力値検証**:
   - Zodスキーマによる厳密なバリデーション
   - SQLインジェクション対策
   - XSS対策のためのサニタイゼーション

3. **レート制限**:
   - IPアドレス単位での制限
   - エンドポイント別の適切な制限値設定
   - ユーザー単位での制限も検討

4. **データ保護**:
   - 他ユーザーのメールアドレス等の個人情報保護
   - パスワードハッシュの適切な管理
   - ログ出力時の機密情報マスキング

この計画により、セキュアで拡張性のあるUser操作APIシステムを構築できます。
