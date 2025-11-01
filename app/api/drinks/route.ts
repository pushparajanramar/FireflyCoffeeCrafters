import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, config, imageUrl } = await request.json()

    const result = await sql`
      INSERT INTO drinks (name, config_json, image_url)
      VALUES (${name}, ${JSON.stringify(config)}, ${imageUrl})
      RETURNING id
    `

    return NextResponse.json({ id: result[0].id })
  } catch (error) {
    console.error("[v0] Error saving drink:", error)
    return NextResponse.json({ error: "Failed to save drink" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM drinks
      ORDER BY created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching drinks:", error)
    return NextResponse.json({ error: "Failed to fetch drinks" }, { status: 500 })
  }
}
