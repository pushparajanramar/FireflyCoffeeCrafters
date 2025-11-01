import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [milk] = await sql`SELECT * FROM milks WHERE id = ${params.id}`;
    if (!milk) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(milk);
  } catch (error) {
    console.error("[v0] Error fetching milk detail:", error);
    return NextResponse.json({ error: "Failed to fetch milk" }, { status: 500 });
  }
}
