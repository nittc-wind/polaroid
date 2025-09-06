"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { UpdateUserRequest, UpdatePasswordRequest } from "@/types";
import { PrivateUser } from "@/types/api";
import { ArrowLeft, User as UserIcon, Lock, LogOut } from "lucide-react";

function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<PrivateUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // プロフィール編集フォーム
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // パスワード変更フォーム
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ユーザー情報取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          throw new Error("ユーザー情報の取得に失敗しました");
        }
        const data = await response.json();
        const userData = data.data;
        setUser(userData);
        setProfileForm({
          username: userData.handle_name || "",
          email: userData.email || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // プロフィール更新
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setError(null);

    try {
      const updateData: UpdateUserRequest = {};
      if (profileForm.username !== user?.handle_name) {
        updateData.username = profileForm.username;
      }
      if (profileForm.email !== user?.email) {
        updateData.email = profileForm.email;
      }

      if (Object.keys(updateData).length === 0) {
        setProfileLoading(false);
        return;
      }

      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "プロフィールの更新に失敗しました");
      }

      const data = await response.json();
      setUser(data.data);
      alert("プロフィールを更新しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setProfileLoading(false);
    }
  };

  // パスワード変更
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("新しいパスワードが一致しません");
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      setPasswordLoading(false);
      return;
    }

    try {
      const updateData: UpdatePasswordRequest = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };

      const response = await fetch(`/api/users/${user?.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "パスワードの変更に失敗しました");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("パスワードを変更しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await logout();
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center">
        <div className="text-[#603736]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dfc7c7] p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold text-[#0a0a0a]">設定</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* プロフィール設定 */}
        <Card className="mb-4 bg-white rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base font-medium text-[#0a0a0a]">
              <UserIcon className="h-4 w-4 mr-2" />
              プロフィール
            </CardTitle>
            <CardDescription className="text-xs text-[#737373]">
              ユーザー名とメールアドレスを変更できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-[#0a0a0a] mb-2 block">
                  ユーザー名
                </label>
                <Input
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, username: e.target.value })
                  }
                  placeholder="ユーザー名を入力"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-[#0a0a0a] mb-2 block">
                  メールアドレス
                </label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  placeholder="メールアドレスを入力"
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-[#603736] hover:bg-[#331515] text-white"
              >
                {profileLoading ? "更新中..." : "プロフィールを更新"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* パスワード変更 */}
        <Card className="mb-4 bg-white rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base font-medium text-[#0a0a0a]">
              <Lock className="h-4 w-4 mr-2" />
              パスワード変更
            </CardTitle>
            <CardDescription className="text-xs text-[#737373]">
              セキュリティのため定期的にパスワードを変更してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-[#0a0a0a] mb-2 block">
                  現在のパスワード
                </label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="現在のパスワードを入力"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-[#0a0a0a] mb-2 block">
                  新しいパスワード
                </label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="新しいパスワードを入力（6文字以上）"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-[#0a0a0a] mb-2 block">
                  パスワード確認
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="新しいパスワードを再入力"
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-[#603736] hover:bg-[#331515] text-white"
              >
                {passwordLoading ? "変更中..." : "パスワードを変更"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ログアウト */}
        <Card className="bg-white rounded-2xl">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 設定ページを認証ガードでラップ
export default function SettingsPageWithAuth() {
  return (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  );
}
