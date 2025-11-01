import { sql } from "@/lib/db"
const COHERE_API_KEY = "78VWOEFbwXZdwIckiVchtMUwryUAhjD8tGYo88Xo"

export async function POST() {
  try {
    // Fetch all coffee data
    const bases = await sql`SELECT * FROM bases WHERE is_active = true`
    const milks = await sql`SELECT * FROM milks`
    const syrups = await sql`SELECT * FROM syrups`
    const toppings = await sql`SELECT * FROM toppings`

    // Create documents for Cohere indexing
    const documents = [
      ...bases.map((base: any) => ({
        id: `base-${base.id}`,
        text: `${base.name}: ${base.description}. Aroma: ${base.aroma}. Flavor: ${base.flavor}. Acidity: ${base.acidity}. Body: ${base.body}. Aftertaste: ${base.aftertaste}`,
        type: "base",
        data: base,
      })),
      ...milks.map((milk: any) => ({
        id: `milk-${milk.id}`,
        text: `${milk.name}: Flavor profile: ${milk.flavor_profile}. Body contribution: ${milk.body_contribution}`,
        type: "milk",
        data: milk,
      })),
      ...syrups.map((syrup: any) => ({
        id: `syrup-${syrup.id}`,
        text: `${syrup.name}: Flavor notes: ${syrup.flavor_notes}. Sweetness level: ${syrup.sweetness_level}`,
        type: "syrup",
        data: syrup,
      })),
      ...toppings.map((topping: any) => ({
        id: `topping-${topping.id}`,
        text: `${topping.name}: Flavor impact: ${topping.flavor_impact}. Texture: ${topping.texture_contribution}`,
        type: "topping",
        data: topping,
      })),
    ]

    // Store documents in a simple cache table for later retrieval
    await sql`
      CREATE TABLE IF NOT EXISTS cohere_documents (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        type TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Clear existing documents
    await sql`DELETE FROM cohere_documents`

    // Insert new documents
    for (const doc of documents) {
      await sql`
        INSERT INTO cohere_documents (id, text, type, data)
        VALUES (${doc.id}, ${doc.text}, ${doc.type}, ${JSON.stringify(doc.data)})
      `
    }

    // Update training status
    await sql`
      UPDATE index_training_status
      SET status = 'completed', last_trained_at = NOW()
    `

    return Response.json({
      success: true,
      message: "Index training completed",
      documentCount: documents.length,
    })
  } catch (error) {
    console.error("Error training index:", error)
    return Response.json({ error: "Failed to train index" }, { status: 500 })
  }
}
