import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPhoto, sql } from "@/lib/db";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<
  NextResponse<ApiSuccessResponse<{ photo_id: string }> | ApiErrorResponse>
> {
  try {
    const { id } = await params;

    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "認証が必要です",
          },
        },
        { status: 401 },
      );
    }

    // 写真の存在確認と基本検証
    const photo = await getPhoto(id);
    if (!photo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PHOTO_NOT_FOUND",
            message: "指定された写真が見つかりません",
          },
        },
        { status: 404 },
      );
    }

    // 有効期限チェック
    const now = new Date();
    if (photo.expires_at < now) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PHOTO_EXPIRED",
            message: "この写真の有効期限が切れています",
          },
        },
        { status: 410 },
      );
    }

    // 既に他のユーザーに紐付け済みかチェック
    if (photo.user_id && photo.user_id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PHOTO_ALREADY_CLAIMED",
            message: "この写真は既に他のユーザーに紐付けられています",
          },
        },
        { status: 409 },
      );
    }

    // 既に同じユーザーに紐付け済みの場合は成功レスポンス
    if (photo.user_id === session.user.id) {
      return NextResponse.json({
        success: true,
        data: { photo_id: id },
      });
    }

    // receiver_nameが設定されているかチェック（未ログインユーザーが受け取り済み）
    if (!photo.receiver_name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PHOTO_NOT_RECEIVED",
            message: "この写真はまだ受け取られていません",
          },
        },
        { status: 400 },
      );
    }

    // 写真をユーザーに紐付け
    await sql`
      UPDATE photos 
      SET 
        user_id = ${session.user.id},
        receiver_user_id = ${session.user.id},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      data: { photo_id: id },
    });
  } catch (error) {
    console.error("Photo claim error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "写真の紐付け処理中にエラーが発生しました",
        },
      },
      { status: 500 },
    );
  }
}
