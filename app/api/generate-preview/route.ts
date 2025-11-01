
import { NextResponse } from "next/server"
import { generateDrinkImageWithLogoServer, generateDrinkImage, buildDrinkPrompt } from "@/lib/adobe-firefly-server"
import { sql } from "@/lib/db"

// Default Starbucks logo URL - Public S3 URL
const DEFAULT_LOGO_URL = "https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle both config directly or nested in config property (for backward compatibility)
    const config = body.config || body;
    
    // Get logo URL from request body, environment, or use default
    const logoUrl = body.logoUrl || process.env.STARBUCKS_LOGO_URL || DEFAULT_LOGO_URL;
    const enableLogo = body.enableLogo !== false; // Default to true unless explicitly disabled

    console.log("[v0] Generating preview with config:", JSON.stringify(config, null, 2));
    console.log("[v0] Logo enabled:", enableLogo, "Logo URL:", logoUrl);

    // Fetch all products for negative prompts
    const [bases, milks, syrups, toppings] = await Promise.all([
      sql`SELECT name FROM bases WHERE is_active = true`,
      sql`SELECT name FROM milks`,
      sql`SELECT name FROM syrups`,
      sql`SELECT name FROM toppings`,
    ]);

    const allProducts = {
      bases: bases.map((b: any) => b.name),
      milks: milks.map((m: any) => m.name),
      syrups: syrups.map((s: any) => s.name),
      toppings: toppings.map((t: any) => t.name),
    };

    console.log("[v0] Available products for negative prompts:", allProducts);

    let result;
    
    if (enableLogo && logoUrl) {
      // Generate with logo compositing using server-only functions
      result = await generateDrinkImageWithLogoServer(config, logoUrl, allProducts);
    } else {
      // Generate without logo (fallback)
      const { prompt, negativePrompt } = buildDrinkPrompt(config, allProducts);
      const imageUrl = await generateDrinkImage(prompt, negativePrompt);
      result = { imageUrl, prompt, negativePrompt };
    }

    console.log("[v0] Final result:", result);

    return NextResponse.json({
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      negativePrompt: result.negativePrompt,
    });
  } catch (error) {
    console.error("[v0] Error generating preview:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate preview image";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Return detailed error in development, simplified in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: errorMessage, 
        ...(isDevelopment && { stack: errorStack })
      }, 
      { status: 500 }
    );
  }
}
