import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [category] = await sql`SELECT * FROM categories WHERE id = ${params.id}`;
    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error("[v0] Error fetching category detail:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}
