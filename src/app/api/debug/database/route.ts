import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // テーブルスキーマを確認
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'photos' 
      ORDER BY ordinal_position
    `;

    // サンプルデータを取得
    const sampleData = await sql`
      SELECT id, user_id, receiver_name, receiver_user_id, is_received, created_at
      FROM photos 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      data: {
        schema: tableInfo,
        sampleData: sampleData,
      },
    });
  } catch (error) {
    console.error("Database debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
