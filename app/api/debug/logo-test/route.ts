import { NextResponse } from "next/server"
import { 
  generateDrinkImage, 
  generateDrinkImageWithLogo, 
  uploadImageToFirefly, 
  extractImageIdFromUrl,
  compositeLogoWithImageIds,
  buildDrinkPrompt 
} from "@/lib/adobe-firefly"

// Test endpoint for debugging logo compositing
export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json()
    
    console.log("[v0] Debug test action:", action, "with params:", params)
    
    switch (action) {
      case "test_basic_generation":
        const basicResult = await generateDrinkImage(
          "A professional photograph of a coffee drink in a clear plastic cup", 
          "blurry, low quality"
        )
        return NextResponse.json({ 
          success: true, 
          result: basicResult,
          message: "Basic image generation test"
        })
      
      case "test_url_extraction":
        if (!params.imageUrl) {
          return NextResponse.json({ error: "imageUrl required" }, { status: 400 })
        }
        const extractedId = extractImageIdFromUrl(params.imageUrl)
        return NextResponse.json({ 
          success: true, 
          imageUrl: params.imageUrl,
          extractedId,
          message: extractedId ? "ID extracted successfully" : "Failed to extract ID"
        })
      
      case "test_logo_upload":
        if (!params.logoUrl) {
          return NextResponse.json({ error: "logoUrl required" }, { status: 400 })
        }
        const logoId = await uploadImageToFirefly(params.logoUrl)
        return NextResponse.json({ 
          success: true, 
          logoUrl: params.logoUrl,
          logoId,
          message: "Logo uploaded to Firefly"
        })
      
      case "test_full_compositing":
        if (!params.backgroundId || !params.logoId) {
          return NextResponse.json({ error: "backgroundId and logoId required" }, { status: 400 })
        }
        const compositedUrl = await compositeLogoWithImageIds(params.backgroundId, params.logoId)
        return NextResponse.json({ 
          success: true, 
          compositedUrl,
          message: "Full compositing test completed"
        })
      
      case "test_drink_config":
        const testConfig = params.config || {
          base: "Latte",
          size: "Grande",
          milk: "Whole Milk",
          temperature: "Hot",
          syrups: [],
          toppings: []
        }
        const logoUrl = params.logoUrl || "https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png"
        const fullResult = await generateDrinkImageWithLogo(testConfig, logoUrl)
        return NextResponse.json({ 
          success: true, 
          ...fullResult,
          config: testConfig,
          message: "Full drink generation with logo test"
        })
      
      case "test_prompt_enhancement":
        const basePrompt = "A professional photograph of a latte in a clear plastic cup"
        const enhancedPrompt = `${basePrompt}, with a small, clean Starbucks logo visible on the lower-right area of the cup. The logo should be clearly visible but not dominating, appearing as it would on a real coffee cup.`
        const enhancedResult = await generateDrinkImage(enhancedPrompt, "blurry, low quality, no logo")
        return NextResponse.json({ 
          success: true, 
          basePrompt,
          enhancedPrompt,
          result: enhancedResult,
          message: "Prompt-based logo test"
        })
      
      default:
        return NextResponse.json({ 
          error: "Unknown action",
          availableActions: [
            "test_basic_generation",
            "test_url_extraction", 
            "test_logo_upload",
            "test_full_compositing",
            "test_drink_config",
            "test_prompt_enhancement"
          ]
        }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Debug test error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Logo Compositing Debug Endpoint",
    usage: "POST with { action: 'test_name', ...params }",
    availableTests: [
      {
        action: "test_basic_generation",
        description: "Test basic image generation",
        params: "none"
      },
      {
        action: "test_url_extraction",
        description: "Test extracting image ID from URL",
        params: "{ imageUrl: 'firefly_image_url' }"
      },
      {
        action: "test_logo_upload",
        description: "Test uploading logo to Firefly",
        params: "{ logoUrl: 'logo_url' }"
      },
      {
        action: "test_full_compositing",
        description: "Test compositing with existing IDs",
        params: "{ backgroundId: 'bg_id', logoId: 'logo_id' }"
      },
      {
        action: "test_drink_config",
        description: "Test full drink generation with logo",
        params: "{ config: {...}, logoUrl: '...' }"
      },
      {
        action: "test_prompt_enhancement",
        description: "Test generating image with logo in prompt",
        params: "none"
      }
    ]
  })
}