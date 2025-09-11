# PWA Implementation Guide

## 実装済み機能

### 1. Web App Manifest (`src/app/manifest.ts`)

- アプリ名、アイコン、スタート URL などの基本情報
- スタンドアロン表示モード
- ショートカット機能
- 日本語対応

### 2. Service Worker (`public/sw.js`)

- 基本的なキャッシング戦略
- オフライン対応
- プッシュ通知の基盤
- バックグラウンド同期の基盤

### 3. PWA Components

- `PWAProvider`: Service Workerの登録と管理
- `PWAInstallPrompt`: インストールプロンプトの表示

### 4. オフラインページ (`src/app/offline/page.tsx`)

- ネットワーク切断時の表示

## 必要な作業

### 1. アイコンファイルの作成

以下のサイズのPNGファイルを `public/` に配置してください：

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `favicon.ico`

推奨ツール:

- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)

### 2. HTTPS対応

PWAの多くの機能（Service Worker、プッシュ通知等）にはHTTPS接続が必要です。
本番環境では必ずHTTPS証明書を設定してください。

### 3. プッシュ通知（オプション）

プッシュ通知を実装する場合は、VAPID鍵の生成が必要です：

```bash
npm install -g web-push
web-push generate-vapid-keys
```

生成された鍵を環境変数として設定：

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

## PWA要件の確認

### Lighthouse PWA監査

以下のコマンドでPWA要件を確認できます：

```bash
npm run build
npm run start
# ブラウザでLighthouseのPWA監査を実行
```

### 主要チェックポイント

- ✅ Web App Manifest
- ✅ Service Worker登録
- ✅ HTTPS接続（本番環境）
- ⚠️ アイコンファイル（要作成）
- ✅ オフライン対応
- ✅ レスポンシブデザイン

## ブラウザサポート

### Desktop

- Chrome 67+
- Edge 79+
- Firefox 58+
- Safari 11.1+

### Mobile

- Chrome for Android 67+
- Samsung Internet 7.4+
- Safari on iOS 11.3+

## デバッグ

### Service Worker

- Chrome DevTools > Application > Service Workers
- `chrome://serviceworker-internals/`

### Web App Manifest

- Chrome DevTools > Application > Manifest

### Push Notifications

- Chrome DevTools > Application > Push Messaging

## 参考リンク

- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
