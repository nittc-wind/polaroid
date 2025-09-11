"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      alert("ユーザーIDを入力してください");
      return;
    }

    if (!nickname.trim()) {
      alert("ニックネームを入力してください");
      return;
    }

    if (!password.trim()) {
      alert("パスワードを入力してください");
      return;
    }

    setIsLoading(true);

    try {
      // ログイン/登録APIの呼び出し（TODO: 実装）
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          nickname,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("ログインに失敗しました");
      }

      const result = await response.json();

      // ログイン成功時の処理
      localStorage.setItem("userId", userId);
      localStorage.setItem("nickname", nickname);

      router.push("/");
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-6 text-center">
            <CardTitle className="text-[#331515] text-xl font-medium mb-2">
              ともだちチェキ
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              アカウント登録・ログイン
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-[#0a0a0a] mb-2"
                >
                  ユーザーID
                </label>
                <Input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="user123"
                  className="w-full border-[#e5e5e5] focus:border-[#603736] focus:ring-[#603736]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="nickname"
                  className="block text-sm font-medium text-[#0a0a0a] mb-2"
                >
                  ニックネーム
                </label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="山田太郎"
                  className="w-full border-[#e5e5e5] focus:border-[#603736] focus:ring-[#603736]"
                  required
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
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#603736] hover:bg-[#331515] text-white py-3 disabled:opacity-50"
                >
                  {isLoading ? "処理中..." : "ログイン / 登録"}
                </Button>

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
