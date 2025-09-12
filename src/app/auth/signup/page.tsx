"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
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

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handleName, setHandleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 基本的なバリデーション
    if (password.length < 6) {
      setError("パスワードは6文字以上である必要があります");
      setIsLoading(false);
      return;
    }

    if (handleName.length < 1) {
      setError("ハンドル名を入力してください");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        handle_name: handleName,
        action: "register",
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("既に登録")) {
          setError("このメールアドレスは既に登録されています");
        } else {
          setError("登録に失敗しました");
        }
      } else if (result?.ok) {
        // 登録成功時、ホーム画面にリダイレクト
        window.location.href = "/";
      }
    } catch (error) {
      setError("登録に失敗しました");
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
              ようこそ！
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
                  htmlFor="handle_name"
                  className="block text-sm font-medium text-[#0a0a0a] mb-2"
                >
                  ハンドル名
                </label>
                <Input
                  id="handle_name"
                  type="text"
                  value={handleName}
                  onChange={(e) => setHandleName(e.target.value)}
                  placeholder="山田太郎"
                  className="w-full border-[#e5e5e5] focus:border-[#603736] focus:ring-[#603736]"
                  required
                  disabled={isLoading}
                  maxLength={100}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0a0a0a] mb-2"
                >
                  パスワード（6文字以上）
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
                  minLength={6}
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
                  {isLoading ? "登録中..." : "新規登録"}
                </Button>

                <div className="text-center">
                  <span className="text-[#737373] text-sm">
                    既にアカウントをお持ちの方は{" "}
                  </span>
                  <Link
                    href="/auth/signin"
                    className="text-[#603736] hover:text-[#331515] text-sm font-medium hover:underline"
                  >
                    ログイン
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
