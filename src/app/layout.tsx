import "@/app/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ともだちチェキ",
  description: "出会いを特別な思い出に",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <main>{children}</main>
          <footer className="border-t p-4 text-center text-sm text-gray-600">
            <p>&copy; 2024 ともだちチェキ</p>
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
        </Providers>
      </body>
    </html>
  );
}
