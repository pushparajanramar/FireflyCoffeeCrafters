import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [syrup] = await sql`SELECT * FROM syrups WHERE id = ${params.id}`;
    if (!syrup) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(syrup);
  } catch (error) {
    console.error("[v0] Error fetching syrup detail:", error);
    return NextResponse.json({ error: "Failed to fetch syrup" }, { status: 500 });
  }
}
