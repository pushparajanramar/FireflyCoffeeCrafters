import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [temperature] = await sql`SELECT * FROM temperatures WHERE id = ${params.id}`;
    if (!temperature) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(temperature);
  } catch (error) {
    console.error("[v0] Error fetching temperature detail:", error);
    return NextResponse.json({ error: "Failed to fetch temperature" }, { status: 500 });
  }
}
