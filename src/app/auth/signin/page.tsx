"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const shouldClaim = searchParams.get("claim") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        action: "login",
        redirect: false,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else if (result?.ok) {
        // ログイン成功時の処理
        if (returnUrl) {
          // リダイレクト先が指定されている場合
          const redirectUrl = shouldClaim
            ? `${returnUrl}?claim=true`
            : returnUrl;
          window.location.href = redirectUrl;
        } else {
          // デフォルトはホーム画面にリダイレクト
          window.location.href = "/";
        }
      }
    } catch (error) {
      setError("ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-6 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-6 text-center">
            <CardTitle className="text-[#331515] text-xl font-medium mb-2">
              ともだちチェキ
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              ともだちを集めよう
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#0a0a0a] mb-2"
                >
                  メールアドレス
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full border-[#e5e5e5] focus:border-[#603736] focus:ring-[#603736]"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0a0a0a] mb-2"
                >
                  パスワード
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-[#e5e5e5] focus:border-[#603736] focus:ring-[#603736]"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-[#603736] hover:bg-[#331515] text-white py-3 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "ログイン中..." : "ログイン"}
                </Button>

                <div className="text-center">
                  <span className="text-[#737373] text-sm">
                    アカウントをお持ちでない方は{" "}
                  </span>
                  <Link
                    href={`/auth/signup${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}${shouldClaim ? "&claim=true" : ""}` : ""}`}
                    className="text-[#603736] hover:text-[#331515] text-sm font-medium hover:underline"
                  >
                    新規登録
                  </Link>
                </div>

                <Button variant="ghost" className="w-full py-2" asChild>
                  <Link
                    href="/"
                    className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                  >
                    ホームに戻る
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
