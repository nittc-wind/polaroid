"use client";

import * as React from "react";
import { useParams } from "next/navigation";
// ...existing code...
import { generateQRCode, generateQRCodeData } from "@/lib/util";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
          <CardHeader className="p-0 mb-3 text-center">
            <CardTitle className="text-base font-medium text-[#0a0a0a]">
              QRコードを相手に見せてください
            </CardTitle>
            <CardDescription className="text-[#737373] text-xs">
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
