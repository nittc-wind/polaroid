---
goal: ユーザー認証機能とマイフォト機能実装計画 - JWT認証とユーザー写真一覧
version: 1.0
date_created: 2025-09-06
last_updated: 2025-09-06
owner: 2名体制開発チーム
status: "Planned"
tags: ["feature", "authentication", "user-management", "jwt", "photo-gallery"]
---

# ユーザー認証機能とマイフォト機能実装計画

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

この実装計画は「ともだちチェキ」サービスにユーザー認証機能を追加し、ユーザーが自分の撮影した写真を後から見返せる機能を実装することを目標とした計画です。localStorage + JWT認証による最小限のユーザー管理システムを構築します。

## 1. Requirements & Constraints

- **REQ-001**: ユーザー登録機能（メアド・パスワード・ハンドルネーム）
- **REQ-002**: ユーザーログイン機能（JWT認証）
- **REQ-003**: localStorage でのJWTトークン管理
- **REQ-004**: ユーザー固有の写真一覧表示機能
- **REQ-005**: 既存のdevice_id ベースシステムとの併存
- **REQ-006**: パスワードのハッシュ化（bcryptjs使用）
- **REQ-007**: UUIDベースのユーザーID管理
- **REQ-008**: レスポンシブなユーザー画面設計
- **SEC-001**: パスワードの適切なハッシュ化と検証
- **SEC-002**: JWTトークンの適切な管理とタイムアウト
- **SEC-003**: メールアドレスの重複チェック
- **SEC-004**: ユーザー写真データのアクセス制御
- **CON-001**: 既存のMVP機能に影響を与えない設計
- **CON-002**: 既存のphotosテーブル構造の保持
- **CON-003**: 最小限のUI変更での実装
- **GUD-001**: Server/Client Componentの適切な分離
- **GUD-002**: TypeScript strict modeの使用
- **GUD-003**: 既存のAPI設計パターンの踏襲
- **PAT-001**: RESTful APIパターンの継続

## 2. Implementation Steps

### Implementation Phase 1: データベース設計と基盤構築

- GOAL-001: ユーザーテーブルの作成とデータベース関係の構築

| Task     | Description                               | Completed | Date |
| -------- | ----------------------------------------- | --------- | ---- |
| TASK-001 | Usersテーブルのスキーマ設計と作成         |           |      |
| TASK-002 | photosテーブルへのuser_id外部キー追加     |           |      |
| TASK-003 | db.tsへのユーザー関連関数追加             |           |      |
| TASK-004 | 型定義の更新（User型、更新されたPhoto型） |           |      |
| TASK-005 | データベースマイグレーション実行          |           |      |

### Implementation Phase 2: 認証API実装

- GOAL-002: JWT認証システムの完成

| Task     | Description                                           | Completed | Date |
| -------- | ----------------------------------------------------- | --------- | ---- |
| TASK-006 | /api/auth/register エンドポイント実装                 |           |      |
| TASK-007 | /api/auth/login エンドポイント実装                    |           |      |
| TASK-008 | JWT認証ミドルウェア実装                               |           |      |
| TASK-009 | パスワードハッシュ化・検証ユーティリティ関数実装      |           |      |
| TASK-010 | ユーザー写真一覧API実装（/api/users/[userId]/photos） |           |      |

### Implementation Phase 3: フロントエンド実装

- GOAL-003: ユーザー認証UIとマイフォト画面の実装

| Task     | Description                                | Completed | Date |
| -------- | ------------------------------------------ | --------- | ---- |
| TASK-011 | ユーザー登録画面実装（/register/page.tsx） |           |      |
| TASK-012 | ログイン画面実装（/login/page.tsx）        |           |      |
| TASK-013 | マイフォト画面実装（/my-photos/page.tsx）  |           |      |
| TASK-014 | 認証状態管理のコンテキスト実装             |           |      |
| TASK-015 | localStorage JWTトークン管理実装           |           |      |
| TASK-016 | 既存画面への認証連携（撮影画面など）       |           |      |

### Implementation Phase 4: 統合とテスト

- GOAL-004: システム統合とMVP機能との整合性確保

| Task     | Description                        | Completed | Date |
| -------- | ---------------------------------- | --------- | ---- |
| TASK-017 | 認証状態での写真撮影フロー統合     |           |      |
| TASK-018 | 未認証ユーザーでの既存機能動作確認 |           |      |
| TASK-019 | ユーザー認証フローのE2Eテスト      |           |      |
| TASK-020 | パフォーマンス影響の確認と最適化   |           |      |

## 3. Alternatives

- **ALT-001**: NextAuth.jsを使用した認証（現在は自作JWT認証を選択）
- **ALT-002**: Cookieベースの認証（現在はlocalStorageを選択）
- **ALT-003**: Prismaを使用したユーザー管理（現在は直接SQL操作を継続）
- **ALT-004**: 完全なdevice_id廃止（現在は併存を選択）

## 4. Dependencies

- **DEP-001**: jsonwebtoken（JWT生成・検証）
- **DEP-002**: bcryptjs（パスワードハッシュ化）
- **DEP-003**: @types/jsonwebtoken（TypeScript型定義）
- **DEP-004**: @types/bcryptjs（TypeScript型定義）
- **DEP-005**: 既存のNeon Database接続
- **DEP-006**: UUIDライブラリ（ユーザーID生成）

## 5. Files

- **FILE-001**: `/src/lib/db.ts` - ユーザー関連DB操作関数追加
- **FILE-002**: `/src/lib/auth.ts` - JWT認証・パスワード管理ユーティリティ
- **FILE-003**: `/src/types/index.ts` - User型とUpdated Photo型定義
- **FILE-004**: `/src/app/api/auth/register/route.ts` - ユーザー登録API
- **FILE-005**: `/src/app/api/auth/login/route.ts` - ログインAPI
- **FILE-006**: `/src/app/api/users/[userId]/photos/route.ts` - ユーザー写真一覧API
- **FILE-007**: `/src/app/register/page.tsx` - ユーザー登録画面
- **FILE-008**: `/src/app/login/page.tsx` - ログイン画面
- **FILE-009**: `/src/app/my-photos/page.tsx` - マイフォト画面
- **FILE-010**: `/src/components/AuthContext.tsx` - 認証状態管理コンテキスト
- **FILE-011**: `/src/lib/middleware.ts` - JWT認証ミドルウェア

## 6. Testing

- **TEST-001**: ユーザー登録フローのテスト
- **TEST-002**: ログイン・ログアウトフローのテスト
- **TEST-003**: JWT認証の有効期限テスト
- **TEST-004**: 認証状態での写真撮影テスト
- **TEST-005**: ユーザー写真一覧表示テスト
- **TEST-006**: 未認証ユーザーでの既存機能動作テスト
- **TEST-007**: パスワードハッシュ化・検証テスト
- **TEST-008**: メールアドレス重複チェックテスト

## 7. Risks & Assumptions

- **RISK-001**: localStorage使用によるXSS脆弱性リスク
- **RISK-002**: 既存のdevice_idベースシステムとの整合性問題
- **RISK-003**: JWTトークンの適切な期限管理の複雑さ
- **RISK-004**: 既存ユーザー（device_idのみ）のマイグレーション問題
- **ASSUMPTION-001**: ユーザーは一意のメールアドレスを使用する
- **ASSUMPTION-002**: localStorageが利用可能なブラウザ環境
- **ASSUMPTION-003**: JWTトークンは適切な期限（例：24時間）で管理される
- **ASSUMPTION-004**: 既存のMVP機能は引き続き未認証でも使用可能

## 8. Related Specifications / Further Reading

[JWT.io Documentation](https://jwt.io/introduction)
[bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
[Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
[localStorage Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

# データベーステーブル設計

## 新規テーブル: Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  handle_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_handle_name ON users(handle_name);
```

## 既存テーブル変更: Photos

```sql
-- user_id外部キーカラム追加
ALTER TABLE photos
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- インデックス作成
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_user_created ON photos(user_id, created_at DESC);
```

## テーブル構造詳細

### Users テーブル

| カラム名      | 型                       | 制約                           | 説明                               |
| ------------- | ------------------------ | ------------------------------ | ---------------------------------- |
| id            | UUID                     | PRIMARY KEY, DEFAULT generated | ユーザー固有ID                     |
| email         | VARCHAR(255)             | UNIQUE, NOT NULL               | ログイン用メールアドレス           |
| password_hash | VARCHAR(255)             | NOT NULL                       | bcryptでハッシュ化されたパスワード |
| handle_name   | VARCHAR(100)             | NOT NULL                       | ユーザー表示名                     |
| created_at    | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP      | アカウント作成日時                 |
| updated_at    | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP      | 最終更新日時                       |

### Photos テーブル（変更後）

| カラム名      | 型                       | 制約                             | 説明                           |
| ------------- | ------------------------ | -------------------------------- | ------------------------------ |
| id            | UUID                     | PRIMARY KEY, DEFAULT generated   | 写真固有ID                     |
| device_id     | VARCHAR(255)             | NOT NULL                         | デバイス識別子（既存）         |
| user_id       | UUID                     | FOREIGN KEY REFERENCES users(id) | 撮影ユーザー（新規、NULL許可） |
| image_url     | TEXT                     | NOT NULL                         | Blob Storage URL               |
| created_at    | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP        | 撮影日時                       |
| expires_at    | TIMESTAMP WITH TIME ZONE | NOT NULL                         | 有効期限                       |
| is_received   | BOOLEAN                  | DEFAULT FALSE                    | 受け取り済みフラグ             |
| receiver_name | VARCHAR(100)             | NULL                             | 受け取り者名                   |
| received_at   | TIMESTAMP WITH TIME ZONE | NULL                             | 受け取り日時                   |
| location      | JSONB                    | NULL                             | 位置情報                       |

## データ関係性

- **users** 1 : N **photos** (user_id外部キー)
- 既存のdevice_idベースの機能は維持（user_idがNULLの場合）
- 認証ユーザーの場合、user_idが設定される
- 未認証ユーザーの場合、user_idはNULLでdevice_idのみ使用

## マイグレーション戦略

1. **Phase 1**: usersテーブル作成
2. **Phase 2**: photosテーブルにuser_idカラム追加（NULL許可）
3. **Phase 3**: インデックス作成
4. **Phase 4**: アプリケーションコード更新
5. **Phase 5**: 既存データの整合性確認

この設計により、既存のMVP機能を壊すことなく、段階的にユーザー機能を追加できます。
