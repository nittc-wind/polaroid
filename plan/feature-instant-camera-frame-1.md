---
goal: インスタントカメラ風の白枠を写真ファイル自体に埋め込む機能の実装
version: 1.0
date_created: 2025-09-13
last_updated: 2025-09-13
owner: Development Team
status: "In progress"
tags: ["feature", "camera", "image-processing", "ui-enhancement"]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

カメラで撮影した写真に、インスタントカメラ（チェキ）風の白枠を画像ファイル自体に埋め込む機能を実装します。現在はCSSで視覚的に枠を表現していますが、実際の画像データに白枠を描画してからアップロードすることで、保存される写真自体がインスタントカメラ風になります。

## 1. Requirements & Constraints

- **REQ-001**: 撮影した写真の上部に画像高さの5%の白枠を追加
- **REQ-002**: 撮影した写真の左右にそれぞれ画像幅の5%の白枠を追加
- **REQ-003**: 撮影した写真の下部に画像高さの10%の白枠を追加
- **REQ-004**: 白枠は画像データに直接描画し、アップロード前に処理完了
- **REQ-005**: 既存のカメラ撮影フローを維持し、ユーザー体験を損なわない
- **SEC-001**: 画像処理はクライアントサイドで実行し、サーバー負荷を軽減
- **PER-001**: 画像処理時間を最小限に抑え、アップロード体験を向上
- **CON-001**: Canvas APIを使用してブラウザ互換性を確保
- **GUD-001**: Next.js App Router の Client Component パターンに従う
- **PAT-001**: TypeScript の型安全性を保持した実装

## 2. Implementation Steps

### Implementation Phase 1: 画像処理関数の実装

- GOAL-001: Canvas APIを使用したインスタントカメラ風枠描画機能の実装

| Task     | Description                                                  | Completed | Date       |
| -------- | ------------------------------------------------------------ | --------- | ---------- |
| TASK-001 | `lib/image-processing.ts` に画像処理ユーティリティ関数を作成 | ✅        | 2025-09-13 |
| TASK-002 | `addInstantCameraFrame` 関数を実装（Canvas APIベース）       | ✅        | 2025-09-13 |
| TASK-003 | 枠サイズ計算ロジックの実装（上5%, 左右5%, 下10%）            | ✅        | 2025-09-13 |
| TASK-004 | 画像品質とファイルサイズの最適化設定                         | ✅        | 2025-09-13 |

### Implementation Phase 2: カメラページの更新

- GOAL-002: 既存のカメラ撮影フローに画像処理機能を統合

| Task     | Description                                            | Completed | Date       |
| -------- | ------------------------------------------------------ | --------- | ---------- |
| TASK-005 | `src/app/camera/page.tsx` の capture 関数を更新        | ✅        | 2025-09-13 |
| TASK-006 | Canvas で撮影画像を取得後、枠描画処理を追加            | ✅        | 2025-09-13 |
| TASK-007 | プログレス表示の更新（"枠を追加中..." ステップを追加） | ✅        | 2025-09-13 |
| TASK-008 | エラーハンドリングの強化（画像処理失敗時の対応）       | ✅        | 2025-09-13 |

### Implementation Phase 3: TypeScript型定義とテスト

- GOAL-003: 型安全性の確保とテスト実装

| Task     | Description                                    | Completed | Date       |
| -------- | ---------------------------------------------- | --------- | ---------- |
| TASK-009 | 画像処理関連の型定義を `types/index.ts` に追加 | ✅        | 2025-09-13 |
| TASK-010 | 画像処理関数の単体テスト実装                   | 🔄        | 2025-09-13 |
| TASK-011 | カメラページの統合テスト更新                   |           |            |
| TASK-012 | 画像処理パフォーマンステスト                   |           |            |

## 3. Alternatives

- **ALT-001**: サーバーサイドでの画像処理 → クライアントサイド処理を選択（REQ-006に基づく）
- **ALT-002**: CSS Overlayでの枠表現継続 → 実際の画像データ埋め込みを選択（要件に基づく）
- **ALT-003**: WebGL使用による高速処理 → Canvas API使用を選択（シンプルさと互換性重視）

## 4. Dependencies

- **DEP-001**: HTML5 Canvas API（ブラウザ標準、追加依存なし）
- **DEP-002**: 既存の `useRef<HTMLCanvasElement>` 実装
- **DEP-003**: 現在の撮影フロー（`capture` 関数）

## 5. Files

- **FILE-001**: `src/lib/image-processing.ts` - 新規作成、画像処理ユーティリティ
- **FILE-002**: `src/app/camera/page.tsx` - 既存ファイル更新、capture関数の修正
- **FILE-003**: `src/types/index.ts` - 既存ファイル更新、画像処理型定義追加
- **FILE-004**: `src/lib/__tests__/image-processing.test.ts` - 新規作成、テストファイル

## 6. Testing

- **TEST-001**: 画像処理関数の単体テスト（枠サイズ、位置の正確性）
- **TEST-002**: 異なる画像サイズでの枠描画テスト
- **TEST-003**: 画像品質劣化のないことを確認するテスト
- **TEST-004**: メモリリークがないことを確認するパフォーマンステスト
- **TEST-005**: エラーケース（Canvas初期化失敗等）のテスト

## 7. Risks & Assumptions

- **RISK-001**: 大きな画像での処理時間増加 → 適切なプログレス表示で対応
- **RISK-002**: モバイルデバイスでのメモリ不足 → 画像サイズ制限と適切なメモリ管理
- **ASSUMPTION-001**: ユーザーはインスタントカメラ風の見た目を期待している
- **ASSUMPTION-002**: 現在のCanvas実装が正常に動作している

## 8. Related Specifications / Further Reading

- [HTML5 Canvas API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Image Data Processing Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
- [Canvas Performance Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
