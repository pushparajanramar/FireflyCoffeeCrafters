import { sql } from "@/lib/db"
import { rerankDocuments, buildPreferenceQuery, type CohereDocument } from "@/lib/cohere"

export async function POST(request: Request) {
  try {
    // Accept optional variant index to return alternative ranked matches
    const body = await request.json().catch(() => ({}))
    const variantIndex = Math.max(0, Number.isFinite(body?.variantIndex) ? Number(body.variantIndex) : (body?.variantIndex ? Number(body.variantIndex) : 0)) || 0
    // Get user preferences
    const preferences = await sql`
      SELECT * FROM user_preferences
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (!preferences[0]) {
      return Response.json({ error: "No preferences found. Please set preferences in Admin panel." }, { status: 400 })
    }

    // Get all indexed documents
    const documents = await sql`
      SELECT * FROM cohere_documents
    `

    if (documents.length === 0) {
      return Response.json({ error: "No documents indexed. Please train the index in Admin panel." }, { status: 400 })
    }

    // Build query from preferences
    const query = buildPreferenceQuery(preferences[0])

    // Convert to Cohere document format
    const cohereDocuments: CohereDocument[] = documents.map((doc: any) => ({
      id: doc.id,
      text: doc.text,
      type: doc.type,
      data: doc.data,
    }))

    // Rerank documents based on preferences
    const rankedResults = await rerankDocuments(query, cohereDocuments)

    // Group candidates by type
    const baseCandidates = rankedResults.filter((r) => r.document.type === "base")
    const milkCandidates = rankedResults.filter((r) => r.document.type === "milk")
    const syrupCandidates = rankedResults.filter((r) => r.document.type === "syrup")
    const toppingCandidates = rankedResults.filter((r) => r.document.type === "topping")

    // Choose the variantIndex-th candidate when available, fallback to top-0
    const pickCandidate = (arr: any[], idx: number) => {
      if (!arr || arr.length === 0) return undefined
      if (idx >= 0 && idx < arr.length) return arr[idx]
      return arr[0]
    }

    const bestBase = pickCandidate(baseCandidates, variantIndex)
    const bestMilk = pickCandidate(milkCandidates, variantIndex)
    // For syrups/toppings, take a slice starting at variantIndex so combinations shift
    const bestSyrups = (syrupCandidates.length > 0) ? syrupCandidates.slice(variantIndex, variantIndex + 2) : []
    if (bestSyrups.length === 0 && syrupCandidates.length > 0) bestSyrups.push(...syrupCandidates.slice(0, 2))
    const bestToppings = (toppingCandidates.length > 0) ? toppingCandidates.slice(variantIndex, variantIndex + 2) : []
    if (bestToppings.length === 0 && toppingCandidates.length > 0) bestToppings.push(...toppingCandidates.slice(0, 2))

    // Get sizes and temperatures (not AI-selected, use defaults)
    const sizes = await sql`SELECT * FROM sizes ORDER BY volume_ml ASC`
    const temperatures = await sql`SELECT * FROM temperatures`
    const iceLevels = await sql`SELECT * FROM ice_levels`

    // Build drink configuration
    const drinkConfig = {
      base: bestBase?.document.data.name || "Coffee",
      size: sizes[1]?.name || "Grande", // Default to medium size
      milk: bestMilk?.document.data.name || "Whole Milk",
      syrups: bestSyrups.map((s) => ({
        name: s.document.data.name,
        pumps: 2,
      })),
      toppings: bestToppings.map((t) => t.document.data.name),
      temperature: temperatures[0]?.name || "Hot",
      sweetness: "medium",
      ice: "none",
      name: "AI Crafted Coffee",
    }

    const priceResponse = await fetch(
      new URL("/api/calculate-price", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drinkConfig),
      },
    )

    if (!priceResponse.ok) {
      console.error("Price calculation failed:", priceResponse.status, priceResponse.statusText)
      // Return recommendation without pricing if price calculation fails
      return Response.json({
        success: true,
        drinkConfig,
        pricing: {
          base: 0,
          size: 0,
          milk: 0,
          syrups: 0,
          toppings: 0,
          total: 0,
          loyaltyPoints: { base: 0, size: 0, milk: 0, syrups: 0, toppings: 0, total: 0 },
        },
        aiInsights: {
          baseScore: bestBase?.relevance_score || 0,
          milkScore: bestMilk?.relevance_score || 0,
          reasoning: `Selected based on your preferences for ${preferences[0].aroma_preference} aroma and ${preferences[0].flavor_preference} flavor.`,
        },
      })
    }

    const priceData = await priceResponse.json()

    return Response.json({
      success: true,
      variantIndex,
      drinkConfig,
      pricing: priceData,
      aiInsights: {
        baseScore: bestBase?.relevance_score || 0,
        milkScore: bestMilk?.relevance_score || 0,
        reasoning: `Selected based on your preferences for ${preferences[0].aroma_preference} aroma and ${preferences[0].flavor_preference} flavor. (variant ${variantIndex})`,
      },
    })
  } catch (error) {
    console.error("Error generating AI recommendation:", error)
    return Response.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}
