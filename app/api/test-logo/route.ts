import { NextResponse } from "next/server"
import { generateDrinkImageWithLogo, buildDrinkPrompt } from "@/lib/adobe-firefly"

export async function POST(request: Request) {
  try {
    // Simple test configuration
    const testConfig = {
      base: "Latte",
      size: "Grande", 
      milk: "Whole Milk",
      temperature: "Hot",
      syrups: [],
      toppings: []
    }
    
    console.log("[v0] Testing logo generation with config:", testConfig)
    
    const result = await generateDrinkImageWithLogo(
      testConfig, 
      "https://example.com/logo.png", // This will fail but prompt-based should work
      {
        bases: ["Espresso", "Americano", "Cold Brew"],
        milks: ["Almond Milk", "Oat Milk", "Soy Milk"], 
        syrups: ["Vanilla", "Caramel", "Hazelnut"],
        toppings: ["Whipped Cream", "Extra Foam"]
      }
    )
    
    console.log("[v0] Test result:", result)
    
    return NextResponse.json({
      success: true,
      ...result,
      message: "Logo test completed - check if Starbucks logo is visible in the generated image"
    })
    
  } catch (error) {
    console.error("[v0] Logo test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Logo test failed"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Logo Test Endpoint",
    description: "POST to test logo generation with a simple latte configuration",
    usage: "curl -X POST http://localhost:3000/api/test-logo"
  })
}