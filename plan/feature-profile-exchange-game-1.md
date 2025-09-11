---
goal: 現像画面にプロフィール交換ゲーム機能を追加し、5つのレベル別質問システムを実装
version: 1.0
date_created: 2025-09-11
last_updated: 2025-09-11
owner: Development Team
status: "Planned"
tags: ["feature", "ui", "game", "social"]
---

# プロフィール交換ゲーム機能実装計画

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

現像画面に質問システムを統合し、ユーザー同士のプロフィール交換を促進するゲーム機能を実装します。現像プロセス中に5つのレベル別質問が順次表示され、ユーザーエンゲージメントを向上させます。

## 1. Requirements & Constraints

- **REQ-001**: 現像画面の既存UIレイアウトを維持しながら質問システムを統合
- **REQ-002**: 5つのレベルから各1問ずつランダムに選択された質問を表示
- **REQ-003**: 画面上部に質問テキスト、下部に「次の質問」ボタンを配置
- **REQ-004**: 現像プログレス（30秒）に合わせて質問の進行を調整
- **REQ-005**: 質問データの型安全性を確保（TypeScript）
- **REQ-006**: レスポンシブデザインでモバイル最適化
- **SEC-001**: 質問データのクライアント側管理（外部API不要）
- **CON-001**: 現像プロセスの既存タイミング（30秒）を変更しない
- **CON-002**: 既存のプログレスバーとアニメーションを維持
- **GUD-001**: 質問レベルの段階的難易度設計を遵守
- **PAT-001**: React hooks pattern による状態管理を採用

## 2. Implementation Steps

### Implementation Phase 1: データ構造とタイプ定義

- GOAL-001: 質問システムの基盤となるデータ構造とTypeScript型定義を実装

| Task     | Description                              | Completed | Date       |
| -------- | ---------------------------------------- | --------- | ---------- |
| TASK-001 | 質問データ型（Question interface）の定義 | ✅        | 2025-09-11 |
| TASK-002 | レベル別質問データの定数定義（50問分）   | ✅        | 2025-09-11 |
| TASK-003 | 質問選択ロジック用のutility関数作成      | ✅        | 2025-09-11 |
| TASK-004 | ゲーム状態管理用のinterface定義          | ✅        | 2025-09-11 |

### Implementation Phase 2: 質問管理システム実装

- GOAL-002: ランダム質問選択とゲーム進行ロジックを実装

| Task     | Description                                  | Completed | Date       |
| -------- | -------------------------------------------- | --------- | ---------- |
| TASK-005 | 5レベルから各1問選択するランダム関数実装     | ✅        | 2025-09-11 |
| TASK-006 | 質問進行状態を管理するカスタムhook作成       | ✅        | 2025-09-11 |
| TASK-007 | 現像プログレスと質問タイミングの同期ロジック | ✅        | 2025-09-11 |
| TASK-008 | 質問完了判定とリセット機能実装               | ✅        | 2025-09-11 |

### Implementation Phase 3: UI コンポーネント実装

- GOAL-003: 質問表示とインタラクション用UIコンポーネントを実装

| Task     | Description                                            | Completed | Date       |
| -------- | ------------------------------------------------------ | --------- | ---------- |
| TASK-009 | 質問表示コンポーネント（QuestionDisplay）作成          | ✅        | 2025-09-11 |
| TASK-010 | 次の質問ボタンコンポーネント（NextQuestionButton）作成 | ✅        | 2025-09-11 |
| TASK-011 | 質問レベルインジケーター実装                           | ✅        | 2025-09-11 |
| TASK-012 | アニメーション効果とトランジション追加                 | ✅        | 2025-09-11 |

### Implementation Phase 4: 既存画面統合

- GOAL-004: develop/[id]/page.tsx に質問システムを統合

| Task     | Description                            | Completed | Date       |
| -------- | -------------------------------------- | --------- | ---------- |
| TASK-013 | 既存のdevelop画面レイアウト調整        | ✅        | 2025-09-11 |
| TASK-014 | 質問システムの条件付き表示ロジック追加 | ✅        | 2025-09-11 |
| TASK-015 | 現像プログレスと質問進行の統合         | ✅        | 2025-09-11 |
| TASK-016 | エラーハンドリングと例外処理実装       | ✅        | 2025-09-11 |

### Implementation Phase 5: スタイリングと最適化

- GOAL-005: Tailwind CSSを使用したレスポンシブデザインと最適化

| Task     | Description                                  | Completed | Date |
| -------- | -------------------------------------------- | --------- | ---- |
| TASK-017 | モバイルファーストのレスポンシブデザイン実装 |           |      |
| TASK-018 | ダークモード対応（必要に応じて）             |           |      |
| TASK-019 | アクセシビリティ対応（ARIA属性等）           |           |      |
| TASK-020 | パフォーマンス最適化とメモ化                 |           |      |

## 3. Alternatives

- **ALT-001**: API経由での質問データ管理 - 複雑性増加のため静的データを選択
- **ALT-002**: 現像時間の変更 - 既存UXへの影響を避けるため現状維持
- **ALT-003**: 質問数の増減 - 5問が現像時間（30秒）に最適と判断
- **ALT-004**: リアルタイム質問共有 - MVP段階では複雑すぎるため将来実装

## 4. Dependencies

- **DEP-001**: React 18+ (useState, useEffect, useCallback hooks)
- **DEP-002**: Next.js App Router structure
- **DEP-003**: TypeScript strict mode compatibility
- **DEP-004**: Tailwind CSS for styling
- **DEP-005**: 既存のui/button, ui/card components

## 5. Files

- **FILE-001**: `/src/types/game.ts` - 質問とゲーム状態の型定義
- **FILE-002**: `/src/lib/questions.ts` - 50問の質問データと選択ロジック
- **FILE-003**: `/src/hooks/useProfileGame.ts` - 質問ゲーム状態管理hook
- **FILE-004**: `/src/components/game/QuestionDisplay.tsx` - 質問表示コンポーネント
- **FILE-005**: `/src/components/game/NextQuestionButton.tsx` - 次の質問ボタン
- **FILE-006**: `/src/app/develop/[id]/page.tsx` - 既存ページの修正（統合）

## 6. Testing

- **TEST-001**: 質問ランダム選択ロジックの単体テスト
- **TEST-002**: 5レベル各1問選択の検証テスト
- **TEST-003**: 現像プログレスと質問タイミング同期テスト
- **TEST-004**: レスポンシブデザインのビジュアルテスト
- **TEST-005**: アクセシビリティ準拠テスト
- **TEST-006**: エラー境界とエラーハンドリングテスト

## 7. Risks & Assumptions

- **RISK-001**: 質問表示が現像アニメーションの視覚的邪魔になる可能性
- **RISK-002**: モバイル画面での質問テキストの可読性問題
- **RISK-003**: 30秒間での5問進行がユーザーにとって急ぎすぎる可能性
- **ASSUMPTION-001**: ユーザーは現像中に質問に集中できる
- **ASSUMPTION-002**: 5レベル各1問の構成が適切なバランス
- **ASSUMPTION-003**: 静的質問データで十分なバリエーション

## 8. Related Specifications / Further Reading

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [TypeScript Interface Guidelines](https://www.typescriptlang.org/docs/handbook/interfaces.html)
