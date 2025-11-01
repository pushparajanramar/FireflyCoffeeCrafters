import { NextRequest, NextResponse } from 'next/server';
import { getCupCoordinates, analyzeImageForCupPlacement } from '@/lib/openai-vision';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing OpenAI Vision API directly');
    
    // Test with a sample coffee image URL
    const testImageUrl = 'https://cdn.openai.com/API/docs/images/example_generations/hot_coffee_1.png';
    
    console.log('[API] Testing basic cup detection...');
    const cupCoords = await getCupCoordinates(testImageUrl);
    
    console.log('[API] Testing advanced image analysis...');
    const analysis = await analyzeImageForCupPlacement(testImageUrl);
    
    return NextResponse.json({
      success: true,
      testImageUrl: testImageUrl,
      basicDetection: cupCoords,
      advancedAnalysis: analysis,
      message: 'OpenAI Vision API test successful'
    });
    
  } catch (error) {
    console.error('[API] OpenAI Vision test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'OpenAI Vision API test failed'
    }, { status: 500 });
  }
}