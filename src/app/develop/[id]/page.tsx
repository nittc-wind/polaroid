"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function DevelopPage() {
  const params = useParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isDeveloping, setIsDeveloping] = useState(true);

  useEffect(() => {
    // 60秒かけて現像
    const duration = 30000; // 30秒
    const interval = 100; // 100msごとに更新
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsDeveloping(false);
          // 完了画面へ自動遷移
          setTimeout(() => {
            router.push(`/complete/${params.id}`);
          }, 1000);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [params.id, router]);

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-6 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-6 text-center">
            <CardTitle className="text-[#0a0a0a] text-lg font-medium mb-2">
              現像中...
            </CardTitle>
            <CardDescription className="text-[#737373] text-sm">
              チェキを現像しています。しばらくお待ちください。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-0">
            {/* プログレスバー */}
            <div className="mb-6">
              <div className="w-full bg-[#e5e5e5] rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#603736] to-[#331515] rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center">
                <span className="text-[#603736] text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            {/* 現像中のアニメーション表示エリア */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div
                className="w-full aspect-[4/5] bg-[#e5e5e5] rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  opacity: Math.max(0.1, progress / 100),
                  filter: `blur(${Math.max(0, 10 - progress / 10)}px)`,
                }}
              >
                {/* 現像中の写真プレビュー */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#737373"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${isDeveloping ? "animate-pulse" : ""}`}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                {/* 現像エフェクト */}
                {isDeveloping && (
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-30 animate-pulse" />
                )}
              </div>
            </div>
            {!isDeveloping && (
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  現像が完了しました！
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
