import { sql } from "@/lib/db";

async function checkPhotosSchema() {
  try {
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'photos'
      ORDER BY ordinal_position;
    `;
    console.log("Photos table schema:", result);
  } catch (error) {
    console.error("Error checking schema:", error);
  }
}

checkPhotosSchema();
