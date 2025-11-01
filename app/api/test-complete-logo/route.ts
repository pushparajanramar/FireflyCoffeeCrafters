import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImageWithLogo, generateDrinkImage } from '@/lib/adobe-firefly';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Starting comprehensive logo test with Sharp');
    
    // First generate a base coffee image
    const basePrompt = "Professional product photography of a tall white paper coffee cup with brown cardboard sleeve on clean white background, studio lighting, high quality, centered";
    const negativePrompt = "low quality, blurry, multiple cups, backgrounds, text, logos";
    
    console.log('[API] Generating base coffee image...');
    const baseImageUrl = await generateDrinkImage(basePrompt, negativePrompt);
    
    if (!baseImageUrl) {
      return NextResponse.json({
        success: false,
        message: 'Failed to generate base coffee image'
      }, { status: 500 });
    }
    
    console.log('[API] Base image generated:', baseImageUrl);
    
    // Now test the logo compositing with our generated image
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    
    const result = await generateDrinkImageWithLogo({
      base: 'espresso',
      size: 'tall',
      temperature: 'hot',
      milk: [],
      syrups: [],
      toppings: []
    }, logoUrl);
    
    if (result.imageUrl) {
      console.log('[API] Logo compositing test successful');
      return NextResponse.json({
        success: true,
        baseImageUrl: baseImageUrl,
        finalImageUrl: result.imageUrl,
        prompt: result.prompt,
        message: 'Complete logo test successful with Sharp compositing'
      });
    } else {
      return NextResponse.json({
        success: false,
        baseImageUrl: baseImageUrl,
        message: 'Logo compositing failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[API] Comprehensive logo test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Comprehensive logo test failed'
    }, { status: 500 });
  }
}