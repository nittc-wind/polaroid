import { NextRequest, NextResponse } from "next/server";
import { getPhoto } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 },
      );
    }

    const photo = await getPhoto(id);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // 24時間後に削除されているかチェック
    const expiryTime = new Date(photo.created_at);
    expiryTime.setHours(expiryTime.getHours() + 24);

    if (new Date() > expiryTime) {
      return NextResponse.json({ error: "Photo has expired" }, { status: 410 });
    }

    return NextResponse.json({
      id: photo.id,
      userId: photo.user_id,
      imageUrl: photo.image_url,
      receiverName: photo.receiver_name,
      receivedAt: photo.received_at,
      location: photo.location,
      createdAt: photo.created_at,
    });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
