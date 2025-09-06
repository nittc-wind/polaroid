"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        // 登録成功時、カメラページにリダイレクト
        window.location.href = "/camera";
      }
    } catch (error) {
      setError("登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="handle_name"
                className="block text-sm font-medium mb-1"
              >
                ハンドル名
              </label>
              <Input
                id="handle_name"
                type="text"
                value={handleName}
                onChange={(e) => setHandleName(e.target.value)}
                required
                disabled={isLoading}
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                パスワード (6文字以上)
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登録中..." : "新規登録"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span>既にアカウントをお持ちの方は </span>
            <a href="/auth/signin" className="text-blue-600 hover:underline">
              ログイン
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
