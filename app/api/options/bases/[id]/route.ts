import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [base] = await sql`SELECT * FROM bases WHERE id = ${params.id}`;
    if (!base) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(base);
  } catch (error) {
    console.error("[v0] Error fetching base detail:", error);
    return NextResponse.json({ error: "Failed to fetch base" }, { status: 500 });
  }
}
