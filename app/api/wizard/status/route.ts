import { sql } from "@/lib/db"

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS index_training_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status TEXT NOT NULL DEFAULT 'not_started',
        last_trained_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    const existing = await sql`
      SELECT COUNT(*) as count FROM index_training_status
    `

    if (existing[0].count === 0) {
      await sql`
        INSERT INTO index_training_status (status) VALUES ('not_started')
      `
    }

    const status = await sql`
      SELECT status FROM index_training_status
      ORDER BY created_at DESC
      LIMIT 1
    `

    const enabled = status[0]?.status === "completed"

    return Response.json({ enabled })
  } catch (error) {
    console.error("[v0] Error checking wizard status:", error)
    return Response.json({ enabled: false })
  }
}
