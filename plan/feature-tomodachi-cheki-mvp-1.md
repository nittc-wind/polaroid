---
goal: ともだちチェキMVP完成実装計画 - セルフィー撮影からチェキ風現像まで
version: 1.0
date_created: 2025-09-05
last_updated: 2025-09-05
owner: 2名体制開発チーム
status: "Planned"
tags: ["feature", "mvp", "camera", "qr", "photo-sharing", "ui/ux"]
---

# ともだちチェキMVP完成実装計画

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

この実装計画は「ともだちチェキ」サービスのMVP（Minimum Viable Product）を2025年9月8日(日)までに完成させることを目標とした包括的な開発プランです。名刺交換時の顔と名前の不一致問題を解決する、セルフィー撮影・QR共有・チェキ風現像機能を実装します。

## 1. Requirements & Constraints

- **REQ-001**: セルフィー撮影機能（フロントカメラ使用）
- **REQ-002**: QRコード生成・読み取り機能
- **REQ-003**: 名前・位置情報入力フォーム
- **REQ-004**: 1分間のチェキ風現像エフェクト
- **REQ-005**: 写真受け取り・日時場所でのグルーピング表示
- **REQ-006**: レスポンシブデザイン（モバイルファーストUI）
- **REQ-007**: 24時間自動削除機能
- **REQ-008**: 将来的なユーザー登録・ログイン機能への拡張性
- **SEC-001**: 写真データの安全な保存（Vercel Blob Storage）
- **SEC-002**: QRコード有効期限（30分）
- **SEC-003**: 位置情報の適切な取り扱い
- **CON-001**: 開発期間: 2024/9/2(月) - 9/12(木) (2週間)
- **CON-002**: MVP完成目標: 9/8(日)
- **CON-003**: 2名体制での開発
- **GUD-001**: Next.js 15 App Routerアーキテクチャの採用
- **GUD-002**: TypeScript strict modeの使用
- **GUD-003**: Tailwind CSS v4の活用
- **PAT-001**: Server/Client Componentの適切な分離

## 2. Implementation Steps

### Implementation Phase 1: コア機能実装

- GOAL-001: カメラ機能とAPI基盤の完成

| Task     | Description                                              | Completed | Date     |
| -------- | -------------------------------------------------------- | --------- | -------- |
| TASK-001 | カメラコンポーネントのUI改善（セルフィーモード対応）     |           |          |
| TASK-002 | 写真撮影後のAPI連携完成（/api/photos POST）              | ✅        | 現在完了 |
| TASK-003 | QR表示画面でのクライアントサイドQR生成実装               |           |          |
| TASK-004 | 写真受け取りAPI実装（/api/photos/[id]/receive/route.ts） |           |          |
| TASK-005 | データベーススキーマの最終調整                           |           |          |
| TASK-006 | 位置情報取得機能の実装                                   |           |          |

### Implementation Phase 2: UI/UX完成

- GOAL-002: ユーザー体験の完成とチェキ風エフェクト実装

| Task     | Description                                           | Completed | Date |
| -------- | ----------------------------------------------------- | --------- | ---- |
| TASK-007 | QR表示画面の完成（/qr/[id]/page.tsx）                 |           |      |
| TASK-008 | 情報入力フォームの完成（/receive/[id]/page.tsx）      |           |      |
| TASK-009 | チェキ風現像エフェクト実装（/develop/[id]/page.tsx）  |           |      |
| TASK-010 | 完了画面のチェキ風デザイン（/complete/[id]/page.tsx） |           |      |
| TASK-011 | 写真一覧のグルーピング表示（/photos/page.tsx）        |           |      |
| TASK-012 | 全画面のモバイル最適化                                |           |      |

### Implementation Phase 3: システム統合とテスト

- GOAL-003: システム全体の統合とMVP完成

| Task     | Description               | Completed | Date |
| -------- | ------------------------- | --------- | ---- |
| TASK-013 | エラーハンドリングの実装  |           |      |
| TASK-014 | 24時間自動削除機能の実装  |           |      |
| TASK-015 | 環境変数とデプロイ設定    |           |      |
| TASK-016 | ユーザーフローのE2Eテスト |           |      |
| TASK-017 | パフォーマンス最適化      |           |      |

## 3. Alternatives

- **ALT-001**: Prismaを使用したデータベース管理（現在はNeon SQLを直接使用）
- **ALT-002**: PWA（Progressive Web App）としての実装（現在は通常のWebアプリ）
- **ALT-003**: リアルタイム通知機能（WebSocketsまたはServer-Sent Events）

## 4. Dependencies

- **DEP-001**: Vercel Blob Storage（写真保存）
- **DEP-002**: Neon Database（PostgreSQL）
- **DEP-003**: QRコード生成ライブラリ（qrcode）
- **DEP-004**: UUID生成ライブラリ（uuid）
- **DEP-005**: Geolocation API（位置情報取得）
- **DEP-006**: MediaDevices API（カメラアクセス）

## 5. Files

- **FILE-001**: `/src/app/camera/page.tsx` - カメラ撮影画面（既存・改善必要）
- **FILE-002**: `/src/app/qr/[id]/page.tsx` - QR表示画面（既存・機能実装必要）
- **FILE-003**: `/src/app/receive/[id]/page.tsx` - 情報入力画面（既存・API連携必要）
- **FILE-004**: `/src/app/develop/[id]/page.tsx` - 現像画面（既存・エフェクト改善必要）
- **FILE-005**: `/src/app/complete/[id]/page.tsx` - 完了画面（既存・チェキ風デザイン必要）
- **FILE-006**: `/src/app/photos/page.tsx` - 写真一覧画面（既存・実際のデータ表示必要）
- **FILE-007**: `/src/app/api/photos/[id]/route.ts` - 写真取得API（未実装）
- **FILE-008**: `/src/app/api/photos/[id]/receive/route.ts` - 写真受け取りAPI（未実装）
- **FILE-009**: `/src/app/api/users/[userId]/photos/route.ts` - ユーザー写真一覧API（将来実装）
- **FILE-010**: `/src/lib/db.ts` - データベース操作（既存・機能追加必要）
- **FILE-011**: `/src/types/index.ts` - 型定義（既存・完成）

## 6. Testing

- **TEST-001**: カメラ撮影からQR生成までのフロー
- **TEST-002**: 標準カメラアプリでのQRコード読み取りから情報入力までのフロー
- **TEST-003**: 現像エフェクトの動作確認
- **TEST-004**: 写真一覧表示とグルーピング機能
- **TEST-005**: 24時間後の自動削除機能
- **TEST-006**: モバイルデバイスでの動作確認
- **TEST-007**: 位置情報取得の許可・拒否パターン

## 7. Risks & Assumptions

- **RISK-001**: カメラ機能のブラウザ互換性問題（特にiOS Safari）
- **RISK-002**: 位置情報取得の権限問題
- **RISK-003**: Vercel Blob Storageの容量制限
- **ASSUMPTION-001**: ユーザーはモバイルデバイスでアクセスする
- **ASSUMPTION-002**: イベント会場でのネットワーク環境は安定している
- **ASSUMPTION-003**: ユーザーはカメラと位置情報の使用を許可する
- **ASSUMPTION-004**: 受け取り側ユーザーは標準カメラアプリでQRコードを読み取る

## 8. Related Specifications / Further Reading

[Next.js App Router Documentation](https://nextjs.org/docs/app)
[Vercel Blob Storage Documentation](https://vercel.com/docs/storage/vercel-blob)
[MediaDevices API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
[Geolocation API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
