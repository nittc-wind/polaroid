"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function ReceivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [locationPermission, setLocationPermission] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("名前を入力してください");
      return;
    }

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
      const response = await fetch(`/api/photos/${id}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverName: name,
          location: locationData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "写真の受け取りに失敗しました");
        return;
      }

      const result = await response.json();
      console.log("受け取り成功:", result);
    } catch (error) {
      console.error("API呼び出しエラー:", error);
      alert("写真の受け取りに失敗しました");
      return;
    }

    // 現像画面へ遷移
    router.push(`/develop/${id}`);
  };

  const requestLocationPermission = async () => {
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setLocationPermission(true);
      alert("位置情報の使用を許可しました");
    } catch {
      alert("位置情報の使用を許可してください");
    }
  };

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-4 max-h-[90vh] overflow-y-auto">
          <div className="mb-3">
            <h1 className="text-base font-medium text-[#0a0a0a] mb-1">写真を受け取る</h1>
            <p className="text-xs text-[#737373]">あなたの情報を入力してください</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="border border-[#e5e5e5] rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-[#0a0a0a] mb-4">
                情報を入力
              </h3>

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
                  asChild
                >
                  <Link href="/">キャンセル</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#603736] hover:bg-[#331515] text-white py-2"
                >
                  現像を開始
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
