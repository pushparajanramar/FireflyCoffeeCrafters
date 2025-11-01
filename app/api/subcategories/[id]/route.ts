import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [subcategory] = await sql`SELECT * FROM subcategories WHERE id = ${params.id}`;
    if (!subcategory) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error("[v0] Error fetching subcategory detail:", error);
    return NextResponse.json({ error: "Failed to fetch subcategory" }, { status: 500 });
  }
}
