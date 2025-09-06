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
    <div className="container min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="inner w-full max-w-md mx-auto">
        <Card className="card">
          <CardHeader>
            <CardTitle className="text-lg">
              QRコードを相手に見せてください
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QRコード" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 animate-pulse rounded" />
            )}
            <p className="text-sm text-[#737373]">
              相手は標準カメラでQRを読み取ってください
            </p>
            <Button variant="ghost" className="w-full" asChild>
              <Link
                href="/camera"
                className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
              >
                もう一度撮影する
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link
                href="/photos"
                className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
              >
                写真一覧を見る
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link
                href="/"
                className="w-full block text-[#737373] hover:text-[#0a0a0a] text-sm"
              >
                ホームに戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
