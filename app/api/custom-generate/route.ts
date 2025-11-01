import { NextResponse } from "next/server"
import { generateDrinkImage, uploadImageToFirefly, compositeLogoWithImageIds, extractImageIdFromUrl } from "@/lib/adobe-firefly"

// Default Starbucks logo URL
const DEFAULT_LOGO_URL = "https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png";

export async function POST(request: Request) {
  try {
    const { prompt, negativePrompt, enableLogo = true, logoUrl } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("[v0] Custom prompt:", prompt)
    console.log("[v0] Custom negative prompt:", negativePrompt)
    console.log("[v0] Enable logo:", enableLogo)

    const baseImageUrl = await generateDrinkImage(prompt, negativePrompt)
    console.log("[v0] Base image generated:", baseImageUrl)

    if (!enableLogo) {
      return NextResponse.json({ imageUrl: baseImageUrl })
    }

    try {
      // Extract image ID from base image URL
      const baseImageId = extractImageIdFromUrl(baseImageUrl)
      if (!baseImageId) {
        console.warn("[v0] Could not extract image ID, returning base image")
        return NextResponse.json({ imageUrl: baseImageUrl })
      }

      // Upload logo and get its image ID
      const finalLogoUrl = logoUrl || DEFAULT_LOGO_URL
      const logoImageId = await uploadImageToFirefly(finalLogoUrl)
      console.log("[v0] Logo uploaded with ID:", logoImageId)

      // Composite logo onto the drink image
      const finalImageUrl = await compositeLogoWithImageIds(baseImageId, logoImageId)
      console.log("[v0] Final composited image:", finalImageUrl)

      return NextResponse.json({ imageUrl: finalImageUrl })
    } catch (compositeError) {
      console.error("[v0] Error compositing logo, returning base image:", compositeError)
      return NextResponse.json({ imageUrl: baseImageUrl })
    }
  } catch (error) {
    console.error("[v0] Error generating custom image:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
