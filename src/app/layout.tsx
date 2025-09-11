import "@/app/globals.css";
import type { Metadata } from "next";
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
      <body className="min-h-screen flex flex-col">
        <Providers>
          <main className="flex-1">{children}</main>
          <footer className="bg-[#dfc7c7] border-t p-4 text-center text-sm text-gray-600">
            <p>&copy; 2025 ともだちチェキ</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
