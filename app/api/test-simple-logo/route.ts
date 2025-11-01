import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImageWithLogo } from '@/lib/adobe-firefly';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Testing simple enhanced logo workflow');

    // Test configuration - simple coffee setup
    const testConfig = {
      name: "Simple Logo Test Coffee",
      base: "Hot Coffee",
      size: "Tall",
      milk: "Whole Milk", 
      syrups: [{ name: "Vanilla", pumps: 1 }],
      toppings: ["Whipped Cream"],
      temperature: "Hot",
      sweetness: "medium",
      ice: "none"
    };

    // Mock products data
    const mockProducts = {
      bases: ["Hot Coffee"],
      milks: ["Whole Milk"],
      syrups: ["Vanilla"],
      toppings: ["Whipped Cream"]
    };

    // Use the updated logo URL
    const logoUrl = "https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png";

    console.log('[v0] Starting simple logo workflow test...');

    const result = await generateDrinkImageWithLogo(
      testConfig,
      logoUrl,
      mockProducts
    );

    console.log('[v0] Simple logo workflow test completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Simple logo workflow test completed',
      result: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        negativePrompt: result.negativePrompt,
        workflow: 'simple-enhanced'
      }
    });

  } catch (error) {
    console.error('[v0] Simple logo workflow test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      workflow: 'simple-enhanced'
    }, { status: 500 });
  }
}