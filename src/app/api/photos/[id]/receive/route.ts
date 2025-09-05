import { NextRequest, NextResponse } from "next/server";
import { receivePhoto } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { receiverName, location } = body;

    // バリデーション
    if (!receiverName || typeof receiverName !== "string") {
      return NextResponse.json(
        { error: "受け取り者の名前が必要です" },
        { status: 400 },
      );
    }

    // 位置情報の処理（オプショナル）
    let locationData:
      | { latitude: number; longitude: number; address?: string }
      | undefined = undefined;
    if (
      location &&
      typeof location.latitude === "number" &&
      typeof location.longitude === "number"
    ) {
      locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || undefined,
      };
    }

    // データベースに保存
    const updatedPhoto = await receivePhoto(id, {
      receiver_name: receiverName,
      location: locationData,
    });

    if (!updatedPhoto) {
      return NextResponse.json(
        { error: "写真が見つからないか、既に受け取り済みです" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      photo: updatedPhoto,
    });
  } catch (error) {
    console.error("Photo receive error:", error);
    return NextResponse.json(
      { error: "写真の受け取りに失敗しました" },
      { status: 500 },
    );
  }
}
