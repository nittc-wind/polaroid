"use client";

import * as React from "react";
import { generateQRCode, generateQRCodeData } from "@/lib/util";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";

function QRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const generate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const qrData = generateQRCodeData(id);
        const url = await generateQRCode(qrData);
        setQrCodeUrl(url);
      } catch (err) {
        console.error("QRコード生成エラー:", err);
        setError("QRコードの生成に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    generate();
  }, [id]);

  return (
    <div className="min-h-[calc(100vh-53px)] bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <CardHeader className="p-0 mb-3 text-center">
            <CardTitle className="text-base font-medium text-[#0a0a0a]">
              QRコードを相手に見せてください
            </CardTitle>
            <CardDescription className="text-[#737373] text-xs">
              相手は標準カメラでQRを読み取ってください
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center gap-4 p-0">
            <div className="flex-1 flex items-center justify-center">
              {isLoading ? (
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#603736] mb-2" />
                  <span className="text-sm text-gray-600">生成中...</span>
                </div>
              ) : error ? (
                <div className="w-40 h-40 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center p-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-xs text-red-800 text-center">
                    {error}
                  </span>
                  <Button
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      // 再生成をトリガー
                      window.location.reload();
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-800 border-red-200 hover:bg-red-100"
                  >
                    再試行
                  </Button>
                </div>
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QRコード"
                  className="w-40 h-40 max-w-[60vw] max-h-[30vh]"
                  onError={() =>
                    setError("QRコード画像の読み込みに失敗しました")
                  }
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 animate-pulse rounded-lg" />
              )}
            </div>
            <div className="w-full space-y-2">
              <Button variant="ghost" className="w-full py-2" asChild>
                <Link
                  href="/camera"
                  className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                >
                  もう一度撮影する
                </Link>
              </Button>
              <Button variant="ghost" className="w-full py-2" asChild>
                <Link
                  href="/photos"
                  className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                >
                  写真一覧を見る
                </Link>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// QRページを認証ガードでラップ
export default function QRPageWithAuth({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AuthGuard>
      <QRPage params={params} />
    </AuthGuard>
  );
}
