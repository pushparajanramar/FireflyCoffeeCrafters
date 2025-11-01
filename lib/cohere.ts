const COHERE_API_KEY = "78VWOEFbwXZdwIckiVchtMUwryUAhjD8tGYo88Xo"

export interface CohereDocument {
  id: string
  text: string
  type: string
  data: any
}

export interface RerankResult {
  index: number
  relevance_score: number
  document: CohereDocument
}

export async function rerankDocuments(query: string, documents: CohereDocument[]): Promise<RerankResult[]> {
  try {
    const response = await fetch("https://api.cohere.ai/v1/rerank", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "rerank-english-v3.0",
        query,
        documents: documents.map((doc) => doc.text),
        top_n: 10,
        return_documents: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Map results back to original documents with scores
    return data.results.map((result: any) => ({
      index: result.index,
      relevance_score: result.relevance_score,
      document: documents[result.index],
    }))
  } catch (error) {
    console.error("Error calling Cohere rerank:", error)
    throw error
  }
}

export function buildPreferenceQuery(preferences: {
  aroma_preference: string
  flavor_preference: string
  acidity_preference: string
  body_preference: string
  aftertaste_preference: string
}): string {
  return `I want a coffee with the following characteristics:
Aroma: ${preferences.aroma_preference}
Flavor: ${preferences.flavor_preference}
Acidity: ${preferences.acidity_preference}
Body: ${preferences.body_preference}
Aftertaste: ${preferences.aftertaste_preference}`
}
