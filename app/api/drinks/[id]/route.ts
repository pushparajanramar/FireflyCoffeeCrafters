import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await sql`
      SELECT * FROM drinks
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Drink not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error fetching drink:", error)
    return NextResponse.json({ error: "Failed to fetch drink" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await sql`
      DELETE FROM drinks
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting drink:", error)
    return NextResponse.json({ error: "Failed to delete drink" }, { status: 500 })
  }
}
