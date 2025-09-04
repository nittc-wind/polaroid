import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createPhoto } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const deviceId = request.headers.get("x-device-id");

    if (!file || !deviceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Blob Storageにアップロード
    const blob = await put(`photos/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // データベースに保存
    const photo = await createPhoto({
      device_id: deviceId,
      image_url: blob.url,
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
