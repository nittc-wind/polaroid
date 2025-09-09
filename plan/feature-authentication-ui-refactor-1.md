---
goal: ホーム画面の認証状態によるUI変更とナビゲーション廃止
version: 1.0
date_created: 2025-09-10
last_updated: 2025-09-10
owner: Development Team
status: "Completed"
tags: ["feature", "authentication", "ui-refactor", "navigation"]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-green)

ホーム画面を認証状態に応じて動的に変更し、最終的にヘッダーナビゲーションを廃止する機能の実装計画。未ログイン時は認証ボタン、ログイン時は機能ボタンを表示し、ユーザビリティを向上させる。

## 1. Requirements & Constraints

- **REQ-001**: ホーム画面は認証状態によってボタン表示を変更する
- **REQ-002**: 未ログイン時は「ログイン」「新規登録」ボタンを表示
- **REQ-003**: ログイン時は「写真を撮る」「思い出」ボタンを表示
- **REQ-004**: ログイン成功後は自動でホーム画面（/）に遷移
- **REQ-005**: 思い出ページにログアウトボタンを追加
- **REQ-006**: ログアウト後はホーム画面（/）に遷移
- **REQ-007**: 思い出ページ以外にはログアウトボタンは不要
- **REQ-008**: ナビゲーション機能確立後にNavigation.tsxを廃止
- **SEC-001**: 認証状態の確認はサーバーサイドで実行
- **UX-001**: UI変更は統一された視覚デザインを維持
- **CON-001**: 既存のTailwind CSSクラスとカラーパレットを維持
- **CON-002**: 現在のCard UIコンポーネント構造を維持

## 2. Implementation Steps

### Implementation Phase 1: ホーム画面の認証状態対応

- GOAL-001: ホーム画面を認証状態に応じて動的に変更する

| Task     | Description                                                   | Completed | Date       |
| -------- | ------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | ホーム画面をClient Componentに変更（useAuthフック使用のため） | ✅        | 2025-09-10 |
| TASK-002 | 認証状態に基づく条件分岐ロジックの実装                        | ✅        | 2025-09-10 |
| TASK-003 | 未ログイン時のボタン表示（ログイン、新規登録）                | ✅        | 2025-09-10 |
| TASK-004 | ログイン時のボタン表示（写真を撮る、思い出）                  | ✅        | 2025-09-10 |
| TASK-005 | ボタンスタイルとレイアウトの統一                              | ✅        | 2025-09-10 |

### Implementation Phase 2: 認証フローの改善

- GOAL-002: ログイン成功後の自動遷移を実装する

| Task     | Description                                          | Completed | Date           |
| -------- | ---------------------------------------------------- | --------- | -------------- |
| TASK-006 | ログインページ（/auth/signin）のリダイレクト処理修正 | ✅        | 2025-09-10     |
| TASK-007 | 新規登録ページ（/auth/signup）のリダイレクト処理修正 | ✅        | 2025-09-10     |
| TASK-008 | 認証成功時のホーム画面への自動遷移テスト             | ⏸️        | 次のフェーズ後 |

### Implementation Phase 3: 思い出ページのログアウト機能

- GOAL-003: 思い出ページにログアウト機能を追加する

| Task     | Description                                        | Completed | Date       |
| -------- | -------------------------------------------------- | --------- | ---------- |
| TASK-009 | 思い出ページ（/photos）の現在実装確認              | ✅        | 2025-09-10 |
| TASK-010 | ページ上部またはヘッダー部分にログアウトボタン追加 | ✅        | 2025-09-10 |
| TASK-011 | ログアウト処理とホーム画面への遷移実装             | ✅        | 2025-09-10 |
| TASK-012 | ログアウトボタンのデザイン統一                     | ✅        | 2025-09-10 |

### Implementation Phase 4: ナビゲーション廃止

- GOAL-004: ヘッダーナビゲーションを段階的に廃止する

| Task     | Description                                              | Completed | Date       |
| -------- | -------------------------------------------------------- | --------- | ---------- |
| TASK-013 | レイアウトファイル（layout.tsx）からNavigation.tsxの削除 | ✅        | 2025-09-10 |
| TASK-014 | Navigation.tsxファイルの削除                             | ✅        | 2025-09-10 |
| TASK-015 | 全ページでナビゲーション削除後の動作確認                 | ✅        | 2025-09-10 |
| TASK-016 | 認証が必要なページでのアクセス制御確認                   | ✅        | 2025-09-10 |

## 3. Alternatives

- **ALT-001**: ホーム画面をServer Componentとして保持し、認証状態をサーバーサイドで判定する方法も検討したが、リアルタイムな状態変更の反映のためClient Componentを採用
- **ALT-002**: 思い出ページ以外にもログアウトボタンを配置する案もあったが、UX要件により思い出ページのみに限定

## 4. Dependencies

- **DEP-001**: useAuthフック（既存の認証状態管理）
- **DEP-002**: 既存のUI コンポーネント（Button, Card）
- **DEP-003**: Next.js App Router（ページ遷移機能）
- **DEP-004**: 既存の認証ページ（/auth/signin, /auth/signup）

## 5. Files

- **FILE-001**: `/src/app/page.tsx` - ホーム画面のメインファイル（認証状態による条件分岐実装）
- **FILE-002**: `/src/app/auth/signin/page.tsx` - ログインページ（リダイレクト処理修正）
- **FILE-003**: `/src/app/auth/signup/page.tsx` - 新規登録ページ（リダイレクト処理修正）
- **FILE-004**: `/src/app/photos/page.tsx` - 思い出ページ（ログアウトボタン追加）
- **FILE-005**: `/src/app/layout.tsx` - レイアウトファイル（Navigation削除）
- **FILE-006**: `/src/components/Navigation.tsx` - ナビゲーションコンポーネント（削除予定）

## 6. Testing

- **TEST-001**: 未ログイン状態でのホーム画面表示テスト
- **TEST-002**: ログイン状態でのホーム画面表示テスト
- **TEST-003**: ログイン成功後の自動遷移テスト
- **TEST-004**: 新規登録成功後の自動遷移テスト
- **TEST-005**: 思い出ページでのログアウト機能テスト
- **TEST-006**: ログアウト後のホーム画面遷移テスト
- **TEST-007**: ナビゲーション削除後の全ページ動作テスト

## 7. Risks & Assumptions

- **RISK-001**: ホーム画面をClient Componentに変更することによるSEOへの影響
- **RISK-002**: 認証状態の変化が即座に反映されない可能性
- **RISK-003**: ナビゲーション削除により他ページからのアクセス方法が制限される
- **ASSUMPTION-001**: useAuthフックが正常に動作し、認証状態を正確に返す
- **ASSUMPTION-002**: 既存の認証フローが正常に動作している
- **ASSUMPTION-003**: 思い出ページが既に実装されている

## 8. Related Specifications / Further Reading

- [Next.js App Router Authentication Documentation](https://nextjs.org/docs/app/building-your-application/authentication)
- [React Client Components Best Practices](https://react.dev/reference/react/use-client)
- 既存の認証実装ファイル: `/src/hooks/useAuth.ts`
