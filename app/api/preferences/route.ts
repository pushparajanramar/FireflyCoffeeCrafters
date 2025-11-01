import { sql } from "@/lib/db"
import { POST as trainIndex } from "../train-index/route"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { aroma, flavor, acidity, body: bodyPref, aftertaste } = body


    // Fetch dummy user's UUID
    const users = await sql`SELECT id FROM users WHERE email = 'dummy@example.com'`
    if (!users[0]?.id) {
      throw new Error('Dummy user not found')
    }
    const dummyUserId = users[0].id

    // Build preferences JSON object
    const preferencesObj = {
      aroma,
      flavor,
      acidity,
      body: bodyPref,
      aftertaste
    }

    // Insert or update user preferences for dummy user
    await sql`
      INSERT INTO user_preferences (
        user_id,
        preferences,
        aroma_preference,
        flavor_preference,
        acidity_preference,
        body_preference,
        aftertaste_preference,
        updated_at
      ) VALUES (
        ${dummyUserId},
        ${JSON.stringify(preferencesObj)},
        ${aroma},
        ${flavor},
        ${acidity},
        ${bodyPref},
        ${aftertaste},
        NOW()
      )
    `

      // Trigger re-indexing of Cohere documents so rerank uses updated preferences
      try {
        await trainIndex()
      } catch (err) {
        // Log but don't fail the preference save if indexing errors
        console.error('Error triggering index training after saving preferences:', err)
      }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error saving preferences:", error)
    return Response.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const preferences = await sql`
      SELECT * FROM user_preferences
      ORDER BY created_at DESC
      LIMIT 1
    `

    return Response.json(preferences[0] || null)
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return Response.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}
