import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageForCupPlacement } from '@/lib/openai-vision';
import { advancedLogoPlacement } from '@/lib/adobe-firefly-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing cream layer detection and cup surface placement');
    
    // Test with the provided image that has cream/foam layer
    const testImageUrl = 'https://cdn.openai.com/API/docs/images/example_generations/latte_with_foam.png'; // Example with foam
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    
    console.log('[API] Analyzing image for cream layer detection...');
    const analysis = await analyzeImageForCupPlacement(testImageUrl);
    
    console.log('[API] Analysis result:', {
      hasCreamLayer: analysis.imageAnalysis?.hasCreamLayer,
      beverage: analysis.imageAnalysis?.beverage,
      cupType: analysis.primary?.cupType,
      confidence: analysis.primary?.confidence
    });
    
    console.log('[API] Testing cream-aware logo placement...');
    const placementResult = await advancedLogoPlacement(testImageUrl, logoUrl);
    
    return NextResponse.json({
      success: true,
      testImageUrl: testImageUrl,
      analysis: {
        primary: analysis.primary,
        hasCreamLayer: analysis.imageAnalysis?.hasCreamLayer,
        beverage: analysis.imageAnalysis?.beverage,
        lighting: analysis.imageAnalysis?.lighting,
        cupCount: analysis.imageAnalysis?.cupCount
      },
      placement: {
        method: placementResult.method,
        imageUrl: placementResult.imageUrl ? 'Generated successfully' : 'Failed',
        finalImageUrl: placementResult.imageUrl
      },
      message: 'Cream layer detection test completed'
    });
    
  } catch (error) {
    console.error('[API] Cream layer test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Cream layer detection test failed'
    }, { status: 500 });
  }
}