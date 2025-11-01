import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const [topping] = await sql`SELECT * FROM toppings WHERE id = ${params.id}`;
    if (!topping) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(topping);
  } catch (error) {
    console.error("[v0] Error fetching topping detail:", error);
    return NextResponse.json({ error: "Failed to fetch topping" }, { status: 500 });
  }
}
