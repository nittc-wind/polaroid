"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ReceivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [locationPermission, setLocationPermission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 未ログインユーザーの場合は名前が必須
    if (!isAuthenticated && !name.trim()) {
      setError("名前を入力してください");
      return;
    }

    setIsSubmitting(true);

    // 位置情報を取得
    let locationData = null;
    if (locationPermission) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          },
        );
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch {
        console.error("位置情報の取得に失敗");
      }
    }

    // APIに送信
    try {
      // 適切な型定義でrequestBodyを作成
      const requestBody: {
        location: { latitude: number; longitude: number } | null;
        receiverName?: string;
      } = {
        location: locationData,
      };

      // 未ログインユーザーの場合のみ名前を含める
      if (!isAuthenticated) {
        requestBody.receiverName = name;
      }

      const response = await fetch(`/api/photos/${id}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // 新しいエラーレスポンス形式に対応
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            setError(
              `写真の受け取りに失敗しました: ${errorData.error.message}`,
            );
          } else {
            setError("写真の受け取りに失敗しました");
          }
        } catch {
          setError("写真の受け取りに失敗しました");
        }
        return;
      }

      // 新しい成功レスポンス形式に対応
      const result = await response.json();
      if (!result.success) {
        setError("写真の受け取りに失敗しました");
        return;
      }

      console.log("受け取り成功:", result);

      // 現像画面へ遷移
      router.push(`/develop/${id}`);
    } catch (error) {
      console.error("API呼び出しエラー:", error);
      setError("写真の受け取り中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setLocationPermission(true);
      setError("位置情報の使用を許可しました");
    } catch {
      setError("位置情報の使用を許可してください");
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="bg-white rounded-2xl p-4">
            <CardContent className="p-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-sm text-[#737373]">読み込み中...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] overflow-y-auto flex flex-col">
          <CardHeader className="p-0 mb-3 text-center">
            <CardTitle className="text-base font-medium text-[#0a0a0a] mb-1">
              写真を受け取る
            </CardTitle>
            <CardDescription className="text-xs text-[#737373]">
              {isAuthenticated
                ? `${user?.name || user?.email}として受け取ります`
                : "あなたの情報を入力してください"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="text-red-800 text-sm">{error}</div>
                <Button
                  onClick={() => setError(null)}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-800 border-red-200 hover:bg-red-100"
                >
                  閉じる
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="border border-[#e5e5e5] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-[#0a0a0a] mb-4">
                  {isAuthenticated ? "受け取り設定" : "情報を入力"}
                </h3>

                {/* ログイン時は名前入力を表示しない */}
                {!isAuthenticated && (
                  <div className="mb-4">
                    <label className="text-sm text-[#0a0a0a] mb-2 block">
                      あなたの名前*
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="名前を入力してください"
                      className="w-full"
                      required
                    />
                  </div>
                )}

                {/* ログイン時は受け取りユーザー情報を表示 */}
                {isAuthenticated && (
                  <div className="mb-4 p-3 bg-[#f8f9fa] rounded-lg border border-[#e9ecef]">
                    <p className="text-sm text-[#0a0a0a] font-medium">
                      {user?.name || user?.email}で受け取る
                    </p>
                    <p className="text-xs text-[#737373] mt-1">
                      ログインしているため、自動的にアカウントに紐付けられます
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                    id="location"
                    checked={locationPermission}
                    onCheckedChange={(checked) =>
                      setLocationPermission(checked === true)
                    }
                    className="data-[state=checked]:bg-[#603736] data-[state=checked]:border-[#603736]"
                  />
                  <label htmlFor="location" className="text-sm text-[#0a0a0a]">
                    位置情報を記録する
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    disabled={isSubmitting}
                    asChild
                  >
                    <Link href="/">キャンセル</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#603736] hover:bg-[#331515] text-white py-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      "現像を開始"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
