import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File;
  const deviceId = request.headers.get("x-device-id");

  // Blob Storageにアップロード
  const blob = await put(`photos/${Date.now()}.jpg`, file, {
    access: "public",
  });

  // 写真を作成（IDは自動生成）
  const photo = await prisma.photo.create({
    data: {
      deviceId,
      imageUrl: blob.url,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    id: photo.id, // このIDがQRコードにもなる！
    imageUrl: photo.imageUrl,
  });
}
