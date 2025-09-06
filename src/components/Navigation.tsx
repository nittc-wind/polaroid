"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4">
      <Link href="/" className="text-lg font-bold">
        ともだちチェキ
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm">
              こんにちは、{user?.handle_name || user?.name}さん
            </span>
            <Link href="/camera">
              <Button variant="outline" size="sm">
                撮影
              </Button>
            </Link>
            <Link href="/photos">
              <Button variant="outline" size="sm">
                マイフォト
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                設定
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              ログアウト
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">新規登録</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
