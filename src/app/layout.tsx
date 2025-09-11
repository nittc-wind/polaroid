import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import PWAProvider from "@/components/PWAProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const metadata: Metadata = {
  title: {
    default: "Polaroid - 思い出をシェア",
    template: "%s | Polaroid",
  },
  description: "フィルムカメラ風写真アプリで思い出をシェアしよう",
  keywords: ["写真", "カメラ", "フィルム", "思い出", "シェア", "PWA"],
  authors: [{ name: "Polaroid Team" }],
  creator: "Polaroid Team",
  publisher: "Polaroid Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Polaroid",
  },
  openGraph: {
    type: "website",
    siteName: "Polaroid",
    title: "Polaroid - 思い出をシェア",
    description: "フィルムカメラ風写真アプリで思い出をシェアしよう",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Polaroid",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Polaroid - 思い出をシェア",
    description: "フィルムカメラ風写真アプリで思い出をシェアしよう",
    images: ["/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152" },
      { url: "/icon-192x192.png", sizes: "192x192" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Polaroid" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <PWAProvider />
        <Providers>
          <main>{children}</main>
          <footer className="border-t p-4 text-center text-sm text-gray-600">
            <p>&copy; 2024 Polaroid</p>
            <div className="mt-2 space-x-4">
              <Link href="/receive/sample-id" className="hover:underline">
                開発用
              </Link>
              <Link href="/develop/sample-id" className="hover:underline">
                開発用2
              </Link>
              <Link href="/complete/sample-id" className="hover:underline">
                開発用3
              </Link>
            </div>
          </footer>
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
