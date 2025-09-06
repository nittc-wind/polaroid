import "@/app/globals.css";
import type { Metadata } from "next";
import Link from "next/link";

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
        <header className="text-[#fff] bg-[#603636]">
          <Link href="/">ともだちチェキ</Link>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2024 ともだちチェキ</p>
          <Link href="/receive/sample-id">開発用</Link>
          <Link href="/develop/sample-id">開発用2</Link>
          <Link href="/complete/sample-id">開発用3</Link>
        </footer>
      </body>
    </html>
  );
}
