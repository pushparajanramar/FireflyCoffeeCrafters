import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params

    // Validate the type parameter
    const validTypes = ["bases", "sizes", "milks", "syrups", "toppings", "temperatures"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid option type" }, { status: 400 })
    }

    // Use a validated table name and construct the query string directly
    let result: any[] = [];
    if (validTypes.includes(type)) {
      if (type === "bases") {
        result = await sql([`SELECT * FROM bases ORDER BY base_index ASC NULLS LAST, name ASC`] as any);
      } else {
        result = await sql([`SELECT * FROM ${type} ORDER BY name ASC`] as any);
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching options:", error)
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
  }
}
