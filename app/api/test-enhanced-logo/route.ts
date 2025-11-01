import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImageWithLogo } from '@/lib/adobe-firefly';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Testing enhanced logo compositing workflow');

    // Test configuration - simple coffee setup
    const testConfig = {
      name: "Enhanced Logo Test Coffee",
      base: "Hot Coffee",
      size: "Tall",
      milk: "Whole Milk",
      syrups: [{ name: "Vanilla", pumps: 2 }],
      toppings: ["Whipped Cream"],
      temperature: "Hot",
      sweetness: "medium",
      ice: "none"
    };

    // Mock products data (simplified)
    const mockProducts = {
      bases: ["Hot Coffee"],
      milks: ["Whole Milk"],
      syrups: ["Vanilla"],
      toppings: ["Whipped Cream"]
    };

    // Test with a working Starbucks logo URL
    const logoUrl = "https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png";

    console.log('[v0] Starting enhanced logo compositing test...');

    const result = await generateDrinkImageWithLogo(
      testConfig,
      logoUrl,
      mockProducts
    );

    console.log('[v0] Enhanced logo compositing test completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Enhanced logo compositing test completed',
      result: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        negativePrompt: result.negativePrompt,
        workflow: 'enhanced'
      }
    });

  } catch (error) {
    console.error('[v0] Enhanced logo compositing test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      workflow: 'enhanced'
    }, { status: 500 });
  }
}