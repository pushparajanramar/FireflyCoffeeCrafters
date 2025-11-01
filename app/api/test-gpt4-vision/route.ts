import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImage, advancedLogoPlacement } from '@/lib/adobe-firefly-server';
import { analyzeImageForCupPlacement } from '@/lib/openai-vision';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Starting GPT-4 Vision logo test');
    
    // First generate a coffee cup image for testing
    const basePrompt = "Professional product photography of a tall white paper coffee cup with brown cardboard sleeve on clean white background, studio lighting, high quality, centered, detailed";
    const negativePrompt = "low quality, blurry, multiple cups, backgrounds, text, logos, decorations";
    
    console.log('[API] Generating base coffee image...');
    const baseImageUrl = await generateDrinkImage(basePrompt, negativePrompt);
    
    if (!baseImageUrl) {
      return NextResponse.json({
        success: false,
        message: 'Failed to generate base coffee image'
      }, { status: 500 });
    }
    
    console.log('[API] Base image generated:', baseImageUrl);
    
    // Analyze the image with GPT-4 Vision
    console.log('[API] Starting GPT-4 Vision analysis...');
    const analysis = await analyzeImageForCupPlacement(baseImageUrl);
    
    console.log('[API] GPT-4 Vision analysis complete:', analysis);
    
    // Test the advanced logo placement
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    
    console.log('[API] Testing advanced logo placement...');
    const placementResult = await advancedLogoPlacement(baseImageUrl, logoUrl);
    
    if (placementResult.imageUrl) {
      console.log(`[API] Logo placement successful using: ${placementResult.method}`);
      return NextResponse.json({
        success: true,
        baseImageUrl: baseImageUrl,
        finalImageUrl: placementResult.imageUrl,
        analysis: placementResult.analysis,
        method: placementResult.method,
        message: 'GPT-4 Vision logo placement test successful'
      });
    } else {
      return NextResponse.json({
        success: false,
        baseImageUrl: baseImageUrl,
        analysis: placementResult.analysis,
        method: placementResult.method,
        message: 'GPT-4 Vision logo placement failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[API] GPT-4 Vision test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'GPT-4 Vision test failed'
    }, { status: 500 });
  }
}