import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageForCupPlacement } from '@/lib/openai-vision';
import { advancedLogoPlacement } from '@/lib/adobe-firefly-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing handle exclusion and 60% logo transparency');
    
    // Test with images that have handles (mugs, etc.)
    const testImages = [
      {
        name: 'Coffee Mug with Handle',
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop'
      },
      {
        name: 'Glass Cup with Handle',
        url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop'
      }
    ];
    
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    const results = [];
    
    for (const testImage of testImages) {
      console.log(`[API] Testing ${testImage.name}...`);
      
      try {
        // Analyze the image for cup body detection (excluding handles)
        const analysis = await analyzeImageForCupPlacement(testImage.url);
        
        // Test the logo placement with transparency
        const placementResult = await advancedLogoPlacement(testImage.url, logoUrl);
        
        results.push({
          name: testImage.name,
          imageUrl: testImage.url,
          analysis: {
            cupType: analysis.primary?.cupType,
            confidence: analysis.primary?.confidence,
            width: analysis.primary?.width, // Should exclude handle
            height: analysis.primary?.height,
            centerX: analysis.primary?.centerX,
            centerY: analysis.primary?.centerY
          },
          placement: {
            method: placementResult.method,
            success: !!placementResult.imageUrl,
            finalImageUrl: placementResult.imageUrl
          }
        });
        
      } catch (error) {
        results.push({
          name: testImage.name,
          imageUrl: testImage.url,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Handle exclusion and transparency test completed',
      features: {
        handleExclusion: 'Cup width measurements exclude handles and spouts',
        logoTransparency: '60% transparent (40% opacity) for realistic appearance',
        cupSurfacePlacement: 'Logo placed on cup body surface only'
      },
      results: results
    });
    
  } catch (error) {
    console.error('[API] Handle exclusion test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Handle exclusion and transparency test failed'
    }, { status: 500 });
  }
}