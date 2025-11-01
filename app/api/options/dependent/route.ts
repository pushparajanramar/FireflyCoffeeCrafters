import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const base = searchParams.get("base")
    if (!base) return NextResponse.json({ error: "Missing base param" }, { status: 400 })

    // Find base id (try exact then ILIKE)
    let baseRes = await sql`SELECT id FROM bases WHERE name = ${base} LIMIT 1`
    if (baseRes.length === 0) {
      baseRes = await sql`SELECT id FROM bases WHERE name ILIKE ${"%" + base + "%"} LIMIT 1`
    }
    if (baseRes.length === 0) return NextResponse.json({ allowedTemperatures: [], allowedMilks: [] })
    const baseId = baseRes[0].id

    const temps = await sql`
      SELECT t.name FROM base_allowed_temperatures bat
      JOIN temperatures t ON t.id = bat.temperature_id
      WHERE bat.base_id = ${baseId}
    `

    const milks = await sql`
      SELECT m.name FROM base_allowed_milks bam
      JOIN milks m ON m.id = bam.milk_id
      WHERE bam.base_id = ${baseId}
    `

    return NextResponse.json({ allowedTemperatures: temps.map((r: any) => r.name), allowedMilks: milks.map((r: any) => r.name) })
  } catch (error) {
    console.error('[v0] Error fetching dependent options', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { base, allowedMilks = [], allowedTemperatures = [] } = body
    if (!base) return NextResponse.json({ error: 'Missing base' }, { status: 400 })

    // Find base id (exact then ILIKE)
    let baseRes = await sql`SELECT id FROM bases WHERE name = ${base} LIMIT 1`
    if (baseRes.length === 0) {
      baseRes = await sql`SELECT id FROM bases WHERE name ILIKE ${"%" + base + "%"} LIMIT 1`
    }
    if (baseRes.length === 0) return NextResponse.json({ error: 'Base not found' }, { status: 404 })
    const baseId = baseRes[0].id

    // Replace allowed milks
    // Remove existing
    await sql`
      DELETE FROM base_allowed_milks WHERE base_id = ${baseId}
    `
    // Insert new mappings
    for (const milkName of allowedMilks) {
      // find milk id
      let mRes = await sql`SELECT id FROM milks WHERE name = ${milkName} LIMIT 1`
      if (mRes.length === 0) mRes = await sql`SELECT id FROM milks WHERE name ILIKE ${"%" + milkName + "%"} LIMIT 1`
      if (mRes.length > 0) {
        await sql`INSERT INTO base_allowed_milks (base_id, milk_id) VALUES (${baseId}, ${mRes[0].id}) ON CONFLICT DO NOTHING`
      }
    }

    // Replace allowed temperatures
    await sql`
      DELETE FROM base_allowed_temperatures WHERE base_id = ${baseId}
    `
    for (const tempName of allowedTemperatures) {
      let tRes = await sql`SELECT id FROM temperatures WHERE name = ${tempName} LIMIT 1`
      if (tRes.length === 0) tRes = await sql`SELECT id FROM temperatures WHERE name ILIKE ${"%" + tempName + "%"} LIMIT 1`
      if (tRes.length > 0) {
        await sql`INSERT INTO base_allowed_temperatures (base_id, temperature_id) VALUES (${baseId}, ${tRes[0].id}) ON CONFLICT DO NOTHING`
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Error updating dependent options', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
