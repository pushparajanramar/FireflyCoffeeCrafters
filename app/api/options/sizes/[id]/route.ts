import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [size] = await sql`SELECT * FROM sizes WHERE id = ${params.id}`;
    if (!size) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(size);
  } catch (error) {
    console.error("[v0] Error fetching size detail:", error);
    return NextResponse.json({ error: "Failed to fetch size" }, { status: 500 });
  }
}
