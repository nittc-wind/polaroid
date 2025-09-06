"use client";

import * as React from "react";
import { useParams } from "next/navigation";
// ...existing code...
import { generateQRCode, generateQRCodeData } from "@/lib/util";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("");

  React.useEffect(() => {
    const generate = async () => {
      const qrData = generateQRCodeData(id);
      const url = await generateQRCode(qrData);
      setQrCodeUrl(url);
    };
    generate();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#dfc7c7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-white rounded-2xl p-4 max-h-[90vh] flex flex-col">
          <div className="text-center mb-3">
            <h1 className="text-base font-medium text-[#0a0a0a]">
              QRコードを相手に見せてください
            </h1>
          </div>
          <CardContent className="flex-1 flex flex-col items-center gap-4 p-0">
            <div className="flex-1 flex items-center justify-center">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QRコード"
                  className="w-40 h-40 max-w-[60vw] max-h-[30vh]"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 animate-pulse rounded" />
              )}
            </div>
            <p className="text-xs text-[#737373] text-center px-2">
              相手は標準カメラでQRを読み取ってください
            </p>
            <div className="w-full space-y-2">
              <Button variant="ghost" className="w-full py-2">
                <Link
                  href="/camera"
                  className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                >
                  もう一度撮影する
                </Link>
              </Button>
              <Button variant="ghost" className="w-full py-2">
                <Link
                  href="/photos"
                  className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
                >
                  写真一覧を見る
                </Link>
              </Button>
              <Button variant="ghost" className="w-full py-2">
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
