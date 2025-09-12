import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { Kiwi_Maru } from "next/font/google";

const kiwiMaru = Kiwi_Maru({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kiwi-maru",
});

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
    <html lang="ja" className={kiwiMaru.variable}>
      <head>
        <meta name="apple-mobile-web-app-title" content="ともだちチェキ" />
      </head>
      <body className="h-screen overflow-hidden flex flex-col font-kiwi-maru">
        <Providers>
          <main className="flex-1 overflow-auto">{children}</main>
          <footer className="flex-shrink-0 bg-[#dfc7c7] border-t p-4 text-center text-sm text-gray-600">
            <p>&copy; 2025 ともだちチェキ</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
